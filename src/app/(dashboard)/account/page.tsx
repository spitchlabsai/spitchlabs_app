"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

type AccountFormState = {
  displayName: string;
  email: string;
  company: string;
  phoneNumber: string;
};

const fieldDefinitions = [
  { label: "Display name", name: "displayName", type: "text", placeholder: "spitchlabs-user" },
  { label: "Email address", name: "email", type: "email", placeholder: "operator@spitchlabs.ai" },
  { label: "Company name", name: "company", type: "text", placeholder: "SpitchLabs Inc." },
  { label: "Phone number", name: "phoneNumber", type: "tel", placeholder: "+1 202 555 0123" },
];

const baseForm: AccountFormState = {
  displayName: "",
  email: "",
  company: "",
  phoneNumber: "",
};

export default function AccountPage() {
  const { user, supabase, loading } = useSupabaseUser();
  const [form, setForm] = useState<AccountFormState>(baseForm);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  console.log("User data in AccountPage:", user);

  useEffect(() => {
    if (!user) return;
    setForm({
      displayName: user.user_metadata?.displayName ?? "",
      email: user.email ?? "",
      company: user.user_metadata?.companyName ?? "",
      phoneNumber: user.user_metadata?.phoneNumber ?? "",
    });
  }, [user]);

  const buttonLabel = useMemo(() => {
    if (status === "saving") return "Saving…";
    if (status === "success") return "Saved";
    return "Save changes";
  }, [status]);

  const handleChange =
    (field: keyof AccountFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      if (status === "success") {
        setStatus("idle");
        setMessage("");
      }
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setStatus("saving");
    setMessage("Updating profile…");

    const { error } = await supabase.auth.updateUser({
      email: form.email,
      data: {
        displayName: form.displayName,
        companyName: form.company,
        phoneNumber: form.phoneNumber,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Details saved.");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">My profile</p>
          <h1 className="text-3xl font-semibold tracking-tight">Account settings</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            All changes here go directly to your Supabase profile and metadata. Email updates trigger Supabase confirmation emails before the new address becomes active.
          </p>
        </div>

        <form
          className="grid gap-5 rounded-2xl border border-border/80 bg-background/80 p-6 shadow-sm shadow-muted-foreground/10"
          onSubmit={handleSubmit}
        >
          {fieldDefinitions.map((field) => {
            const fieldValue = form[field.name as keyof AccountFormState] ?? "";
            return (
              <label key={field.name} className="flex flex-col gap-2 text-sm font-medium text-foreground">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </span>
                <Input
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={fieldValue}
                  onChange={handleChange(field.name as keyof AccountFormState)}
                  disabled={loading || status === "saving"}
                  className="bg-transparent"
                />
              </label>
            );
          })}

          <div className="flex flex-col gap-1 border-t border-border/60 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {status === "error" ? "Error" : status === "success" ? "Saved" : "Unsaved changes"}
              </span>
              <Button
                type="submit"
                variant="secondary"
                className="border-black/60 bg-black text-white hover:bg-black/80 focus-visible:ring-black/50"
                disabled={loading || status === "saving"}
              >
                {buttonLabel}
              </Button>
            </div>
            {message && (
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
