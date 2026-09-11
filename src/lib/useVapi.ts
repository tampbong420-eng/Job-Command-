import Vapi from '@vapi-ai/web';
import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'connecting' | 'connected' | 'error';

export function useVapi({
  publicKey,
  assistantId,
}: {
  publicKey: string;
  assistantId: string;
}) {
  const clientRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);

  useEffect(() => {
    if (!publicKey) {
      clientRef.current = null;
      return;
    }
    const client = new Vapi(publicKey);
    clientRef.current = client;
    const onStart = () => setStatus('connected');
    const onEnd = () => setStatus('idle');
    const onError = (err: unknown) => {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Voice engine error');
    };
    const onMessage = (message: { type?: string; role?: string; transcript?: string }) => {
      if (message.type === 'transcript' && message.transcript) {
        setTranscript((prev) => [...prev, `${message.role ?? 'voice'}: ${message.transcript}`]);
      }
    };
    client.on('call-start', onStart);
    client.on('call-end', onEnd);
    client.on('error', onError);
    client.on('message', onMessage);
    return () => {
      client.stop();
      clientRef.current = null;
    };
  }, [publicKey]);

  const start = useCallback(async () => {
    setError(null);
    setTranscript([]);
    if (!publicKey || !assistantId) {
      setStatus('error');
      setError('Add your Vapi public key and assistant ID in Settings to arm a live test call.');
      return { ok: false as const, demo: true };
    }
    setStatus('connecting');
    try {
      await clientRef.current?.start(assistantId);
      return { ok: true as const, demo: false };
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unable to start Vapi call');
      return { ok: false as const, demo: false };
    }
  }, [assistantId, publicKey]);

  const stop = useCallback(() => {
    clientRef.current?.stop();
    setStatus('idle');
  }, []);

  return {
    start,
    stop,
    status,
    error,
    transcript,
    isLive: status === 'connected',
  };
}
