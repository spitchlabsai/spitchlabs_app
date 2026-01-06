"use client";

import { useUser } from "@/app/userProvider";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const user = useUser();
  const pathname = usePathname();
  const { open } = useSidebar();

  const showWelcome = pathname === "/" || pathname === "/dashboard";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-end gap-2 px-4 lg:gap-2 lg:px-6 py-5">
        <div className="flex items-center">
          {!open && (
            <SidebarTrigger className="-ml-1" aria-label="Open sidebar" />
          )}
        </div>

        {showWelcome && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-lg md:text-xl font-medium text-gray-900">
                Welcome, {user?.user_metadata.companyName}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
