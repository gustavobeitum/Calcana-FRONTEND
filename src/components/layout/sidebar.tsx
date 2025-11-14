import { 
  LayoutDashboard, 
  Users, 
  Building, 
  TestTube, 
  History,
  ChevronRight,
  UserCog
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
}

export function Sidebar({ activeSection, onSectionChange, userRole }: SidebarProps) {
  const role = userRole.toUpperCase();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      allowed: ["GESTOR", "OPERADOR"]
    },
    {
      id: "analises",
      label: "Lançar Análises",
      icon: TestTube,
      allowed: ["OPERADOR"] 
    },
    {
      id: "fornecedores", 
      label: "Fornecedores",
      icon: Users,
      allowed: ["GESTOR", "OPERADOR"]
    },
    {
      id: "propriedades",
      label: "Propriedades", 
      icon: Building,
      allowed: ["GESTOR", "OPERADOR"]
    },
    {
      id: "historico",
      label: "Consultar Análises",
      icon: History,
      allowed: ["GESTOR", "OPERADOR"]
    },
    {
      id: "operadores",
      label: "Usuários",
      icon: UserCog,
      allowed: ["GESTOR"]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.allowed.includes(role)
  );

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Menu Principal
        </h2>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-10 px-3 font-medium transition-all",
                isActive 
                  ? "calcana-sidebar-active"
                  : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Link to={`/${item.id}`}> 
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p>Versão 1.0</p>
          <p>© 2025 Assocana</p>
        </div>
      </div>
    </aside>
  );
}