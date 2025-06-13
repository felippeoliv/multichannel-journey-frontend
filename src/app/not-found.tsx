
export default function NotFound() {
  return (
    <div className=\"flex flex-col items-center justify-center min-h-screen\">
      <h2 className=\"text-xl font-bold mb-4\">Página não encontrada</h2>
      <p>A página que você está procurando não existe.</p>
      <a href=\"/\" className=\"mt-4 text-blue-500 hover:underline\">
        Voltar para a página inicial
      </a>
    </div>
  );
}


