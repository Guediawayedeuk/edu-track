import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminParents from "./pages/admin/AdminParents";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminSubjects from "./pages/admin/AdminSubjects";
import AdminTimetable from "./pages/admin/AdminTimetable";
import AdminExams from "./pages/admin/AdminExams";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminStats from "./pages/admin/AdminStats";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherSubjects from "./pages/teacher/TeacherSubjects";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherGrades from "./pages/teacher/TeacherGrades";
import TeacherTimetable from "./pages/teacher/TeacherTimetable";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherExams from "./pages/teacher/TeacherExams";
import TeacherResources from "./pages/teacher/TeacherResources";
import TeacherMessages from "./pages/teacher/TeacherMessages";
import TeacherNotifications from "./pages/teacher/TeacherNotifications";
import TeacherMeetings from "./pages/teacher/TeacherMeetings";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import ParentDashboard from "./pages/ParentDashboard";
import Messages from "./pages/Messages";
import NotificationSettings from "./pages/NotificationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to correct dashboard
    const dashboardMap: Record<string, string> = { admin: "/admin", teacher: "/teacher", parent: "/parent" };
    return <Navigate to={dashboardMap[role] || "/"} replace />;
  }

  return <>{children}</>;
};

const AuthRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (user && role) {
    const dashboardMap: Record<string, string> = { admin: "/admin", teacher: "/teacher", parent: "/parent" };
    return <Navigate to={dashboardMap[role] || "/"} replace />;
  }
  return <Login />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<AuthRedirect />} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTeachers /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/parents" element={<ProtectedRoute allowedRoles={["admin"]}><AdminParents /></ProtectedRoute>} />
            <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminClasses /></ProtectedRoute>} />
            <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSubjects /></ProtectedRoute>} />
            <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTimetable /></ProtectedRoute>} />
            <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={["admin"]}><AdminExams /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAnnouncements /></ProtectedRoute>} />
            <Route path="/admin/documents" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDocuments /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={["admin"]}><AdminMessages /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/security" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSecurity /></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRoles /></ProtectedRoute>} />
            <Route path="/admin/stats" element={<ProtectedRoute allowedRoles={["admin"]}><AdminStats /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/teacher" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherClasses /></ProtectedRoute>} />
            <Route path="/teacher/subjects" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherSubjects /></ProtectedRoute>} />
            <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAttendance /></ProtectedRoute>} />
            <Route path="/teacher/grades" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherGrades /></ProtectedRoute>} />
            <Route path="/teacher/timetable" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherTimetable /></ProtectedRoute>} />
            <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAssignments /></ProtectedRoute>} />
            <Route path="/teacher/exams" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherExams /></ProtectedRoute>} />
            <Route path="/teacher/resources" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherResources /></ProtectedRoute>} />
            <Route path="/teacher/messages" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherMessages /></ProtectedRoute>} />
            <Route path="/teacher/notifications" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherNotifications /></ProtectedRoute>} />
            <Route path="/teacher/meetings" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherMeetings /></ProtectedRoute>} />
            <Route path="/teacher/profile" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherProfile /></ProtectedRoute>} />
            <Route path="/teacher/*" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/parent" element={<ProtectedRoute allowedRoles={["parent"]}><ParentDashboard /></ProtectedRoute>} />
            <Route path="/parent/*" element={<ProtectedRoute allowedRoles={["parent"]}><ParentDashboard /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
