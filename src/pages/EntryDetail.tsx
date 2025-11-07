import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEntry, deleteEntry, DiaryEntry } from "@/lib/db";
import { getMoodEmoji } from "@/components/MoodSelector";
import { format } from "date-fns";
import { toast } from "sonner";

export default function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);

  useEffect(() => {
    if (id) {
      loadEntry(id);
    }
  }, [id]);

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
    <div className="min-h-screen bg-[hsl(222,47%,11%)] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-[hsl(222,47%,15%)] border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4" asChild>
              <Link to={`/entry/${id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content - Full Screen */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {/* Date and Mood */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-white/60 text-base">
            {format(new Date(entry.createdAt), 'dd MMM yyyy • h:mm a')}
          </div>
          <div className="text-4xl">
            {getMoodEmoji(entry.mood)}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-white text-2xl font-semibold mb-4">
          {entry.title}
        </h1>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {entry.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="bg-blue-500/20 text-blue-300 text-sm border-0">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Content */}
        <div 
          className="text-white/90 text-lg leading-relaxed prose prose-lg max-w-none prose-invert prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-em:text-white/80"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </main>
    </div>
  );
}
