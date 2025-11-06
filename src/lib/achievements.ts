import { getAllEntries, getSetting, setSetting } from './db';
import { toast } from 'sonner';
import { celebrateMilestone } from './confetti';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

const achievementsList: Omit<Achievement, 'unlocked' | 'progress'>[] = [
  { id: 'first_entry', title: 'First Step', description: 'Create your first diary entry', icon: '✍️', target: 1 },
  { id: 'week_streak', title: 'Week Warrior', description: 'Write for 7 days straight', icon: '🔥', target: 7 },
  { id: 'month_streak', title: 'Monthly Master', description: 'Write for 30 days straight', icon: '🌟', target: 30 },
  { id: 'ten_entries', title: 'Getting Started', description: 'Create 10 entries', icon: '📝', target: 10 },
  { id: 'fifty_entries', title: 'Dedicated Diarist', description: 'Create 50 entries', icon: '📚', target: 50 },
  { id: 'hundred_entries', title: 'Century Club', description: 'Create 100 entries', icon: '💯', target: 100 },
  { id: 'all_moods', title: 'Emotional Explorer', description: 'Use all mood types', icon: '🎭', target: 6 },
  { id: 'night_writer', title: 'Night Owl', description: 'Write after midnight', icon: '🌙' },
];

export async function checkAchievements() {
  const entries = await getAllEntries();
  const streakCount = await getSetting('streakCount') || 0;
  const unlockedAchievements: string[] = JSON.parse(await getSetting('achievements') || '[]');
  const newUnlocked: string[] = [];

  // Check entry count achievements
  if (entries.length >= 1 && !unlockedAchievements.includes('first_entry')) {
    newUnlocked.push('first_entry');
  }
  if (entries.length >= 10 && !unlockedAchievements.includes('ten_entries')) {
    newUnlocked.push('ten_entries');
  }
  if (entries.length >= 50 && !unlockedAchievements.includes('fifty_entries')) {
    newUnlocked.push('fifty_entries');
  }
  if (entries.length >= 100 && !unlockedAchievements.includes('hundred_entries')) {
    newUnlocked.push('hundred_entries');
    celebrateMilestone();
  }

  // Check streak achievements
  if (streakCount >= 7 && !unlockedAchievements.includes('week_streak')) {
    newUnlocked.push('week_streak');
  }
  if (streakCount >= 30 && !unlockedAchievements.includes('month_streak')) {
    newUnlocked.push('month_streak');
    celebrateMilestone();
  }

  // Check mood diversity
  const uniqueMoods = new Set(entries.map(e => e.mood));
  if (uniqueMoods.size >= 6 && !unlockedAchievements.includes('all_moods')) {
    newUnlocked.push('all_moods');
  }

  // Check night writer
  const hasNightEntry = entries.some(e => {
    const hour = new Date(e.createdAt).getHours();
    return hour >= 0 && hour < 6;
  });
  if (hasNightEntry && !unlockedAchievements.includes('night_writer')) {
    newUnlocked.push('night_writer');
  }

  // Save and notify new achievements
  if (newUnlocked.length > 0) {
    const allUnlocked = [...unlockedAchievements, ...newUnlocked];
    await setSetting('achievements', JSON.stringify(allUnlocked));

    newUnlocked.forEach(id => {
      const achievement = achievementsList.find(a => a.id === id);
      if (achievement) {
        toast.success(`🎉 Achievement Unlocked!`, {
          description: `${achievement.icon} ${achievement.title}`,
          duration: 5000,
        });
      }
    });
  }
}

export async function getAchievements(): Promise<Achievement[]> {
  const entries = await getAllEntries();
  const streakCount = await getSetting('streakCount') || 0;
  const unlockedAchievements: string[] = JSON.parse(await getSetting('achievements') || '[]');
  const uniqueMoods = new Set(entries.map(e => e.mood));

  return achievementsList.map(achievement => {
    let progress = 0;
    
    switch (achievement.id) {
      case 'first_entry':
      case 'ten_entries':
      case 'fifty_entries':
      case 'hundred_entries':
        progress = entries.length;
        break;
      case 'week_streak':
      case 'month_streak':
        progress = streakCount;
        break;
      case 'all_moods':
        progress = uniqueMoods.size;
        break;
    }

    return {
      ...achievement,
      unlocked: unlockedAchievements.includes(achievement.id),
      progress,
    };
  });
}
