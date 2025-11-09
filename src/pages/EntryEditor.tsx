import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Smile, Menu as MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoodSelector } from "@/components/MoodSelector";
import { updateStreak } from "@/lib/db";
import { addEntry, getEntry, updateEntry, deleteEntry } from "@/lib/storage";
import { checkAchievements } from "@/lib/achievements";
import { celebrateEntry } from "@/lib/confetti";
import { toast } from "sonner";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { soundManager } from "@/lib/sounds";

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
      const newEntry = await addEntry({
        title,
        content,
        mood,
        tags: tagArray,
        date,
      });
      savedId = newEntry.id;
      await updateStreak();
      await checkAchievements();
      celebrateEntry();
      soundManager.entrySaved();
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
        soundManager.delete();
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Smile className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900/95 border-purple-500/30 backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-white mb-4">How are you feeling?</h3>
                <MoodSelector value={mood} onChange={setMood} />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
              <MenuIcon className="w-5 h-5" />
            </Button>
            {!isNew && (
              <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 shadow-lg shadow-purple-500/30">
              <Save className="w-5 h-5 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Editor - Full Screen */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-10">
        {/* Title */}
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          className="bg-transparent border-none text-white text-3xl font-bold px-0 focus-visible:ring-0 placeholder:text-white/40 border-b-2 border-purple-500/30 focus-visible:border-purple-500 rounded-none pb-2"
        />

        {/* Content */}
        <div className="bg-transparent">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder="Write more here..."
            className="quill-dark-fullscreen"
          />
        </div>

        {/* Hidden Mood Selector and Tags - accessible via toolbar */}
        <div className="hidden">
          <MoodSelector value={mood} onChange={setMood} />
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="work, personal, travel..."
          />
        </div>
      </main>
    </div>
  );
}
