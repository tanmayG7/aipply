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
import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  authenticateUser, 
  checkEmailSignInMethods,
  setupPasswordForGoogleAccount,
  auth,
  provider,
  firestore
} from "@/lib/firebaseConfig/firebaseConfig";
import { 
  signInWithPopup, 
  EmailAuthProvider, 
  linkWithCredential 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [isGoogleOnlyAccount, setIsGoogleOnlyAccount] = useState(false);
  const [passwordSetupLoading, setPasswordSetupLoading] = useState(false);
  const [emailMethods, setEmailMethods] = useState<{
    hasPassword: boolean;
    hasGoogle: boolean;
    exists: boolean;
  }>({ hasPassword: false, hasGoogle: false, exists: false });

  // Watch for error changes to detect GOOGLE_ONLY_ACCOUNT
  useEffect(() => {
    if (errorText && errorText.includes("Google")) {
      setIsGoogleOnlyAccount(true);
    } else {
      setIsGoogleOnlyAccount(false);
    }
  }, [errorText]);

  const handleEmailBlur = async () => {
    if (email && email.includes('@')) {
      try {
        console.log("🔍 Checking email methods for:", email);
        const methods = await checkEmailSignInMethods(email);
        console.log("📧 Email methods detected:", methods);
        setEmailMethods(methods);
        
        // Reset password setup form when email changes
        setShowPasswordSetup(false);
        setError("");
      } catch (error: any) {
        console.error("Error checking email methods:", error);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGoogleOnlyAccount(false);
    onLogin(email, password);
  };

  const handlePasswordSetup = async () => {
    if (!password || password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    setPasswordSetupLoading(true);
    setError("");

    try {
      console.log("🔐 Starting password setup for Google account");
      
      // First, sign in with Google to establish the user session
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      console.log("✅ Google sign-in successful, linking password...");
      
      // Now link the email/password credential to the existing Google account
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);
      
      console.log("✅ Password linked successfully!");
      
      // Store the token
      const token = await user.getIdToken();
      localStorage.setItem("firebaseToken", token);
      
      setError("");
      setShowPasswordSetup(false);
      
      // Check if user has completed profile
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        router.push("/dashboard/home");
      } else {
        router.push("/dashboard/onboarding/profile-setup");
      }
      
    } catch (error: any) {
      console.error("❌ Password setup failed:", error);
      if (error.code === "auth/credential-already-in-use") {
        setError("This password is already associated with another account.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled. Please try again.");
      } else {
        setError(error.message);
      }
    } finally {
      setPasswordSetupLoading(false);
    }
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Reset email methods when email changes
                      setEmailMethods({ hasPassword: false, hasGoogle: false, exists: false });
                      setShowPasswordSetup(false);
                    }}
                    onBlur={handleEmailBlur}
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

                {/* Authentication method guidance */}
                {(emailMethods.exists || isGoogleOnlyAccount) && (
                  <div className="text-sm text-[#94969C] bg-[#1a1a2e] p-3 rounded-md">
                    {emailMethods.hasGoogle && emailMethods.hasPassword ? (
                      <p>✅ You can sign in with either email/password or Google</p>
                    ) : (emailMethods.hasGoogle && !emailMethods.hasPassword) || isGoogleOnlyAccount ? (
                      <div className="space-y-3">
                        <p>🔍 This email is registered with Google only</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-white border-blue-500 hover:bg-blue-500/10"
                            onClick={() => setShowPasswordSetup(true)}
                          >
                            Set up a password
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="text-black"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                          >
                            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path
                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                fill="currentColor"
                              />
                            </svg>
                            Sign in with Google
                          </Button>
                        </div>
                      </div>
                    ) : emailMethods.hasPassword && !emailMethods.hasGoogle ? (
                      <p>🔑 This email uses password authentication</p>
                    ) : null}
                  </div>
                )}

                {/* Password setup form for Google-only accounts - OUTSIDE main form to avoid nesting */}
                {showPasswordSetup && (
                  <div className="bg-[#2a2a3e] p-4 rounded-md border border-[#333741]">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-white font-semibold">Set up password for your account</h3>
                      <p className="text-sm text-[#94969C]">
                        You'll be able to sign in with either Google or email/password after this.
                      </p>
                      <div className="grid gap-2">
                        <Label htmlFor="setupPassword" className="text-[#CECFD2]">
                          New Password
                        </Label>
                        <Input
                          id="setupPassword"
                          type="password"
                          placeholder="Enter your new password (min 6 characters)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handlePasswordSetup}
                          size="sm"
                          disabled={passwordSetupLoading || !password || password.length < 6}
                        >
                          {passwordSetupLoading ? "Setting up..." : "Set up password"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setShowPasswordSetup(false);
                            setPassword("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-row justify-between">
                  <a
                    href="#"
                    className="ml-auto text-text-sm-medium font-inter text-[#CECFD2] underline-offset-4"
                  >
                    Forgot password?
                  </a>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                {!showPasswordSetup && (
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                )}
              </div>
            </div>
          </form>
          {/* Only show the general Google sign-in button when NOT showing Google-only account options */}
          {!isGoogleOnlyAccount && !(emailMethods.hasGoogle && !emailMethods.hasPassword) && (
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
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </div>
            </div>
          )}
          
          {/* Show alternative text when Google-only account is detected */}
          {(isGoogleOnlyAccount || (emailMethods.hasGoogle && !emailMethods.hasPassword)) && (
            <div className="text-center mt-8">
              <CardDescription>
                Choose your preferred sign-in method above
              </CardDescription>
            </div>
          )}
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
