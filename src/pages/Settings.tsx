import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Moon, Sun, Download, Trophy, Palette, Award, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { getSetting, setSetting, setLockPassword, getAllEntries } from "@/lib/db";
import { toast } from "sonner";
import { useAmbientSound, AmbientSoundType } from "@/hooks/use-ambient-sound";

export default function Settings() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const { currentSound, volume, playSound, changeVolume } = useAmbientSound();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const theme = await getSetting('theme') || 'light';
    setIsDark(theme === 'dark');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    const streak = await getSetting('streakCount') || 0;
    setStreakCount(streak);

    const entries = await getAllEntries();
    setTotalEntries(entries.length);
  };

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    await setSetting('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`);
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

        {/* Ambient Sounds */}
        <div className="bg-[hsl(222,47%,15%)] rounded-2xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white">Ambient Sounds</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">Play soft background sounds while writing</p>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white/80 text-sm mb-2 block">Sound Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['none', 'rain', 'ocean', 'forest'] as AmbientSoundType[]).map((sound) => (
                  <Button
                    key={sound}
                    onClick={() => playSound(sound)}
                    variant={currentSound === sound ? "default" : "outline"}
                    className={currentSound === sound 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0" 
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                    }
                  >
                    {sound === 'none' ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                    {sound.charAt(0).toUpperCase() + sound.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white/80 text-sm">Volume</Label>
                <span className="text-white/60 text-sm">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={([val]) => changeVolume(val)}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
          </div>
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
