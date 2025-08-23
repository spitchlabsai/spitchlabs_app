// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import Providers from "./providers";
// import { createSupabaseServerClient } from "@/lib/supabase/server";
// import Link from "next/link";
// import { UserProvider } from "./userProvider";
// import { AppSidebar } from "@/components/app-sidebar";
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// import { NavMain } from "@/components/nav-main";

// // Add an icon for your agent route (you can import from tabler-icons)
// import { IconRobot, IconHome, IconSettings, IconUsers } from "@tabler/icons-react";

// const navigation = [
//   {
//     title: "Dashboard",
//     url: "/",
//     icon: IconHome,
//   },
//   {
//     title: "Agent Sessions", // Your agent route
//     url: "/agent",
//     icon: IconRobot,
//   },
//   {
//     title: "Users",
//     url: "/users",
//     icon: IconUsers,
//   },
//   {
//     title: "Settings",
//     url: "/settings",
//     icon: IconSettings,
//   },
// ];

// export const metadata: Metadata = {
//   title: "Spitchlabs dashboard",
//   description: "spitchlabs dashboard",
// };

// export default async function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {

//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();


//   return (
//     <html lang="en">
//       <body className="">
        
//         {/* <Providers> {children} </Providers> */}
//        <Providers>
//         <UserProvider user={user}>
//           <SidebarProvider>
//           <AppSidebar>
//             <NavMain items={navigation} />
//           </AppSidebar>
//           <SidebarInset>
//         {children}
//          </SidebarInset>
//         </SidebarProvider>
//         </UserProvider>
//         </Providers>
//       </body>
//     </html>
//   );
// }

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
            <SidebarProvider>
              <AppSidebar>
                <NavMain items={navigation} />
              </AppSidebar>
              <SidebarInset>
                <SiteHeader /> 
                {children}
                </SidebarInset>
            </SidebarProvider>
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
