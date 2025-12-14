import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const Profile = () => {
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Первая победа',
      description: 'Выиграйте первый раунд',
      icon: '🎯',
      unlocked: true,
    },
    {
      id: '2',
      name: 'Снайпер',
      description: 'Попадите в круг радиусом 30px',
      icon: '🎪',
      unlocked: true,
    },
    {
      id: '3',
      name: 'Мастер',
      description: 'Наберите 1000 очков за раунд',
      icon: '⭐',
      unlocked: true,
    },
    {
      id: '4',
      name: 'Профессионал',
      description: 'Выиграйте 10 раундов подряд',
      icon: '🏆',
      unlocked: false,
    },
    {
      id: '5',
      name: 'Легенда',
      description: 'Попадите в топ-3 игроков',
      icon: '👑',
      unlocked: true,
    },
    {
      id: '6',
      name: 'Безупречный',
      description: 'Наберите 5000 очков за раунд',
      icon: '💎',
      unlocked: false,
    },
  ];

  const stats = {
    totalGames: 42,
    wins: 28,
    totalScore: 2450,
    bestScore: 1350,
    winRate: 67,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8 bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-4xl font-bold bg-accent text-accent-foreground">
                В
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">Вы</h1>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-sm">
                  Ранг #1
                </Badge>
                <Badge variant="outline" className="text-sm">
                  5 достижений
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Играю с {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold text-primary">
                {stats.totalScore.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Всего очков</div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white/80 backdrop-blur">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="BarChart3" size={24} />
              Статистика
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Всего игр</span>
                <span className="text-2xl font-bold">{stats.totalGames}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Побед</span>
                <span className="text-2xl font-bold text-green-600">{stats.wins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Лучший счёт</span>
                <span className="text-2xl font-bold text-primary">
                  {stats.bestScore}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Процент побед</span>
                  <span className="font-bold">{stats.winRate}%</span>
                </div>
                <Progress value={stats.winRate} className="h-3" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="TrendingUp" size={24} />
              Прогресс
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">До следующего уровня</span>
                  <span className="text-sm font-semibold">450/1000 очков</span>
                </div>
                <Progress value={45} className="h-3" />
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Открыто достижений
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-accent/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-accent-foreground">
                      {achievements.filter((a) => a.unlocked).length}
                    </div>
                    <div className="text-xs text-muted-foreground">из {achievements.length}</div>
                  </div>
                  <div className="flex-1 bg-secondary/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-secondary-foreground">
                      {Math.round(
                        (achievements.filter((a) => a.unlocked).length /
                          achievements.length) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">прогресс</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Award" size={24} />
            Достижения
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`p-4 transition-all hover:scale-105 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30'
                    : 'bg-muted/30 opacity-60 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">
                  {achievement.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
                {achievement.unlocked && (
                  <Badge variant="secondary" className="mt-3 text-xs">
                    <Icon name="Check" size={12} className="mr-1" />
                    Получено
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
