import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEntry, deleteEntry, DiaryEntry, getAllEntries } from "@/lib/db";
import { getMoodEmoji } from "@/components/MoodSelector";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAmbientSound } from "@/hooks/use-ambient-sound";

export default function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [allEntries, setAllEntries] = useState<DiaryEntry[]>([]);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const { currentSound, playSound } = useAmbientSound();

  useEffect(() => {
    loadAllEntries();
  }, []);

  useEffect(() => {
    if (id) {
      loadEntry(id);
    }
    // Auto-play saved ambient sound when viewing entry
    if (currentSound !== 'none') {
      playSound(currentSound);
    }
  }, [id]);

  const loadAllEntries = async () => {
    const entries = await getAllEntries();
    const sorted = entries.sort((a, b) => b.createdAt - a.createdAt);
    setAllEntries(sorted);
  };

  const loadEntry = async (entryId: string) => {
    const data = await getEntry(entryId);
    if (data) {
      setEntry(data);
    } else {
      toast.error("Entry not found");
      navigate("/dashboard");
    }
  };

  const handleDelete = async () => {
    if (id && confirm("Are you sure you want to delete this entry?")) {
      await deleteEntry(id);
      toast.success("Entry deleted");
      navigate("/dashboard");
    }
  };

  const getCurrentIndex = () => {
    return allEntries.findIndex(e => e.id === id);
  };

  const navigateToEntry = (direction: 'prev' | 'next') => {
    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < allEntries.length) {
      navigate(`/view/${allEntries[newIndex].id}`);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next entry
        navigateToEntry('next');
      } else {
        // Swipe right - previous entry
        navigateToEntry('prev');
      }
    }
  };

  const currentIndex = getCurrentIndex();
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allEntries.length - 1;

  if (!entry) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] animate-pulse-glow pointer-events-none" />
      
      {/* Header */}
      <header className="flex-shrink-0 bg-black/20 backdrop-blur-md border-b border-white/10 relative z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-white/80 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            {hasPrev && (
              <Button variant="ghost" size="icon" onClick={() => navigateToEntry('prev')} className="text-white/60 hover:text-white hover:bg-white/10">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            {hasNext && (
              <Button variant="ghost" size="icon" onClick={() => navigateToEntry('next')} className="text-white/60 hover:text-white hover:bg-white/10">
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 shadow-lg shadow-purple-500/30" asChild>
              <Link to={`/entry/${id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content - Full Screen with swipe */}
      <main 
        className="flex-1 overflow-y-auto px-4 py-6 relative z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Date and Mood */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="text-white/70 text-base">
            {format(new Date(entry.createdAt), 'dd MMM yyyy • h:mm a')}
          </div>
          <div className="text-5xl animate-float drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            {getMoodEmoji(entry.mood)}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-white text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient animate-slide-up">
          {entry.title}
        </h1>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 animate-slide-up">
            {entry.tags.map((tag, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-sm border border-purple-400/30 backdrop-blur-sm hover:scale-105 transition-transform"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Content */}
        <div 
          className="text-white/90 text-xl leading-relaxed prose prose-xl max-w-none prose-invert prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-em:text-white/80 animate-slide-up"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </main>
    </div>
  );
}
