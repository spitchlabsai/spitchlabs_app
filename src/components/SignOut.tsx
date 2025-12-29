"use client";

import { useState } from "react";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);

    try {
      // Call your API route
      const res = await fetch("/auth/signout", {
        method: "POST",
      });

      if (res.redirected) {
        // Redirect to homepage (or wherever your backend sends you)
        window.location.href = res.url;
      }
    } catch (err) {
      console.error("Error signing out:", err);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-600 disabled:opacity-50"
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
