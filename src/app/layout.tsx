import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserProvider } from "./userProvider";

export const metadata: Metadata = {
  title: "Spitchlabs dashboard",
  description: "spitchlabs dashboard",
  icons: {
    icon: "/favicon.png",
  },
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
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body>
        <Providers>
          <UserProvider user={user}>{children}</UserProvider>
        </Providers>
      </body>
    </html>
  );
}
