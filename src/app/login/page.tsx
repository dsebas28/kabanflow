import { Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
