import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";

export const metadata: Metadata = {
  title: "ResQLens — AI Emergency Scene Assistant",
  description:
    "ResQLens helps bystanders understand simulated emergency scenes through AI analysis. A prototype for educational and demonstration purposes only.",
  keywords: ["emergency", "AI", "scene analysis", "prototype", "demo"],
  authors: [{ name: "ResQLens Team" }],
  openGraph: {
    title: "ResQLens — AI Emergency Scene Assistant",
    description: "AI-powered emergency scene analysis prototype",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0f1e] text-gray-100 antialiased">
        <NavBar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <footer className="border-t border-gray-800 py-6 px-4 text-center text-xs text-gray-500">
          <p className="mb-1 font-medium text-amber-500">
            ⚠ ResQLens is an emergency-assistance prototype only.
          </p>
          <p>
            It does not diagnose injuries, contact emergency services, or
            replace trained professionals. For real emergencies, call your
            local emergency number immediately.
          </p>
          <p className="mt-2 text-gray-600">
            © 2024 ResQLens — Demo purposes only
          </p>
        </footer>
      </body>
    </html>
  );
}
