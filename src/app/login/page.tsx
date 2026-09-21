import { Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import AuthVisual from "@/components/AuthVisual";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <AuthVisual className="opacity-60" />
      <div className="relative z-10 flex flex-col items-center">
        <Link href="/" className="mb-8">
          <Logo />
        </Link>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
