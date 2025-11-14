import { useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

import { LoginForm } from "../components/auth/login-form";
import { Dashboard } from "../components/dashboard/dashboard";
import { Fornecedores } from "../components/cadastros/fornecedores";
import { Propriedades } from "../components/cadastros/propriedades";
import { LancamentoAnalises } from "../components/analises/lancamento-analises";
import { Historico } from "../components/historico/historico";
import { Operadores } from "../components/admin/operadores";

import { Header } from "../components/layout/header";
import { Sidebar } from "../components/layout/sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import type { JSX } from "react/jsx-runtime";

interface UserPayload {
  sub: string;
  name: string;
  id: number;
  role: string;
  exp: number;
}

interface AppRoutesProps {
  isAuthenticated: boolean;
  user: { id: number; name: string; email: string; role: string } | null;
  onLogin: () => void;
  onLogout: () => void;
}

function AppLayout({ user, onLogout }: { 
  user: AppRoutesProps['user']; 
  onLogout: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const location = useLocation();
  const activeSection = location.pathname.substring(1) || "dashboard";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header 
        user={user} 
        onLogout={onLogout} 
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex w-64 flex-col border-r">
          <Sidebar 
            activeSection={activeSection}
            onSectionChange={() => {}} 
            userRole={user.role || ""}
          />
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu Principal</SheetTitle>
              <SheetDescription>Navegação do sistema</SheetDescription>
            </SheetHeader>
            <Sidebar 
              activeSection={activeSection}
              onSectionChange={() => setIsMobileMenuOpen(false)} 
              userRole={user.role || ""}
            />
          </SheetContent>
        </Sheet>
        
        <main className="flex-1 overflow-auto bg-background/50 w-full relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function PrivateRoute({ isAuthenticated, user, onLogout }: AppRoutesProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout user={user} onLogout={onLogout} />;
}

export function AppRoutes({ isAuthenticated, user, onLogin, onLogout }: AppRoutesProps) {
  
  const GestorRoute = ({ children }: { children: JSX.Element }) => {
    if (user?.role !== "GESTOR") {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated 
            ? <Navigate to="/dashboard" replace />
            : <LoginForm onLogin={onLogin} />
        } 
      />

      <Route 
        path="/" 
        element={
          <PrivateRoute 
            isAuthenticated={isAuthenticated} 
            user={user} 
            onLogin={onLogin} 
            onLogout={onLogout} 
          />
        }
      >
       
        <Route path="dashboard" element={<Dashboard userRole={user?.role as "GESTOR" | "OPERADOR"} />} />
        
        <Route index element={<Navigate to="/dashboard" replace />} /> 

        <Route path="fornecedores" element={<Fornecedores userRole={user?.role || ""} />} />
        <Route path="propriedades" element={<Propriedades userRole={user?.role || ""} />} />
        <Route path="analises" element={<LancamentoAnalises userRole={user?.role || ""} userId={user?.id} />} />
        <Route path="historico" element={<Historico userRole={user?.role || ""} />} />
        
        <Route 
          path="operadores" 
          element={
            <GestorRoute>
              <Operadores />
            </GestorRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}