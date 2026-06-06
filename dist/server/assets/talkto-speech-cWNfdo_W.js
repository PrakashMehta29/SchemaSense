import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { S as SectionTitle, G as GlassCard } from "./ui-bits-DiJjH9oN.js";
import { Mic } from "lucide-react";
import "motion/react";
import "react";
function TalkToSpeech() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { kicker: "Intelligence", title: /* @__PURE__ */ jsxs(Fragment, { children: [
      "Talk to ",
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Speech." })
    ] }), sub: "Interact with the AI via voice commands." }),
    /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxs(GlassCard, { className: "p-8 flex flex-col items-center justify-center text-center h-64", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary", children: /* @__PURE__ */ jsx(Mic, { className: "w-8 h-8" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold mb-2", children: "Voice Input Ready" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm max-w-sm", children: "This module is currently in development. Soon you will be able to speak directly to the AI to query your schema." })
    ] }) })
  ] });
}
export {
  TalkToSpeech as component
};
