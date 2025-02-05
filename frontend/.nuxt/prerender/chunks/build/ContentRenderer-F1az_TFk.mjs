import { defineComponent, watch, useSlots, h, useSSRContext } from 'file:///home/runner/workspace/frontend/node_modules/vue/index.mjs';
import _sfc_main$1 from './ContentRendererMarkdown-DS0SKLUZ.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/destr/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/scule/dist/index.mjs';
import 'file:///home/runner/workspace/node_modules/property-information/index.js';
import './node-04k6j4dz.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/vue/server-renderer/index.mjs';
import './preview-CsEiFjbj.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/cookie-es/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/h3/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/ohash/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/klona/dist/index.mjs';
import './server.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/ofetch/dist/node.mjs';
import '../_/renderer.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/devalue/index.js';
import 'file:///home/runner/workspace/frontend/node_modules/ufo/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/@unhead/ssr/dist/index.mjs';
import '../runtime.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/unenv/runtime/fetch/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/hookable/dist/index.mjs';
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
import './ssr-Hn_cZjI8.mjs';

const _sfc_main = defineComponent({
  name: "ContentRenderer",
  props: {
    /**
     * The document to render.
     */
    value: {
      type: Object,
      required: false,
      default: () => ({})
    },
    /**
     * Whether or not to render the excerpt.
     * @default false
     */
    excerpt: {
      type: Boolean,
      default: false
    },
    /**
     * The tag to use for the renderer element if it is used.
     * @default 'div'
     */
    tag: {
      type: String,
      default: "div"
    }
  },
  setup(props) {
    watch(
      () => props.excerpt,
      (newExcerpt) => {
        var _a, _b, _c;
        if (newExcerpt && !((_a = props.value) == null ? void 0 : _a.excerpt)) {
          console.warn(`No excerpt found for document content/${(_b = props == null ? void 0 : props.value) == null ? void 0 : _b._path}.${(_c = props == null ? void 0 : props.value) == null ? void 0 : _c._extension}!`);
          console.warn("Make sure to use <!--more--> in your content if you want to use excerpt feature.");
        }
      },
      {
        immediate: true
      }
    );
  },
  /**
   * Content empty fallback
   * @slot empty
   */
  render(ctx) {
    var _a, _b;
    const slots = useSlots();
    const { value, excerpt, tag } = ctx;
    const markdownAST = excerpt ? value == null ? void 0 : value.excerpt : value == null ? void 0 : value.body;
    if (!((_a = markdownAST == null ? void 0 : markdownAST.children) == null ? void 0 : _a.length) && (slots == null ? void 0 : slots.empty)) {
      return slots.empty({ value, excerpt, tag, ...this.$attrs });
    }
    if (slots == null ? void 0 : slots.default) {
      return slots.default({ value, excerpt, tag, ...this.$attrs });
    }
    if ((markdownAST == null ? void 0 : markdownAST.type) === "root" && ((_b = markdownAST == null ? void 0 : markdownAST.children) == null ? void 0 : _b.length)) {
      return h(
        _sfc_main$1,
        {
          value,
          excerpt,
          tag,
          ...this.$attrs
        }
      );
    }
    return h(
      "pre",
      null,
      JSON.stringify({ message: "You should use slots with <ContentRenderer>", value, excerpt, tag }, null, 2)
    );
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/content/dist/runtime/components/ContentRenderer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ContentRenderer-F1az_TFk.mjs.map
