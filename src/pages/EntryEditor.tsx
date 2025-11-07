import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoodSelector } from "@/components/MoodSelector";
import { addEntry, getEntry, updateEntry, deleteEntry, updateStreak } from "@/lib/db";
import { checkAchievements } from "@/lib/achievements";
import { celebrateEntry } from "@/lib/confetti";
import { toast } from "sonner";
import { format } from "date-fns";
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
    <div className="min-h-screen bg-[hsl(222,47%,11%)] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-[hsl(222,47%,15%)] border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex gap-2">
            {!isNew && (
              <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white px-6">
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Editor - Full Screen */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Date and Mood */}
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-base">
            {format(new Date(), 'dd MMM yyyy')}
          </div>
          <div className="text-4xl">
            {mood === 'happy' && '😊'}
            {mood === 'sad' && '😢'}
            {mood === 'excited' && '🤩'}
            {mood === 'calm' && '😌'}
            {mood === 'angry' && '😠'}
            {mood === 'anxious' && '😰'}
          </div>
        </div>

        {/* Title */}
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="bg-transparent border-none text-white/60 text-lg font-normal px-0 focus-visible:ring-0 placeholder:text-white/40"
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
