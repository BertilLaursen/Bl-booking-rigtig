type Props = { status: "ACTIVE_FREE" | "ACTIVE_BOOKED" | "OUT_OF_ORDER" | "DISABLED" };

const CONFIG: Record<Props["status"], { label: string; dot: string; text: string; bg: string }> = {
  ACTIVE_FREE: { label: "Ledig", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  ACTIVE_BOOKED: { label: "Booket", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  OUT_OF_ORDER: { label: "Ude af drift", dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" },
  DISABLED: { label: "Deaktiveret", dot: "bg-gray-500", text: "text-gray-700", bg: "bg-gray-100" }
};

export default function StatusBadge({ status }: Props) {
  const c = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${c.text} ${c.bg}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function deriveStatus(machine: { status: string; bookings?: { startTime: string; endTime: string }[] }): Props["status"] {
  if (machine.status === "OUT_OF_ORDER") return "OUT_OF_ORDER";
  if (machine.status === "DISABLED") return "DISABLED";
  const now = new Date();
  const bookedNow = (machine.bookings || []).some(
    (b) => new Date(b.startTime) <= now && new Date(b.endTime) >= now
  );
  return bookedNow ? "ACTIVE_BOOKED" : "ACTIVE_FREE";
}
