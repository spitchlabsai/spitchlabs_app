import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserProvider } from "./userProvider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { SiteHeader } from "@/components/site-header";

const navigation = [
  { title: "Dashboard", url: "/" },
  { title: "Agent Sessions", url: "/agent" },
  { title: "Users", url: "/users" },
  { title: "Settings", url: "/settings" },
  { title: "Upload Leads", url: "/upload" },
];


export const metadata: Metadata = {
  title: "Spitchlabs dashboard",
  description: "spitchlabs dashboard",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <Providers>
          <UserProvider user={user}>
            {user ? (
              <SidebarProvider>
                <AppSidebar>
                  <NavMain items={navigation} />
                </AppSidebar>
                <SidebarInset>
                  <SiteHeader />
                  {children}
                </SidebarInset>
              </SidebarProvider>
            ) : (
              <div className="min-h-screen flex flex-col">
                <main className="flex-1">{children}</main>
              </div>
            )}
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
