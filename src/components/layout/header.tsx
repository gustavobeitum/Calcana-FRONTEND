import { LogOut, Menu, Leaf } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ThemeToggle } from "../theme/theme-toggle";

interface HeaderProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  onLogout?: () => void;
  onOpenMobileMenu?: () => void;
}

export function Header({ user, onLogout, onOpenMobileMenu }: HeaderProps) {
  
  const firstName = user?.name ? user.name.split(" ")[0] : "";

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        {user && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-1 text-muted-foreground"
            onClick={onOpenMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 calcana-logo-bg rounded-lg flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex flex-col justify-center leading-tight">
            <h1 className="text-lg font-bold text-primary">Calcana</h1>
            <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block -mt-0.5">
              Sistema de Análise de Cana-de-açúcar
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10 hover:bg-muted/50 px-2 sm:pl-2 sm:pr-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white font-medium">
                    {firstName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none max-w-[100px] truncate">
                    {firstName}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {user.role.toLowerCase()}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48">
              <div className="md:hidden p-2 border-b mb-1">
                <p className="text-sm font-medium">{firstName}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
                        
              <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}