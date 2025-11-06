import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyLockPassword } from "@/lib/db";
import { toast } from "sonner";

export default function Unlock() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const navigate = useNavigate();

  const handleUnlock = async () => {
    const isValid = await verifyLockPassword(password);
    
    if (isValid) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error("Incorrect password");
      setIsShaking(true);
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
    <div className="min-h-screen gradient-bg-ocean flex items-center justify-center p-4">
      <Card className={`w-full max-w-md shadow-elevated animate-scale-in ${isShaking ? "animate-bounce" : ""}`}>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-6 bg-primary/10 rounded-full animate-float">
              <Lock className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">My Diary Pro</CardTitle>
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
            className="w-full text-lg py-6 shadow-glow transition-bounce"
            size="lg"
          >
            Unlock Diary
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
