'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Registration failed');
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError('Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Create account</CardTitle>
          <CardDescription>Register to place orders and track them later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full name"
              className="w-full h-12 rounded-xl border px-4"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full h-12 rounded-xl border px-4"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              type="password"
              placeholder="Password (8+ characters)"
              className="w-full h-12 rounded-xl border px-4"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full h-12" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href={`/account/login?next=${encodeURIComponent(nextPath)}`} className="font-medium text-black">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
