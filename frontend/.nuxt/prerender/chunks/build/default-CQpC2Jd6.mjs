import { _ as __nuxt_component_0$1 } from './nuxt-link-pw9f5qQl.mjs';
import { _ as _sfc_main$4 } from './NuxtImg-3DJNeqsf.mjs';
import { useSSRContext, defineComponent, withAsyncContext, ref, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, renderList, createCommentVNode, resolveDynamicComponent } from 'file:///home/runner/workspace/frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderStyle, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderVNode } from 'file:///home/runner/workspace/frontend/node_modules/vue/server-renderer/index.mjs';
import { c as cn, a as useColorMode, _ as _sfc_main$1$1, G as GlowBorder } from './GlowBorder-kyYxuHRg.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { Sun, Moon, Twitter, Facebook, Linkedin, Instagram } from 'file:///home/runner/workspace/frontend/node_modules/lucide-vue-next/dist/cjs/lucide-vue-next.js';
import { u as useAsyncData, q as queryContent } from './query-Csgz12rX.mjs';
import { u as useHead } from './server.mjs';
import { useRoute } from 'file:///home/runner/workspace/frontend/node_modules/vue-router/dist/vue-router.node.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/ufo/dist/index.mjs';
import './index-CllLxYzM.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/unhead/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/@unhead/shared/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/h3/dist/index.mjs';
import './ssr-Hn_cZjI8.mjs';
import 'file:///home/runner/workspace/node_modules/clsx/dist/clsx.mjs';
import 'file:///home/runner/workspace/node_modules/tailwind-merge/dist/bundle-mjs.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/ohash/dist/index.mjs';
import './preview-CsEiFjbj.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/cookie-es/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/destr/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/klona/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/ofetch/dist/node.mjs';
import '../_/renderer.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/devalue/index.js';
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
import 'file:///home/runner/workspace/frontend/node_modules/unctx/dist/index.mjs';
import 'file:///home/runner/workspace/frontend/node_modules/vue-devtools-stub/dist/index.mjs';
import 'file:///home/runner/workspace/node_modules/framesync/dist/es/index.mjs';
import 'file:///home/runner/workspace/node_modules/popmotion/dist/es/index.mjs';
import 'file:///home/runner/workspace/node_modules/style-value-types/dist/es/index.mjs';

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "RadiantText",
  __ssrInlineRender: true,
  props: {
    duration: {
      type: Number,
      default: 10
    },
    radiantWidth: {
      type: Number,
      default: 100
    },
    class: String
  },
  setup(__props) {
    const props = __props;
    const styleVar = computed(() => {
      return {
        "--radiant-anim-duration": `${props.duration}s`,
        "--radiant-width": `${props.radiantWidth}px`
      };
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<p${ssrRenderAttrs(mergeProps({
        style: unref(styleVar),
        class: unref(cn)(
          "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",
          // Radiant effect
          "radiant-animation bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--radiant-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
          // Radiant gradient
          "bg-gradient-to-r from-transparent via-black via-50% to-transparent  dark:via-white",
          _ctx.$props.class
        )
      }, _attrs))} data-v-9a42901d>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</p>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/inspiria/radiant-text/RadiantText.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const RadiantText = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-9a42901d"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Navbar",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const colorMode = useColorMode();
    const isDark = computed(() => colorMode.value === "dark");
    const hoveredItem = ref(null);
    const selectedItem = ref(null);
    const activeItem = computed(() => hoveredItem.value || selectedItem.value);
    const setActiveItem = (item) => {
      if (item == null ? void 0 : item.subMenu) {
        hoveredItem.value = item;
        selectedItem.value = item;
      } else {
        hoveredItem.value = null;
        selectedItem.value = null;
      }
    };
    const closeMenu = () => {
      hoveredItem.value = null;
      selectedItem.value = null;
    };
    ref(0);
    const { data: navItems } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("navItems", () => queryContent("/layout/navbar").findOne())), __temp = await __temp, __restore(), __temp);
    const toggleColorMode = () => {
      colorMode.value = colorMode.value === "dark" ? "light" : "dark";
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_NuxtImg = _sfc_main$4;
      _push(ssrRenderComponent(unref(_sfc_main$1$1), mergeProps({
        delay: 0.2,
        duration: 0.75,
        class: "w-full"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<nav class="relative w-full flex items-center px-8 lg:px-20 gap-6 py-6 lg:py-2 bg-surface-0 dark:bg-surface-950" data-v-b0afdf6a${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/",
              class: "relative z-20 flex items-center gap-4"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_NuxtImg, {
                    src: isDark.value ? "/logo-dark.svg" : "/logo.svg",
                    width: "35",
                    height: "35",
                    alt: "Logo"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(unref(RadiantText), {
                    class: "text-surface-900 dark:text-surface-0 text-lg font-semibold",
                    duration: 5
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(navItems).businessName)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(navItems).businessName), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_NuxtImg, {
                      src: isDark.value ? "/logo-dark.svg" : "/logo.svg",
                      width: "35",
                      height: "35",
                      alt: "Logo"
                    }, null, 8, ["src"]),
                    createVNode(unref(RadiantText), {
                      class: "text-surface-900 dark:text-surface-0 text-lg font-semibold",
                      duration: 5
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(navItems).businessName), 1)
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<button class="p-2 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-0" data-v-b0afdf6a${_scopeId}>`);
            if (isDark.value) {
              _push2(ssrRenderComponent(unref(Sun), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(unref(Moon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            }
            _push2(`</button><div class="flex-1 hidden lg:flex items-center justify-between" data-v-b0afdf6a${_scopeId}><ul class="flex items-center gap-8" data-v-b0afdf6a${_scopeId}><!--[-->`);
            ssrRenderList(unref(navItems).items, (item) => {
              var _a;
              _push2(`<li class="relative" data-v-b0afdf6a${_scopeId}><button class="font-medium text-surface-700 dark:text-surface-300 hover:text-primary p-2" data-v-b0afdf6a${_scopeId}>${ssrInterpolate(item.label)}</button>`);
              if (item.subMenu && ((_a = activeItem.value) == null ? void 0 : _a.label) === item.label) {
                _push2(`<div class="absolute top-full left-0 bg-surface-0 dark:bg-surface-900 rounded-lg shadow-lg p-4 animate-fadein" data-v-b0afdf6a${_scopeId}><!--[-->`);
                ssrRenderList(item.subMenu, (subItem) => {
                  _push2(ssrRenderComponent(_component_NuxtLink, {
                    key: subItem.label,
                    to: subItem.to,
                    class: "block p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(subItem.label)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(subItem.label), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</li>`);
            });
            _push2(`<!--]--></ul><div class="flex items-center gap-4" data-v-b0afdf6a${_scopeId}><button class="px-4 py-2 text-surface-700 dark:text-surface-300" data-v-b0afdf6a${_scopeId}>Login</button>`);
            _push2(ssrRenderComponent(unref(GlowBorder), {
              color: ["#10B981", "#34D399", "#6EE7B7"],
              class: "rounded-lg"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<button class="px-4 py-2 bg-primary text-white font-medium rounded-lg" data-v-b0afdf6a${_scopeId2}>Register</button>`);
                } else {
                  return [
                    createVNode("button", { class: "px-4 py-2 bg-primary text-white font-medium rounded-lg" }, "Register")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div><button class="lg:hidden ml-auto text-surface-700 dark:text-surface-300" data-v-b0afdf6a${_scopeId}><i class="pi pi-bars text-2xl" data-v-b0afdf6a${_scopeId}></i></button></nav>`);
          } else {
            return [
              createVNode("nav", {
                class: "relative w-full flex items-center px-8 lg:px-20 gap-6 py-6 lg:py-2 bg-surface-0 dark:bg-surface-950",
                onMouseleave: closeMenu
              }, [
                createVNode(_component_NuxtLink, {
                  to: "/",
                  class: "relative z-20 flex items-center gap-4"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_NuxtImg, {
                      src: isDark.value ? "/logo-dark.svg" : "/logo.svg",
                      width: "35",
                      height: "35",
                      alt: "Logo"
                    }, null, 8, ["src"]),
                    createVNode(unref(RadiantText), {
                      class: "text-surface-900 dark:text-surface-0 text-lg font-semibold",
                      duration: 5
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(navItems).businessName), 1)
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode("button", {
                  onClick: toggleColorMode,
                  class: "p-2 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-0"
                }, [
                  isDark.value ? (openBlock(), createBlock(unref(Sun), {
                    key: 0,
                    class: "w-5 h-5"
                  })) : (openBlock(), createBlock(unref(Moon), {
                    key: 1,
                    class: "w-5 h-5"
                  }))
                ]),
                createVNode("div", { class: "flex-1 hidden lg:flex items-center justify-between" }, [
                  createVNode("ul", { class: "flex items-center gap-8" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(navItems).items, (item) => {
                      var _a;
                      return openBlock(), createBlock("li", {
                        key: item.label,
                        class: "relative"
                      }, [
                        createVNode("button", {
                          onMouseenter: ($event) => setActiveItem(item),
                          onClick: ($event) => setActiveItem(item),
                          class: "font-medium text-surface-700 dark:text-surface-300 hover:text-primary p-2"
                        }, toDisplayString(item.label), 41, ["onMouseenter", "onClick"]),
                        item.subMenu && ((_a = activeItem.value) == null ? void 0 : _a.label) === item.label ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "absolute top-full left-0 bg-surface-0 dark:bg-surface-900 rounded-lg shadow-lg p-4 animate-fadein"
                        }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(item.subMenu, (subItem) => {
                            return openBlock(), createBlock(_component_NuxtLink, {
                              key: subItem.label,
                              to: subItem.to,
                              class: "block p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(subItem.label), 1)
                              ]),
                              _: 2
                            }, 1032, ["to"]);
                          }), 128))
                        ])) : createCommentVNode("", true)
                      ]);
                    }), 128))
                  ]),
                  createVNode("div", { class: "flex items-center gap-4" }, [
                    createVNode("button", { class: "px-4 py-2 text-surface-700 dark:text-surface-300" }, "Login"),
                    createVNode(unref(GlowBorder), {
                      color: ["#10B981", "#34D399", "#6EE7B7"],
                      class: "rounded-lg"
                    }, {
                      default: withCtx(() => [
                        createVNode("button", { class: "px-4 py-2 bg-primary text-white font-medium rounded-lg" }, "Register")
                      ]),
                      _: 1
                    })
                  ])
                ]),
                createVNode("button", { class: "lg:hidden ml-auto text-surface-700 dark:text-surface-300" }, [
                  createVNode("i", { class: "pi pi-bars text-2xl" })
                ])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/Navbar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-b0afdf6a"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Footer",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const colorMode = useColorMode();
    const isDark = computed(() => colorMode.value === "dark");
    const { data: footerContent } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("footerContent", () => queryContent("/layout/footer").findOne())), __temp = await __temp, __restore(), __temp);
    const socialIcons = [
      { icon: Twitter, link: "#" },
      { icon: Facebook, link: "#" },
      { icon: Linkedin, link: "#" },
      { icon: Instagram, link: "#" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_NuxtImg = _sfc_main$4;
      _push(ssrRenderComponent(unref(_sfc_main$1$1), mergeProps({
        delay: 0.2,
        duration: 0.75,
        class: "w-full"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<footer class="bg-surface-0 dark:bg-surface-950 text-surface-700 dark:text-surface-200"${_scopeId}><div class="container mx-auto px-6 py-12"${_scopeId}><div class="grid grid-cols-1 md:grid-cols-4 gap-8"${_scopeId}><div class="col-span-1 md:col-span-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/",
              class: "inline-block mb-6"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_NuxtImg, {
                    src: isDark.value ? "/logo-dark.svg" : "/logo.svg",
                    width: "134",
                    height: "78",
                    alt: "Logo"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_NuxtImg, {
                      src: isDark.value ? "/logo-dark.svg" : "/logo.svg",
                      width: "134",
                      height: "78",
                      alt: "Logo"
                    }, null, 8, ["src"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(RadiantText), {
              class: "text-xl font-semibold mb-4",
              duration: 5
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(footerContent).businessName)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(footerContent).businessName), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<p class="mb-4"${_scopeId}>${ssrInterpolate(unref(footerContent).slogan)}</p><p class="text-sm"${_scopeId}>\xA9 ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} ${ssrInterpolate(unref(footerContent).businessName)}. All rights reserved.</p></div><div${_scopeId}><h3 class="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100"${_scopeId}>${ssrInterpolate(unref(footerContent).mainMenuTitle)}</h3><ul class="space-y-2"${_scopeId}><!--[-->`);
            ssrRenderList(unref(footerContent).mainMenu, (item) => {
              _push2(`<li${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: item.link,
                class: "hover:text-primary transition-colors"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(item.label)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item.label), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</li>`);
            });
            _push2(`<!--]--></ul></div><div${_scopeId}><h3 class="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100"${_scopeId}>${ssrInterpolate(unref(footerContent).jobListingsTitle)}</h3><ul class="space-y-2"${_scopeId}><!--[-->`);
            ssrRenderList(unref(footerContent).jobListingsMenu, (item) => {
              _push2(`<li${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: item.link,
                class: "hover:text-primary transition-colors"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(item.label)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item.label), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</li>`);
            });
            _push2(`<!--]--></ul></div></div><div class="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col md:flex-row justify-between items-center"${_scopeId}><div class="mb-4 md:mb-0"${_scopeId}><ul class="flex space-x-4"${_scopeId}><!--[-->`);
            ssrRenderList(unref(footerContent).legalMenu, (item) => {
              _push2(`<li${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: item.link,
                class: "text-sm hover:text-primary transition-colors"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(item.label)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item.label), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</li>`);
            });
            _push2(`<!--]--></ul></div><div class="flex space-x-4"${_scopeId}><!--[-->`);
            ssrRenderList(socialIcons, (social, index) => {
              _push2(ssrRenderComponent(unref(GlowBorder), {
                key: index,
                color: ["#10B981", "#34D399", "#6EE7B7"],
                class: "rounded-full"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<a${ssrRenderAttr("href", social.link)} class="p-2 bg-surface-100 dark:bg-surface-800 rounded-full text-surface-900 dark:text-surface-100 hover:text-primary transition-colors"${_scopeId2}>`);
                    ssrRenderVNode(_push3, createVNode(resolveDynamicComponent(social.icon), { class: "w-5 h-5" }, null), _parent3, _scopeId2);
                    _push3(`</a>`);
                  } else {
                    return [
                      createVNode("a", {
                        href: social.link,
                        class: "p-2 bg-surface-100 dark:bg-surface-800 rounded-full text-surface-900 dark:text-surface-100 hover:text-primary transition-colors"
                      }, [
                        (openBlock(), createBlock(resolveDynamicComponent(social.icon), { class: "w-5 h-5" }))
                      ], 8, ["href"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--></div></div></div></footer>`);
          } else {
            return [
              createVNode("footer", { class: "bg-surface-0 dark:bg-surface-950 text-surface-700 dark:text-surface-200" }, [
                createVNode("div", { class: "container mx-auto px-6 py-12" }, [
                  createVNode("div", { class: "grid grid-cols-1 md:grid-cols-4 gap-8" }, [
                    createVNode("div", { class: "col-span-1 md:col-span-2" }, [
                      createVNode(_component_NuxtLink, {
                        to: "/",
                        class: "inline-block mb-6"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_NuxtImg, {
                            src: isDark.value ? "/logo-dark.svg" : "/logo.svg",
                            width: "134",
                            height: "78",
                            alt: "Logo"
                          }, null, 8, ["src"])
                        ]),
                        _: 1
                      }),
                      createVNode(unref(RadiantText), {
                        class: "text-xl font-semibold mb-4",
                        duration: 5
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(footerContent).businessName), 1)
                        ]),
                        _: 1
                      }),
                      createVNode("p", { class: "mb-4" }, toDisplayString(unref(footerContent).slogan), 1),
                      createVNode("p", { class: "text-sm" }, "\xA9 " + toDisplayString((/* @__PURE__ */ new Date()).getFullYear()) + " " + toDisplayString(unref(footerContent).businessName) + ". All rights reserved.", 1)
                    ]),
                    createVNode("div", null, [
                      createVNode("h3", { class: "text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100" }, toDisplayString(unref(footerContent).mainMenuTitle), 1),
                      createVNode("ul", { class: "space-y-2" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(footerContent).mainMenu, (item) => {
                          return openBlock(), createBlock("li", {
                            key: item.label
                          }, [
                            createVNode(_component_NuxtLink, {
                              to: item.link,
                              class: "hover:text-primary transition-colors"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(item.label), 1)
                              ]),
                              _: 2
                            }, 1032, ["to"])
                          ]);
                        }), 128))
                      ])
                    ]),
                    createVNode("div", null, [
                      createVNode("h3", { class: "text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100" }, toDisplayString(unref(footerContent).jobListingsTitle), 1),
                      createVNode("ul", { class: "space-y-2" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(footerContent).jobListingsMenu, (item) => {
                          return openBlock(), createBlock("li", {
                            key: item.label
                          }, [
                            createVNode(_component_NuxtLink, {
                              to: item.link,
                              class: "hover:text-primary transition-colors"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(item.label), 1)
                              ]),
                              _: 2
                            }, 1032, ["to"])
                          ]);
                        }), 128))
                      ])
                    ])
                  ]),
                  createVNode("div", { class: "mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col md:flex-row justify-between items-center" }, [
                    createVNode("div", { class: "mb-4 md:mb-0" }, [
                      createVNode("ul", { class: "flex space-x-4" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(footerContent).legalMenu, (item) => {
                          return openBlock(), createBlock("li", {
                            key: item.label
                          }, [
                            createVNode(_component_NuxtLink, {
                              to: item.link,
                              class: "text-sm hover:text-primary transition-colors"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(item.label), 1)
                              ]),
                              _: 2
                            }, 1032, ["to"])
                          ]);
                        }), 128))
                      ])
                    ]),
                    createVNode("div", { class: "flex space-x-4" }, [
                      (openBlock(), createBlock(Fragment, null, renderList(socialIcons, (social, index) => {
                        return createVNode(unref(GlowBorder), {
                          key: index,
                          color: ["#10B981", "#34D399", "#6EE7B7"],
                          class: "rounded-full"
                        }, {
                          default: withCtx(() => [
                            createVNode("a", {
                              href: social.link,
                              class: "p-2 bg-surface-100 dark:bg-surface-800 rounded-full text-surface-900 dark:text-surface-100 hover:text-primary transition-colors"
                            }, [
                              (openBlock(), createBlock(resolveDynamicComponent(social.icon), { class: "w-5 h-5" }))
                            ], 8, ["href"])
                          ]),
                          _: 2
                        }, 1024);
                      }), 64))
                    ])
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/Footer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const siteUrl = "https://intellistaffsolutions.com";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c;
    let __temp, __restore;
    const { data: navbarContent } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("navbarContent", () => queryContent("layout/navbar").findOne())), __temp = await __temp, __restore(), __temp);
    [__temp, __restore] = withAsyncContext(() => useAsyncData("footerContent", () => queryContent("layout/footer").findOne())), __temp = await __temp, __restore();
    const route = useRoute();
    const title = ref(`${((_a = navbarContent.value) == null ? void 0 : _a.businessName) || "IntelliStaff Solutions"} | Home`);
    const description = ref("AI-powered recruitment platform revolutionizing hiring processes");
    const metaImage = ref("/og-image.jpg");
    const canonicalUrl = computed(() => `${siteUrl}${route.fullPath}`);
    useHead({
      titleTemplate: (titleChunk) => {
        var _a2, _b2;
        return titleChunk ? `${titleChunk} - ${((_a2 = navbarContent.value) == null ? void 0 : _a2.businessName) || "IntelliStaff Solutions"}` : ((_b2 = navbarContent.value) == null ? void 0 : _b2.businessName) || "IntelliStaff Solutions";
      },
      title,
      meta: [
        { name: "description", content: description },
        { name: "author", content: ((_b = navbarContent.value) == null ? void 0 : _b.businessName) || "IntelliStaff Solutions" },
        { name: "og:title", content: title },
        { name: "og:description", content: description },
        { name: "og:type", content: "website" },
        { name: "og:url", content: canonicalUrl },
        { name: "og:image", content: `${siteUrl}${metaImage.value}` },
        { name: "og:site_name", content: ((_c = navbarContent.value) == null ? void 0 : _c.businessName) || "IntelliStaff Solutions" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: `${siteUrl}${metaImage.value}` },
        { name: "robots", content: "index, follow" },
        { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
        { name: "bingbot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
        { name: "keywords", content: "recruitment, AI-powered hiring, job matching, talent acquisition, career opportunities" },
        { name: "format-detection", content: "telephone=no" }
      ],
      link: [
        { rel: "canonical", href: canonicalUrl },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }
      ],
      htmlAttrs: {
        lang: "en"
      }
    });
    const isDarkMode = ref(false);
    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      (void 0).documentElement.classList.toggle("dark", isDarkMode.value);
      localStorage.setItem("color-scheme", isDarkMode.value ? "dark" : "light");
    };
    const showScrollTopButton = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      const _component_Navbar = __nuxt_component_0;
      const _component_Footer = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [{ "dark": isDarkMode.value }, "flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white"]
      }, _attrs))}><header class="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow">`);
      _push(ssrRenderComponent(_component_Navbar, {
        items: (_a2 = unref(navbarContent)) == null ? void 0 : _a2.items,
        onToggleDarkMode: toggleDarkMode,
        "is-dark-mode": isDarkMode.value
      }, null, _parent));
      _push(`</header><main class="flex-grow">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="bg-gray-100 dark:bg-gray-800">`);
      _push(ssrRenderComponent(_component_Footer, null, null, _parent));
      _push(`</footer><button style="${ssrRenderStyle(showScrollTopButton.value ? null : { display: "none" })}" class="fixed bottom-4 right-4 p-2 rounded-full bg-primary text-white shadow-lg transition-opacity duration-300 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50" aria-label="Scroll to top"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg></button></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-CQpC2Jd6.mjs.map
