"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormProps = {
  onSuccess: (user: { id: string; email: string }) => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();

  useEffect(() => {
    if (user && !isLoading) {
      onSuccess({ id: user.uid, email: user.email! });
    }
  }, [user, isLoading, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const data = loginSchema.parse({ email, password });
      setIsLoading(true);
      await signIn(data.email, data.password);
      toast.success("Successfully signed in");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to sign in");
      }
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label='Email'
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id='email-error' className='text-sm text-red-500'>
            {errors.email}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input
          id='password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label='Password'
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <p id='password-error' className='text-sm text-red-500'>
            {errors.password}
          </p>
        )}
      </div>

      <Button
        type='submit'
        className='w-full'
        disabled={isLoading}
        aria-label='Sign in'
      >
        {isLoading ? (
          <>
            <Loader2
              className='mr-2 h-4 w-4 animate-spin'
              data-testid='loading-spinner'
            />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
