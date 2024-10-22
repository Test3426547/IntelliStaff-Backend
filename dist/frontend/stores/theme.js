"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useThemeStore = void 0;
const pinia_1 = require("pinia");
exports.useThemeStore = (0, pinia_1.defineStore)('theme', {
    state: () => ({
        isDark: false
    }),
    actions: {
        toggleTheme() {
            this.isDark = !this.isDark;
        }
    }
});
//# sourceMappingURL=theme.js.map