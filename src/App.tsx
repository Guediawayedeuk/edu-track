import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
