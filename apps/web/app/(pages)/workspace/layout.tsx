import { Sidebar } from "@/components/layout/Sidebar";
import React from "react";

function WorkSpaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 w-full overflow-auto">
        <div className="h-full w-full">{children}</div>
      </main>
    </div>
  );
}

export default WorkSpaceLayout;
