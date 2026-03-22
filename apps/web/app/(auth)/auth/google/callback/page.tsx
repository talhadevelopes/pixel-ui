import { Suspense } from 'react';
import { GoogleCallbackContent } from './GoogleCallbackContent';

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-4 py-12">
                <div className="rounded-xl border border-border bg-card px-8 py-10 text-center shadow">
                    <h2 className="text-2xl font-semibold">Completing Google Sign-In</h2>
                    <p className="mt-4 text-sm text-muted-foreground">Loading sign-in process...</p>
                </div>
            </div>
        }>
            <GoogleCallbackContent />
        </Suspense>
    );
}