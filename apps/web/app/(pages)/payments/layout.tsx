import { Sidebar } from "@/components/layout/Sidebar";
import React from "react";

function PaymentsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen w-full bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <div className="min-h-full w-full">{children}</div>
            </main>
        </div>
    );
}

export default PaymentsLayout;
