// // app/login/page.tsx
// "use client";

// import { Auth } from "@supabase/auth-ui-react";
// import { ThemeSupa } from "@supabase/auth-ui-shared";
// import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// export default function LoginPage() {
//   const supabase = createSupabaseBrowserClient();

//   return (
//     <main style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
//       <h1>Log in</h1>
//       <Auth
//         supabaseClient={supabase}
//         appearance={{ theme: ThemeSupa }}
//         providers={["google", "github"]} // add/remove providers as desired
//         redirectTo={
//           typeof window !== "undefined"
//             ? `${window.location.origin}/auth/callback`
//             : undefined
//         }
//       />
//     </main>
//   );
// }

// app/login/page.tsx
// "use client";

// import { Auth } from "@supabase/auth-ui-react";
// import { ThemeSupa } from "@supabase/auth-ui-shared";
// import { createSupabaseBrowserClient } from "@/lib/supabase/client";
// import { useEffect, useState } from "react";

// export default function LoginPage() {
//   const supabase = createSupabaseBrowserClient();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   return (
//     <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 opacity-20">
//         <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
//         <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
//         <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
//       </div>

//       {/* Grid pattern overlay */}
//       <div
//         className="absolute inset-0 opacity-10"
//         style={{
//           backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
//           backgroundSize: "20px 20px",
//         }}
//       ></div>

//       {/* Content */}
//       <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
//         <div
//           className={`w-full max-w-md transition-all duration-1000 ${
//             mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
//           }`}
//         >
//           {/* Main card */}
//           <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
//             {/* Glassmorphism shine effect */}
//             <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl"></div>

//             {/* Header */}
//             <div className="relative z-10 text-center mb-8">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mb-6 shadow-lg">
//                 <svg
//                   className="w-8 h-8 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                   />
//                 </svg>
//               </div>
//               <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//                 Welcome Back
//               </h1>
//               <p className="text-gray-300 text-sm">
//                 Sign in to your account to continue your journey
//               </p>
//             </div>

//             {/* Auth component wrapper */}
//             <div className="relative z-10">
//               <style jsx global>{`
//                 .supabase-auth-ui_ui {
//                   --brand-color: rgb(147 51 234);
//                   --brand-accent: rgb(79 70 229);
//                 }

//                 .supabase-auth-ui_ui button[type="submit"] {
//                   background: linear-gradient(
//                     135deg,
//                     rgb(147 51 234) 0%,
//                     rgb(79 70 229) 100%
//                   ) !important;
//                   border: none !important;
//                   border-radius: 12px !important;
//                   font-weight: 600 !important;
//                   padding: 12px 24px !important;
//                   transition: all 0.3s ease !important;
//                   box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4) !important;
//                 }

//                 .supabase-auth-ui_ui button[type="submit"]:hover {
//                   transform: translateY(-2px) !important;
//                   box-shadow: 0 8px 25px rgba(147, 51, 234, 0.6) !important;
//                 }

//                 .supabase-auth-ui_ui .supabase-auth-ui_ui-button {
//                   border-radius: 12px !important;
//                   border: 1px solid rgba(255, 255, 255, 0.1) !important;
//                   background: rgba(255, 255, 255, 0.05) !important;
//                   backdrop-filter: blur(10px) !important;
//                   color: white !important;
//                   font-weight: 500 !important;
//                   transition: all 0.3s ease !important;
//                   padding: 12px 16px !important;
//                 }

//                 .supabase-auth-ui_ui .supabase-auth-ui_ui-button:hover {
//                   background: rgba(255, 255, 255, 0.1) !important;
//                   transform: translateY(-1px) !important;
//                   box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
//                 }

//                 .supabase-auth-ui_ui input {
//                   background: rgba(255, 255, 255, 0.05) !important;
//                   border: 1px solid rgba(255, 255, 255, 0.1) !important;
//                   border-radius: 12px !important;
//                   color: white !important;
//                   padding: 12px 16px !important;
//                   backdrop-filter: blur(10px) !important;
//                   transition: all 0.3s ease !important;
//                 }

//                 .supabase-auth-ui_ui input:focus {
//                   border-color: rgb(147 51 234) !important;
//                   box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1) !important;
//                   outline: none !important;
//                 }

//                 .supabase-auth-ui_ui input::placeholder {
//                   color: rgba(255, 255, 255, 0.5) !important;
//                 }

//                 .supabase-auth-ui_ui label {
//                   color: rgba(255, 255, 255, 0.9) !important;
//                   font-weight: 500 !important;
//                   margin-bottom: 6px !important;
//                 }

//                 .supabase-auth-ui_ui a {
//                   color: rgb(147 51 234) !important;
//                   text-decoration: none !important;
//                   font-weight: 500 !important;
//                   transition: all 0.3s ease !important;
//                 }

//                 .supabase-auth-ui_ui a:hover {
//                   color: rgb(168 85 247) !important;
//                 }

//                 .supabase-auth-ui_ui .supabase-auth-ui_ui-divider {
//                   background: rgba(255, 255, 255, 0.1) !important;
//                   margin: 24px 0 !important;
//                 }

//                 .supabase-auth-ui_ui .supabase-auth-ui_ui-divider span {
//                   background: transparent !important;
//                   color: rgba(255, 255, 255, 0.7) !important;
//                   font-size: 14px !important;
//                 }

//                 .supabase-auth-ui_ui .supabase-auth-ui_ui-message {
//                   border-radius: 12px !important;
//                   background: rgba(239, 68, 68, 0.1) !important;
//                   border: 1px solid rgba(239, 68, 68, 0.2) !important;
//                   color: rgb(248 113 113) !important;
//                   padding: 12px 16px !important;
//                   margin-bottom: 16px !important;
//                 }

//                 .supabase-auth-ui_ui .supabase-auth-ui_ui-message-success {
//                   background: rgba(34, 197, 94, 0.1) !important;
//                   border-color: rgba(34, 197, 94, 0.2) !important;
//                   color: rgb(74 222 128) !important;
//                 }
//               `}</style>

//               <Auth
//                 supabaseClient={supabase}
//                 appearance={{
//                   theme: ThemeSupa,
//                   style: {
//                     button: { borderRadius: "12px" },
//                     anchor: { color: "rgb(147 51 234)" },
//                   },
//                 }}
//                 providers={["google", "github"]}
//                 redirectTo={
//                   typeof window !== "undefined"
//                     ? `${window.location.origin}/auth/callback`
//                     : undefined
//                 }
//               />
//             </div>

//             {/* Footer */}
//             <div className="relative z-10 text-center mt-8 pt-6 border-t border-white/10">
//               <p className="text-gray-400 text-sm">
//                 New to our platform?{" "}
//                 <a
//                   href="/signup"
//                   className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
//                 >
//                   Create an account
//                 </a>
//               </p>
//             </div>
//           </div>

//           {/* Floating elements */}
//           <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
//           <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse delay-1000"></div>
//         </div>
//       </div>

//       {/* Bottom decoration */}
//       <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
//     </div>
//   );
// }

import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            {/* <GalleryVerticalEnd className="size-4" /> */}
          </div>
          SpitchLabs
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
