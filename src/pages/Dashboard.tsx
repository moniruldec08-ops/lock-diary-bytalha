import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Calendar, Menu, Settings, Trophy, Flame, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllEntries, getSetting, DiaryEntry } from "@/lib/db";
import { getMoodEmoji } from "@/components/MoodSelector";
import { getAchievements } from "@/lib/achievements";
import QuoteOfTheDay from "@/components/QuoteOfTheDay";
import { format } from "date-fns";

export default function Dashboard() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allEntries = await getAllEntries();
    setEntries(allEntries.sort((a, b) => b.createdAt - a.createdAt));
    
    const streak = await getSetting('streakCount') || 0;
    setStreakCount(streak);

    const achievements = await getAchievements();
    setUnlockedCount(achievements.filter(a => a.unlocked).length);
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] animate-pulse-glow pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/10">
              <Link to="/settings">
                <Menu className="w-6 h-6" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              My Diary
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {streakCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-full backdrop-blur-sm">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white font-bold text-sm">{streakCount}</span>
              </div>
            )}
            {unlockedCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-full backdrop-blur-sm">
                <Award className="w-4 h-4 text-green-400" />
                <span className="text-white font-bold text-sm">{unlockedCount}</span>
              </div>
            )}
            <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/10">
              <Link to="/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your diary..."
              className="pl-10 py-3 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 backdrop-blur-sm"
            />
          </div>
        </div>
      </header>

      {/* Entries List */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-24 relative z-10">
        <QuoteOfTheDay />
        <div className="mt-4">
        {filteredEntries.length === 0 ? (
          <div className="mt-8 bg-black/20 backdrop-blur-md rounded-3xl border border-purple-500/30 p-8 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-center mb-4 animate-pulse-glow">
                <Calendar className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">No entries yet</h2>
              <p className="text-white/60 mb-6">
                Start your journaling journey by creating your first entry
              </p>
              <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30">
                <Link to="/entry/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Entry
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry, index) => (
              <Link key={entry.id} to={`/view/${entry.id}`}>
                <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-purple-500/30 p-4 hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all cursor-pointer animate-fade-in">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl flex-shrink-0 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{getMoodEmoji(entry.mood)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-1 truncate">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-white/50 mb-2">
                        {format(new Date(entry.createdAt), 'dd MMM yyyy, h:mm a')}
                      </p>
                      <p className="text-white/70 line-clamp-2 text-base">
                        {entry.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                      </p>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 text-xs rounded-full backdrop-blur-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          asChild
          className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:shadow-[0_0_60px_rgba(168,85,247,0.8)] transition-all hover:scale-110"
        >
          <Link to="/entry/new">
            <Plus className="w-7 h-7" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
