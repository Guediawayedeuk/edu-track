import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Mock useAuth
const mockAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockAuth(),
}));

// Mock loading screen to a simple marker
vi.mock("./RoleLoadingScreen", () => ({
  default: ({ message }: { message?: string }) => (
    <div data-testid="loading">{message || "loading"}</div>
  ),
}));

const renderWithRoutes = (initialPath: string, allowedRoles?: string[]) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={allowedRoles ?? ["admin"]}>
              <div>Admin Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/no-role" element={<div>No Role Page</div>} />
        <Route path="/teacher" element={<div>Teacher Dashboard</div>} />
        <Route path="/parent" element={<div>Parent Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  it("shows loading screen while session is loading", () => {
    mockAuth.mockReturnValue({ user: null, role: null, loading: true, roleLoaded: false });
    renderWithRoutes("/admin");
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to /login", () => {
    mockAuth.mockReturnValue({ user: null, role: null, loading: false, roleLoaded: false });
    renderWithRoutes("/admin");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("shows loading screen when authenticated but role not yet fetched", () => {
    mockAuth.mockReturnValue({
      user: { id: "u1" },
      role: null,
      loading: false,
      roleLoaded: false,
    });
    renderWithRoutes("/admin");
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("redirects to /no-role when authenticated but no role assigned", () => {
    mockAuth.mockReturnValue({
      user: { id: "u1" },
      role: null,
      loading: false,
      roleLoaded: true,
    });
    renderWithRoutes("/admin");
    expect(screen.getByText("No Role Page")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("redirects a teacher to /teacher when trying to access /admin", () => {
    mockAuth.mockReturnValue({
      user: { id: "u1" },
      role: "teacher",
      loading: false,
      roleLoaded: true,
    });
    renderWithRoutes("/admin", ["admin"]);
    expect(screen.getByText("Teacher Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("redirects a parent to /parent when trying to access /admin", () => {
    mockAuth.mockReturnValue({
      user: { id: "u1" },
      role: "parent",
      loading: false,
      roleLoaded: true,
    });
    renderWithRoutes("/admin", ["admin"]);
    expect(screen.getByText("Parent Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("allows access when the role matches allowedRoles", () => {
    mockAuth.mockReturnValue({
      user: { id: "u1" },
      role: "admin",
      loading: false,
      roleLoaded: true,
    });
    renderWithRoutes("/admin", ["admin"]);
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("allows access when no allowedRoles restriction is provided", () => {
    mockAuth.mockReturnValue({
      user: { id: "u1" },
      role: "parent",
      loading: false,
      roleLoaded: true,
    });
    render(
      <MemoryRouter initialEntries={["/any"]}>
        <Routes>
          <Route
            path="/any"
            element={
              <ProtectedRoute>
                <div>Shared Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Shared Content")).toBeInTheDocument();
  });
});
