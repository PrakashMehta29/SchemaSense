import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { S as SectionTitle, G as GlassCard } from "./ui-bits-DiJjH9oN.js";
import { Globe } from "lucide-react";
import "motion/react";
import "react";
function Multilingual() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { kicker: "Intelligence", title: /* @__PURE__ */ jsxs(Fragment, { children: [
      "Multilingual ",
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Support." })
    ] }), sub: "Translate and interact across multiple languages." }),
    /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxs(GlassCard, { className: "p-8 flex flex-col items-center justify-center text-center h-64", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary", children: /* @__PURE__ */ jsx(Globe, { className: "w-8 h-8" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold mb-2", children: "Global Access" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm max-w-sm", children: "This module is currently in development. It will enable processing schemas and communicating with the AI in over 50 languages." })
    ] }) })
  ] });
}
export {
  Multilingual as component
};
