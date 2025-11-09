import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      navigate('/unlock');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      <Card className="w-full max-w-md bg-[hsl(222,47%,15%)]/90 backdrop-blur-sm border-white/10 p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-white/60 text-sm">Create a new password for your account</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="newPassword" className="text-white/80 text-sm">New Password</Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 4 characters)"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-white/80 text-sm">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <Button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
            ) : (
              'Update Password'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
