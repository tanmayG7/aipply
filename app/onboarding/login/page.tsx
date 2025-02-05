import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex w-full h-full">
      <div className="grid grid-cols-2 items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
