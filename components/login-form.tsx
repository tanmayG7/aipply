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
import { sendPasswordResetEmail } from "firebase/auth";
import Image from "next/image";
import {
  authenticateUser,
  checkEmailSignInMethods,
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [emailMethods, setEmailMethods] = useState<{
    hasPassword: boolean;
    hasGoogle: boolean;
    exists: boolean;
  }>({ hasPassword: false, hasGoogle: false, exists: false });
  const [aiConsentChecked, setAiConsentChecked] = useState(true);
  const [showConsentError, setShowConsentError] = useState(false);

  // Watch for error changes to detect GOOGLE_ONLY_ACCOUNT and update local error state
  useEffect(() => {
    // Update local error state when parent error changes
    setError(errorText);

    if (errorText && errorText.includes("Google")) {
      setIsGoogleOnlyAccount(true);
    } else {
      setIsGoogleOnlyAccount(false);
    }
  }, [errorText]);

  // Check for email in URL params (from Offer Page)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      } else {
        // Fallback to localStorage if set by offer page but param lost (unlikely but safe)
        try {
          const storedData = localStorage.getItem("aipply_promo_data");
          if (storedData) {
            const parsed = JSON.parse(storedData);
            if (parsed.email) setEmail(parsed.email);
          }
        } catch (e) {
          console.error("Error reading promo data:", e);
        }
      }
    }
  }, []);

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

    // Check if user has consented to AI data usage
    if (!aiConsentChecked) {
      setShowConsentError(true);
      setError("Please consent to AI data usage to continue");
      return;
    }

    setShowConsentError(false);
    setIsGoogleOnlyAccount(false);

    // Store AI consent in localStorage for new user creation
    localStorage.setItem('aipply_ai_consent', JSON.stringify({
      consent: aiConsentChecked,
      timestamp: Date.now()
    }));

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
      const userCredential = await signInWithPopup(auth!, provider);
      const user = userCredential.user;

      console.log("✅ Google sign-in successful, linking password...");

      // Now link the email/password credential to the existing Google account
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);

      console.log("✅ Password linked successfully!");

      // Store the account linking information for future reference
      const linkingData = JSON.parse(localStorage.getItem('aipply_account_linking') || '{}');
      linkingData[email] = { hasPassword: true, timestamp: Date.now() };
      localStorage.setItem('aipply_account_linking', JSON.stringify(linkingData));
      console.log("💾 Saved account linking data for", email);

      // Store the token
      const token = await user.getIdToken();
      localStorage.setItem("firebaseToken", token);

      setError("");
      setShowPasswordSetup(false);

      // Check if user has completed profile
      const userDoc = await getDoc(doc(firestore!, "users", user.uid));
      if (userDoc.exists()) {
        router.push("/dashboard/home");
      } else {
        router.push("/dashboard/onboarding/profile-setup");
      }

    } catch (error: any) {
      console.error("❌ Password setup failed:", error);
      if (error.code === "auth/credential-already-in-use") {
        setError("This password is already associated with another account. Please try a different password.");
      } else if (error.code === "auth/provider-already-linked") {
        setError("This account already has password authentication set up. Please try signing in with your password instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled. Please try again.");
      } else if (error.code === "auth/email-already-in-use") {
        setError("You selected a different Google account than expected. Please select the Google account for " + email + " or contact support.");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        setError("An account with this email already exists with different credentials. Please try signing in with your existing method.");
      } else {
        setError("Setup failed: " + error.message + ". Please try again or contact support.");
      }
    } finally {
      setPasswordSetupLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Check if user has consented to AI data usage
    if (!aiConsentChecked) {
      setShowConsentError(true);
      setError("Please consent to AI data usage to continue");
      return;
    }

    setShowConsentError(false);

    try {
      // Store AI consent in localStorage for new user creation
      localStorage.setItem('aipply_ai_consent', JSON.stringify({
        consent: aiConsentChecked,
        timestamp: Date.now()
      }));

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

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    if (!email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    setForgotPasswordLoading(true);
    setError("");

    try {
      console.log("🔐 Sending password reset email to:", email);
      await sendPasswordResetEmail(auth!, email);
      console.log("✅ Password reset email sent successfully");

      setForgotPasswordSuccess(true);
      setError("");
      setShowForgotPassword(false);

    } catch (error: any) {
      console.error("❌ Password reset failed:", error);

      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address. Please check your email or create a new account.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many password reset attempts. Please try again later.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setForgotPasswordLoading(false);
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
                            className="bg-white text-black hover:bg-gray-100"
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
                        you&apos;ll be able to sign in with either Google or email/password after this.
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
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="ml-auto text-text-sm-medium font-inter text-[#CECFD2] underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Success message for forgot password */}
                {forgotPasswordSuccess && (
                  <div className="p-3 bg-green-900 text-green-200 rounded-md text-sm">
                    ✅ Password reset email sent! Please check your inbox and follow the instructions to reset your password.
                  </div>
                )}

                {/* Error messages */}
                {error && !showConsentError && <p className="text-red-500 text-sm">{error}</p>}

                {/* AI Data Consent Checkbox */}
                <div className={`p-4 rounded-md border ${showConsentError ? 'border-red-500 bg-red-500/10' : 'border-[#333741] bg-[#1a1a2e]'} transition-all duration-200`}>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="aiConsent"
                      checked={aiConsentChecked}
                      onChange={(e) => {
                        setAiConsentChecked(e.target.checked);
                        if (e.target.checked) {
                          setShowConsentError(false);
                          setError("");
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <Label
                      htmlFor="aiConsent"
                      className="text-text-sm-regular font-inter text-[#CECFD2] cursor-pointer"
                    >
                      I consent to my data being used by AI for improving services, personalized job recommendations, and automated application assistance
                    </Label>
                  </div>
                  {showConsentError && (
                    <div className="mt-3 flex items-start space-x-2 text-red-400">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-text-sm-regular font-inter">
                        You must consent to AI data usage to create an account or sign in. This helps us provide personalized job recommendations and automated application assistance.
                      </p>
                    </div>
                  )}
                </div>

                {/* Forgot Password Modal */}
                {showForgotPassword && (
                  <div className="bg-[#2a2a3e] p-4 rounded-md border border-[#333741]">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-white font-semibold">Reset your password</h3>
                      <p className="text-sm text-[#94969C]">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                      </p>
                      <div className="grid gap-2">
                        <Label htmlFor="resetEmail" className="text-[#CECFD2]">
                          Email Address
                        </Label>
                        <Input
                          id="resetEmail"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={forgotPasswordLoading}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleForgotPassword}
                          size="sm"
                          disabled={forgotPasswordLoading || !email}
                        >
                          {forgotPasswordLoading ? "Sending..." : "Send reset email"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setForgotPasswordSuccess(false);
                            setError("");
                          }}
                          disabled={forgotPasswordLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {!showPasswordSetup && !showForgotPassword && (
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In / Register"}
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
                  className="w-full bg-white text-black hover:bg-gray-100"
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
