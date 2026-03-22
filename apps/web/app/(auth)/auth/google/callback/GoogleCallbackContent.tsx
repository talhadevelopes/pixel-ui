'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGoogleCallbackMutation } from '@/mutations/';

export function GoogleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasProcessed = useRef(false);
    const googleCallback = useGoogleCallbackMutation({
        onSuccess: () => {
            // Redirect immediately
            router.replace('/workspace');
        },
        onError: (error) => {
            console.error('Google login failed', error);
            router.replace('/workspace');
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
                router.replace('/workspace');
                return;
            }

            if (!code) {
                router.replace('/workspace');
                return;
            }

            try {
                await googleCallback.mutateAsync({ code, state: searchParams.get('state') ?? undefined });
            } catch (error) {
                if (!(error instanceof Error)) {
                    router.replace('/workspace');
                }
            }
        };

        handleCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Completing secure sign-in...</p>
            </div>
        </div>
    );
}
