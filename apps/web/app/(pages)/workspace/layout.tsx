import { Sidebar } from "@/components/custom/Sidebar"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import React from "react"

function WorkSpaceLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-background">
                <Sidebar />
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