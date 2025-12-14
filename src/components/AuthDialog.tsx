import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AuthDialogProps {
  open: boolean;
  onAuthSuccess: (user: { id: number; username: string; balance: number }) => void;
}

const AuthDialog = ({ open, onAuthSuccess }: AuthDialogProps) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (username.trim().length < 2) {
      toast.error('Имя должно быть минимум 2 символа');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/a635386d-9e38-4385-a7ff-8bdc08d37b8c?username=${encodeURIComponent(username)}`
      );
      
      if (!response.ok) {
        throw new Error('Ошибка авторизации');
      }

      const user = await response.json();
      localStorage.setItem('kraze_user', JSON.stringify(user));
      toast.success(`Добро пожаловать, ${user.username}!`, {
        style: { background: '#22c55e', color: '#fff' }
      });
      onAuthSuccess(user);
    } catch (error) {
      toast.error('Не удалось войти. Попробуйте снова');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добро пожаловать в KRAZE</DialogTitle>
          <DialogDescription>
            Введите имя пользователя для начала игры
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Введите имя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            disabled={loading}
            autoFocus
          />
          <Button 
            onClick={handleAuth} 
            disabled={loading || username.trim().length < 2}
            className="w-full"
            size="lg"
          >
            {loading ? 'Загрузка...' : 'Войти'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
