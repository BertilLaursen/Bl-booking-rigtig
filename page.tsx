"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge, { deriveStatus } from "@/components/StatusBadge";

type Machine = {
  id: string;
  name: string;
  type: string | null;
  imageUrl: string | null;
  status: string;
  bookings: { startTime: string; endTime: string }[];
};

export default function HomePage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALLE" | "LEDIGE" | "BOOKEDE" | "UDE_AF_DRIFT">("ALLE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/machines")
      .then((r) => r.json())
      .then((data) => setMachines(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return machines
      .filter((m) => m.status !== "DISABLED")
      .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
      .filter((m) => {
        const s = deriveStatus(m);
        if (filter === "ALLE") return true;
        if (filter === "LEDIGE") return s === "ACTIVE_FREE";
        if (filter === "BOOKEDE") return s === "ACTIVE_BOOKED";
        if (filter === "UDE_AF_DRIFT") return s === "OUT_OF_ORDER";
        return true;
      });
  }, [machines, search, filter]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-blabooking-bluedark">Maskiner</h1>
        <p className="text-sm text-gray-500">Se status og book ledigt udstyr.</p>
      </div>

      <input
        placeholder="🔎 Søg efter maskine..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: "ALLE", label: "Alle" },
          { key: "LEDIGE", label: "Ledige" },
          { key: "BOOKEDE", label: "Bookede" },
          { key: "UDE_AF_DRIFT", label: "Ude af drift" }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full border ${
              filter === f.key
                ? "bg-blabooking-blue text-white border-blabooking-blue"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">Indlæser maskiner...</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((m) => (
          <Link
            key={m.id}
            href={`/machines/${m.id}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:border-blabooking-blue transition"
          >
            <div>
              <p className="font-semibold text-blabooking-gray">{m.name}</p>
              {m.type && <p className="text-xs text-gray-400">{m.type}</p>}
            </div>
            <StatusBadge status={deriveStatus(m)} />
          </Link>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-gray-400 col-span-2">Ingen maskiner matcher din søgning.</p>
        )}
      </div>
    </div>
  );
}
