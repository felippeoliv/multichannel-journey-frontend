
import { MetricCard } from \"@/components/ui/metric-card\";
import { Card, CardContent, CardHeader, CardTitle } from \"@/components/ui/card\";
import { Users, MessageSquare, Waypoints, Bot } from \"lucide-react\";
import { EngagementChart } from \"@/components/charts/engagement-chart\";
import { PerformanceChart } from \"@/components/charts/performance-chart\";
import { useQuery } from \"@tanstack/react-query\";
import { apiClient } from \"@/lib/api/client\";

export default function DashboardPage() {
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: [\"dashboardMetrics\"],
    queryFn: () => apiClient.get<any>(\"/dashboard/metrics\"),
  });

  return (
    <div className=\"space-y-6\">
      <h1 className=\"text-3xl font-bold\">Dashboard</h1>

      <div className=\"grid gap-6 md:grid-cols-2 lg:grid-cols-4\">
        <MetricCard
          title=\"Total de Contatos\"
          value={metrics?.contacts?.total}
          icon={Users}
          loading={isLoadingMetrics}
          change={{
            value: metrics?.contacts?.growth_rate,
            type: \"increase\",
            period: \"último mês\",
          }}
        />
        <MetricCard
          title=\"Mensagens Enviadas Hoje\"
          value={metrics?.messages?.sent_today}
          icon={MessageSquare}
          loading={isLoadingMetrics}
          change={{
            value: metrics?.messages?.delivered_rate,
            type: \"increase\",
            period: \"taxa de entrega\",
          }}
        />
        <MetricCard
          title=\"Jornadas Ativas\"
          value={metrics?.journeys?.active}
          icon={Waypoints}
          loading={isLoadingMetrics}
          change={{
            value: metrics?.journeys?.avg_conversion,
            type: \"increase\",
            period: \"taxa de conversão\",
          }}
        />
        <MetricCard
          title=\"Agentes Ativos\"
          value={metrics?.agents?.active_conversations}
          icon={Bot}
          loading={isLoadingMetrics}
          change={{
            value: metrics?.agents?.avg_response_time,
            type: \"decrease\",
            period: \"tempo de resposta (min)\",
          }}
        />
      </div>

      <div className=\"grid gap-6 lg:grid-cols-2\">
        <Card>
          <CardHeader>
            <CardTitle>Engajamento de Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <EngagementChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


