
import { JourneyForm } from \"@/components/forms/journey-form\";
import { useQuery } from \"@tanstack/react-query\";
import { apiClient } from \"@/lib/api/client\";
import { Journey } from \"@/lib/types/journey\";
import { useRouter } from \"next/navigation\";
import { Button } from \"@/components/ui/button\";
import { ArrowLeft } from \"lucide-react\";

export default function EditJourneyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const { data: journey, isLoading } = useQuery({
    queryKey: [\"journey\", id],
    queryFn: () => apiClient.get<Journey>(`/journeys/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return <p>Carregando jornada...</p>;
  }

  if (!journey) {
    return <p>Jornada não encontrada.</p>;
  }

  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <Button variant=\"outline\" onClick={() => router.back()}>
          <ArrowLeft className=\"mr-2 h-4 w-4\" /> Voltar
        </Button>
        <h1 className=\"text-3xl font-bold\">Editar Jornada: {journey.name}</h1>
      </div>
      <JourneyForm initialData={journey} />
    </div>
  );
}


