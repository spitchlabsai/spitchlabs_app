// "use client";

// import { useState } from "react";
// import { createSupabaseBrowserClient } from "@/lib/supabase/client"; // make sure this is correct
// import { Github, Loader2, Apple, GalleryVerticalEnd } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export function LoginForm({
//   className,
//   ...props
// }: React.ComponentProps<"div">) {
//   const supabase = createSupabaseBrowserClient();
//   const [loading, setLoading] = useState<"google" | "github" | null>(null);

//   const handleOAuthLogin = async (provider: "google" | "github") => {
//     try {
//       setLoading(provider);
//       const { error } = await supabase.auth.signInWithOAuth({
//         provider,
//         options: {
//           redirectTo:
//             typeof window !== "undefined"
//               ? `${window.location.origin}/auth/callback`
//               : undefined,
//         },
//       });

//       if (error) {
//         console.error("OAuth login error:", error.message);
//         // You can show a toast or error message here
//       }
//     } finally {
//       setLoading(null);
//     }
//   };

//   return (
//     <div className={cn("flex flex-col gap-6", className)} {...props}>
//       <Card>
//         <CardHeader className="text-center">
//           <CardTitle className="text-xl">Welcome back</CardTitle>
//           <CardDescription>
//             Login with your GitHub or Google account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-6">
//             <div className="flex flex-col gap-4">
//               <Button
//                 variant="outline"
//                 className="w-full"
//                 onClick={() => handleOAuthLogin("google")}
//                 disabled={loading === "google"}
//               >
//                 {loading === "google" ? (
//                   <Loader2 className="mr-2 size-4 animate-spin" />
//                 ) : (
//                   <svg
//                     className="mr-2 size-4"
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
//                       fill="currentColor"
//                     />
//                   </svg>
//                 )}
//                 Login with Google
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full"
//                 onClick={() => handleOAuthLogin("github")}
//                 disabled={loading === "github"}
//               >
//                 {loading === "github" ? (
//                   <Loader2 className="mr-2 size-4 animate-spin" />
//                 ) : (
//                   <Github className="mr-2 size-4" />
//                 )}
//                 Login with GitHub
//               </Button>
//             </div>

//             <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
//               <span className="bg-card text-muted-foreground relative z-10 px-2">
//                 Or continue with
//               </span>
//             </div>

//             <form className="grid gap-6">
//               <div className="grid gap-3">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="m@example.com"
//                   required
//                 />
//               </div>
//               <div className="grid gap-3">
//                 <div className="flex items-center">
//                   <Label htmlFor="password">Password</Label>
//                   <a
//                     href="#"
//                     className="ml-auto text-sm underline-offset-4 hover:underline"
//                   >
//                     Forgot your password?
//                   </a>
//                 </div>
//                 <Input id="password" type="password" required />
//               </div>
//               <Button type="submit" className="w-full">
//                 Login
//               </Button>
//             </form>

//             <div className="text-center text-sm">
//               Don&apos;t have an account?{" "}
//               <a href="#" className="underline underline-offset-4">
//                 Sign up
//               </a>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
//         By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
//         and <a href="#">Privacy Policy</a>.
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { createSupabaseBrowserClient } from "@/lib/supabase/client";
// import { Github, Loader2 } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export function LoginForm({
//   className,
//   ...props
// }: React.ComponentProps<"div">) {
//   const supabase = createSupabaseBrowserClient();

//   const [loadingProvider, setLoadingProvider] = useState<
//     "google" | "github" | null
//   >(null);
//   const [loading, setLoading] = useState(false);
//   const [mode, setMode] = useState<"login" | "signup">("login"); // switch between modes
//   const [displayName, setDisplayName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   const handleOAuthLogin = async (provider: "google" | "github") => {
//     try {
//       setLoadingProvider(provider);
//       const { error } = await supabase.auth.signInWithOAuth({
//         provider,
//         options: {
//           redirectTo:
//             typeof window !== "undefined"
//               ? `${window.location.origin}/auth/callback`
//               : undefined,
//         },
//       });

