# Renders the homepage photo frame as a lit 3D gilded moulding (assets/img/frame-gold.webp).
#   python scripts/frame3d.py
# The frame is drawn as a height map (outer bead, cove, a carved band of the Egyptian
# reed frieze, inner bead, sight edge), mitred at the corners like a real frame, then
# shaded as gilded metal under a light from the top left. Used with CSS border-image,
# so the four edges stretch to any photo size (the frieze repeats seamlessly).
import numpy as np
from PIL import Image, ImageFilter

B = 96                  # border width in px (shown at half size, so it stays sharp)
N = 12                  # frieze motifs along each edge's middle part
P = 24                  # motif period in px
SIZE = 2 * B + N * P    # 480
HMAX = 22.0             # tallest point of the moulding, px

def gblur(a, sigma):
    """Separable Gaussian blur for float arrays."""
    r = max(1, int(sigma * 3)); k = np.exp(-(np.arange(-r, r + 1) ** 2) / (2 * sigma * sigma)); k /= k.sum()
    a = np.pad(a, r, mode="edge")
    a = np.apply_along_axis(lambda m: np.convolve(m, k, mode="valid"), 0, a)
    return np.apply_along_axis(lambda m: np.convolve(m, k, mode="valid"), 1, a)

def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def bead(v, a, b, h):   # convex half-round between a and b
    t = np.clip((v - a) / (b - a), 0, 1); return h * np.sqrt(np.clip(1 - (2 * t - 1) ** 2, 0, 1))

def profile(v):
    """Height of the moulding across the border, v = 0 (outer edge) .. 1 (photo)."""
    h = 0.25 * smooth(v, 0.0, 0.04)
    h = np.maximum(h, 0.25 + bead(v, 0.03, 0.22, 0.75) * (v < 0.22))
    h = np.where((v >= 0.22) & (v < 0.27), 0.72, h)                                  # fillet
    cove = 0.72 - 0.30 * np.sin(np.clip((v - 0.27) / 0.14, 0, 1) * np.pi / 2)        # concave cove
    h = np.where((v >= 0.27) & (v < 0.41), cove, h)
    h = np.where((v >= 0.41) & (v < 0.77), 0.42, h)                                  # frieze band
    h = np.where(v >= 0.77, 0.42 + bead(v, 0.77, 0.91, 0.36), h)                    # inner bead
    lip = 0.42 - 0.30 * smooth(v, 0.91, 1.0)
    h = np.where(v >= 0.91, lip, h)                                                  # sight edge
    return h

def frieze(u, v):
    """Raised reed-bundle motifs (the Egyptian 'khekher' frieze) on the flat band."""
    a, b = 0.43, 0.75
    t = np.clip((v - a) / (b - a), 0, 1)                   # 0 at outer side of band, 1 inner
    inband = (v > a) & (v < b)
    x = (np.mod(u, P) / P) - 0.5                           # -0.5..0.5 across one motif
    width = 0.30 + 0.06 * np.cos(t * np.pi * 2)            # bundle waist
    body = np.clip(1 - (np.abs(x) / width) ** 2, 0, 1) ** 0.6
    top = smooth(t, 0.0, 0.18)                             # rounded head toward the outer side
    knots = 1 - 0.55 * (np.exp(-((t - 0.42) / 0.035) ** 2) + np.exp(-((t - 0.58) / 0.035) ** 2))
    disc = np.exp(-((x / 0.16) ** 2 + ((t - 0.86) / 0.07) ** 2))   # small disc at the foot
    m = np.maximum(body * top * knots * (t < 0.76), disc * 0.9)
    return 0.13 * m * inband

y, x = np.mgrid[0:SIZE, 0:SIZE].astype(np.float64) + 0.5
dl, dr, dt, db = x, SIZE - x, y, SIZE - y
d = np.minimum(np.minimum(dl, dr), np.minimum(dt, db))
edge = np.argmin(np.stack([dt, dr, db, dl]), axis=0)        # 0 top, 1 right, 2 bottom, 3 left
u = np.select([edge == 0, edge == 1, edge == 2, edge == 3], [x - B, y - B, (SIZE - x) - B, (SIZE - y) - B])
v = np.clip(d / B, 0, 1.2)
H = (profile(np.minimum(v, 1)) + frieze(u, v)) * HMAX
H = np.where(v <= 1, H, 0)

# Shading: normals from the height map, light from the top left, gilded metal.
gy, gx = np.gradient(gblur(H, 0.6))
n = np.dstack([-gx, -gy, np.ones_like(H)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.55, -0.62, 0.56]); L /= np.linalg.norm(L)
V = np.array([0.0, 0.0, 1.0]); Hh = (L + V) / np.linalg.norm(L + V)
diff = np.clip(n @ L, 0, 1)
spec = np.clip(n @ Hh, 0, 1) ** 60
# Polished metal mostly shows what it reflects: a bright room above-left, darker below.
nz = n[..., 2:3]
R = 2 * nz * n - V                                          # reflected view ray
up = -(R[..., 1] * 0.75 + R[..., 0] * 0.45)                  # how much it faces the light side
env = 0.10 + 0.95 * smooth(up, -0.35, 0.75) + 0.9 * np.exp(-np.sum((R - L) ** 2, axis=2) / 0.06)
blur = gblur(H, 5)
ao = np.clip(1 - (blur - H) * 0.08, 0.40, 1.0)              # grooves and the cove darken
rng = np.random.default_rng(7)
grain = gblur(rng.random((SIZE, SIZE)), 0.8)
gold = np.array([0.86, 0.63, 0.24]) * (0.93 + 0.14 * grain[..., None])
light = np.array([1.0, 0.92, 0.66])
col = gold * (0.22 * diff[..., None] + 0.95 * env[..., None])
col = col * ao[..., None] + spec[..., None] * light * 0.9
# sight edge goes dark where it drops toward the photo
col *= (1 - 0.55 * smooth(v, 0.95, 1.0))[..., None]
rgb = np.clip(col * 255, 0, 255).astype(np.uint8)
alpha = np.where(v < 1, 255, 0).astype(np.uint8)
img = Image.fromarray(np.dstack([rgb, alpha]), "RGBA")
img.save("assets/img/frame-gold.webp", quality=88, method=6)   # ~23 KB, a tenth of the PNG

print("assets/img/frame-gold.webp", img.size, "border", B)
