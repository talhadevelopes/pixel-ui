"use client";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader } from "@workspace/ui/components/sidebar";
import { AxeIcon } from "lucide-react";
import Link from "next/link";
import { useContext, useState } from "react";

export function AppHeader() {
    const [projectList, setProjectList] = useState([])
    //const [userCredits, setUserCredits] = useContext(use);
    return (
        <div className="flex items-center justify-between">

        </div>
    )
}