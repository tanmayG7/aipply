/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  checkEmailSignInMethods,
  linkEmailPasswordToAccount,
  linkGoogleToAccount,
  auth 
} from "@/lib/firebaseConfig/firebaseConfig";

interface AuthMethodsManagerProps {
  userEmail?: string;
}

export function AuthMethodsManager({ userEmail }: AuthMethodsManagerProps) {
  const [authMethods, setAuthMethods] = useState<{
    hasPassword: boolean;
    hasGoogle: boolean;
    methods: string[];
  }>({ hasPassword: false, hasGoogle: false, methods: [] });
  
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAuthMethods = useCallback(async () => {
    if (!userEmail) return;

    try {
      const methods = await checkEmailSignInMethods(userEmail);
      setAuthMethods(methods);
    } catch (error: any) {
      console.error("Error loading auth methods:", error);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      loadAuthMethods();
    }
  }, [userEmail, loadAuthMethods]);

  const handleLinkPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await linkEmailPasswordToAccount(userEmail!, password);
      setMessage("Password authentication linked successfully!");
      setShowPasswordSetup(false);
      setPassword("");
      setConfirmPassword("");
      await loadAuthMethods();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await linkGoogleToAccount();
      setMessage("Google account linked successfully!");
      await loadAuthMethods();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.currentUser) {
    return (
      <Card className="text-white">
        <CardContent className="p-6">
          <p className="text-center text-[#94969C]">Please sign in to manage authentication methods</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-white">
      <CardHeader>
        <CardTitle>Authentication Methods</CardTitle>
        <p className="text-sm text-[#94969C]">
          Manage how you sign in to your account. You can use multiple methods for the same email.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Methods */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Current Sign-in Methods</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-medium">Email & Password</p>
                  <p className="text-sm text-[#94969C]">{userEmail}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                authMethods.hasPassword 
                  ? 'bg-green-900 text-green-200' 
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {authMethods.hasPassword ? 'Active' : 'Not Set Up'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="font-medium">Google Account</p>
                  <p className="text-sm text-[#94969C]">Sign in with Google</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                authMethods.hasGoogle 
                  ? 'bg-green-900 text-green-200' 
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {authMethods.hasGoogle ? 'Linked' : 'Not Linked'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="p-3 bg-green-900 text-green-200 rounded-md text-sm">
            {message}
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-900 text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Add Authentication Methods */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Add Authentication Methods</h3>
          
          {!authMethods.hasPassword && (
            <div className="mb-4">
              {!showPasswordSetup ? (
                <Button 
                  onClick={() => setShowPasswordSetup(true)}
                  variant="outline"
                  className="w-full"
                >
                  Set up Email & Password Authentication
                </Button>
              ) : (
                <div className="border border-[#333741] rounded-md p-4">
                  <form onSubmit={handleLinkPassword} className="space-y-4">
                    <h4 className="font-medium">Set up Password Authentication</h4>
                    <div className="grid gap-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={loading || !password || !confirmPassword}
                      >
                        {loading ? "Setting up..." : "Set up Password"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowPasswordSetup(false);
                          setPassword("");
                          setConfirmPassword("");
                          setError("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {!authMethods.hasGoogle && (
            <Button 
              onClick={handleLinkGoogle}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              {loading ? "Linking..." : "Link Google Account"}
            </Button>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-[#1a1a2e] p-4 rounded-md">
          <h4 className="font-medium mb-2">Benefits of Multiple Authentication Methods</h4>
          <ul className="text-sm text-[#94969C] space-y-1">
            <li>• Flexible sign-in options - use whatever is convenient</li>
            <li>• Account recovery - if one method fails, use another</li>
            <li>• Enhanced security with multiple verification options</li>
            <li>• Seamless experience across different devices</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}