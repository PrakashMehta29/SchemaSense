import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle, GlassCard } from "@/components/ui-bits";
import { Globe } from "lucide-react";

export const Route = createFileRoute("/multilingual")({
  head: () => ({ meta: [{ title: "Multilingual · SchemaSense" }] }),
  component: Multilingual,
});

function Multilingual() {
  return (
    <div>
      <SectionTitle
        kicker="Intelligence"
        title={
          <>
            Multilingual <span className="text-primary">Support.</span>
          </>
        }
        sub="Translate and interact across multiple languages."
      />
      <div className="mt-8">
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center h-64">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Global Access</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            This module is currently in development. It will enable processing schemas and
            communicating with the AI in over 50 languages.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
