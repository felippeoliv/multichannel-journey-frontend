import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import BusinessSelection from "@/pages/auth/BusinessSelection";
import { Dashboard } from "@/pages/Dashboard";
import { Settings } from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import { Journeys } from "@/pages/Journeys";
import { JourneyEditor } from "@/pages/JourneyEditor";
import { Leads } from "@/pages/Leads";
import { ContactsTable } from "@/pages/ContactsTable";
import { Messages } from "@/pages/Messages";
import { Integrations } from "@/pages/Integrations";
import { Reports } from "@/pages/Reports";
import { NpsAnalysis } from "@/pages/NpsAnalysis";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute: user', user);
  console.log('ProtectedRoute: loading', loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute: No user, navigating to /auth/login');
    return <Navigate to="/auth/login" />;
  }

  if (!user.selectedBusinessId) {
    console.log('ProtectedRoute: No selectedBusinessId, navigating to /auth/business-selection');
    return <Navigate to="/auth/business-selection" />;
  }

  console.log('ProtectedRoute: User and selectedBusinessId exist, rendering children');
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/business-selection" element={<BusinessSelection />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journeys"
              element={
                <ProtectedRoute>
                  <Journeys />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journeys/editor/:id?"
              element={
                <ProtectedRoute>
                  <JourneyEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <Leads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts-table"
              element={
                <ProtectedRoute>
                  <ContactsTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/integrations"
              element={
                <ProtectedRoute>
                  <Integrations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
