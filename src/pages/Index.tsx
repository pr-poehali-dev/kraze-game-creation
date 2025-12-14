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
  stopped: boolean;
}

interface Bet {
  circleId: string;
  amount: number;
  multiplier: number;
}

interface RoundHistory {
  id: number;
  result: 'win' | 'loss';
  multiplier: number;
  amount: number;
  winAmount: number;
}

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [puck, setPuck] = useState<Puck>({ x: 0, y: 0, vx: 0, vy: 0, active: false, distance: 0, stopped: false });
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [timeUntilLaunch, setTimeUntilLaunch] = useState(30);
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [isPlacingCircle, setIsPlacingCircle] = useState(false);
  const [previewRadius, setPreviewRadius] = useState(20);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [roundHistory, setRoundHistory] = useState<RoundHistory[]>([]);
  const mouseDownTimeRef = useRef<number>(0);
  const mouseDownRef = useRef(false);
  const animationRef = useRef<number>();
  const lastLaunchRef = useRef<number>(Date.now());
  const maxDistanceRef = useRef<number>(0);

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 550;
  const PUCK_RADIUS = 14;
  const MIN_RADIUS = 25;
  const MAX_RADIUS = 120;
  const ROUND_DURATION = 30000;

  const calculateMultiplier = (radius: number) => {
    return Math.max(1.2, (MAX_RADIUS / radius) * 1.2).toFixed(2);
  };

  const launchPuck = () => {
    const angle = Math.random() * Math.PI * 2;
    const minDistance = 300;
    const maxDistance = 1500;
    const targetDistance = minDistance + Math.random() * (maxDistance - minDistance);
    maxDistanceRef.current = targetDistance;

    const duration = 3000 + Math.random() * 7000;
    const speed = targetDistance / (duration / 16);

    setPuck({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      vx: Math.sin(angle) * (speed / 60),
      vy: -Math.cos(angle) * (speed / 60),
      active: true,
      distance: 0,
      stopped: false,
    });

    lastLaunchRef.current = Date.now();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (puck.active || currentBet || timeUntilLaunch < 5) return;
    if (betAmount > balance) {
      toast.error('Недостаточно средств');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    mouseDownRef.current = true;
    mouseDownTimeRef.current = Date.now();
    setIsPlacingCircle(true);
    setPreviewRadius(MIN_RADIUS);
    setPreviewPosition({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mouseDownRef.current) return;

    const holdTime = Date.now() - mouseDownTimeRef.current;
    const newRadius = Math.min(MIN_RADIUS + holdTime / 15, MAX_RADIUS);
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

    setCircles([newCircle]);
    setCurrentBet({
      circleId: newCircle.id,
      amount: betAmount,
      multiplier,
    });
    setBalance((prev) => prev - betAmount);
    toast.success(`Ставка ${betAmount}₽ принята! x${multiplier}`, {
      style: { background: '#1a2332', color: '#fff', border: '1px solid #2d3748' }
    });

    mouseDownRef.current = false;
    setIsPlacingCircle(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - lastLaunchRef.current;
      let remaining = Math.max(-5, Math.ceil((ROUND_DURATION - elapsed) / 1000));
      
      if (puck.stopped && remaining > 0) {
        remaining = 0;
      }
      
      setTimeUntilLaunch(remaining);

      if (remaining === 0 && !puck.active && !puck.stopped) {
        launchPuck();
        setCircles([]);
        setCurrentBet(null);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [puck.active, puck.stopped]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#1a2332');
      gradient.addColorStop(1, '#0f1722');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < CANVAS_WIDTH; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let i = 0; i < CANVAS_HEIGHT; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_WIDTH, i);
        ctx.stroke();
      }

      circles.forEach((circle) => {
        const circleGradient = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circle.radius);
        circleGradient.addColorStop(0, 'rgba(220, 38, 38, 0.4)');
        circleGradient.addColorStop(1, 'rgba(220, 38, 38, 0.1)');
        
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circleGradient;
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Rubik';
        ctx.textAlign = 'center';
        ctx.fillText(`x${circle.multiplier}`, circle.x, circle.y + 5);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px Rubik';
        ctx.fillText(`${circle.betAmount}₽`, circle.x, circle.y + 25);
      });

      if (isPlacingCircle) {
        const previewGradient = ctx.createRadialGradient(
          previewPosition.x, previewPosition.y, 0,
          previewPosition.x, previewPosition.y, previewRadius
        );
        previewGradient.addColorStop(0, 'rgba(220, 38, 38, 0.3)');
        previewGradient.addColorStop(1, 'rgba(220, 38, 38, 0.05)');
        
        ctx.beginPath();
        ctx.arc(previewPosition.x, previewPosition.y, previewRadius, 0, Math.PI * 2);
        ctx.fillStyle = previewGradient;
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Rubik';
        ctx.textAlign = 'center';
        ctx.fillText(`x${calculateMultiplier(previewRadius)}`, previewPosition.x, previewPosition.y + 5);
      }

      if (puck.active || puck.stopped) {
        const newPuck = { ...puck };

        if (puck.active && !puck.stopped) {
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
              toast.success(`ВЫИГРЫШ! +${winAmount}₽ (x${circle.multiplier})`, {
                style: { background: '#22c55e', color: '#fff', fontWeight: 'bold' }
              });
              setRoundHistory(prev => [{
                id: Date.now(),
                result: 'win',
                multiplier: circle.multiplier,
                amount: circle.betAmount,
                winAmount
              }, ...prev.slice(0, 9)]);
              newPuck.active = false;
              newPuck.stopped = true;
            }
          });

          if (newPuck.distance >= maxDistanceRef.current && !hitDetected) {
            newPuck.active = false;
            newPuck.stopped = true;
            if (currentBet) {
              toast.error('Проигрыш! Шайба не попала в круг', {
                style: { background: '#dc2626', color: '#fff', fontWeight: 'bold' }
              });
              setRoundHistory(prev => [{
                id: Date.now(),
                result: 'loss',
                multiplier: currentBet.multiplier,
                amount: currentBet.amount,
                winAmount: 0
              }, ...prev.slice(0, 9)]);
            }
          }
        }

        const puckGradient = ctx.createRadialGradient(newPuck.x, newPuck.y, 0, newPuck.x, newPuck.y, PUCK_RADIUS * 3);
        puckGradient.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
        puckGradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.2)');
        puckGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = puckGradient;
        ctx.beginPath();
        ctx.arc(newPuck.x, newPuck.y, PUCK_RADIUS * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(newPuck.x, newPuck.y, PUCK_RADIUS, 0, Math.PI * 2);
        const puckInnerGradient = ctx.createRadialGradient(
          newPuck.x - 4, newPuck.y - 4, 2,
          newPuck.x, newPuck.y, PUCK_RADIUS
        );
        puckInnerGradient.addColorStop(0, '#6ee7b7');
        puckInnerGradient.addColorStop(1, '#22c55e');
        ctx.fillStyle = puckInnerGradient;
        ctx.fill();
        ctx.strokeStyle = '#10b981';
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
  }, [circles, puck, isPlacingCircle, previewRadius, previewPosition]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            <Card className="bg-card border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon name="Gamepad2" className="text-primary" size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Puck Crash</h1>
                    <p className="text-xs text-muted-foreground">Следите за шайбой!</p>
                  </div>
                </div>
                <div className="text-right">
                  {timeUntilLaunch > 0 ? (
                    <>
                      <div className="text-xs text-muted-foreground">Следующий раунд</div>
                      <div className="text-2xl font-bold text-primary">{timeUntilLaunch}с</div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-accent">В ИГРЕ</div>
                      <div className="text-2xl font-bold text-accent animate-pulse">●</div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="w-full rounded-lg border-2 border-border cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ maxHeight: '550px' }}
                />
              </div>
            </Card>

            <Card className="bg-card border-border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="History" size={18} />
                История раундов
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {roundHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Пока нет истории</p>
                ) : (
                  roundHistory.map((round) => (
                    <div
                      key={round.id}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold ${
                        round.result === 'win'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-destructive/20 text-destructive'
                      }`}
                    >
                      x{round.multiplier}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-muted-foreground">Баланс</div>
                  <div className="text-3xl font-bold text-primary">{balance}₽</div>
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Wallet" className="text-primary" size={24} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Сумма ставки</label>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    disabled={puck.active || currentBet !== null || timeUntilLaunch < 5}
                    className="text-lg font-semibold h-12 bg-secondary border-border"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 500].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(amount)}
                      disabled={puck.active || currentBet !== null || timeUntilLaunch < 5}
                      className="border-border hover:bg-primary hover:text-primary-foreground"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>

                {currentBet && (
                  <Card className="bg-accent/10 border-accent/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="CheckCircle2" className="text-accent" size={18} />
                      <span className="text-sm font-semibold text-accent">Активная ставка</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Сумма:</span>
                        <span className="font-bold">{currentBet.amount}₽</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Коэффициент:</span>
                        <span className="font-bold text-primary">x{currentBet.multiplier}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Выигрыш:</span>
                        <span className="font-bold text-accent">
                          {Math.floor(currentBet.amount * currentBet.multiplier)}₽
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Card>

            <Card className="bg-card border-border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="Info" size={18} />
                Как играть
              </h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Выберите сумму ставки</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Зажмите мышь на поле для выбора размера круга</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Меньше круг = выше коэффициент</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Дождитесь автозапуска шайбы</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span>Попадание = выигрыш!</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
