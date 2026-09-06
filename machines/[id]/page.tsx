"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusBadge, { deriveStatus } from "@/components/StatusBadge";

type Booking = {
  id: string;
  startTime: string;
  endTime: string;
  user: { name: string };
  visibility: "FULL_NAME" | "FIRST_NAME" | "HIDDEN";
};

type Machine = {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
  imageUrl: string | null;
  registrationNumber: string | null;
  status: string;
  bookings: Booking[];
};

function bookedByLabel(b: Booking) {
  if (b.visibility === "HIDDEN") return "en anden bruger";
  if (b.visibility === "FIRST_NAME") return b.user.name.split(" ")[0];
  return b.user.name;
}

export default function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await fetch(`/api/machines/${id}`);
    if (res.ok) setMachine(await res.json());
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!from || !to) return;
    setSubmitting(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ machineId: id, startTime: from, endTime: to })
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Maskinen er allerede booket i dette tidsrum.");
      return;
    }
    setSuccess("Booking bekræftet!");
    setFrom("");
    setTo("");
    load();
  }

  if (!machine) return <p className="text-sm text-gray-400">Indlæser...</p>;

  const status = deriveStatus(machine);
  const upcoming = machine.bookings
    .filter((b) => new Date(b.endTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="text-sm text-blabooking-blue">
        ← Tilbage
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-blabooking-gray">{machine.name}</h1>
            {machine.type && <p className="text-sm text-gray-400">{machine.type}</p>}
          </div>
          <StatusBadge status={status} />
        </div>
        {machine.description && <p className="text-sm text-gray-600">{machine.description}</p>}
        {machine.registrationNumber && (
          <p className="text-xs text-gray-400">Reg. nr.: {machine.registrationNumber}</p>
        )}
      </div>

      {machine.status === "ACTIVE" ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold mb-3 text-blabooking-gray">Book maskine</h2>
          <form onSubmit={handleBook} className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">📅 Fra</label>
              <input
                type="datetime-local"
                required
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">📅 Til</label>
              <input
                type="datetime-local"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <button
              disabled={submitting}
              className="w-full bg-blabooking-blue text-white rounded-lg py-2.5 font-medium hover:bg-blabooking-bluedark transition disabled:opacity-60"
            >
              {submitting ? "Booker..." : "Book maskine"}
            </button>
          </form>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Denne maskine kan ikke bookes lige nu.</p>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold mb-3 text-blabooking-gray">Kommende bookinger</h2>
        {upcoming.length === 0 && <p className="text-sm text-gray-400">Ingen kommende bookinger.</p>}
        <ul className="space-y-2">
          {upcoming.map((b) => (
            <li key={b.id} className="text-sm border-l-2 border-blabooking-blue pl-3">
              <p className="font-medium">Booket af: {bookedByLabel(b)}</p>
              <p className="text-gray-500">
                {new Date(b.startTime).toLocaleString("da-DK")} – {new Date(b.endTime).toLocaleString("da-DK")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
