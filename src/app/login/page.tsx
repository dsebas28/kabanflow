import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Inicia sesión"
      subtitle="Entra a tus tableros y sigue donde lo dejaste."
      panelHeadline="Cada tarjeta que mueves, tu equipo la ve al instante."
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