//       if (error) console.error("OAuth login error:", error.message);
//     } finally {
//       setLoadingProvider(null);
//     }
//   };

//   const handleAuth = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccessMessage("");

//     let error;

//     if (mode === "login") {
//       const { error: signInError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });
//       error = signInError;
//     } else {
//       const { error: signUpError } = await supabase.auth.signUp({
//         displayName,
//         email,
//         password,
//       });
//       error = signUpError;
//     }

//     if (error) {
//       setError(error.message);
//     } else {
//       setSuccessMessage(
//         "Account created! Please check your email to veerify your account"
//       );
//     }

//     setLoading(false);
//   };

//   return (
//     <div className={cn("flex flex-col gap-6", className)} {...props}>
//       <Card>
//         <CardHeader className="text-center">
//           <CardTitle className="text-xl">
//             {mode === "login" ? "Welcome back" : "Create an account"}
//           </CardTitle>
//           <CardDescription>
//             {mode === "login"
//               ? "Login with your GitHub, Google, or email"
//               : "Sign up with your email to get started"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-6">
//             {/* OAuth Buttons */}
//             <div className="flex flex-col gap-4">
//               <Button
//                 variant="outline"
//                 className="w-full"
//                 onClick={() => handleOAuthLogin("google")}
//                 disabled={loadingProvider === "google"}
//               >
//                 {loadingProvider === "google" ? (
//                   <Loader2 className="mr-2 size-4 animate-spin" />
//                 ) : (
//                   <svg
//                     className="mr-2 size-4"
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
//                       fill="currentColor"
//                     />
//                   </svg>
//                 )}
//                 {mode === "login" ? "Login with Google" : "Sign up with Google"}
//               </Button>

//               <Button
//                 variant="outline"
//                 className="w-full"
//                 onClick={() => handleOAuthLogin("github")}
//                 disabled={loadingProvider === "github"}
//               >
//                 {loadingProvider === "github" ? (
//                   <Loader2 className="mr-2 size-4 animate-spin" />
//                 ) : (
//                   <Github className="mr-2 size-4" />
//                 )}
//                 {mode === "login" ? "Login with GitHub" : "Sign up with GitHub"}
//               </Button>
//             </div>

//             {/* Divider */}
//             <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
//               <span className="bg-card text-muted-foreground relative z-10 px-2">
//                 Or continue with email
//               </span>
//             </div>

//             {/* Email/password form */}
//             <form onSubmit={handleAuth} className="grid gap-6">
//             <div className="grid gap-3">
//                 <Label htmlFor="displayName">Username</Label>
//                 <Input
//                   id="displayName"
//                   type="text"
//                   placeholder="John Doe"
//                   value={displayName}
//                   onChange={(e) => setDisplayName(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="grid gap-3">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="m@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="grid gap-3">
//                 <div className="flex items-center">
//                   <Label htmlFor="password">Password</Label>
//                   {mode === "login" && (
//                     <a
//                       href="#"
//                       className="ml-auto text-sm underline-offset-4 hover:underline"
//                     >
//                       Forgot your password?
//                     </a>
//                   )}
//                 </div>
//                 <Input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>

//               {error && <p className="text-sm text-red-500 -mt-4">{error}</p>}
//               {successMessage && (
//                 <p className="text-sm text-green-600 -mt-4">{successMessage}</p>
//               )}

//               <Button type="submit" className="w-full" disabled={loading}>
//                 {loading
//                   ? mode === "login"
//                     ? "Logging in..."
//                     : "Creating account..."
//                   : mode === "login"
//                   ? "Login"
//                   : "Sign up"}
//               </Button>
//             </form>

