'use client';

import { useCampusStore } from '@/lib/store';
import AnimatedBackground from '@/components/campus/AnimatedBackground';
import Sidebar from '@/components/campus/Sidebar';
import Header from '@/components/campus/Header';
import Dashboard from '@/components/campus/Dashboard';
import AttendanceSection from '@/components/campus/AttendanceSection';
import PlacementSection from '@/components/campus/PlacementSection';
import LibrarySection from '@/components/campus/LibrarySection';
import AcademicSection from '@/components/campus/AcademicSection';
import HostelSection from '@/components/campus/HostelSection';
import FinanceSection from '@/components/campus/FinanceSection';
import EventsSection from '@/components/campus/EventsSection';
import AdminSection from '@/components/campus/AdminSection';
import ChatPanel from '@/components/campus/ChatPanel';
import { AnimatePresence, motion } from 'framer-motion';

const sections: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  attendance: AttendanceSection,
  placement: PlacementSection,
  library: LibrarySection,
  academic: AcademicSection,
  hostel: HostelSection,
  finance: FinanceSection,
  events: EventsSection,
  admin: AdminSection,
};

export default function Home() {
  const { activeSection } = useCampusStore();
  const SectionComponent = sections[activeSection] || Dashboard;

  return (
    <div className="h-screen flex bg-[#050510] text-white overflow-hidden">
      <AnimatedBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header />
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <SectionComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ChatPanel />
    </div>
  );
}
