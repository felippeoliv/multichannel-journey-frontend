
import { Button } from \"@/components/ui/button\";
import { PlusCircle } from \"lucide-react\";
import Link from \"next/link\";

export default function AgentsPage() {
  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <h1 className=\"text-3xl font-bold\">Agentes de IA</h1>
        <Link href=\"/agents/create\">
          <Button>
            <PlusCircle className=\"mr-2 h-4 w-4\" /> Novo Agente
          </Button>
        </Link>
      </div>

      <p>Lista de agentes de IA...</p>
      {/* TODO: Implementar listagem de agentes */}
    </div>
  );
}


