"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    content: [
        "./presets/**/*.{js,vue,ts}",
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [require('tailwindcss-primeui')],
};
//# sourceMappingURL=tailwind.config.js.map