import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5FA]">
      <Navbar />
      {/* pb-24 on mobile ensures content is never covered by the fixed mobile bottom navbar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        {children}
      </main>
      <footer className="bg-white border-t border-[#E5E2EE] py-4 text-center text-xs text-[#6A6577] hidden md:block">
        Digital Bridge International (DBI) • Staff Food Management Portal • Asia/Kolkata Timezone
      </footer>
    </div>
  );
}
