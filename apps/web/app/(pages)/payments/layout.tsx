import { SidebarProvider } from "@workspace/ui/components/sidebar";
import React from "react";
import { AppSidebar } from "../workspace/_components/AppSidebar";

function PaymentsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-background">
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                    <div className="min-h-full w-full">{children}</div>
                </main>
            </div>
        </SidebarProvider>
    );
}

export default PaymentsLayout;
