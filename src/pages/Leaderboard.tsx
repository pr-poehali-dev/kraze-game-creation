import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface Player {
  id: string;
  name: string;
  score: number;
  achievements: number;
  rank: number;
}

const Leaderboard = () => {
  const players: Player[] = [
    { id: '1', name: 'Вы', score: 2450, achievements: 5, rank: 1 },
    { id: '2', name: 'Игрок_123', score: 2100, achievements: 3, rank: 2 },
    { id: '3', name: 'ProGamer', score: 1850, achievements: 4, rank: 3 },
    { id: '4', name: 'Luna', score: 1600, achievements: 2, rank: 4 },
    { id: '5', name: 'StarPlayer', score: 1420, achievements: 3, rank: 5 },
    { id: '6', name: 'Champion', score: 1250, achievements: 1, rank: 6 },
    { id: '7', name: 'Victory', score: 1100, achievements: 2, rank: 7 },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-500';
    if (rank === 3) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Icon name="Trophy" size={36} />
            Рейтинг игроков
          </h1>
          <p className="text-muted-foreground">Лучшие игроки по очкам</p>
        </Card>

        <div className="space-y-3">
          {players.map((player, index) => (
            <Card
              key={player.id}
              className={`p-6 transition-all hover:scale-[1.02] ${
                player.id === '1'
                  ? 'bg-gradient-to-r from-primary/30 to-primary/10 border-primary/50'
                  : 'bg-white/80 backdrop-blur'
              }`}
            >
              <div className="flex items-center gap-6">
                <div
                  className={`text-3xl font-bold w-16 text-center ${getRankColor(
                    player.rank
                  )}`}
                >
                  {getRankIcon(player.rank)}
                </div>

                <Avatar className="w-14 h-14">
                  <AvatarFallback className="text-xl font-semibold bg-accent text-accent-foreground">
                    {player.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">
                    {player.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="Award" size={14} />
                      {player.achievements} достижений
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {player.score.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">очков</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-accent/10 backdrop-blur">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-accent-foreground mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Как попасть в топ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Играйте больше раундов, ставьте маленькие круги для максимума очков и
                получайте достижения за особые игровые результаты!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
