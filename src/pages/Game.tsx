import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Circle {
  id: string;
  x: number;
  y: number;
  radius: number;
  playerId: string;
  playerName: string;
}

interface Puck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [puck, setPuck] = useState<Puck>({ x: 0, y: 0, vx: 0, vy: 0, active: false });
  const [selectedRadius, setSelectedRadius] = useState(50);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const animationRef = useRef<number>();

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PUCK_RADIUS = 10;
  const FRICTION = 0.995;

  const addCircle = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newCircle: Circle = {
      id: Date.now().toString(),
      x,
      y,
      radius: selectedRadius,
      playerId: 'player1',
      playerName: 'Вы',
    };

    setCircles([...circles, newCircle]);
  };

  const launchPuck = () => {
    const angle = Math.random() * Math.PI / 3 - Math.PI / 6;
    const speed = 8 + Math.random() * 4;

    setPuck({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed,
      active: true,
    });
    setGameStarted(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#FFF9E5';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      circles.forEach((circle) => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.playerId === 'player1' ? '#FFE5E5' : '#E5F3FF';
        ctx.fill();
        ctx.strokeStyle = circle.playerId === 'player1' ? '#FF9999' : '#99CCFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = '14px Rubik';
        ctx.textAlign = 'center';
        ctx.fillText(circle.playerName, circle.x, circle.y);
      });

      if (puck.active) {
        const newPuck = { ...puck };

        newPuck.x += newPuck.vx;
        newPuck.y += newPuck.vy;

        if (newPuck.x - PUCK_RADIUS < 0 || newPuck.x + PUCK_RADIUS > CANVAS_WIDTH) {
          newPuck.vx *= -1;
          newPuck.x = Math.max(PUCK_RADIUS, Math.min(CANVAS_WIDTH - PUCK_RADIUS, newPuck.x));
        }
        if (newPuck.y - PUCK_RADIUS < 0 || newPuck.y + PUCK_RADIUS > CANVAS_HEIGHT) {
          newPuck.vy *= -1;
          newPuck.y = Math.max(PUCK_RADIUS, Math.min(CANVAS_HEIGHT - PUCK_RADIUS, newPuck.y));
        }

        newPuck.vx *= FRICTION;
        newPuck.vy *= FRICTION;

        circles.forEach((circle) => {
          const dx = newPuck.x - circle.x;
          const dy = newPuck.y - circle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < PUCK_RADIUS + circle.radius) {
            const points = Math.floor(1000 / circle.radius);
            setScore((prev) => prev + points);
            newPuck.active = false;
            setGameStarted(false);
          }
        });

        if (Math.abs(newPuck.vx) < 0.1 && Math.abs(newPuck.vy) < 0.1) {
          newPuck.active = false;
          setGameStarted(false);
        }

        ctx.beginPath();
        ctx.arc(newPuck.x, newPuck.y, PUCK_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#F0E5FF';
        ctx.fill();
        ctx.strokeStyle = '#9966FF';
        ctx.lineWidth = 2;
        ctx.stroke();

        setPuck(newPuck);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [circles, puck]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="p-6 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Игра</h1>
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold">
                Очки: <span className="text-primary">{score}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border-4 border-border rounded-3xl cursor-crosshair shadow-lg"
                onClick={addCircle}
              />

              <div className="flex gap-3">
                <Button
                  onClick={launchPuck}
                  disabled={gameStarted || circles.length === 0}
                  className="flex-1"
                  size="lg"
                >
                  <Icon name="Play" className="mr-2" size={20} />
                  Запустить шайбу
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="p-4 bg-accent/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Circle" size={18} />
                  Размер круга
                </h3>
                <div className="space-y-3">
                  {[30, 50, 70, 90].map((size) => (
                    <Button
                      key={size}
                      variant={selectedRadius === size ? 'default' : 'outline'}
                      onClick={() => setSelectedRadius(size)}
                      className="w-full"
                    >
                      Радиус {size}px
                      <span className="ml-auto text-xs opacity-70">
                        {Math.floor(1000 / size)} очков
                      </span>
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="p-4 bg-secondary/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="Info" size={18} />
                  Правила
                </h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Кликайте на поле, чтобы разместить круг</li>
                  <li>• Чем меньше круг — тем больше очков</li>
                  <li>• Шайба летит в случайном направлении</li>
                  <li>• Попадание в круг даёт очки</li>
                </ul>
              </Card>

              <Card className="p-4 bg-muted/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="Users" size={18} />
                  Игроки
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-primary"></div>
                    <span>Вы</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Game;
