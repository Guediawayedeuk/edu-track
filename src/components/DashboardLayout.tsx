import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList,
  FileText, BarChart3, Bell, LogOut, Menu, X, GraduationCap,
  ChevronRight, UserCircle, MessageSquare, Upload
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: "Tableau de bord", path: "/admin", icon: LayoutDashboard },
  { label: "Élèves", path: "/admin/students", icon: Users },
  { label: "Enseignants", path: "/admin/teachers", icon: UserCircle },
  { label: "Classes", path: "/admin/classes", icon: BookOpen },
  { label: "Matières", path: "/admin/subjects", icon: ClipboardList },
  { label: "Emploi du temps", path: "/admin/timetable", icon: Calendar },
  { label: "Bulletins", path: "/admin/reports", icon: FileText },
  { label: "Statistiques", path: "/admin/stats", icon: BarChart3 },
];

const teacherNav: NavItem[] = [
  { label: "Tableau de bord", path: "/teacher", icon: LayoutDashboard },
  { label: "Mes classes", path: "/teacher/classes", icon: BookOpen },
  { label: "Notes", path: "/teacher/grades", icon: ClipboardList },
  { label: "Absences", path: "/teacher/attendance", icon: Users },
  { label: "Devoirs", path: "/teacher/assignments", icon: Upload },
  { label: "Emploi du temps", path: "/teacher/timetable", icon: Calendar },
];

const parentNav: NavItem[] = [
  { label: "Tableau de bord", path: "/parent", icon: LayoutDashboard },
  { label: "Notes", path: "/parent/grades", icon: ClipboardList },
  { label: "Bulletin", path: "/parent/report", icon: FileText },
  { label: "Emploi du temps", path: "/parent/timetable", icon: Calendar },
  { label: "Messages", path: "/parent/messages", icon: MessageSquare },
];

interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "teacher" | "parent";
  userName: string;
}

const DashboardLayout = ({ children, role, userName }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = role === "admin" ? adminNav : role === "teacher" ? teacherNav : parentNav;
  const roleLabel = role === "admin" ? "Administration" : role === "teacher" ? "Enseignant" : "Parent";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-sidebar lg:relative"
          >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent">
                <GraduationCap className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">EduTrack</h1>
                <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-auto rounded-lg p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                );
              })}
            </nav>

            {/* User */}
            <div className="border-t border-sidebar-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                  {userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
                  <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
                </div>
                <Link to="/" className="rounded-lg p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent">
                  <LogOut className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1" />
          <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
