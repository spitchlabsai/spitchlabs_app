import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
          aria-label="SpitchLabs home"
        >
          <Image src="/sp2.png" width={200} height={40} alt="SpitchLabs logo" />
        </Link>

        <SignupForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-cyan-600 underline-offset-4 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
