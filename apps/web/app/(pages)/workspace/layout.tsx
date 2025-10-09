import { SidebarProvider } from "@workspace/ui/components/sidebar"
import React from "react"
import { AppSidebar } from "./_components/AppSidebar"
import { AppHeader } from "./_components/AppHeader"

function WorkSpaceLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-background">
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                    <div className="h-full w-full">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}

export default WorkSpaceLayout