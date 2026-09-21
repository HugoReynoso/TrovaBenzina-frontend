import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AdminLoginGate } from "@/features/admin/AdminLoginGate";
import { mockAdminLogs } from "@/mocks/reports";
import { getPriceReports } from "@/lib/api/reports";

export const metadata: Metadata = {
  title: "Admin TrovaBenzina",
  description: "Area admin per approvare segnalazioni prezzo e consultare log applicativi.",
  robots: { index: false, follow: false }
};

export default async function AdminPage() {
  const reports = await getPriceReports();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <AdminLoginGate reports={reports} logs={mockAdminLogs} />
      </main>
      <Footer />
    </>
  );
}
