import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

const Index = () => {
  const features = [
    {
      icon: 'Target',
      title: 'Простая механика',
      description: 'Размещайте круги и зарабатывайте очки за попадания',
    },
    {
      icon: 'Users',
      title: 'Мультиплеер',
      description: 'Соревнуйтесь с другими игроками в реальном времени',
    },
    {
      icon: 'Award',
      title: 'Достижения',
      description: 'Получайте медали за особые игровые результаты',
    },
  ];

  const stats = [
    { label: 'Активных игроков', value: '1,234' },
    { label: 'Игр сегодня', value: '5,678' },
    { label: 'Очков разыграно', value: '1.2M' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-6xl font-bold text-foreground animate-fade-in">
              Краш-игра
            </h1>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              Размещайте круги, запускайте шайбу и зарабатывайте очки. Чем меньше круг — тем больше награда!
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link to="/game">
                <Button size="lg" className="text-lg px-8 hover-scale">
                  <Icon name="Play" className="mr-2" size={24} />
                  Начать игру
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button size="lg" variant="outline" className="text-lg px-8 hover-scale">
                  <Icon name="Trophy" className="mr-2" size={24} />
                  Рейтинг
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="p-6 text-center bg-white/80 backdrop-blur hover-scale"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 bg-white/80 backdrop-blur hover-scale transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mb-4">
                  <Icon name={feature.icon as any} size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <Card className="p-12 bg-white/90 backdrop-blur">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-foreground">Как играть?</h2>
              <div className="grid md:grid-cols-4 gap-8 pt-8">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                    1
                  </div>
                  <h4 className="font-semibold">Выберите размер</h4>
                  <p className="text-sm text-muted-foreground">
                    Меньше круг = больше очков
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                    2
                  </div>
                  <h4 className="font-semibold">Разместите круги</h4>
                  <p className="text-sm text-muted-foreground">
                    Кликайте по полю для размещения
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                    3
                  </div>
                  <h4 className="font-semibold">Запустите шайбу</h4>
                  <p className="text-sm text-muted-foreground">
                    Она полетит в случайном направлении
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                    4
                  </div>
                  <h4 className="font-semibold">Получите очки</h4>
                  <p className="text-sm text-muted-foreground">
                    При попадании в ваш круг
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
