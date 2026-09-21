import Link from "next/link";
import Logo from "@/components/Logo";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <RegisterForm />
    </div>
  );
}
