"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type User = {
  id: string; name: string; email: string; role: string; active: boolean; canManageUsers: boolean;
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const myRole = (session?.user as any)?.role;
  const isSuperadmin = myRole === "SUPERADMIN";

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  async function load() {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function toggleActive(u: User) {
    await fetch(`/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active })
    });
    load();
  }

  async function setRole(u: User, role: string) {
    await fetch(`/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    load();
  }

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-blabooking-bluedark">Brugere</h1>
      <input
        placeholder="🔎 Søg efter bruger..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
      />
      <div className="space-y-2">
        {filtered.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-blabooking-gray">{u.name}</p>
              <p className="text-xs text-gray-400">{u.email} · {u.role}{!u.active ? " · Deaktiveret" : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              {isSuperadmin && (
                <select value={u.role} onChange={(e) => setRole(u, e.target.value)} className="text-sm rounded-lg border border-gray-300 px-2 py-1">
                  <option value="USER">Bruger</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">Superadmin</option>
                </select>
              )}
              <button onClick={() => toggleActive(u)} className="text-sm text-red-600 hover:underline">
                {u.active ? "Deaktivér" : "Aktivér"}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-gray-400">Ingen brugere fundet.</p>}
      </div>
    </div>
  );
}
