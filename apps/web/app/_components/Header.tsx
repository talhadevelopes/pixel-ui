// Header.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";

import { clearAuthTokens, getAccessToken } from "@/lib/auth-storage";

const MenuOptions = [
    {
        name: "Pricing",
        path: "/pricing",
    },
    {
        name: "Contact Us",
        path: "/contact",
    },
    {
        name: "Features",
        path: "/features",
    },
];

function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hasToken, setHasToken] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleAuthChange = () => setHasToken(Boolean(getAccessToken()));
        handleAuthChange();
        window.addEventListener("auth-change", handleAuthChange);
        return () => window.removeEventListener("auth-change", handleAuthChange);
    }, []);

    const handleLogout = () => {
        clearAuthTokens();
        toast.success("Logged out successfully");
        router.push("/");
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="rounded-lg bg-primary p-2">
                            <span className="text-lg font-bold text-primary-foreground">P</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Pixel-UI</h1>
                            <p className="text-xs text-muted-foreground hidden sm:block">
                                Website Builder
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {MenuOptions.map((option, index) => (
                            <Link key={index} href={option.path}>
                                <Button variant="ghost" className="text-foreground">
                                    {option.name}
                                </Button>
                            </Link>
                        ))}
                    </div>

                    {/* CTA & Mobile Menu Button */}
                    <div className="flex items-center gap-2">
                        {hasToken ? (
                            <Link href="/logout" className="hidden sm:block">
                                <Button variant="outline" className="gap-2">
                                    Log Out
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden sm:block">
                                    <Button variant="outline">Log In</Button>
                                </Link>
                                <Link href="/register" className="hidden sm:block">
                                    <Button className="gap-2">
                                        Get Started
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-border py-4 space-y-2">
                        {MenuOptions.map((option, index) => (
                            <Link
                                key={index}
                                href={option.path}
                                onClick={closeMobileMenu}
                            >
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                >
                                    {option.name}
                                </Button>
                            </Link>
                        ))}

                        {hasToken ? (
                            <Link href="/logout" className="block" onClick={closeMobileMenu}>
                                <Button variant="outline" className="w-full gap-2">
                                    Log Out
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="block" onClick={closeMobileMenu}>
                                    <Button variant="outline" className="w-full">
                                        Log In
                                    </Button>
                                </Link>
                                <Link href="/register" className="block" onClick={closeMobileMenu}>
                                    <Button className="w-full gap-2">
                                        Get Started
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;