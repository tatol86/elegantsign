'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                setError(data?.error || 'Login failed');
                return;
            }

            router.push('/admin');
            router.refresh();
        } catch {
            setError('Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
            <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 text-white">
                <CardHeader className="text-center space-y-1">
                    <div className="mx-auto w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-neutral-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">Admin Login</CardTitle>
                    <CardDescription className="text-neutral-400">
                        Enter your password to access the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <input
                                type="email"
                                placeholder="Admin email"
                                className="w-full h-12 bg-neutral-800 border-neutral-700 rounded-lg px-4 focus:ring-2 focus:ring-white transition-all text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full h-12 bg-neutral-800 border-neutral-700 rounded-lg px-4 focus:ring-2 focus:ring-white transition-all text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {error && <p className="text-xs text-red-500">{error}</p>}
                        </div>
                        <Button type="submit" disabled={submitting} className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-semibold">
                            {submitting ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                    <p className="text-center text-[10px] text-neutral-500 mt-6 tracking-widest uppercase">
                        ElegantSign Administration
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
