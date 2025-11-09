import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cloud, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setSetting } from "@/lib/db";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function StorageModeSelection() {
  const navigate = useNavigate();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleModeSelection = async (mode: 'local' | 'cloud') => {
    setIsSelecting(true);
    try {
      await setSetting('storageMode', mode);
      toast.success(`${mode === 'local' ? 'Local' : 'Cloud'} storage selected`);
      
      if (mode === 'local') {
        navigate('/setup');
      } else {
        navigate('/cloud-auth');
      }
    } catch (error) {
      toast.error('Failed to save storage mode');
      setIsSelecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      <Card className="w-full max-w-md bg-[hsl(222,47%,15%)]/90 backdrop-blur-sm border-white/10 p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <div className="text-4xl">📔</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Choose Storage Mode</h1>
          <p className="text-white/60 text-sm">
            Select how you want to save your diary entries
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => handleModeSelection('local')}
            disabled={isSelecting}
            className="w-full h-auto py-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 text-white"
          >
            <div className="flex items-center gap-4 w-full">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <HardDrive className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-lg">Local Storage</div>
                <div className="text-xs text-white/60 mt-1">
                  Save on this device only. Fast and private.
                </div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => handleModeSelection('cloud')}
            disabled={isSelecting}
            className="w-full h-auto py-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/30 text-white"
          >
            <div className="flex items-center gap-4 w-full">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Cloud className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-lg">Cloud Storage</div>
                <div className="text-xs text-white/60 mt-1">
                  Sync across devices with Gmail. Access anywhere.
                </div>
              </div>
            </div>
          </Button>
        </div>

        <p className="text-xs text-white/40 text-center">
          You can migrate from local to cloud storage later in settings
        </p>
      </Card>
    </div>
  );
}
