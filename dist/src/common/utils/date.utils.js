"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWithinDays = exports.formatDate = void 0;
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
exports.formatDate = formatDate;
function isWithinDays(date, days) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff <= days * 24 * 60 * 60 * 1000;
}
exports.isWithinDays = isWithinDays;
//# sourceMappingURL=date.utils.js.map