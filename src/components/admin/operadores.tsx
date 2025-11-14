import { useState, useEffect } from "react";
import { Button, buttonVariants } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import { Badge } from "../ui/badge";
import { Plus, Pencil, Trash2, Eye, EyeOff, KeyRound, UserCog, Search, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../ui/utils";

interface Perfil {
  idPerfil: number;
  descricao: string;
}
interface Operador {
  idUsuario: number;
  nome: string;
  email: string;
  ativo: boolean;
  perfil: Perfil;
}
interface TokenPayload {
  id: number;
  role: string;
}

interface AlertItem {
  action: 'desativar' | 'reativar';
  data: Operador;
}

export function Operadores() {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertItem, setAlertItem] = useState<AlertItem | null>(null);
  
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    perfilId: ""
  });

  const [novaSenha, setNovaSenha] = useState("");

  const token = localStorage.getItem("calcana_token");
  let idUsuarioLogado: number | null = null;
  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      idUsuarioLogado = decoded.id;
    } catch (e) { console.error(e); }
  }

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [opData, perfisData] = await Promise.all([
        api.get<Operador[]>("/usuarios?perfil=&status=todos"),
        api.get<Perfil[]>("/perfis")
      ]);
      
      setOperadores(opData.data);
      setPerfis(perfisData.data);
      
    } catch (error) {
      toast.error("Erro ao carregar lista de operadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.perfilId) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!selectedOperador && !formData.senha) {
      toast.error("A senha é obrigatória para novos usuários.");
      return;
    }
    setIsSaving(true);
    try {
      if (selectedOperador) {
        const putPayload = {
          nome: formData.nome,
          email: formData.email,
          perfil: { idPerfil: parseInt(formData.perfilId) }
        };
        await api.put(`/usuarios/${selectedOperador.idUsuario}`, putPayload);
        toast.success("Dados do usuário atualizados!");
      } else {
        const postPayload = {
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          perfil: { idPerfil: parseInt(formData.perfilId) },
          ativo: true
        };
        await api.post("/usuarios", postPayload);
        toast.success("Usuário cadastrado com sucesso!");
      }
      setIsDialogOpen(false);
      carregarDados();
      limparForm();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Erro ao salvar usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmAction = async () => {
    if (!alertItem) return;
    const { action, data } = alertItem;

    try {
      if (action === 'desativar') {
        await api.delete(`/usuarios/${data.idUsuario}`);
        toast.success("Usuário desativado com sucesso!");
      } else if (action === 'reativar') {
        await api.patch(`/usuarios/${data.idUsuario}`, { ativo: true });
        toast.success(`Usuário "${data.nome}" reativado com sucesso!`);
      }
      carregarDados();
    } catch (error: any) {
      toast.error(`Erro ao ${action === 'desativar' ? 'desativar' : 'reativar'} usuário.`);
    } finally {
      setIsAlertOpen(false);
      setAlertItem(null);
    }
  };

  const handleResetSenha = async () => {
    if (!selectedOperador || !novaSenha) return;
    try {
      await api.put(`/usuarios/${selectedOperador.idUsuario}/resetar-senha`, {
        novaSenha: novaSenha
      });
      toast.success(`Senha de ${selectedOperador.nome} alterada com sucesso!`);
      setIsResetPasswordOpen(false);
      setNovaSenha("");
      setSelectedOperador(null);
    } catch (error: any) {
      toast.error("Erro ao resetar senha.");
    }
  };

  const limparForm = () => {
    setFormData({ nome: "", email: "", senha: "", perfilId: "" });
    setSelectedOperador(null);
    setShowPassword(false);
  };

  const handleAdd = () => {
    limparForm();
    const perfilOperador = perfis.find(p => p.descricao === "OPERADOR");
    if(perfilOperador) setFormData(prev => ({ ...prev, perfilId: String(perfilOperador.idPerfil) }));
    setIsDialogOpen(true);
  };

  const handleEdit = (operador: Operador) => {
    setSelectedOperador(operador);
    setFormData({
      nome: operador.nome,
      email: operador.email,
      senha: "",
      perfilId: String(operador.perfil.idPerfil)
    });
    setIsDialogOpen(true);
  };

  const requestAction = (action: 'desativar' | 'reativar', operador: Operador) => {
    setAlertItem({ action, data: operador });
    setIsAlertOpen(true);
  };

  const requestResetSenha = (operador: Operador) => {
    setSelectedOperador(operador);
    setNovaSenha("");
    setIsResetPasswordOpen(true);
  };

  const filteredOperadores = operadores.filter(op => 
    op.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const perfisDisponiveis = perfis.filter(p => p.descricao.toUpperCase() !== "GESTOR");

  if (loading) {
    return <div className="p-6 space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Cadastre operadores do sistema</p>
        </div>
        
        <Button onClick={handleAdd} className="btn-calcana shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-primary" />
              Lista de Usuários
            </CardTitle>
            <div className="relative w-full max-w-xs hidden sm:block">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-8 bg-input-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperadores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOperadores.map((operador) => (
                  <TableRow key={operador.idUsuario}>
                    <TableCell className="font-medium">{operador.nome}</TableCell>
                    <TableCell>{operador.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={operador.perfil.descricao === "GESTOR" ? "border-purple-500 text-purple-600 dark:border-purple-600 dark:text-purple-400" : ""}>
                        {operador.perfil.descricao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={operador.ativo ? "default" : "destructive"}>
                        {operador.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        
                        <Button
                          variant="outline"
                          size="sm"
                          title="Alterar Senha"
                          onClick={() => requestResetSenha(operador)}
                          disabled={!operador.ativo}
                          className="text-amber-700 hover:text-amber-700 border-gray-200 hover:border-amber-200 hover:bg-amber-100"
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          title="Editar Dados"
                          onClick={() => handleEdit(operador)}
                          disabled={!operador.ativo}
                          className="text-blue-700 hover:text-blue-700 border-gray-200 hover:border-blue-200 hover:bg-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        {operador.ativo ? (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Desativar"
                            disabled={operador.idUsuario === idUsuarioLogado}
                            onClick={() => requestAction('desativar', operador)}
                            className="text-red-700 hover:text-red-700 border-gray-200 hover:border-red-200 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Reativar"
                            onClick={() => requestAction('reativar', operador)}
                            className="text-green-700 hover:text-green-700 border-gray-200 hover:border-green-200 hover:bg-green-100"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOperador ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription>
              {selectedOperador ? "Atualize os dados cadastrais." : "Preencha os dados para criar um acesso."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="off"
                  name="new-user-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@calcana.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perfil">Perfil de Acesso</Label>
                <Select 
                  value={formData.perfilId} 
                  onValueChange={(val) => setFormData({ ...formData, perfilId: val })}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {perfisDisponiveis.map(p => (
                      <SelectItem key={p.idPerfil} value={String(p.idPerfil)}>
                        {p.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!selectedOperador && (
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha Inicial</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      name="new-user-password"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="btn-calcana" disabled={isSaving}>
                {isSaving ? "Salvando..." : (selectedOperador ? "Atualizar" : "Cadastrar")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para o usuário <strong>{selectedOperador?.nome}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Nova Senha</Label>
            <Input 
              type="password" 
              value={novaSenha} 
              onChange={(e) => setNovaSenha(e.target.value)} 
              placeholder="Digite a nova senha..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Cancelar</Button>
            <Button type="button" className="btn-calcana" onClick={handleResetSenha}>Confirmar Alteração</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className={alertItem?.action === 'desativar' ? "text-destructive" : "text-primary"} />
              Confirmar {alertItem?.action === 'desativar' ? 'Desativação' : 'Reativação'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {alertItem?.action === 'desativar' ? 'DESATIVAR' : 'REATIVAR'} o usuário 
              <strong> {alertItem?.data.nome}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction} 
              className={cn(
                alertItem?.action === 'desativar' 
                  ? buttonVariants({ variant: "destructive" }) 
                  : "btn-calcana"
              )}
            >
              Sim, {alertItem?.action === 'desativar' ? 'Desativar' : 'Reativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}