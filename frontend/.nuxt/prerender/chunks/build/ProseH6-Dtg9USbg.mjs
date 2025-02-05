import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'file:///home/runner/workspace/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderSlot } from 'file:///home/runner/workspace/frontend/node_modules/vue/server-renderer/index.mjs';
import { b as useRuntimeConfig } from './server.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/ofetch/dist/node.mjs';
import '../_/renderer.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/h3/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/devalue/index.js';
import 'file:///home/runner/workspace/frontend/node_modules/ufo/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/@unhead/ssr/dist/index.mjs';
import '../runtime.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/destr/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/unenv/runtime/fetch/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/hookable/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/klona/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/scule/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/ohash/dist/index.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProseH6",
  __ssrInlineRender: true,
  props: {
    id: {}
  },
  setup(__props) {
    const props = __props;
    const { headings } = useRuntimeConfig().public.mdc;
    const generate = computed(() => {
      var _a;
      return props.id && (typeof (headings == null ? void 0 : headings.anchorLinks) === "boolean" && (headings == null ? void 0 : headings.anchorLinks) === true || typeof (headings == null ? void 0 : headings.anchorLinks) === "object" && ((_a = headings == null ? void 0 : headings.anchorLinks) == null ? void 0 : _a.h6));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<h6${ssrRenderAttrs(mergeProps({
        id: props.id
      }, _attrs))}>`);
      if (props.id && unref(generate)) {
        _push(`<a${ssrRenderAttr("href", `#${props.id}`)}>`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
        _push(`</a>`);
      } else {
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      }
      _push(`</h6>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseH6.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ProseH6-Dtg9USbg.mjs.map
