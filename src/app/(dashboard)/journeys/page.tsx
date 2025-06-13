
import { Button } from \"@/components/ui/button\";
import { PlusCircle } from \"lucide-react\";
import Link from \"next/link\";

export default function JourneysPage() {
  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <h1 className=\"text-3xl font-bold\">Jornadas</h1>
        <Link href=\"/journeys/create\">
          <Button>
            <PlusCircle className=\"mr-2 h-4 w-4\" /> Nova Jornada
          </Button>
        </Link>
      </div>

      <p>Lista de jornadas...</p>
      {/* TODO: Implementar listagem de jornadas */}
    </div>
  );
}


