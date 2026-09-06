"use client";
import { useEffect, useState } from "react";

type Booking = {
  id: string;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED";
  machine: { id: string; name: string };
};

export default function MineBookingerPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/bookings?mine=1");
    if (res.ok) setBookings(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id: string) {
    if (!confirm("Er du sikker på, at du vil annullere denne booking?")) return;
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  const upcoming = bookings.filter((b) => b.status === "CONFIRMED" && new Date(b.endTime) >= new Date());
  const past = bookings.filter((b) => b.status !== "CONFIRMED" || new Date(b.endTime) < new Date());

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-blabooking-bluedark">Mine bookinger</h1>

      {loading && <p className="text-sm text-gray-400">Indlæser...</p>}

      <div className="space-y-3">
        {upcoming.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-blabooking-gray">{b.machine.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(b.startTime).toLocaleString("da-DK")} – {new Date(b.endTime).toLocaleString("da-DK")}
              </p>
              <p className="text-xs text-green-600 mt-1">Status: Bekræftet</p>
            </div>
            <button onClick={() => cancel(b.id)} className="text-sm text-red-600 hover:underline">
              Annullér
            </button>
          </div>
        ))}
        {!loading && upcoming.length === 0 && (
          <p className="text-sm text-gray-400">Du har ingen kommende bookinger.</p>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Tidligere / annullerede</h2>
          <div className="space-y-2">
            {past.map((b) => (
              <div key={b.id} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
                {b.machine.name} · {new Date(b.startTime).toLocaleDateString("da-DK")} ·{" "}
                {b.status === "CANCELLED" ? "Annulleret" : "Afsluttet"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
