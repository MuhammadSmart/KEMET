// ===== src/runtime.js =====
// The app runs inside the original page-kit bundle (vendor/kit-runtime.head.js),
// which already ships React 18 + ReactDOM. We borrow them here instead of
// adding a package manager or bundler. No JSX: h(type, props, ...children).
var React = require_react();
var ReactDOMClient = require_client();
var h = React.createElement;
var Fragment = React.Fragment;
var useState = React.useState;
var useEffect = React.useEffect;
var useLayoutEffect = React.useLayoutEffect;
var useRef = React.useRef;
var useMemo = React.useMemo;
var useCallback = React.useCallback;
var useContext = React.useContext;
var useId = React.useId;
var useSyncExternalStore = React.useSyncExternalStore;
