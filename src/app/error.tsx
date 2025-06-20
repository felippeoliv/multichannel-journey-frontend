

\"use client\";

import { useEffect } from \"react\";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className=\"flex flex-col items-center justify-center min-h-screen\">
      <h2 className=\"text-xl font-bold mb-4\">Algo deu errado!</h2>
      <button
        className=\"px-4 py-2 bg-blue-500 text-white rounded-md\"
        onClick={() => reset()}
      >
        Tentar novamente
      </button>
    </div>
  );
}


