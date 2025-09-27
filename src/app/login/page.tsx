
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthAction = async () => {
    if (isSignUp) {
      if (password !== confirmPassword) {
        toast({
          variant: 'destructive',
          title: 'Passwords Do Not Match',
          description: 'Please make sure your passwords match.',
        });
        return;
      }
      if (password.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Password Too Short',
            description: 'Your password must be at least 6 characters long.',
        });
        return;
      }
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-gradient-to-br from-background to-muted/40 lg:flex flex-col items-center justify-center p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/40"></div>
        <div className="relative z-10 flex flex-col items-center">
           <div className="relative mb-10">
                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl"></div>
                <Fingerprint className="relative w-64 h-64 text-primary" />
            </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
            Biometric Capture Pro
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-lg">
            The professional's tool for high-quality biometric data collection and analysis.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
             <Fingerprint className="mx-auto h-16 w-auto text-primary" />
             <h1 className="mt-6 text-4xl font-bold tracking-tight">
              Biometric Capture Pro
            </h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{isSignUp ? 'Create an Account' : 'Login'}</CardTitle>
              <CardDescription>
                {isSignUp
                  ? 'Create an account to start capturing data.'
                  : 'Enter your credentials to access your account.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="m@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                 {isSignUp && (
                  <p className="text-xs text-muted-foreground pt-1">
                    Password must be at least 6 characters long.
                  </p>
                )}
              </div>
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" onClick={handleAuthAction}>
                {isSignUp ? <UserPlus /> : <LogIn />}
                {isSignUp ? 'Sign Up' : 'Login'}
              </Button>
               <p className="text-center text-sm text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? 'Login' : 'Sign Up'}
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
