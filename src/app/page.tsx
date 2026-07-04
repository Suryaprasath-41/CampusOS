'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampusStore } from '@/lib/store';
import AnimatedBackground from '@/components/campus/AnimatedBackground';
import Sidebar from '@/components/campus/Sidebar';
import Header from '@/components/campus/Header';
import ChatPanel from '@/components/campus/ChatPanel';
import CommandPalette from '@/components/campus/CommandPalette';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const VoiceAssistant = dynamic(() => import('@/components/campus/VoiceAssistant'), { ssr: false });
const NotificationToast = dynamic(() => import('@/components/campus/NotificationToast'), { ssr: false });
const SplashScreen = dynamic(() => import('@/components/campus/SplashScreen'), { ssr: false });

// Lazy load ALL section components to reduce memory
const Dashboard = dynamic(() => import('@/components/campus/Dashboard'), { ssr: false });
const AttendanceSection = dynamic(() => import('@/components/campus/AttendanceSection'), { ssr: false });
const PlacementSection = dynamic(() => import('@/components/campus/PlacementSection'), { ssr: false });
const LibrarySection = dynamic(() => import('@/components/campus/LibrarySection'), { ssr: false });
const AcademicSection = dynamic(() => import('@/components/campus/AcademicSection'), { ssr: false });
const ExamsSection = dynamic(() => import('@/components/campus/ExamsSection'), { ssr: false });
const HostelSection = dynamic(() => import('@/components/campus/HostelSection'), { ssr: false });
const FinanceSection = dynamic(() => import('@/components/campus/FinanceSection'), { ssr: false });
const EventsSection = dynamic(() => import('@/components/campus/EventsSection'), { ssr: false });
const WorkflowSection = dynamic(() => import('@/components/campus/WorkflowSection'), { ssr: false });
const FacultySection = dynamic(() => import('@/components/campus/FacultySection'), { ssr: false });
const ProfileSection = dynamic(() => import('@/components/campus/ProfileSection'), { ssr: false });
const AdminPortal = dynamic(() => import('@/components/campus/AdminPortal'), { ssr: false });
const FacultyPortal = dynamic(() => import('@/components/campus/FacultyPortal'), { ssr: false });
const AiMemorySection = dynamic(() => import('@/components/campus/AiMemorySection'), { ssr: false });
const SettingsSection = dynamic(() => import('@/components/campus/SettingsSection'), { ssr: false });

const studentSections: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  attendance: AttendanceSection,
  placement: PlacementSection,
  library: LibrarySection,
  academic: AcademicSection,
  exams: ExamsSection,
  hostel: HostelSection,
  finance: FinanceSection,
  events: EventsSection,
  workflow: WorkflowSection,
  faculty: FacultySection,
  'faculty-portal': FacultyPortal,
  profile: ProfileSection,
  admin: AdminPortal,
  'ai-memory': AiMemorySection,
  settings: SettingsSection,
};

const facultySections: Record<string, React.ComponentType> = {
  dashboard: FacultyPortal,
  'my-classes': FacultyPortal,
  attendance: FacultyPortal,
  assignments: FacultyPortal,
  research: FacultyPortal,
  schedule: FacultyPortal,
  'ai-assistant': FacultyPortal,
  'faculty-classes': FacultyPortal,
  'faculty-attendance': FacultyPortal,
  'faculty-assignments': FacultyPortal,
  'faculty-research': FacultyPortal,
  'faculty-schedule': FacultyPortal,
  'faculty-ai-assistant': FacultyPortal,
  'faculty-settings': FacultyPortal,
  profile: ProfileSection,
  settings: SettingsSection,
};

const adminSections: Record<string, React.ComponentType> = {
  dashboard: AdminPortal,
  admin: AdminPortal,
  students: AdminPortal,
  faculty: AdminPortal,
  courses: AdminPortal,
  complaints: AdminPortal,
  'admin-users': AdminPortal,
  'admin-students': AdminPortal,
  'admin-faculty': AdminPortal,
  'admin-courses': AdminPortal,
  'admin-complaints': AdminPortal,
  'admin-notifications': AdminPortal,
  'admin-ai-playground': AdminPortal,
  'admin-search': AdminPortal,
  'admin-knowledge': AdminPortal,
  'admin-automations': AdminPortal,
  notifications: AdminPortal,
  'ai-playground': AdminPortal,
  search: AdminPortal,
  'knowledge-base': AdminPortal,
  automations: AdminPortal,
  profile: ProfileSection,
  settings: SettingsSection,
};

export default function Home() {
  const router = useRouter();
  const { activeSection, activeRole, isAuthenticated, setIsAuthenticated, setCurrentUser, setActiveRole, logout } = useCampusStore();
  const [showSplash, setShowSplash] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for token in cookie
        const token = document.cookie.split('; ').find(row => row.startsWith('campusos-token='));
        if (token) {
          const tokenValue = token.split('=')[1];
          const decoded = atob(tokenValue);
          const [id, email, role] = decoded.split(':');
          if (id && email && role) {
            setIsAuthenticated(true);
            setCurrentUser({ id, email, name: email.split('@')[0], role });
            setActiveRole(role as 'student' | 'faculty' | 'admin');
            setCheckingAuth(false);

            const hasSeenSplash = sessionStorage.getItem('campusos-splash-seen');
            if (!hasSeenSplash) {
              setShowSplash(true);
            }
            return;
          }
        }
        router.push('/login');
      } catch {
        router.push('/login');
      }
    };

    checkSession();
  }, [router, setIsAuthenticated, setCurrentUser, setActiveRole]);

  const handleSplashComplete = () => {
    sessionStorage.setItem('campusos-splash-seen', 'true');
    setShowSplash(false);
  };

  const handleLogout = () => {
    document.cookie = 'campusos-token=; path=/; max-age=0';
    logout();
    router.push('/login');
  };

  // Expose logout to window
  useEffect(() => {
    (window as any).__campusLogout = handleLogout;
    return () => { delete (window as any).__campusLogout; };
  }, [logout]);

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-[var(--text-muted)] text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const sections = activeRole === 'admin' ? adminSections : activeRole === 'faculty' ? facultySections : studentSections;
  const SectionComponent = sections[activeSection] || (activeRole === 'admin' ? AdminPortal : activeRole === 'faculty' ? FacultyPortal : Dashboard);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className="h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
        <AnimatedBackground />
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <Header />
          <main className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeRole}-${activeSection}`}
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
        <VoiceAssistant />
        <CommandPalette />
        <NotificationToast />
      </div>
    </>
  );
}
