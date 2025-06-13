
import { DataTable } from \"@/components/ui/data-table\";
import { Button } from \"@/components/ui/button\";
import { PlusCircle, Upload } from \"lucide-react\";
import { useQuery } from \"@tanstack/react-query\";
import { apiClient } from \"@/lib/api/client\";
import { Contact } from \"@/lib/types/contact\";
import Link from \"next/link\";
import { useState } from \"react\";
import { Input } from \"@/components/ui/input\";

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState(\"\");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: [\"contacts\", searchTerm, page, limit],
    queryFn: () =>
      apiClient.get<{ data: Contact[]; pagination: any }>(
        `/contacts?page=${page}&limit=${limit}&search=${searchTerm}`
      ),
  });

  const columns = [
    {
      accessorKey: \"full_name\",


      header: \"Nome Completo\",
    },
    {
      accessorKey: \"email\",


      header: \"Email\",
    },
    {
      accessorKey: \"phone\",
      header: \"Telefone\",
    },
    {
      accessorKey: \"tags\",
      header: \"Tags\",
      cell: ({ row }: { row: any }) => (
        <div className=\"flex flex-wrap gap-1\">
          {row.original.tags.map((tag: string) => (
            <span
              key={tag}
              className=\"px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full\"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: \"engagement_score\",
      header: \"Engajamento\",
      cell: ({ row }: { row: any }) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.original.engagement_score > 70
              ? \"bg-green-100 text-green-800\"
              : row.original.engagement_score > 40
              ? \"bg-yellow-100 text-yellow-800\"
              : \"bg-red-100 text-red-800\"
          }`}
        >
          {row.original.engagement_score}
        </span>
      ),
    },
    {
      id: \"actions\",
      header: \"Ações\",
      cell: ({ row }: { row: any }) => (
        <Link href={`/contacts/${row.original.id}`}>
          <Button variant=\"ghost\" size=\"sm\">Ver Detalhes</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <h1 className=\"text-3xl font-bold\">Contatos</h1>
        <div className=\"flex space-x-2\">
          <Link href=\"/contacts/import\">
            <Button variant=\"outline\">
              <Upload className=\"mr-2 h-4 w-4\" /> Importar
            </Button>
          </Link>
          <Link href=\"/contacts/create\">
            <Button>
              <PlusCircle className=\"mr-2 h-4 w-4\" /> Novo Contato
            </Button>
          </Link>
        </div>
      </div>

      <Input
        placeholder=\"Buscar contatos...\"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className=\"max-w-sm\"
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}


