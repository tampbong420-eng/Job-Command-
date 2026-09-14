"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { tapHaptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";

type SpeechEngine = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function createSpeechEngine(): SpeechEngine | null {
  const Speech = (
    window as unknown as {
      SpeechRecognition?: new () => SpeechEngine;
      webkitSpeechRecognition?: new () => SpeechEngine;
    }
  ).SpeechRecognition ?? (
    window as unknown as { webkitSpeechRecognition?: new () => SpeechEngine }
  ).webkitSpeechRecognition;
  if (!Speech) return null;
  return new Speech();
}

export function JobScopeTalk({
  jobId,
  customerName,
  onSaved,
}: {
  jobId: string;
  customerName: string;
  onSaved: (scope: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [listening, setListening] = useState(false);
  const [pending, setPending] = useState(false);
  const engineRef = useRef<SpeechEngine | null>(null);

  useEffect(() => {
    return () => engineRef.current?.stop();
  }, []);

  function toggleTalk() {
    if (listening) {
      engineRef.current?.stop();
      setListening(false);
      return;
    }
    const engine = createSpeechEngine();
    if (!engine) {
      toast.error("Talk works in Chrome or Safari. You can still type the scope.");
      return;
    }
    engine.lang = "en-US";
    engine.interimResults = false;
    engine.continuous = true;
    engine.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const spoken = last?.[0]?.transcript?.trim();
      if (spoken) {
        setNotes((current) => (current.trim() ? `${current.trim()} ${spoken}` : spoken));
      }
    };
    engine.onerror = () => {
      setListening(false);
      toast.error("Could not hear that. Type it, or tap Talk again.");
    };
    engine.onend = () => setListening(false);
    engineRef.current = engine;
    try {
      engine.start();
      setListening(true);
      tapHaptic();
    } catch {
      toast.error("Microphone is blocked. Type the scope instead.");
    }
  }

  async function writeScope() {
    if (!notes.trim()) return;
    setPending(true);
    engineRef.current?.stop();
    setListening(false);
    try {
      const payload = await api<{ scope: string }>(`/api/jobs/${jobId}/scope`, {
        method: "POST",
        body: JSON.stringify({ notes }),
      });
      tapHaptic("success");
      toast.success(`Scope posted for ${customerName}`);
      onSaved(payload.scope);
      setNotes("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to write scope");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2 rounded-2xl bg-background p-3 ring-1 ring-border">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        Scope for crew
      </p>
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Talk or type what they should do on this job"
        rows={3}
        disabled={pending}
      />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={toggleTalk}
          disabled={pending}
          className={cn(
            "flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold",
            listening
              ? "clock-in-move bg-boss text-ink"
              : "bg-secondary ring-1 ring-boss/30",
          )}
        >
          {listening ? <Square className="size-4" /> : <Mic className="size-4" />}
          {listening ? "Stop" : "Talk"}
        </button>
        <button
          type="button"
          onClick={() => void writeScope()}
          disabled={pending || !notes.trim()}
          className="flex h-11 items-center justify-center rounded-xl bg-logo text-sm font-semibold text-ink disabled:opacity-50"
        >
          {pending ? "Writing…" : "Write scope"}
        </button>
      </div>
    </div>
  );
}
