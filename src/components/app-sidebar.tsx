"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { useUser } from "@/app/userProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";

const navigation = [
  { title: "Dashboard", url: "/" },
  { title: "Campaigns", url: "/campaign" },
  { title: "Knowledge Base", url: "/knowledge" },
  // { title: "Agent Sessions", url: "/agent" },
  { title: "Agent", url: "/caller" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUser();
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!px-4 data-[slot=sidebar-menu-button]:!py-4 data-[slot=sidebar-menu-button]:!justify-start"
              >
                <Link href="/" className="">
                  <div className="relative h-16 w-[260px] max-w-full -ml-6">
                    <Image
                      src="/sp2.png"
                      alt="SpitchLabs logo"
                      fill
                      className="object-contain object-left"
                      priority
                    />
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {open && (
            <SidebarTrigger
              className="text-muted-foreground hover:text-primary"
              aria-label="Close sidebar"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user as any} />
      </SidebarFooter>
    </Sidebar>
  );
}
