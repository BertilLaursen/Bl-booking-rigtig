"use client";
import { useEffect, useState } from "react";

type Machine = {
  id: string; name: string; type: string | null; description: string | null;
  registrationNumber: string | null; status: string;
};

const emptyForm = { name: "", type: "", description: "", registrationNumber: "", imageUrl: "" };

export default function AdminMachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/machines");
    if (res.ok) setMachines(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const res = await fetch("/api/machines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setCreating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Kunne ikke oprette maskine.");
      return;
    }
    setForm(emptyForm);
    load();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/machines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-blabooking-bluedark">Maskiner</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-blabooking-gray">Tilføj maskine</h2>
        <input placeholder="Maskinnavn" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        <input placeholder="Type (fx Køretøj, Værktøj)" value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        <textarea placeholder="Beskrivelse" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        <input placeholder="Registreringsnummer (valgfrit)" value={form.registrationNumber}
          onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        <input placeholder="Billede-URL (valgfrit)" value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={creating} className="bg-blabooking-blue text-white rounded-lg px-4 py-2 font-medium">
          {creating ? "Opretter..." : "Tilføj maskine"}
        </button>
      </form>

      <div className="space-y-2">
        {machines.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-blabooking-gray">{m.name}</p>
              <p className="text-xs text-gray-400">{m.type} · {m.status}</p>
            </div>
            <select
              value={m.status}
              onChange={(e) => setStatus(m.id, e.target.value)}
              className="text-sm rounded-lg border border-gray-300 px-2 py-1"
            >
              <option value="ACTIVE">Aktiv</option>
              <option value="OUT_OF_ORDER">Ude af drift</option>
              <option value="DISABLED">Deaktiveret</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
