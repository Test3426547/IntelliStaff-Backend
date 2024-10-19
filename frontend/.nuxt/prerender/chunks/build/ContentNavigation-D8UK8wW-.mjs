import { defineComponent, toRefs, computed, useSlots, useSSRContext, toRef, isRef, h } from 'file:///home/runner/workspace/frontend/node_modules/vue/index.mjs';
import { hash } from 'file:///home/runner/workspace/frontend/node_modules/ohash/dist/index.mjs';
import { a as useContentDisabled, u as useAsyncData, q as queryContent, w as withContentBase, e as encodeQueryParams, b as addPrerenderPath, s as shouldUseClientDB, j as jsonStringify } from './query-BysONKs0.mjs';
import { u as useContentPreview } from './preview-kCS6-_iv.mjs';
import { c as useNuxtApp, b as useRuntimeConfig } from './server.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-pw9f5qQl.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/ufo/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/cookie-es/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/h3/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/destr/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/klona/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/ofetch/dist/node.mjs';
import '../_/renderer.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/devalue/index.js';
import 'file:///home/runner/workspace/frontend/node_modules/vue/server-renderer/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/@unhead/ssr/dist/index.mjs';
import '../runtime.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/unenv/runtime/fetch/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/hookable/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/scule/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/unstorage/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/unstorage/drivers/fs.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/unstorage/drivers/lru-cache.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/radix3/dist/index.mjs';
import 'node:fs';
import 'node:url';
import 'file:///home/runner/workspace/frontend/node_modules/pathe/dist/index.mjs';
import 'file:///home/runner/workspace/node_modules/ipx/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/unhead/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/@unhead/shared/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/unctx/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/vue-router/dist/vue-router.node.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/vue-devtools-stub/dist/index.mjs';
import 'file:///home/runner/workspace/node_modules/framesync/dist/es/index.mjs';
import 'file:///home/runner/workspace/node_modules/popmotion/dist/es/index.mjs';
import 'file:///home/runner/workspace/node_modules/style-value-types/dist/es/index.mjs';

const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const fetchContentNavigation = async (queryBuilder) => {
  const { content } = useRuntimeConfig().public;
  if (typeof (queryBuilder == null ? void 0 : queryBuilder.params) !== "function") {
    queryBuilder = queryContent(queryBuilder);
  }
  const params = queryBuilder.params();
  const apiPath = content.experimental.stripQueryParameters ? withContentBase(`/navigation/${`${hash(params)}.${content.integrity}`}/${encodeQueryParams(params)}.json`) : withContentBase(`/navigation/${hash(params)}.${content.integrity}.json`);
  {
    addPrerenderPath(apiPath);
  }
  if (shouldUseClientDB()) {
    const generateNavigation = await import('./client-db-D_1zxSEs.mjs').then((m) => m.generateNavigation);
    return generateNavigation(params);
  }
  const data = await $fetch(apiPath, {
    method: "GET",
    responseType: "json",
    params: content.experimental.stripQueryParameters ? void 0 : {
      _params: jsonStringify(params),
      previewToken: useContentPreview().getPreviewToken()
    }
  });
  if (typeof data === "string" && data.startsWith("<!DOCTYPE html>")) {
    throw new Error("Not found");
  }
  return data;
};
const ContentNavigation = defineComponent({
  name: "ContentNavigation",
  props: {
    /**
     * A query to be passed to `fetchContentNavigation()`.
     */
    query: {
      type: Object,
      required: false,
      default: void 0
    }
  },
  async setup(props) {
    const {
      query
    } = toRefs(props);
    const queryBuilder = computed(() => {
      var _a;
      if (typeof ((_a = query.value) == null ? void 0 : _a.params) === "function") {
        return query.value.params();
      }
      return query.value;
    });
    if (!queryBuilder.value && useState("dd-navigation").value) {
      const { navigation: navigation2 } = useContentDisabled();
      return { navigation: navigation2 };
    }
    const { data: navigation } = await useAsyncData(
      `content-navigation-${hash(queryBuilder.value)}`,
      () => fetchContentNavigation(queryBuilder.value)
    );
    return { navigation };
  },
  /**
   * Navigation empty fallback
   * @slot empty
   */
  render(ctx) {
    const slots = useSlots();
    const { navigation } = ctx;
    const renderLink = (link) => h(__nuxt_component_0, { to: link._path }, () => link.title);
    const renderLinks = (data, level) => h(
      "ul",
      level ? { "data-level": level } : null,
      data.map((link) => {
        if (link.children) {
          return h("li", null, [renderLink(link), renderLinks(link.children, level + 1)]);
        }
        return h("li", null, renderLink(link));
      })
    );
    const defaultNode = (data) => renderLinks(data, 0);
    return (slots == null ? void 0 : slots.default) ? slots.default({ navigation, ...this.$attrs }) : defaultNode(navigation);
  }
});
const _sfc_main = ContentNavigation;
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/content/dist/runtime/components/ContentNavigation.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ContentNavigation-D8UK8wW-.mjs.map
