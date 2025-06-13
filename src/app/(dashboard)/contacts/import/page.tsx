
import { Card, CardContent, CardHeader, CardTitle } from \"@/components/ui/card\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { useState }"react";
import { toast } from \"sonner\";
import { apiClient } from \"@/lib/api/client\";

export default function ImportContactsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error(\"Por favor, selecione um arquivo CSV para importar.\");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append(\"file\", file);

    try {
      await apiClient.post(\"/contacts/import\", formData, {
        headers: {
          \"Content-Type\": \"multipart/form-data\",
        },
      });
      toast.success(\"Contatos importados com sucesso!\");
      setFile(null);
    } catch (error) {
      toast.error(\"Erro ao importar contatos. Tente novamente.\");
      console.error(\"Import error:\", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=\"space-y-6\">
      <h1 className=\"text-3xl font-bold\">Importar Contatos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Importar Contatos via CSV</CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          <p>Selecione um arquivo CSV para importar seus contatos. O arquivo deve conter as colunas: <code>full_name</code>, <code>email</code>, <code>phone</code>, <code>tags</code> (separadas por vírgula).</p>
          <div>
            <Label htmlFor=\"csv-file\">Arquivo CSV</Label>
            <Input
              id=\"csv-file\"
              type=\"file\"
              accept=\".csv\"
              onChange={handleFileChange}
              className=\"mt-1\"
            />
          </div>
          <Button onClick={handleImport} disabled={isLoading || !file}>
            {isLoading ? \"Importando...\" : \"Importar Contatos\"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


