"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = exports.capitalize = void 0;
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.capitalize = capitalize;
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
}
exports.slugify = slugify;
//# sourceMappingURL=string.utils.js.map