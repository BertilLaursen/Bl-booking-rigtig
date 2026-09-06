"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ machines: number; users: number; upcoming: number; outOfOrder: number } | null>(null);

  useEffect(() => {
    async function load() {
      const [machinesRes, usersRes, bookingsRes] = await Promise.all([
        fetch("/api/machines"),
        fetch("/api/users").catch(() => null),
        fetch("/api/bookings")
      ]);
      const machines = machinesRes.ok ? await machinesRes.json() : [];
      const users = usersRes && usersRes.ok ? await usersRes.json() : [];
      const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
      setStats({
        machines: machines.length,
        users: users.length,
        upcoming: bookings.filter((b: any) => b.status === "CONFIRMED" && new Date(b.endTime) >= new Date()).length,
        outOfOrder: machines.filter((m: any) => m.status === "OUT_OF_ORDER").length
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Maskiner", value: stats?.machines, href: "/admin/maskiner" },
    { label: "Brugere", value: stats?.users, href: "/admin/brugere" },
    { label: "Kommende bookinger", value: stats?.upcoming, href: "/bookinger" },
    { label: "Ude af drift", value: stats?.outOfOrder, href: "/admin/maskiner" }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-blabooking-bluedark">Admin-dashboard</h1>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-blabooking-blue">{c.value ?? "–"}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/maskiner" className="text-sm px-3 py-2 rounded-lg bg-blabooking-blue text-white">Maskiner</Link>
        <Link href="/admin/brugere" className="text-sm px-3 py-2 rounded-lg bg-white border border-gray-200">Brugere</Link>
        <Link href="/admin/invitationer" className="text-sm px-3 py-2 rounded-lg bg-white border border-gray-200">Invitationer</Link>
      </div>
    </div>
  );
}
