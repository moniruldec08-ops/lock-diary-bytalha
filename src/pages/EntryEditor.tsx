import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MoodSelector } from "@/components/MoodSelector";
import { addEntry, getEntry, updateEntry, deleteEntry, updateStreak } from "@/lib/db";
import { checkAchievements } from "@/lib/achievements";
import { celebrateEntry } from "@/lib/confetti";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EntryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("happy");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (!isNew && id) {
      loadEntry(id);
    }
  }, [id, isNew]);

  const loadEntry = async (entryId: string) => {
    const entry = await getEntry(entryId);
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setMood(entry.mood);
      setTags(entry.tags.join(", "));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!content.trim()) {
      toast.error("Please write something in your diary");
      return;
    }

    const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
    const date = new Date().toISOString();

    let savedId = id;
    
    if (isNew) {
      savedId = await addEntry({
        title,
        content,
        mood,
        tags: tagArray,
        date,
      });
      await updateStreak();
      await checkAchievements();
      celebrateEntry();
      toast.success("Entry saved! 🎉", {
        description: "Keep up the great work!",
      });
    } else if (id) {
      await updateEntry(id, {
        title,
        content,
        mood,
        tags: tagArray,
        date,
      });
      toast.success("Entry updated!");
    }

    navigate(`/view/${savedId}`);
  };

  const handleDelete = async () => {
    if (id && !isNew) {
      if (confirm("Are you sure you want to delete this entry?")) {
        await deleteEntry(id);
        toast.success("Entry deleted");
        navigate("/dashboard");
      }
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg shadow-soft border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">
            {isNew ? "New Entry" : "Edit Entry"}
          </h1>
          <div className="flex gap-2">
            {!isNew && (
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="w-5 h-5 text-destructive" />
              </Button>
            )}
            <Button onClick={handleSave} size="sm" className="shadow-glow">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="shadow-soft animate-fade-in">
          <CardContent className="pt-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title..."
                className="text-lg font-semibold"
              />
            </div>

            {/* Mood Selector */}
            <div className="space-y-2">
              <Label>How are you feeling?</Label>
              <MoodSelector value={mood} onChange={setMood} />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>Your thoughts</Label>
              <div className="bg-card rounded-lg overflow-hidden border border-border">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  placeholder="Start writing your diary entry..."
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="work, personal, travel..."
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
