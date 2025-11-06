import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen gradient-bg-1">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg shadow-soft border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="w-5 h-5 text-destructive" />
            </Button>
            <Button size="sm" className="shadow-glow" asChild>
              <Link to={`/entry/${id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card className="shadow-elevated animate-fade-in overflow-hidden">
          {/* Decorative header with mood */}
          <div className="h-32 gradient-bg-3 flex items-center justify-center">
            <div className="text-8xl animate-float">
              {getMoodEmoji(entry.mood)}
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Title and date */}
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {entry.title}
              </h1>
              <p className="text-muted-foreground">
                {format(new Date(entry.createdAt), 'EEEE, dd MMMM yyyy • h:mm a')}
              </p>
            </div>

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
