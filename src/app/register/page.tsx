import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Gratis, y en menos de un minuto tienes tu primer tablero."
      panelHeadline="Empieza un tablero y suma a tu equipo cuando quieras."
    >
      <RegisterForm />
    </AuthShell>
  );
}
