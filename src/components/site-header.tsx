"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const pageTitle =
    {
      "/dashboard": "Dashboard",
      "/agent": "Agent Sessions",
      "/users": "Users",
      "/upload": "Upload Leads",
    }[pathname] || "Spitchlabs AI";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-24 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-4 data-[orientation=vertical]:h-16"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          {pageTitle} - SpitchLabs
        </h1>

        {/* <h1 className="text-base font-medium">SpitchLabs</h1> */}

        {/* <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
            <p className="text-xs text-gray-500">Authenticated User</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user.email[0].toUpperCase()}
            </span>
          </div>
        </div> */}
      </div>
    </header>
  );
}
