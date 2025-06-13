
import { useRouter } from \"next/navigation\";
import { useQuery } from \"@tanstack/react-query\";
import { apiClient } from \"@/lib/api/client\";
import { Agent } from \"@/lib/types/agent\";
import { Card, CardContent, CardHeader, CardTitle } from \"@/components/ui/card\";
import { Button } from \"@/components/ui/button\";
import { ArrowLeft, MessageSquare } from \"lucide-react\";
import Link from \"next/link\";

export default function AgentConversationsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const { data: agent, isLoading } = useQuery({
    queryKey: [\"agent\", id],
    queryFn: () => apiClient.get<Agent>(`/agents/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return <p>Carregando agente...</p>;
  }

  if (!agent) {
    return <p>Agente não encontrado.</p>;
  }

  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <Button variant=\"outline\" onClick={() => router.back()}>
          <ArrowLeft className=\"mr-2 h-4 w-4\" /> Voltar
        </Button>
        <h1 className=\"text-3xl font-bold\">Conversas do Agente: {agent.name}</h1>
        <Button>
          <MessageSquare className=\"mr-2 h-4 w-4\" /> Iniciar Nova Conversa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Agente</CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          <div>
            <h3 className=\"font-semibold\">Nome:</h3>
            <p>{agent.name}</p>
          </div>
          <div>
            <h3 className=\"font-semibold\">Descrição:</h3>
            <p>{agent.description}</p>
          </div>
          <div>
            <h3 className=\"font-semibold\">Modelo de IA:</h3>
            <p>{agent.ai_model}</p>
          </div>
          <div>
            <h3 className=\"font-semibold\">Instruções:</h3>
            <p>{agent.instructions}</p>
          </div>
          <div>
            <h3 className=\"font-semibold\">Criado em:</h3>
            <p>{new Date(agent.created_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Conversas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Lista de conversas do agente...</p>
          {/* TODO: Implementar listagem de conversas */}
        </CardContent>
      </Card>
    </div>
  );
}


