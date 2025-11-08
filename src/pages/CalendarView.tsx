import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { getAllEntries, DiaryEntry } from "@/lib/db";
import { getMoodEmoji } from "@/components/MoodSelector";
import { format } from "date-fns";

const MOOD_COLORS = {
  happy: 'bg-gradient-to-br from-yellow-500/40 to-orange-500/40 border-yellow-400/50',
  sad: 'bg-gradient-to-br from-blue-500/40 to-indigo-500/40 border-blue-400/50',
  excited: 'bg-gradient-to-br from-pink-500/40 to-purple-500/40 border-pink-400/50',
  calm: 'bg-gradient-to-br from-green-500/40 to-teal-500/40 border-green-400/50',
  anxious: 'bg-gradient-to-br from-red-500/40 to-orange-500/40 border-red-400/50',
  grateful: 'bg-gradient-to-br from-emerald-500/40 to-cyan-500/40 border-emerald-400/50',
};

export default function CalendarView() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entriesByDate, setEntriesByDate] = useState<Map<string, DiaryEntry[]>>(new Map());

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const allEntries = await getAllEntries();
    setEntries(allEntries);
    
    // Group entries by date
    const grouped = new Map<string, DiaryEntry[]>();
    allEntries.forEach(entry => {
      const dateKey = format(new Date(entry.createdAt), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(entry);
    });
    setEntriesByDate(grouped);
  };

  const getDatesWithEntries = () => {
    return Array.from(entriesByDate.keys()).map(dateStr => new Date(dateStr));
  };

  const getSelectedDateEntries = () => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return entriesByDate.get(dateKey) || [];
  };

  const modifiers = {
    hasEntry: getDatesWithEntries(),
  };

  const modifiersStyles = {
    hasEntry: {
      fontWeight: 'bold',
    },
  };

  const selectedEntries = getSelectedDateEntries();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] animate-pulse-glow pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-white/80 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <CalendarIcon className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Calendar View
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Calendar */}
        <div className="bg-black/20 backdrop-blur-md rounded-3xl border border-purple-500/30 p-6 shadow-[0_0_40px_rgba(168,85,247,0.3)] mb-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="mx-auto"
            classNames={{
              day_selected: "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600",
              day_today: "bg-white/10 text-white font-bold",
            }}
          />
        </div>

        {/* Legend */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-purple-500/30 p-4 mb-6">
          <h3 className="text-white font-semibold mb-3 text-lg">Mood Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(MOOD_COLORS).map(([mood, color]) => (
              <div key={mood} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full border ${color}`} />
                <span className="text-white/80 text-sm capitalize">{mood}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Entries */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6">
          <h3 className="text-white font-bold text-xl mb-4">
            {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Select a date'}
          </h3>
          
          {selectedEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-white/60">No entries on this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => navigate(`/view/${entry.id}`)}
                  className={`rounded-xl border p-4 cursor-pointer hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all ${MOOD_COLORS[entry.mood as keyof typeof MOOD_COLORS] || 'bg-white/5 border-white/20'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                      {getMoodEmoji(entry.mood)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-lg mb-1 truncate">
                        {entry.title}
                      </h4>
                      <p className="text-white/70 line-clamp-2 text-sm">
                        {entry.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                      <p className="text-white/50 text-xs mt-2">
                        {format(new Date(entry.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
