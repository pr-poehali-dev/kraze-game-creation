import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Circle {
  id: string;
  x: number;
  y: number;
  radius: number;
  playerId: string;
  playerName: string;
  multiplier: number;
  betAmount: number;
}

interface Puck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  distance: number;
}

interface Bet {
  circleId: string;
  amount: number;
  multiplier: number;
}

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [puck, setPuck] = useState<Puck>({ x: 0, y: 0, vx: 0, vy: 0, active: false, distance: 0 });
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [timeUntilLaunch, setTimeUntilLaunch] = useState(30);
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [isPlacingCircle, setIsPlacingCircle] = useState(false);
  const [previewRadius, setPreviewRadius] = useState(20);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const mouseDownTimeRef = useRef<number>(0);
  const mouseDownRef = useRef(false);
  const animationRef = useRef<number>();
  const lastLaunchRef = useRef<number>(Date.now());

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PUCK_RADIUS = 12;
  const MIN_RADIUS = 20;
  const MAX_RADIUS = 100;
  const ROUND_DURATION = 30000;

  const calculateMultiplier = (radius: number) => {
    return Math.max(1.1, (MAX_RADIUS / radius) * 0.8).toFixed(2);
  };

  const launchPuck = () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2;

    setPuck({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed,
      active: true,
      distance: 0,
    });

    lastLaunchRef.current = Date.now();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (puck.active || currentBet) return;
    if (betAmount > balance) {
      toast.error('Недостаточно средств');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseDownRef.current = true;
    mouseDownTimeRef.current = Date.now();
    setIsPlacingCircle(true);
    setPreviewRadius(MIN_RADIUS);
    setPreviewPosition({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mouseDownRef.current) return;

    const holdTime = Date.now() - mouseDownTimeRef.current;
    const newRadius = Math.min(MIN_RADIUS + holdTime / 20, MAX_RADIUS);
    setPreviewRadius(newRadius);
  };

  const handleMouseUp = () => {
    if (!mouseDownRef.current || !isPlacingCircle) return;

    const radius = previewRadius;
    const multiplier = parseFloat(calculateMultiplier(radius));

    const newCircle: Circle = {
      id: Date.now().toString(),
      x: previewPosition.x,
      y: previewPosition.y,
      radius,
      playerId: 'player1',
      playerName: 'Вы',
      multiplier,
      betAmount,
    };

    setCircles([...circles, newCircle]);
    setCurrentBet({
      circleId: newCircle.id,
      amount: betAmount,
      multiplier,
    });
    setBalance((prev) => prev - betAmount);
    toast.success(`Ставка ${betAmount}₽ принята! Коэффициент: x${multiplier}`);

    mouseDownRef.current = false;
    setIsPlacingCircle(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - lastLaunchRef.current;
      const remaining = Math.max(0, Math.ceil((ROUND_DURATION - elapsed) / 1000));
      setTimeUntilLaunch(remaining);

      if (remaining === 0 && !puck.active) {
        launchPuck();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [puck.active]);

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
        ctx.fillStyle = circle.playerId === 'player1' ? 'rgba(255, 229, 229, 0.6)' : 'rgba(229, 243, 255, 0.6)';
        ctx.fill();
        ctx.strokeStyle = circle.playerId === 'player1' ? '#FF9999' : '#99CCFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Rubik';
        ctx.textAlign = 'center';
        ctx.fillText(`x${circle.multiplier}`, circle.x, circle.y - 5);
        ctx.font = '12px Rubik';
        ctx.fillText(`${circle.betAmount}₽`, circle.x, circle.y + 10);
      });

      if (isPlacingCircle) {
        ctx.beginPath();
        ctx.arc(previewPosition.x, previewPosition.y, previewRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 229, 229, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#FF9999';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Rubik';
        ctx.textAlign = 'center';
        ctx.fillText(`x${calculateMultiplier(previewRadius)}`, previewPosition.x, previewPosition.y);
      }

      if (puck.active) {
        const newPuck = { ...puck };

        newPuck.x += newPuck.vx;
        newPuck.y += newPuck.vy;
        newPuck.distance += Math.sqrt(newPuck.vx * newPuck.vx + newPuck.vy * newPuck.vy);

        if (newPuck.x - PUCK_RADIUS < 0 || newPuck.x + PUCK_RADIUS > CANVAS_WIDTH) {
          newPuck.vx *= -1;
          newPuck.x = Math.max(PUCK_RADIUS, Math.min(CANVAS_WIDTH - PUCK_RADIUS, newPuck.x));
        }
        if (newPuck.y - PUCK_RADIUS < 0 || newPuck.y + PUCK_RADIUS > CANVAS_HEIGHT) {
          newPuck.vy *= -1;
          newPuck.y = Math.max(PUCK_RADIUS, Math.min(CANVAS_HEIGHT - PUCK_RADIUS, newPuck.y));
        }

        let hitDetected = false;
        circles.forEach((circle) => {
          const dx = newPuck.x - circle.x;
          const dy = newPuck.y - circle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < PUCK_RADIUS + circle.radius && !hitDetected) {
            hitDetected = true;
            const winAmount = Math.floor(circle.betAmount * circle.multiplier);
            setBalance((prev) => prev + winAmount);
            toast.success(`Выигрыш! +${winAmount}₽ (x${circle.multiplier})`);
            newPuck.active = false;
            setCurrentBet(null);
            setCircles([]);
          }
        });

        if (newPuck.distance > 2000) {
          newPuck.active = false;
          if (currentBet) {
            toast.error('Проигрыш! Шайба не попала в круг');
          }
          setCurrentBet(null);
          setCircles([]);
        }

        ctx.beginPath();
        ctx.arc(newPuck.x, newPuck.y, PUCK_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#F0E5FF';
        ctx.fill();
        ctx.strokeStyle = '#9966FF';
        ctx.lineWidth = 3;
        ctx.stroke();

        const gradient = ctx.createRadialGradient(newPuck.x, newPuck.y, 0, newPuck.x, newPuck.y, PUCK_RADIUS * 2);
        gradient.addColorStop(0, 'rgba(153, 102, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(153, 102, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(newPuck.x, newPuck.y, PUCK_RADIUS * 2, 0, Math.PI * 2);
        ctx.fill();

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
  }, [circles, puck, isPlacingCircle, previewRadius, previewPosition]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="p-6 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Игра</h1>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Баланс</div>
                <div className="text-2xl font-bold text-primary">{balance}₽</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">До старта</div>
                <div className="text-2xl font-bold text-accent-foreground">
                  {timeUntilLaunch}с
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="border-4 border-border rounded-3xl cursor-crosshair shadow-lg w-full"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                {puck.active && (
                  <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur px-4 py-2 rounded-2xl">
                    <div className="text-sm text-accent-foreground font-semibold">
                      Дистанция: {Math.floor(puck.distance)}px
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-primary/20 to-accent/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                  <Icon name="DollarSign" size={20} />
                  Сделать ставку
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Сумма ставки
                    </label>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      disabled={puck.active || currentBet !== null}
                      className="text-lg font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount(amount)}
                        disabled={puck.active || currentBet !== null}
                      >
                        {amount}₽
                      </Button>
                    ))}
                  </div>
                  {currentBet && (
                    <div className="bg-accent/20 rounded-xl p-3">
                      <div className="text-sm text-muted-foreground mb-1">Текущая ставка</div>
                      <div className="font-bold text-lg">{currentBet.amount}₽</div>
                      <div className="text-sm text-accent-foreground">
                        Коэффициент: x{currentBet.multiplier}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4 bg-secondary/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="Info" size={18} />
                  Правила
                </h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Выберите сумму ставки</li>
                  <li>• Зажмите кнопку мыши на поле для выбора размера круга</li>
                  <li>• Чем меньше круг — тем выше коэффициент</li>
                  <li>• Шайба запускается каждые 30 секунд</li>
                  <li>• Попадание в круг = выигрыш!</li>
                </ul>
              </Card>

              <Card className="p-4 bg-muted/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="TrendingUp" size={18} />
                  Статистика раунда
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ставок сделано</span>
                    <span className="font-semibold">{circles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ваша ставка</span>
                    <span className="font-semibold">{currentBet ? `${currentBet.amount}₽` : '-'}</span>
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
