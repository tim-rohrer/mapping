"use strict";
exports.__esModule = true;
var react_1 = require("react");
function Button(_a) {
    var onClick = _a.onClick, _b = _a.className, className = _b === void 0 ? '' : _b, children = _a.children;
    return (<button onClick={onClick} className={className} type="button">
            {children}
        </button>);
}
exports["default"] = Button;
