
import { RegisterForm } from \"@/components/forms/register-form\";

export default function RegisterPage() {
  return (
    <div className=\"w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md\">
      <h2 className=\"text-2xl font-bold text-center\">Registrar</h2>
      <RegisterForm />
    </div>
  );
}


