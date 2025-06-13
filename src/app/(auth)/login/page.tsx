
import { LoginForm } from \"@/components/forms/login-form\";

export default function LoginPage() {
  return (
    <div className=\"w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md\">
      <h2 className=\"text-2xl font-bold text-center\">Login</h2>
      <LoginForm />
    </div>
  );
}


