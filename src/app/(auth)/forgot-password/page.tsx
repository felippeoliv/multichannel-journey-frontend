
import { ForgotPasswordForm } from \"@/components/forms/forgot-password-form\";

export default function ForgotPasswordPage() {
  return (
    <div className=\"w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md\">
      <h2 className=\"text-2xl font-bold text-center\">Esqueceu a Senha?</h2>
      <ForgotPasswordForm />
    </div>
  );
}


