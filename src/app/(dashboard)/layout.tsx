import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F5FA] flex flex-col">
      <Navbar />
      {/* Content wrapper with md:pl-64 offset for the left sidebar */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 md:pb-8">
          {children}
        </main>
        <footer className="bg-white border-t border-[#E5E2EE] py-4 text-center text-xs text-[#6A6577]">
          Digital Bridge International (DBI) • Staff Food Management Portal • Asia/Kolkata Timezone
        </footer>
      </div>
    </div>
  );
}
