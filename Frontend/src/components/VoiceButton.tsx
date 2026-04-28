import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface Props { onResult: (text: string) => void; lang?: string }

export default function VoiceButton({ onResult, lang = "en-US" }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const r = new SR();
    r.lang = lang; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      onResult(text);
      toast.success(`Heard: "${text}"`);
    };
    r.onerror = () => { toast.error("Voice input failed"); setListening(false); };
    r.onend = () => setListening(false);
    recRef.current = r;
    return () => { try { r.stop(); } catch {} };
  }, [lang, onResult]);

  if (!supported) return null;

  const toggle = () => {
    const r = recRef.current; if (!r) return;
    if (listening) { r.stop(); setListening(false); }
    else { try { r.start(); setListening(true); } catch {} }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative size-11 rounded-xl border flex items-center justify-center transition-all ${
        listening ? "border-primary bg-primary/20 text-primary animate-pulse-glow" : "border-border hover:border-primary/50 text-muted-foreground hover:text-primary"
      }`}
      title={listening ? "Listening…" : "Voice input"}
    >
      {listening ? <Mic className="size-4" /> : <MicOff className="size-4" />}
      {listening && <span className="absolute -inset-1 rounded-xl border-2 border-primary/40 animate-ping" />}
    </button>
  );
}