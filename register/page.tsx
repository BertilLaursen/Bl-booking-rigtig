"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", invitationCode: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Der opstod en fejl.");
      return;
    }
    router.push("/login");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-blabooking-bluedark text-center mb-6">Opret konto</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input placeholder="Fulde navn" required value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <input placeholder="Email" type="email" required value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <input placeholder="Telefonnummer (valgfrit)" value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <input placeholder="Adgangskode (min. 8 tegn)" type="password" required minLength={8} value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <input placeholder="Invitationskode" required value={form.invitationCode}
            onChange={(e) => update("invitationCode", e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blabooking-blue text-white rounded-lg py-2.5 font-medium hover:bg-blabooking-bluedark transition disabled:opacity-60">
            {loading ? "Opretter..." : "Opret konto"}
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-6">
          Har du allerede en konto? <Link href="/login" className="text-blabooking-blue font-medium">Log ind</Link>
        </p>
      </div>
    </div>
  );
}
