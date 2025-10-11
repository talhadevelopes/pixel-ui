// AppSidebar.tsx
"use client";

import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
} from "@workspace/ui/components/sidebar";
import { AxeIcon, LogOut, Moon, Plus, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { ProjectHistory } from "./ProjectsHistory";

export function AppSidebar() {
    const userCredits = 2;
    const totalCredits = 6;
    const creditPercentage = (userCredits / totalCredits) * 100;
    const { theme, setTheme } = useTheme();

    return (
        <Sidebar className="border-r bg-card">
            {/* Header Section */}
            <SidebarHeader className="border-b px-4 py-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary p-2">
                            <AxeIcon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">AI Builder</h2>
                            <p className="text-xs text-muted-foreground">Website Creator</p>
                        </div>
                    </div>
                    <Link href="/workspace/new" className="w-full">
                        <Button className="w-full gap-2" size="sm">
                            <Plus className="h-4 w-4" />
                            New Project
                        </Button>
                    </Link>
                </div>
            </SidebarHeader>

            {/* Content Section */}
            <SidebarContent className="px-2 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wide text-muted-foreground">
                        Projects
                    </SidebarGroupLabel>
                    <ProjectHistory />
                </SidebarGroup>
            </SidebarContent>

            {/* Footer Section */}
            <SidebarFooter className="border-t px-4 py-4 space-y-4">
                {/* Credits Card */}
                <div className="space-y-3 rounded-lg bg-muted/50 p-3">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Credits Remaining
                        </p>
                        <p className="text-lg font-bold">
                            {userCredits}
                            <span className="text-xs font-normal text-muted-foreground">
                                {" "}/ {totalCredits}
                            </span>
                        </p>
                    </div>
                    <Progress value={creditPercentage} className="h-2" />
                    {/* <p className="text-xs text-muted-foreground">
                            ? "No credits available"
                            : `${userCredits} credit${userCredits !== 1 ? "s" : ""} available`}
                    </p> */}
                </div>

                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    size="sm"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                    {theme === 'light' ? (
                        <Moon className="h-4 w-4" />
                    ) : (
                        <Sun className="h-4 w-4" />
                    )}
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </Button>

                {/* Logout Button */}
                <Link href="/logout" className="w-full">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        size="sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </Link>
            </SidebarFooter>
        </Sidebar>
    );
}