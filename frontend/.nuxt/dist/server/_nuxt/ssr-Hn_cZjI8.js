import "vue";
import { c as useNuxtApp } from "../server.mjs";
function useRequestEvent(nuxtApp = useNuxtApp()) {
  var _a;
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
export {
  useRequestEvent as u
};
//# sourceMappingURL=ssr-Hn_cZjI8.js.map
