"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Invitation = {
  id: string; code: string; status: string; grantsRole: string;
  usedBy: { name: string; email: string } | null; createdAt: string;
};

export default function AdminInvitationsPage() {
  const { data: session } = useSession();
  const isSuperadmin = (session?.user as any)?.role === "SUPERADMIN";
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [grantsRole, setGrantsRole] = useState("USER");
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await fetch("/api/invitations");
    if (res.ok) setInvitations(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function createInvitation() {
    setCreating(true);
    await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grantsRole })
    });
    setCreating(false);
    load();
  }

  async function disable(id: string) {
    await fetch(`/api/invitations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DISABLED" })
    });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-blabooking-bluedark">Invitationer</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-3 flex-wrap">
        {isSuperadmin && (
          <select value={grantsRole} onChange={(e) => setGrantsRole(e.target.value)} className="text-sm rounded-lg border border-gray-300 px-2 py-1.5">
            <option value="USER">Almindelig bruger</option>
            <option value="ADMIN">Administrator</option>
          </select>
        )}
        <button onClick={createInvitation} disabled={creating} className="bg-blabooking-blue text-white rounded-lg px-4 py-2 text-sm font-medium">
          {creating ? "Opretter..." : "+ Ny invitation"}
        </button>
      </div>

      <div className="space-y-2">
        {invitations.map((inv) => (
          <div key={inv.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-mono font-semibold text-blabooking-gray">{inv.code}</p>
              <p className="text-xs text-gray-400">
                Rolle: {inv.grantsRole === "ADMIN" ? "Administrator" : "Bruger"} ·{" "}
                {inv.status === "UNUSED" && "Ikke brugt"}
                {inv.status === "USED" && `Brugt af ${inv.usedBy?.name ?? "?"}`}
                {inv.status === "DISABLED" && "Deaktiveret"}
              </p>
            </div>
            {inv.status === "UNUSED" && (
              <button onClick={() => disable(inv.id)} className="text-sm text-red-600 hover:underline">
                Deaktivér
              </button>
            )}
          </div>
        ))}
        {invitations.length === 0 && <p className="text-sm text-gray-400">Ingen invitationer endnu.</p>}
      </div>
    </div>
  );
}
