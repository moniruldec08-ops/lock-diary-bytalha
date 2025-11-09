import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { setSetting, getSetting } from "@/lib/db";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function CloudAuth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast.error("Passwords don't match");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (error) throw error;

        await setSetting('cloudPassword', password);
        await setSetting('storageMode', 'cloud');
        
        toast.success("Account created successfully!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        await setSetting('cloudPassword', password);
        toast.success("Signed in successfully!");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || "Authentication failed");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      <Card className={`w-full max-w-md bg-[hsl(222,47%,15%)]/90 backdrop-blur-sm border-white/10 p-8 space-y-6 relative z-10 transition-transform ${
        isShaking ? 'animate-shake' : ''
      }`}>
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Mail className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-white/60 text-sm">
            {isSignUp ? 'Set up your cloud diary' : 'Access your cloud diary'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white/80 text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white/80 text-sm">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min. 4 characters)"
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

          {isSignUp && (
            <div>
              <Label htmlFor="confirmPassword" className="text-white/80 text-sm">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          )}

          <Button
            onClick={handleAuth}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <>{isSignUp ? 'Create Account' : 'Sign In'}</>
            )}
          </Button>

          {!isSignUp && (
            <Button
              onClick={handleResetPassword}
              variant="ghost"
              className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            >
              Forgot Password?
            </Button>
          )}

          <Button
            onClick={() => setIsSignUp(!isSignUp)}
            variant="ghost"
            className="w-full text-white/60 hover:text-white hover:bg-white/5"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
