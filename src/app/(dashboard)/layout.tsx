import Navbar from "@/components/Navbar";
import FoodDoodleBackground from "@/components/FoodDoodleBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#F6F5FA] overflow-x-hidden">
      <FoodDoodleBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        {/* pb-20 on mobile ensures content is never covered by the fixed mobile bottom navbar */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 md:pb-8">
          {children}
        </main>
        <footer className="bg-white/80 backdrop-blur-xs py-4 text-center text-xs text-[#6A6577] hidden md:block">
          Digital Bridge International (DBI) • Staff Food Management Portal • Asia/Kolkata Timezone
        </footer>
      </div>
    </div>
  );
}

