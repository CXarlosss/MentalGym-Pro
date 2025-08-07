import { login } from "@/lib/api";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  const handleLogin = async (email: string, password: string) => {
    try {
      const data = await login(email, password);
      console.log("Login correcto ✅", data);
      localStorage.setItem("token", data.token); // O puedes usar cookies
    } catch (error) {
      console.error("Error de login ❌", error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <AuthForm type="login" onSubmit={handleLogin} />
    </main>
  );
}
