
import { useRouter } from \"next/navigation\";
import { useQuery } from \"@tanstack/react-query\";
import { apiClient } from \"@/lib/api/client\";
import { Contact } from \"@/lib/types/contact\";
import { Card, CardContent, CardHeader, CardTitle } from \"@/components/ui/card\";
import { Button } from \"@/components/ui/button\";
import { ArrowLeft, Edit, MessageSquare } from \"lucide-react\";
import Link from \"next/link\";

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const { data: contact, isLoading } = useQuery({
    queryKey: [\"contact\", id],
    queryFn: () => apiClient.get<Contact>(`/contacts/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return <p>Carregando contato...</p>;
  }

  if (!contact) {
    return <p>Contato não encontrado.</p>;
  }

  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <Button variant=\"outline\" onClick={() => router.back()}>
          <ArrowLeft className=\"mr-2 h-4 w-4\" /> Voltar
        </Button>
        <div className=\"flex space-x-2\">
          <Button variant=\"outline\">
            <Edit className=\"mr-2 h-4 w-4\" /> Editar
          </Button>
          <Button>
            <MessageSquare className=\"mr-2 h-4 w-4\" /> Enviar Mensagem
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{contact.full_name}</CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          <div>
            <h3 className=\"font-semibold\">Email:</h3>
            <p>{contact.email}</p>
          </div>
          <div>
            <h3 className=\"font-semibold\">Telefone:</h3>
            <p>{contact.phone}</p>
          </div>
          <div>
            <h3 className=\"font-semibold\">Tags:</h3>
            <div className=\"flex flex-wrap gap-2\">
              {contact.tags.map((tag) => (
                <span
                  key={tag}
                  className=\"px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 rounded-full\"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className=\"font-semibold\">Pontuação de Engajamento:</h3>
            <p>{contact.engagement_score}</p>
          </div>
          <div>
            <h3 className=\"font-semibold\">Criado em:</h3>
            <p>{new Date(contact.created_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


