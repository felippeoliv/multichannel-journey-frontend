
import { DashboardLayout } from \"@/components/layout/dashboard-layout\";
import { AuthProvider } from \"@/components/providers/auth-provider\";
import { QueryProvider } from \"@/components/providers/query-provider\";
import { RealtimeProvider } from \"@/components/providers/realtime-provider\";
import { ThemeProvider } from \"@/components/providers/theme-provider\";
import { Toaster } from \"sonner\";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute=\"class\" defaultTheme=\"system\" enableSystem>
      <AuthProvider>
        <QueryProvider>
          <RealtimeProvider>
            <DashboardLayout>{children}</DashboardLayout>
            <Toaster position=\"top-right\" richColors />
          </RealtimeProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


