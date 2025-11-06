import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Unlock as UnlockIcon } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyLockPassword } from "@/lib/db";
import { toast } from "sonner";

export default function Unlock() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const navigate = useNavigate();

  const handleUnlock = async () => {
    setIsUnlocking(true);
    const isValid = await verifyLockPassword(password);
    
    if (isValid) {
      toast.success("Welcome back!");
      setTimeout(() => navigate("/dashboard"), 500);
    } else {
      toast.error("Incorrect password");
      setIsShaking(true);
      setIsUnlocking(false);
      setTimeout(() => setIsShaking(false), 500);
      setPassword("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  };

  return (
    <div className="min-h-screen gradient-bg-ocean flex items-center justify-center p-4 relative overflow-hidden">
      <Card className={`w-full max-w-md shadow-elevated animate-scale-in glass-effect ${isShaking ? "animate-bounce" : ""}`}>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`transition-all duration-500 ${isUnlocking ? "scale-110 rotate-12" : ""}`}>
              <img 
                src={logo} 
                alt="Lock Diary" 
                className="w-24 h-24 drop-shadow-2xl animate-float" 
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
            Lock Diary
          </CardTitle>
          <CardDescription className="text-base">
            Enter your password to unlock your diary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                className="pr-10 text-lg py-6"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="w-full text-lg py-6 shadow-glow transition-bounce animate-glow-pulse"
            size="lg"
          >
            {isUnlocking ? (
              <>
                <UnlockIcon className="w-5 h-5 mr-2 animate-spin" />
                Unlocking...
              </>
            ) : (
              <>
                <UnlockIcon className="w-5 h-5 mr-2" />
                Unlock Diary
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
