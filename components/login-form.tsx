/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { authenticateUser } from "@/lib/firebaseConfig/firebaseConfig";
import { useRouter } from "next/navigation";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  onLogin: (email: string, password: string) => void;
  loading: boolean;
  errorText: string;
}

export function LoginForm({
  className,
  onLogin,
  loading,
  errorText,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState(errorText);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const handleGoogleLogin = async () => {
    try {
      await authenticateUser(
        "",
        "",
        (path: string) => {
          router.push(path);
        },
        true,
        setError
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card className="text-white">
        <CardHeader className="flex flex-col gap-6 text-center items-center ">
          <Image
            src={"/static/icons/aipplyLogo.svg"}
            alt="Aipply Logo"
            width={142}
            height={48}
          />
          <div className="flex flex-col gap-3">
            <CardTitle className="text-display-sm-semibold font-inter">
              Welcome
            </CardTitle>
            <p className="text-[#94969C] font-inter text-text-md-regular">
              Find your next opportunity!
            </p>
          </div>
        </CardHeader>
        <CardContent className="max-w-[720px] mt-4">
          <form onSubmit={handleLogin} className="flex flex-col gap-8">
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="text-text-sm-medium font-inter text-[#CECFD2]"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                    className="text-text-sm-medium font-inter text-[#CECFD2]"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-row justify-between">
                  <a
                    href="#"
                    className="ml-auto text-text-sm-medium font-inter text-[#CECFD2] underline-offset-4"
                  >
                    Forgot password?
                  </a>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </div>
          </form>
          <div className="flex flex-col gap-4">
            <CardDescription className="text-center mt-8">
              Sign in with your Google account
            </CardDescription>
            <div className="flex flex-col gap-4">
              <Button
                variant="secondary"
                className="w-full text-black"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Sign in with Google
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="font-inter text-center text-text-md-regular text-muted-foreground text-[#94969C]">
        By <Link href="/dashboard/onboarding/profile-setup" className="text-white hover:underline">Signing Up</Link>, you agree to{" "}
        <a href="#" className="font-bold">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="font-bold">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
