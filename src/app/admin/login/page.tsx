'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic password protection (Hardcoded for prototype - should be ENV in production)
        if (password === 'admin123') {
            document.cookie = 'admin_token=valid_token; path=/; max-age=86400'; // 24 hours
            router.push('/admin');
        } else {
            setError('Invalid password');
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
                                type="password"
                                placeholder="Password"
                                className="w-full h-12 bg-neutral-800 border-neutral-700 rounded-lg px-4 focus:ring-2 focus:ring-white transition-all text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                            />
                            {error && <p className="text-xs text-red-500">{error}</p>}
                        </div>
                        <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-semibold">
                            Login
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
