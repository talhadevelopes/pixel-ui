'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGoogleCallbackMutation } from '@/mutations/useAuthMutations';

export function GoogleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Processing Google sign-in...');
    const hasProcessed = useRef(false);
    const googleCallback = useGoogleCallbackMutation({
        onSuccess: () => {
            setStatus('Google login successful! Redirecting...');
            setTimeout(() => router.replace('/workspace'), 1200);
        },
        onError: (error) => {
            console.error('Google login failed', error);
            const message = error.message || 'google_login_failed';
            setStatus('Failed to complete Google login.');
            setTimeout(() => router.replace(`/login?error=${encodeURIComponent(message)}`), 2000);
        },
    });

    useEffect(() => {
        if (hasProcessed.current) {
            return;
        }

        const handleCallback = async () => {
            hasProcessed.current = true;

            const code = searchParams.get('code');
            const returnedError = searchParams.get('error');

            if (returnedError) {
                setStatus('Google authentication was cancelled or failed.');
                setTimeout(() => router.replace('/login?error=google_cancelled'), 2000);
                return;
            }

            if (!code) {
                setStatus('Missing authorization code from Google.');
                setTimeout(() => router.replace('/login?error=google_missing_code'), 2000);
                return;
            }

            try {
                setStatus('Finalising Google login...');
                await googleCallback.mutateAsync({ code, state: searchParams.get('state') ?? undefined });
            } catch (error) {
                if (!(error instanceof Error)) {
                    setStatus('Failed to complete Google login.');
                    setTimeout(() => router.replace(`/login?error=${encodeURIComponent('google_login_failed')}`), 2000);
                }
            }
        };

        handleCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-4 py-12">
            <div className="rounded-xl border border-border bg-card px-8 py-10 text-center shadow">
                <h2 className="text-2xl font-semibold">Completing Google Sign-In</h2>
                <p className="mt-4 text-sm text-muted-foreground">{status}</p>
                <p className="mt-6 text-xs text-muted-foreground">
                    If this takes more than a few seconds, you will be redirected automatically.
                </p>
            </div>
        </div>
    );
}