//             {/* Mode toggle */}
//             <div className="text-center text-sm">
//               {mode === "login" ? (
//                 <>
//                   Don&apos;t have an account?{" "}
//                   <button
//                     type="button"
//                     className="underline underline-offset-4"
//                     onClick={() => setMode("signup")}
//                   >
//                     Sign up
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   Already have an account?{" "}
//                   <button
//                     type="button"
//                     className="underline underline-offset-4"
//                     onClick={() => setMode("login")}
//                   >
//                     Login
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
//         By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
//         <a href="#">Privacy Policy</a>.
//       </div>
//     </div>
//   );
// }

"use client";

import { FormEvent, useMemo, useState } from "react";
import { Github, Loader2 } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup";

interface LoginFormProps extends React.ComponentProps<"div"> {}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const supabase = createSupabaseBrowserClient();

  const [mode, setMode] = useState<Mode>("login");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // centralize redirect target
  const redirectTo = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined,
    []
  );

  const resetMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      return "Email and password are required.";
    }

    if (mode === "signup") {
      if (!companyName.trim()) return "Company name is required.";
      if (!displayName.trim()) return "Username is required.";
      if (password.length < 8) {
        return "Password must be at least 8 characters.";
      }
      if (password !== confirmPassword) {
        return "Passwords do not match.";
      }
    }

    return null;
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    resetMessages();
    setLoadingProvider(provider);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (error) {
        console.error("OAuth login error:", error.message);
        setError(error.message);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong with social sign-in.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        setSuccessMessage("Logged in successfully.");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              displayName,
              companyName,
            },
            emailRedirectTo: redirectTo,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        setSuccessMessage(
          "Account created. Check your inbox to verify your email."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    resetMessages();

    if (!email.trim()) {
      setError("Enter your email first to reset your password.");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccessMessage("Password reset link sent. Check your email.");
    } catch (err) {
      console.error(err);
      setError("Could not send reset email. Try again.");
    }
  };

  const isBusy = loading || !!loadingProvider;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {mode === "login" ? "Welcome back" : "Create your SpitchLabs account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Sign in to manage your AI sales agents."
              : "Sign up to start automating your sales calls."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6">
            {/* OAuth Buttons */}
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("google")}
                disabled={loadingProvider === "google" || isBusy}
                type="button"
              >
                {loadingProvider === "google" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <svg
                    className="mr-2 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                )}
                {mode === "login" ? "Continue with Google" : "Sign up with Google"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("github")}
                disabled={loadingProvider === "github" || isBusy}
                type="button"
              >
                {loadingProvider === "github" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Github className="mr-2 size-4" />
                )}
                {mode === "login" ? "Continue with GitHub" : "Sign up with GitHub"}
              </Button>
            </div>

            {/* Divider */}
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-card text-muted-foreground relative z-10 px-2">
                Or continue with email
              </span>
            </div>

            {/* Email/password form */}
            <form onSubmit={handleAuth} className="grid gap-6" noValidate>
              {mode === "signup" && (
                <>
                  <div className="grid gap-3">
                    <Label htmlFor="companyName">Company name</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Acme Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="displayName">Username</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Jane Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>

                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {mode === "signup" && (
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-500 -mt-2">{error}</p>}
              {successMessage && (
                <p className="text-sm text-green-600 -mt-2">{successMessage}</p>
              )}

              <Button type="submit" className="w-full" disabled={isBusy}>
                {loading
                  ? mode === "login"
                    ? "Logging in..."
                    : "Creating account..."
                  : mode === "login"
                  ? "Login"
                  : "Sign up"}
              </Button>
            </form>

            {/* Mode toggle */}
            <div className="text-center text-sm">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={() => {
                      setMode("signup");
                      resetMessages();
                    }}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={() => {
                      setMode("login");
                      resetMessages();
                    }}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By continuing, you agree to our{" "}
        <a href="/terms" target="_blank" rel="noreferrer">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" target="_blank" rel="noreferrer">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
