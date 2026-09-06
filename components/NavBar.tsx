"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";

  if (!session) return null;

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 text-sm rounded-md ${
        pathname === href ? "bg-blabooking-blue text-white" : "text-blabooking-gray hover:bg-blue-50"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-blabooking-bluedark text-lg tracking-tight">
          BLÅ <span className="text-blabooking-blue">BOOKING</span>
        </Link>
        <nav className="flex items-center gap-1">
          {link("/", "Forside")}
          {link("/bookinger", "Mine bookinger")}
          {isAdmin && link("/admin", "Admin")}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-2 px-3 py-2 text-sm rounded-md text-gray-500 hover:bg-gray-100"
          >
            Log ud
          </button>
        </nav>
      </div>
    </header>
  );
}
