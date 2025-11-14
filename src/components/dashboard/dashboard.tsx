import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TestTube, Calendar, Activity } from "lucide-react";
import api from "../../services/api";
import { Skeleton } from "../ui/skeleton";

interface DashboardProps {
  userRole: "OPERADOR" | "GESTOR";
}

interface DashboardMetrics {
  totalAnalises: number;
  analisesEsteAno: number;
  fornecedoresAtivos: number;
  propriedadesAtivas: number;
  mediaATR: number;
  ultimaAnalise: string;
}

interface AnaliseMensal {
  mes: string;
  analises: number;
  atr: number;
}

interface AtividadeRecente {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  atr?: number;
  usuario: string;
}

export function Dashboard({ userRole }: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [analisesMensais, setAnalisesMensais] = useState<AnaliseMensal[]>([]);
  const [atividadesRecentes, setAtividadesRecentes] = useState<AtividadeRecente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, mensaisRes, recentesRes] = await Promise.all([
          api.get<DashboardMetrics>("/dashboard/metrics"),
          api.get<AnaliseMensal[]>("/dashboard/analises-mensais"),
          api.get<AtividadeRecente[]>("/dashboard/atividades-recentes")
        ]);

        setMetrics(metricsRes.data);
        setAnalisesMensais(mensaisRes.data);
        setAtividadesRecentes(recentesRes.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema Calcana</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Análises Este Ano</CardTitle>
          <TestTube className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {metrics?.analisesEsteAno || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Total acumulado em {new Date().getFullYear()}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Análises este Ano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analisesMensais}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--popover-foreground)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{
                    color: 'var(--primary)',
                    fontWeight: 500
                  }}
                  labelStyle={{
                    color: 'var(--muted-foreground)',
                    marginBottom: '0.25rem'
                  }}
                  cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                />
                <Bar dataKey="analises" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ATR Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {metrics?.mediaATR ? metrics.mediaATR.toFixed(2) : "0.00"}
          </div>
          <p className="text-xs text-muted-foreground">
            kg/t de açúcar recuperável (Média Geral)
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Evolução ATR Médio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analisesMensais}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--popover-foreground)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{
                    color: 'var(--primary)',
                    fontWeight: 500
                  }}
                  labelStyle={{
                    color: 'var(--muted-foreground)',
                    marginBottom: '0.25rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="atr" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Análises Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atividadesRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma análise recente.</p>
            ) : (
              atividadesRecentes.map((atividade) => (
                <div key={atividade.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{atividade.descricao}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(atividade.data).toLocaleDateString('pt-BR')}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        por {atividade.usuario}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {atividade.atr && (
                      <Badge variant="outline" className="border-primary text-primary bg-primary/5">
                        ATR: {atividade.atr.toFixed(1)}
                      </Badge>
                    )}
                    <Badge 
                      variant={
                        atividade.tipo === "analise" ? "default" : 
                        atividade.tipo === "relatorio" ? "secondary" : "outline"
                      }
                    >
                      {atividade.tipo}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  );
}