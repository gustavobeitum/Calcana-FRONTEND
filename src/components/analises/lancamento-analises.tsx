import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { TestTube, Calculator, Save, RotateCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface Fornecedor {
  idFornecedor: number;
  nome: string;
}

interface Propriedade {
  idPropriedade: number;
  nome: string;
}

interface LancamentoAnalisesProps {
  userRole: string;
  userId?: number;
}

export function LancamentoAnalises({ userId }: LancamentoAnalisesProps) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  
  const [formData, setFormData] = useState({
    fornecedor: "",
    propriedade: "",
    zona: "",
    talhao: "",
    numeroAmostra: "",
    corte: "",
    dataAnalise: new Date().toISOString().split('T')[0],
    pbu: "",
    brix: "",
    leituraSacarimetrica: "",
    observacoes: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  const [resultados, setResultados] = useState<{
    pbu: number;
    brix: number;
    leituraSacarimetrica: number;
    polCaldo: number;
    pureza: number;
    polCana: number;
    fibra: number;
    arCana: number;
    arCaldo: number;
    atr: number;
  } | null>(null);

  useEffect(() => {
    api.get<{ content: Fornecedor[] }>("/fornecedores?status=ativos&size=10")
      .then(res => setFornecedores(res.data.content)) 
      .catch(err => toast.error("Erro ao carregar fornecedores."));
  }, []);

  useEffect(() => {
    if (!formData.fornecedor) {
      setPropriedades([]);
      return;
    }
    api.get<Propriedade[]>(`/propriedades/por-fornecedor/${formData.fornecedor}`)
      .then(res => setPropriedades(res.data))
      .catch(err => toast.error("Erro ao carregar propriedades."));
  }, [formData.fornecedor]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Erro de sessão: ID do usuário não encontrado. Faça login novamente.");
      return;
    }

    if (!formData.propriedade || !formData.numeroAmostra || !formData.pbu || !formData.brix || !formData.leituraSacarimetrica) {
      toast.error("Preencha todos os campos obrigatórios (*)");
      return;
    }

    setIsSaving(true);

    const payload = {
      numeroAmostra: parseInt(formData.numeroAmostra),
      dataAnalise: formData.dataAnalise,
      pbu: parseFloat(formData.pbu),
      brix: parseFloat(formData.brix),
      leituraSacarimetrica: parseFloat(formData.leituraSacarimetrica),
      zona: formData.zona,
      talhao: formData.talhao,
      corte: parseInt(formData.corte) || 1,
      observacoes: formData.observacoes,
      propriedade: {
        idPropriedade: parseInt(formData.propriedade)
      },
      usuarioLancamento: {
        idUsuario: userId
      }
    };

    try {
      const response = await api.post("/analises", payload);
      const dados = response.data;
      
      setResultados({
        pbu: dados.pbu || 0,
        brix: dados.brix || 0,
        leituraSacarimetrica: dados.leituraSacarimetrica || 0,
        polCaldo: dados.polCaldo || 0,
        pureza: dados.pureza || 0,
        polCana: dados.polCana || 0,
        fibra: dados.fibra || 0,
        arCana: dados.arCana || 0,
        arCaldo: dados.arCaldo || 0,
        atr: dados.atr || 0
      });

      toast.success("Análise salva com sucesso!");
      
    } catch (error: any) {
      console.error("Erro detalhado:", error.response?.data);
      toast.error(`Erro ao salvar: ${error.response?.data?.message || "Verifique os dados."}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      zona: "",
      talhao: "",
      numeroAmostra: "",
      corte: "",
      dataAnalise: new Date().toISOString().split('T')[0],
      pbu: "",
      brix: "",
      leituraSacarimetrica: "",
      observacoes: ""
    }));
    setResultados(null);
  };

  const hoje = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lançamento de Análises</h1>
        <p className="text-muted-foreground">Registre os dados laboratoriais e calcule automaticamente o ATR</p>
      </div>

      <div className=" gap-6">
        
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TestTube className="w-5 h-5 text-primary" />
                  Informações da Amostra
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fornecedor *</Label>
                  <Select value={formData.fornecedor} onValueChange={(val) => handleInputChange("fornecedor", val)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {fornecedores.map(f => <SelectItem key={f.idFornecedor} value={String(f.idFornecedor)}>{f.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Propriedade *</Label>
                  <Select value={formData.propriedade} onValueChange={(val) => handleInputChange("propriedade", val)} disabled={!formData.fornecedor}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {propriedades.map(p => <SelectItem key={p.idPropriedade} value={String(p.idPropriedade)}>{p.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nº Amostra *</Label>
                  <Input 
                    type="number"
                    value={formData.numeroAmostra} 
                    onChange={e => handleInputChange("numeroAmostra", e.target.value)} 
                    placeholder="Ex: 101"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Zona</Label>
                  <Input value={formData.zona} onChange={e => handleInputChange("zona", e.target.value)} placeholder="Zona 1200" />
                </div>

                <div className="space-y-2">
                  <Label>Talhão</Label>
                  <Input value={formData.talhao} onChange={e => handleInputChange("talhao", e.target.value)} placeholder="T-01" />
                </div>

                <div className="space-y-2">
                  <Label>Corte</Label>
                  <Select value={formData.corte} onValueChange={(val) => handleInputChange("corte", val)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {[...Array(12)].map((_, i) => (
                        <SelectItem key={i+1} value={String(i+1)}>{i+1}º Corte</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data da Análise *</Label>
                  <Input 
                    type="date" 
                    max={hoje}
                    value={formData.dataAnalise} 
                    onChange={e => handleInputChange("dataAnalise", e.target.value)} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="w-5 h-5 text-primary" />
                  Dados Laboratoriais (Entrada)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>PBU (%) *</Label>
                    <Input type="number" step="0.01" placeholder="0.00" value={formData.pbu} onChange={e => handleInputChange("pbu", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>BRIX *</Label>
                    <Input type="number" step="0.01" placeholder="0.00" value={formData.brix} onChange={e => handleInputChange("brix", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Leitura Sac. *</Label>
                    <Input type="number" step="0.01" placeholder="0.00" value={formData.leituraSacarimetrica} onChange={e => handleInputChange("leituraSacarimetrica", e.target.value)} required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input value={formData.observacoes} onChange={e => handleInputChange("observacoes", e.target.value)} placeholder="Opcional..." />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" className="btn-calcana flex-1 shadow-lg" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Calculando..." : "Salvar Análise"}
              </Button>
              
              <Button type="button" className = "shadow-lg" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Novo Lançamento
              </Button>
            </div>
          </form>
          
          <Card className={`sticky top-6 h-fit border-2 ${resultados ? 'border-primary/20 shadow-lg' : 'border-dashed'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {resultados ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Calculator className="w-5 h-5 text-muted-foreground" />}
                Resultados Calculados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!resultados ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Preencha o formulário e salve para ver os cálculos.
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-center space-y-1">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">ATR Final</span>
                    <div className="text-4xl font-bold text-primary">
                      {resultados.atr.toFixed(2)}
                    </div>
                    <span className="text-xs text-muted-foreground">kg/t</span>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-muted/50 rounded text-center">
                            <span className="block text-xs text-muted-foreground">PBU</span>
                            <span className="font-medium">{resultados.pbu.toFixed(2)}</span>
                        </div>
                        <div className="p-2 bg-muted/50 rounded text-center">
                            <span className="block text-xs text-muted-foreground">Brix</span>
                            <span className="font-medium">{resultados.brix.toFixed(2)}</span>
                        </div>
                        <div className="p-2 bg-muted/50 rounded text-center col-span-2">
                            <span className="block text-xs text-muted-foreground">Leitura Sac.</span>
                            <span className="font-medium">{resultados.leituraSacarimetrica.toFixed(2)}</span>
                        </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Pol do Caldo (S)</span>
                        <span className="font-medium">{resultados.polCaldo.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Pol da Cana (PC)</span>
                        <span className="font-medium">{resultados.polCana.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Pureza</span>
                        <span className="font-medium">{resultados.pureza.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Fibra</span>
                        <span className="font-medium">{resultados.fibra.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Açúcar Redutor (AR)</span>
                        <span className="font-medium">{resultados.arCana.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">AR Caldo</span>
                        <span className="font-medium">{resultados.arCaldo.toFixed(2)}%</span>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}