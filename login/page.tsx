"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Forkert email eller adgangskode.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-blabooking-bluedark text-center mb-1">BLÅ BOOKING</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Nem booking af maskiner og udstyr.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blabooking-blue"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Adgangskode</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blabooking-blue"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blabooking-blue text-white rounded-lg py-2.5 font-medium hover:bg-blabooking-bluedark transition disabled:opacity-60"
          >
            {loading ? "Logger ind..." : "Log ind"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Har du en invitationskode?{" "}
          <Link href="/register" className="text-blabooking-blue font-medium">
            Opret konto
          </Link>
        </p>
      </div>
    </div>
  );
}
