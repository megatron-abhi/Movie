"use client";
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clapperboard, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        // Navigation is handled by AuthProvider effect
        toast({
          title: "Login Successful",
          description: `Welcome back, ${username}!`,
        });
      } else {
        setError('Invalid username or password. Try "testuser"/"userpass" or "admin"/"adminpass".');
        toast({
          title: "Login Failed",
          description: 'Invalid username or password.',
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      toast({
          title: "Login Error",
          description: 'An unexpected error occurred.',
          variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Clapperboard size={48} className="text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Welcome to ReelTime Tickets</CardTitle>
          <CardDescription>Sign in to book your next movie adventure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., testuser or admin"
                required
                className="bg-input border-border focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g., userpass or adminpass"
                required
                className="bg-input border-border focus:ring-accent"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'Logging in...' : (
                <>
                  <LogIn size={18} className="mr-2" /> Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>No account? This is a demo. Use credentials above.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
