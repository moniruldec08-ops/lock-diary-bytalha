import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getAchievements, Achievement } from '@/lib/achievements';

export default function Achievements() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const data = await getAchievements();
    setAchievements(data);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-[hsl(222,47%,15%)] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-white">Achievements</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <div className="bg-[hsl(222,47%,15%)] rounded-2xl border border-white/10 p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Trophy className="w-7 h-7 text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {unlockedCount} / {totalCount}
              </h2>
              <p className="text-white/60 text-sm">Achievements Unlocked</p>
            </div>
          </div>
          <Progress value={(unlockedCount / totalCount) * 100} className="h-2" />
        </div>

        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-[hsl(222,47%,15%)] rounded-2xl border p-4 ${
                achievement.unlocked ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`text-3xl ${
                    achievement.unlocked ? '' : 'grayscale opacity-40'
                  }`}
                >
                  {achievement.unlocked ? achievement.icon : <Lock className="w-8 h-8 text-white/40" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-1 text-white">{achievement.title}</h3>
                  <p className="text-sm text-white/60 mb-2">{achievement.description}</p>
                  {achievement.target && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">Progress</span>
                        <span className="font-semibold text-white/80">
                          {achievement.progress || 0} / {achievement.target}
                        </span>
                      </div>
                      <Progress
                        value={((achievement.progress || 0) / achievement.target) * 100}
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>
                {achievement.unlocked && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20">
                    <Trophy className="w-4 h-4 text-green-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
