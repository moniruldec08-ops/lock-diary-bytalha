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
    <div className="min-h-screen bg-[hsl(222,47%,11%)] overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[hsl(222,47%,15%)] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white">
              <Link to="/settings">
                <Menu className="w-6 h-6" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-white">
              Lock Diary
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {streakCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white font-bold text-sm">{streakCount}</span>
              </div>
            )}
            {unlockedCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                <Award className="w-4 h-4 text-green-400" />
                <span className="text-white font-bold text-sm">{unlockedCount}</span>
              </div>
            )}
            <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white">
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
              className="pl-10 py-3 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10"
            />
          </div>
        </div>
      </header>

      {/* Entries List */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-24">
        <QuoteOfTheDay />
        <div className="mt-4">
        {filteredEntries.length === 0 ? (
          <div className="mt-8 bg-[hsl(222,47%,15%)] rounded-2xl border border-white/10 p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <Calendar className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">No entries yet</h2>
              <p className="text-white/60 mb-6">
                Start your journaling journey by creating your first entry
              </p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
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
                <div className="bg-[hsl(222,47%,15%)] rounded-2xl border border-white/10 p-4 hover:bg-[hsl(222,47%,18%)] transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">{getMoodEmoji(entry.mood)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-white/50 mb-2">
                        {format(new Date(entry.createdAt), 'dd MMM yyyy, h:mm a')}
                      </p>
                      <p className="text-white/70 line-clamp-2 text-sm">
                        {entry.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                      </p>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
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
          className="rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-700 shadow-lg"
        >
          <Link to="/entry/new">
            <Plus className="w-7 h-7" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
