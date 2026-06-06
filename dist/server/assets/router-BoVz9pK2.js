import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouterState, Link, Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, BarChart3, AlertTriangle, Upload, BookOpen, Download, MessageSquare, Mic, Globe, Sun, Moon } from "lucide-react";
function DataCloud({ className = "", density = 40 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId;
    let time = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener("resize", resize);
    resize();
    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);
      const isDark = document.documentElement.classList.contains("dark");
      const numRibbons = 4;
      const points = 100;
      ctx.globalCompositeOperation = isDark ? "screen" : "multiply";
      for (let rIdx = 0; rIdx < numRibbons; rIdx++) {
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        const opacityBase = isDark ? 0.15 : 0.4;
        const opacityFaded = isDark ? 0.02 : 0.1;
        gradient.addColorStop(0, `rgba(242, 120, 92, ${opacityBase})`);
        gradient.addColorStop(0.5, `rgba(250, 209, 196, ${opacityFaded})`);
        gradient.addColorStop(1, `rgba(242, 120, 92, ${opacityBase})`);
        ctx.fillStyle = gradient;
        const phase = rIdx * 1.8;
        const speed = time * 0.4;
        const yOffset = (rIdx - numRibbons / 2) * (height * 0.1);
        for (let j = 0; j <= points; j++) {
          const t = j / points;
          const x = t * width;
          const wave1 = Math.sin(x * 15e-4 + speed + phase) * (height * 0.25);
          const wave2 = Math.cos(x * 2e-3 - speed * 0.5 + phase * 0.8) * (height * 0.1);
          const y = height / 2 + wave1 + wave2 + yOffset;
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        for (let j = points; j >= 0; j--) {
          const t = j / points;
          const x = t * width;
          const wave1 = Math.sin(x * 15e-4 + speed + phase) * (height * 0.25);
          const wave2 = Math.cos(x * 2e-3 - speed * 0.5 + phase * 0.8) * (height * 0.1);
          const thickness = height * 0.12 + Math.sin(x * 25e-4 + speed * 1.2 + phase) * (height * 0.08);
          const y = height / 2 + wave1 + wave2 + yOffset + thickness;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      time += 0.012;
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density]);
  return /* @__PURE__ */ jsxs("div", { className: `fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background transition-colors duration-500 ${className}`, children: [
    /* @__PURE__ */ jsx(
      "canvas",
      {
        ref: canvasRef,
        className: "absolute inset-0 opacity-100"
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none",
        style: {
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }
      }
    )
  ] });
}
function BrandLogo({ className = "w-8 h-8 mr-3 shrink-0" }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className, children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M12 2L2 7l10 5 10-5-10-5z",
        transform: "translate(0, 8)",
        fill: "var(--foreground)",
        fillOpacity: 0.02,
        stroke: "var(--foreground)",
        strokeOpacity: 0.15,
        strokeWidth: 1
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M12 2L2 7l10 5 10-5-10-5z",
        transform: "translate(0, 4)",
        fill: "var(--foreground)",
        fillOpacity: 0.04,
        stroke: "var(--foreground)",
        strokeOpacity: 0.25,
        strokeWidth: 1
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M12 2L2 7l10 5 10-5-10-5z",
        fill: "var(--primary)",
        fillOpacity: 0.35,
        stroke: "var(--primary)",
        strokeWidth: 1.5,
        style: { filter: "drop-shadow(0 0 8px var(--primary))" }
      }
    )
  ] });
}
const navGroups = [
  {
    title: "OVERVIEW",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/summary", label: "Summary", icon: BarChart3 },
      { to: "/anomalies", label: "Anomalies", icon: AlertTriangle }
    ]
  },
  {
    title: "DATA MANAGEMENT",
    items: [
      { to: "/upload", label: "Upload", icon: Upload },
      { to: "/dictionary", label: "Dictionary", icon: BookOpen },
      { to: "/export", label: "Export", icon: Download }
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { to: "/ask", label: "Ask AI", icon: MessageSquare },
      { to: "/talkto-speech", label: "Talkto speech", icon: Mic },
      { to: "/multilingual", label: "Multilingual", icon: Globe }
    ]
  }
];
function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);
  return /* @__PURE__ */ jsxs("div", { className: "flex w-screen h-screen overflow-hidden bg-transparent text-foreground", children: [
    /* @__PURE__ */ jsx(DataCloud, { density: 70 }),
    /* @__PURE__ */ jsxs("aside", { className: "w-64 h-full flex-shrink-0 border-r glass-panel backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20 hidden md:flex flex-col px-4 py-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-8 px-2", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center", children: [
        /* @__PURE__ */ jsx(BrandLogo, {}),
        /* @__PURE__ */ jsx("span", { className: "font-display text-2xl font-bold tracking-tight text-foreground", children: "SchemaSense" })
      ] }) }),
      /* @__PURE__ */ jsx("nav", { className: "flex flex-col gap-6 w-full overflow-y-auto pb-4 custom-scrollbar", children: navGroups.map((group, idx) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col w-full", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-4", children: group.title }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1 w-full", children: group.items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return /* @__PURE__ */ jsx(
            Link,
            {
              to,
              className: `group relative flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${active ? "border border-primary/20 bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]" : "border border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Icon, { className: "h-[18px] w-[18px]" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: label })
              ] })
            },
            to
          );
        }) })
      ] }, idx)) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-auto rounded-xl border glass-panel-heavy p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "h-2 w-2 animate-pulse-dot rounded-full bg-primary glow-lime" }),
          "Engine online"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono-tight text-[11px] text-muted-foreground/80", children: "v0.42 · region us-east" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 h-full overflow-y-auto relative z-10 bg-transparent flex flex-col", children: [
      /* @__PURE__ */ jsx("div", { className: "w-full max-w-[1600px] mx-auto px-8 pt-8 relative z-50", children: /* @__PURE__ */ jsx("div", { className: "flex justify-end hidden md:flex items-center", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsDark(!isDark),
          className: "flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full glass-panel-heavy hover:bg-black/5 dark:hover:bg-white/10 transition-colors shadow-sm border border-border",
          children: isDark ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Sun, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsx("span", { children: "Light Mode" })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsx("span", { children: "Dark Mode" })
          ] })
        }
      ) }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/60 bg-background/60 px-4 py-3 backdrop-blur md:hidden mb-8", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center font-display text-base font-bold", children: [
          /* @__PURE__ */ jsx(BrandLogo, { className: "w-6 h-6 mr-2 shrink-0" }),
          "SchemaSense"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "v0.42" })
      ] }),
      /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -8 },
          transition: { type: "spring", stiffness: 220, damping: 26 },
          className: "w-full max-w-[1600px] mx-auto px-8 pb-24",
          children: /* @__PURE__ */ jsx(Outlet, {})
        },
        pathname
      ) })
    ] })
  ] });
}
const appCss = "/assets/styles-BcUjF9u9.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$a = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SchemaSense — AI Data Schema Intelligence" },
      { name: "description", content: "Upload, profile, and understand your data schemas with AI — dictionary, lineage, anomaly detection and more." },
      { name: "author", content: "SchemaSense" },
      { property: "og:title", content: "SchemaSense — AI Data Schema Intelligence" },
      { property: "og:description", content: "Upload, profile, and understand your data schemas with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$a.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(AppShell, {}) });
}
const $$splitComponentImporter$9 = () => import("./upload-BcCgdYro.js");
const Route$9 = createFileRoute("/upload")({
  head: () => ({
    meta: [{
      title: "Upload · SchemaSense"
    }, {
      name: "description",
      content: "Drag and drop your dataset to begin schema analysis."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./talkto-speech-cWNfdo_W.js");
const Route$8 = createFileRoute("/talkto-speech")({
  head: () => ({
    meta: [{
      title: "Talk to Speech · SchemaSense"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./summary-DxNRLI9y.js");
const Route$7 = createFileRoute("/summary")({
  head: () => ({
    meta: [{
      title: "Summary · SchemaSense"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./multilingual-e9g61pF3.js");
const Route$6 = createFileRoute("/multilingual")({
  head: () => ({
    meta: [{
      title: "Multilingual · SchemaSense"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./lineage-DL4kboxC.js");
const Route$5 = createFileRoute("/lineage")({
  head: () => ({
    meta: [{
      title: "Lineage · SchemaSense"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./export-CS3D-Cyj.js");
const Route$4 = createFileRoute("/export")({
  head: () => ({
    meta: [{
      title: "Export · SchemaSense"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./dictionary-Cfga3yvz.js");
const Route$3 = createFileRoute("/dictionary")({
  head: () => ({
    meta: [{
      title: "Dictionary · SchemaSense"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./ask-BJAPUvl0.js");
const Route$2 = createFileRoute("/ask")({
  head: () => ({
    meta: [{
      title: "Ask AI · SchemaSense"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./anomalies-IEyOvG4S.js");
const Route$1 = createFileRoute("/anomalies")({
  head: () => ({
    meta: [{
      title: "Anomalies · SchemaSense"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-zmWTCh1-.js");
const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Dashboard · SchemaSense"
    }, {
      name: "description",
      content: "Live overview of your data schema health, columns evaluated and anomalies."
    }, {
      property: "og:title",
      content: "SchemaSense Dashboard"
    }, {
      property: "og:description",
      content: "Analyze your schema in real time."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const UploadRoute = Route$9.update({
  id: "/upload",
  path: "/upload",
  getParentRoute: () => Route$a
});
const TalktoSpeechRoute = Route$8.update({
  id: "/talkto-speech",
  path: "/talkto-speech",
  getParentRoute: () => Route$a
});
const SummaryRoute = Route$7.update({
  id: "/summary",
  path: "/summary",
  getParentRoute: () => Route$a
});
const MultilingualRoute = Route$6.update({
  id: "/multilingual",
  path: "/multilingual",
  getParentRoute: () => Route$a
});
const LineageRoute = Route$5.update({
  id: "/lineage",
  path: "/lineage",
  getParentRoute: () => Route$a
});
const ExportRoute = Route$4.update({
  id: "/export",
  path: "/export",
  getParentRoute: () => Route$a
});
const DictionaryRoute = Route$3.update({
  id: "/dictionary",
  path: "/dictionary",
  getParentRoute: () => Route$a
});
const AskRoute = Route$2.update({
  id: "/ask",
  path: "/ask",
  getParentRoute: () => Route$a
});
const AnomaliesRoute = Route$1.update({
  id: "/anomalies",
  path: "/anomalies",
  getParentRoute: () => Route$a
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$a
});
const rootRouteChildren = {
  IndexRoute,
  AnomaliesRoute,
  AskRoute,
  DictionaryRoute,
  ExportRoute,
  LineageRoute,
  MultilingualRoute,
  SummaryRoute,
  TalktoSpeechRoute,
  UploadRoute
};
const routeTree = Route$a._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  BrandLogo as B,
  router as r
};
