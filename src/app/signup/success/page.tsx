import Image from "next/image";
import Link from "next/link";

export default function SignupSuccessPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Link
        href="/"
        className="flex items-center gap-2 self-center font-medium"
        aria-label="SpitchLabs home"
      >
        <Image src="/sp2.png" width={220} height={44} alt="SpitchLabs logo" />
      </Link>

      <div className="w-full max-w-2xl space-y-5 text-center px-4 md:px-0">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Welcome aboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Registration successful
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          Your account is in the queue and a confirmation email has been sent to
          your inbox. Once you verify the address, return to log in and explore
          the SpitchLabs experience.
        </p>
        <p className="text-sm text-muted-foreground">
          Need help before then? Reach out to{" "}
          <Link
            href="mailto:support@spitchlabs.ai"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            support@spitchlabs.ai
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
