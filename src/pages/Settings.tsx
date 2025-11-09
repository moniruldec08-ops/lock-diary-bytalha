import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Download, Award, Volume2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSetting, setSetting, setLockPassword, getAllEntries } from "@/lib/db";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const streak = await getSetting('streakCount') || 0;
    setStreakCount(streak);

    const entries = await getAllEntries();
    setTotalEntries(entries.length);
  };


  const handleChangePassword = async () => {
    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    await setLockPassword(newPassword);
    setNewPassword("");
    toast.success("Password updated successfully!");
  };

  const handleExportData = async () => {
    const entries = await getAllEntries();
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-diary-backup-${Date.now()}.json`;
    link.click();
    toast.success("Diary exported successfully!");
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[hsl(222,47%,15%)] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/achievements">
            <div className="bg-[hsl(222,47%,15%)] rounded-2xl border border-white/10 p-4 hover:bg-[hsl(222,47%,18%)] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/20">
                  <Award className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Achievements</p>
                  <p className="text-lg font-bold text-white">View →</p>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-[hsl(222,47%,15%)] rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500/20">
                <Trophy className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">Day Streak</p>
                <p className="text-lg font-bold text-white">{streakCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-[hsl(222,47%,15%)] rounded-2xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white">Security</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">Change your diary password</p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="new-password" className="text-white/80 text-sm">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 4 characters)"
                className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Button onClick={handleChangePassword} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Update Password
            </Button>
          </div>
        </div>

        {/* Sound Effects */}
        <div className="bg-[hsl(222,47%,15%)] rounded-2xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white">Sound Effects</h3>
          </div>
          <p className="text-sm text-white/60">
            Interactive sound effects enhance your experience when saving entries, unlocking achievements, and completing actions. Sounds play automatically at full volume.
          </p>
        </div>

        {/* Data Management */}
        <div className="bg-[hsl(222,47%,15%)] rounded-2xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white">Data Management</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">Export or backup your diary</p>
          <Button onClick={handleExportData} className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Download className="w-4 h-4 mr-2" />
            Export All Entries (JSON)
          </Button>
        </div>

        {/* About */}
        <div className="bg-[hsl(222,47%,15%)] rounded-2xl border border-white/10 p-6 text-center">
          <p className="font-semibold text-purple-400 mb-1">My Diary Pro</p>
          <p className="text-white/60 text-sm">Version 1.0.0</p>
          <p className="mt-2 text-white/60 text-sm">Your private, secure digital journal</p>
        </div>
      </main>
    </div>
  );
}
