import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupSuccessPage() {
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

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Registration successful</CardTitle>
            <CardDescription>
              Your registration is successful. A confirmation mail has been sent to your email address. Please confirm before proceeding to login.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <p className="text-sm text-muted-foreground text-center">
              Once you verify, come back to log in and start using SpitchLabs.
            </p>
            <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-600">
              <Link href="/signin">Proceed to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
