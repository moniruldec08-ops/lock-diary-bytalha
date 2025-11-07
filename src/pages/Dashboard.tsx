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
import AnimatedBackground from "@/components/AnimatedBackground";
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
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground type="gradient" />
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect shadow-soft border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/settings">
                <Menu className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
              Lock Diary
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {streakCount > 0 && (
              <Badge variant="secondary" className="gap-1 px-3 py-1 shadow-soft hover-lift animate-glow-pulse">
                <Flame className="w-4 h-4 text-accent" />
                <span className="font-bold">{streakCount}</span>
              </Badge>
            )}
            {unlockedCount > 0 && (
              <Badge variant="secondary" className="gap-1 px-3 py-1 shadow-soft hover-lift">
                <Award className="w-4 h-4 text-success" />
                <span className="font-bold">{unlockedCount}</span>
              </Badge>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link to="/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your diary..."
              className="pl-10 py-6 shadow-soft glass-effect"
            />
          </div>
        </div>
      </header>

      {/* Entries List */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <QuoteOfTheDay />
        <div className="mt-6">
        {filteredEntries.length === 0 ? (
          <Card className="mt-8 shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No entries yet</h2>
              <p className="text-muted-foreground mb-6">
                Start your journaling journey by creating your first entry
              </p>
              <Button asChild size="lg" className="shadow-glow">
                <Link to="/entry/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Entry
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => (
              <Link key={entry.id} to={`/view/${entry.id}`}>
                <Card
                  className="group hover:shadow-elevated transition-all hover:scale-[1.02] cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-4xl">{getMoodEmoji(entry.mood)}</span>
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                              {entry.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(entry.createdAt), 'dd MMM yyyy, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 mb-3">
                          {entry.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
          size="lg"
          className="rounded-full w-16 h-16 shadow-elevated hover:shadow-glow transition-all hover:scale-110 animate-glow-pulse"
        >
          <Link to="/entry/new">
            <Plus className="w-8 h-8" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
