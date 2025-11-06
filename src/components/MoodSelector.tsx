import { cn } from "@/lib/utils";

const MOODS = [
  { emoji: "😊", value: "happy", label: "Happy" },
  { emoji: "😔", value: "sad", label: "Sad" },
  { emoji: "😡", value: "angry", label: "Angry" },
  { emoji: "😌", value: "calm", label: "Calm" },
  { emoji: "😰", value: "anxious", label: "Anxious" },
  { emoji: "😴", value: "tired", label: "Tired" },
  { emoji: "🤩", value: "excited", label: "Excited" },
  { emoji: "😐", value: "neutral", label: "Neutral" },
];

interface MoodSelectorProps {
  value: string;
  onChange: (mood: string) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={cn(
            "flex flex-col items-center justify-center p-3 rounded-2xl transition-all",
            "hover:scale-110 active:scale-95",
            value === mood.value
              ? "bg-primary text-primary-foreground shadow-glow scale-110"
              : "bg-card hover:bg-muted"
          )}
          title={mood.label}
        >
          <span className="text-2xl mb-1">{mood.emoji}</span>
          <span className="text-xs font-medium">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}

export function getMoodEmoji(mood: string): string {
  return MOODS.find(m => m.value === mood)?.emoji || "😊";
}
