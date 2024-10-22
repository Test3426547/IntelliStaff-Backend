"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMouseState = void 0;
const vue_1 = require("vue");
function useMouseState() {
    const isMouseEntered = (0, vue_1.ref)(false);
    function setMouseEntered(value) {
        isMouseEntered.value = value;
    }
    return {
        isMouseEntered: (0, vue_1.readonly)(isMouseEntered),
        setMouseEntered,
    };
}
exports.useMouseState = useMouseState;
//# sourceMappingURL=useMouseState.js.map