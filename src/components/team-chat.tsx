"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { BASE_CHANNELS, jobChannelId, jobChannelLabel, dmChannelId } from "@/lib/chat";
import { formatJobNumber, initials } from "@/lib/format";
import { tapHaptic } from "@/lib/haptic";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/lib/domain";
import type { JobListItem } from "@/lib/services/jobs";

type ChatMessage = {
  id: string;
  channel: string;
  body: string;
  imageUrl: string | null;
  createdAt: string | Date;
  authorId: string | null;
  authorName: string | null;
  authorAvatar: string | null;
};

export function TeamChat({
  user,
  jobs,
  teammates,
}: {
  user: PublicUser;
  jobs: JobListItem[];
  teammates: PublicUser[];
}) {
  const channels = useMemo(() => {
    const jobLanes = jobs
      .filter((job) => job.status !== "completed" && job.status !== "cancelled")
      .slice(0, 6)
      .map((job) => ({
        id: jobChannelId(job.id),
        label: jobChannelLabel(job.jobNumber),
      }));
    const dms = teammates
      .filter((person) => person.id !== user.id)
      .slice(0, 4)
      .map((person) => ({
        id: dmChannelId(user.id, person.id),
        label: person.name.split(" ")[0] ?? person.name,
      }));
    return [...BASE_CHANNELS, ...jobLanes, ...dms];
  }, [jobs, teammates, user.id]);

  const [channel, setChannel] = useState<string>(BASE_CHANNELS[2].id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const payload = await api<{ messages: ChatMessage[] }>(`/api/chat?channel=${encodeURIComponent(channel)}`);
        if (!cancelled) setMessages(payload.messages);
      } catch {
        if (!cancelled) setMessages([]);
      }
    }
    void load();
    const timer = setInterval(() => void load(), 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [channel]);

  async function send() {
    if (!body.trim()) return;
    setPending(true);
    try {
      const result = await api<{ message: ChatMessage }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ channel, body }),
      });
      tapHaptic("success");
      setMessages((current) => [...current, result.message]);
      setBody("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Message did not send");
    } finally {
      setPending(false);
    }
  }

  const selected = channels.find((item) => item.id === channel);

  return (
    <div className="flex min-h-[28rem] flex-col gap-3">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {channels.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setChannel(item.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ring-1",
              item.id === channel ? "bg-boss text-ink ring-boss" : "bg-card text-muted-foreground ring-border",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-card ring-1 ring-border">
        <div className="border-b border-border px-4 py-2">
          <p className="text-sm font-semibold">{selected?.label}</p>
          <p className="text-[11px] text-muted-foreground">Cached on this phone if the signal drops.</p>
        </div>
        <div className="flex max-h-[22rem] flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
          {messages.map((message) => {
            const mine = message.authorId === user.id;
            return (
              <div key={message.id} className={cn("flex gap-2", mine && "flex-row-reverse")}>
                <Avatar className="size-8">
                  {message.authorAvatar ? <AvatarImage src={message.authorAvatar} alt="" /> : null}
                  <AvatarFallback className="text-[10px]">{initials(message.authorName || "JC")}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    mine ? "bg-boss text-ink" : "bg-background ring-1 ring-border",
                  )}
                >
                  {!mine ? (
                    <p className="mb-0.5 text-[10px] font-medium opacity-70">{message.authorName}</p>
                  ) : null}
                  <p className="leading-snug">{message.body}</p>
                </div>
              </div>
            );
          })}
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No messages in this lane yet.</p>
          ) : null}
        </div>
        <div className="border-t border-border p-3">
          <Textarea
            rows={2}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={`Message ${selected?.label ?? ""}`}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
          />
          <div className="mt-2 flex justify-end">
            <Button type="button" disabled={pending || !body.trim()} onClick={() => void send()}>
              Send
            </Button>
          </div>
        </div>
      </div>
      {channel.startsWith("job:") ? (
        <p className="text-xs text-muted-foreground">
          Job thread {jobs.find((job) => jobChannelId(job.id) === channel)
            ? formatJobNumber(jobs.find((job) => jobChannelId(job.id) === channel)!.jobNumber)
            : ""}
        </p>
      ) : null}
    </div>
  );
}
