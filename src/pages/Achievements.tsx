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
    <div className="min-h-screen bg-background relative">
      <header className="sticky top-0 z-50 glass-effect shadow-soft border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Achievements</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="shadow-elevated glass-effect">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {unlockedCount} / {totalCount}
                </h2>
                <p className="text-muted-foreground">Achievements Unlocked</p>
              </div>
            </div>
            <Progress value={(unlockedCount / totalCount) * 100} className="h-3" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`shadow-soft hover-lift transition-all ${
                achievement.unlocked ? 'border-primary/50 bg-primary/5' : 'opacity-70'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`text-4xl ${
                      achievement.unlocked ? 'animate-bounce-in' : 'grayscale opacity-50'
                    }`}
                  >
                    {achievement.unlocked ? achievement.icon : <Lock className="w-10 h-10" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    {achievement.target && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">
                            {achievement.progress || 0} / {achievement.target}
                          </span>
                        </div>
                        <Progress
                          value={((achievement.progress || 0) / achievement.target) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/20">
                      <Trophy className="w-5 h-5 text-success" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
