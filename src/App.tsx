import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Toaster } from "./components/ui/sonner";
import { AppRoutes } from "./routes";


interface UserPayload {
  sub: string;
  name: string;
  id: number;
  role: string;
  exp: number;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{id: number; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("calcana_token");
    if (token) {
      try {
        const decoded = jwtDecode<UserPayload>(token);
        if (decoded.exp * 1000 < Date.now()) {
          handleLogout();
        } else {
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.sub,
            role: decoded.role
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    const token = localStorage.getItem("calcana_token");
    if (token) {
      const decoded = jwtDecode<UserPayload>(token);
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.sub,
        role: decoded.role
      });
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("calcana_token");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-primary">Carregando...</div>;
  }

  return (
    <>
      <AppRoutes 
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={handleLoginSuccess}
        onLogout={handleLogout}
      />
      <Toaster />
    </>
  );
}

export default App;