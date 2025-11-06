import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Moon, Sun, Download, Trophy, Palette, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getSetting, setSetting, setLockPassword, getAllEntries } from "@/lib/db";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg shadow-soft border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/achievements">
            <Card className="shadow-soft hover-lift cursor-pointer">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Award className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold">View →</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="shadow-soft">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/10">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
                <p className="text-2xl font-bold">{streakCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Theme */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize your diary's look</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={isDark}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Change your diary password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 4 characters)"
              />
            </div>
            <Button onClick={handleChangePassword} className="w-full">
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>Export or backup your diary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleExportData} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export All Entries (JSON)
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="shadow-soft">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <p className="font-semibold text-primary mb-1">My Diary Pro</p>
            <p>Version 1.0.0</p>
            <p className="mt-2">Your private, secure digital journal</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
