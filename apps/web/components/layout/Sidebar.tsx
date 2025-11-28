"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { Sparkles, LogOut, Moon, Plus, Sun, FolderOpen, User, X, Home } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSubscriptionStatusQuery } from "@/mutations/useSubscription";
import { useAuthToken } from "@/services/auth.api";
import { useProfileQuery } from "@/queries/useAuthQueries";
import { ProjectHistory } from "@/components/layout/ProjectsHistory";

type SidebarTab = "profile" | "workspace" | null;

export function Sidebar() {
    const [activeTab, setActiveTab] = useState<SidebarTab>(null);
    const accessToken = useAuthToken();
    const { data: subscriptionStatus } = useSubscriptionStatusQuery(accessToken);
    const { theme, setTheme } = useTheme();
    const { data: profile } = useProfileQuery(accessToken);

    const userCredits = subscriptionStatus?.credits ?? 0;
    const totalCredits = subscriptionStatus?.dailyCreditsLimit ?? 0;
    const creditPercentage = totalCredits > 0 ? (userCredits / totalCredits) * 100 : 0;
    const subscriptionLabel = subscriptionStatus?.subscriptionStatus ?? "inactive";

    const toggleTab = (tab: SidebarTab) => {
        setActiveTab(activeTab === tab ? null : tab);
    };

    return (
        <div className="flex h-[92%] fixed left-0 top-[4%] bottom-[4%] z-50">
            {/* Icon Sidebar */}
            <div className="z-20 rounded-br-2xl rounded-tr-2xl flex flex-col items-center flex-shrink-0 w-16 py-4 bg-card border-r border-border">
                {/* Logo */}
                <div className="flex-shrink-0 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center  justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Icons */}
                <div className="flex flex-col items-center flex-1 space-y-4">
                    <button className={`p-2 transition-all rounded-lg shadow-md focus:outline-none ${activeTab === "profile"
                        ? 'bg-primary text-white scale-110'
                        : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'
                        }`} title="workspace" >
                        <Link href="/workspace" > <Home /></Link>
                    </button>
                    {/* Profile Icon */}
                    <button
                        onClick={() => toggleTab("profile")}
                        className={`p-2 transition-all rounded-lg shadow-md focus:outline-none ${activeTab === "profile"
                            ? 'bg-primary text-white scale-110'
                            : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'
                            }`}
                        title="Profile"
                    >
                        <User className="w-5 h-5" />
                    </button>

                    {/* Workspace Icon */}
                    <button
                        onClick={() => toggleTab("workspace")}
                        className={`p-2 transition-all rounded-lg shadow-md focus:outline-none ${activeTab === "workspace"
                            ? 'bg-primary text-white scale-110'
                            : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'
                            }`}
                        title="Workspace"
                    >
                        <FolderOpen className="w-5 h-5" />
                    </button>
                </div>

                {/* Bottom Icons */}
                <div className="flex flex-col items-center space-y-4 mt-auto">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className="p-2 transition-all rounded-lg shadow-md bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary focus:outline-none"
                        title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    >
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>

                    {/* Logout Icon */}
                    <Link href="/logout">
                        <button
                            className="p-2 transition-all rounded-lg shadow-md bg-muted text-destructive hover:bg-destructive/10 focus:outline-none"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Expandable Panel */}
            {activeTab && (
                <div className="w-72 bg-card rounded-tr-2xl rounded-br-2xl rounded-tl-2xl flex flex-col animate-in slide-in-from-left duration-300">
                    {/* Profile Panel */}
                    {activeTab === "profile" && (
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h2 className="text-lg font-bold text-foreground">Profile</h2>
                                <button
                                    onClick={() => setActiveTab(null)}
                                    className="p-1 rounded-md hover:bg-muted transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Profile Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                                        {(profile?.name?.[0] ?? profile?.email?.[0] ?? 'U').toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {/* Placeholder for username */}
                                            {profile?.name ?? ""}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {/* Placeholder for email */}
                                            {profile?.email ?? ""}
                                        </p>
                                    </div>
                                </div>

                                {/* Credits Card */}
                                <div className="space-y-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            Credits Remaining
                                        </p>
                                        <p className="text-2xl font-black text-foreground">
                                            {userCredits}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                {" "}/ {totalCredits}
                                            </span>
                                        </p>
                                    </div>
                                    <Progress value={creditPercentage} className="h-2" />
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground capitalize">
                                            Plan: {subscriptionLabel}
                                        </p>
                                        <Link href="/payments">
                                            <span className="text-xs font-semibold text-primary hover:text-accent transition-colors cursor-pointer">
                                                Upgrade →
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Subscription Info */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-foreground">Subscription</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="font-medium text-foreground capitalize">{subscriptionLabel}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Daily Limit</span>
                                            <span className="font-medium text-foreground">{totalCredits} credits</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Used Today</span>
                                            <span className="font-medium text-foreground">{totalCredits - userCredits} credits</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Manage Subscription Button */}
                                <Link href="/payments" className="block">
                                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg" size="sm">
                                        Manage Subscription
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Workspace Panel */}
                    {activeTab === "workspace" && (
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h2 className="text-lg font-bold text-foreground">Workspace</h2>
                                <button
                                    onClick={() => setActiveTab(null)}
                                    className="p-1 rounded-md hover:bg-muted transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>



                            {/* Projects List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                    Recent Projects
                                </p>
                                <ProjectHistory />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}