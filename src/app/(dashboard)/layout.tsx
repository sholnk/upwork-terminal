import { MainNav } from "@/components/layout/main-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="lg:ml-64">
        {children}
      </main>
    </div>
  );
}
