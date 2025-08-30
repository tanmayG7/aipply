// components/completeProfile/PlatformCredentials.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/Icon";
import {
  auth,
  savePlatformCredentials,
  getPlatformCredentials,
  encryptCredentialsForStorage,
} from "@/lib/firebaseConfig/firebaseConfig";
import { UserDetails, PlatformCredentialsData } from "@/lib/types";

interface PlatformCredentialsProps {
  isEditing: boolean;
  userDetails: UserDetails;
  onRefresh?: () => Promise<void>;
  onExitEditMode?: () => void;
}

interface ValidationStatus {
  [key: string]: {
    isValid: boolean | null;
    message: string;
    isValidating: boolean;
  };
}

const PlatformCredentials: React.FC<PlatformCredentialsProps> = ({
  isEditing,
  userDetails,
  onRefresh,
  onExitEditMode,
}) => {
  const [showPasswords, setShowPasswords] = useState({
    foundit: false,
    hirist: false,
    shine: false,
    timesjob: false,
  });

  const [credentials, setCredentials] = useState<PlatformCredentialsData>({});
  const [saveStatus, setSaveStatus] = useState<
    | "idle"
    | "validating"
    | "saving"
    | "saved"
    | "validation-error"
    | "save-error"
  >("idle");
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(
    {}
  );
  const [isValidatingAll, setIsValidatingAll] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState<
    "checking" | "encrypted" | "not-encrypted" | "error"
  >("checking");

  const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Load existing credentials with encryption support
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        if (userDetails.userId) {
          setEncryptionStatus("checking");

          // Use the new getPlatformCredentials function which handles decryption
          const platformCreds = await getPlatformCredentials(
            userDetails.userId
          );

          if (platformCreds && Object.keys(platformCreds).length > 0) {
            // Convert to the format expected by your component
            const formattedCredentials: PlatformCredentialsData = {};

            Object.entries(platformCreds).forEach(([platform, creds]) => {
              const currentTime = new Date().toISOString();
              formattedCredentials[platform as keyof PlatformCredentialsData] =
                {
                  email: creds.email || "",
                  password: creds.password || "",
                  isActive: true,
                  createdAt: currentTime,
                  updatedAt: currentTime,
                };
            });

            setCredentials(formattedCredentials);
            setEncryptionStatus("encrypted");
          } else {
            // If no credentials found, initialize empty
            setCredentials({});
            setEncryptionStatus("not-encrypted");
          }
        }
      } catch (error) {
        console.error("Error loading credentials:", error);
        setEncryptionStatus("error");
        // Fallback to userDetails if decryption fails
        if (userDetails.platformCredentials) {
          setCredentials(userDetails.platformCredentials);
        }
      }
    };

    loadCredentials();
  }, [userDetails.userId, userDetails.platformCredentials]);

  const platforms = [
    {
      id: "foundit" as keyof PlatformCredentialsData,
      name: "Foundit",
      color: "bg-red-600",
      iconName: "newspaper" as const,
      description:
        "India's leading job portal with millions of job opportunities",
    },
    {
      id: "hirist" as keyof PlatformCredentialsData,
      name: "Hirist",
      color: "bg-purple-600",
      iconName: "briefcase" as const,
      description: "Premier platform for tech professionals and startups",
    },
    {
      id: "shine" as keyof PlatformCredentialsData,
      name: "Shine",
      color: "bg-blue-600",
      iconName: "star" as const,
      description:
        "Career acceleration platform with personalized job recommendations",
    },
    {
      id: "timesjob" as keyof PlatformCredentialsData,
      name: "Timesjob",
      color: "bg-green-600",
      iconName: "zap" as const,
      description: "Comprehensive job search platform by Times Group",
    },
  ];

  const togglePasswordVisibility = (
    platform: keyof PlatformCredentialsData
  ) => {
    setShowPasswords((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleCredentialChange = (
    platform: keyof PlatformCredentialsData,
    field: "email" | "password",
    value: string
  ) => {
    const currentTime = new Date().toISOString();
    setCredentials((prev) => ({
      ...prev,
      [platform]: {
        email: prev[platform]?.email || "",
        password: prev[platform]?.password || "",
        isActive: prev[platform]?.isActive ?? true,
        createdAt: prev[platform]?.createdAt || currentTime,
        updatedAt: currentTime,
        ...prev[platform],
        [field]: value,
      },
    }));

    // Reset validation status when credentials change
    setValidationStatus((prev) => ({
      ...prev,
      [platform]: {
        isValid: null,
        message: "",
        isValidating: false,
      },
    }));
  };

  const validateSinglePlatform = async (
    platform: keyof PlatformCredentialsData
  ) => {
    const platformCreds = credentials[platform];
    if (!platformCreds?.email || !platformCreds?.password) {
      return;
    }

    setValidationStatus((prev) => ({
      ...prev,
      [platform]: {
        isValid: null,
        message: "Validating...",
        isValidating: true,
      },
    }));

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // 🔐 Encrypt before sending
      const encryptedPayload = encryptCredentialsForStorage(user.uid, {
        [platform]: {
          email: platformCreds.email,
          password: platformCreds.password,
        },
      });
      const response = await fetch(
        `${API_URL}/api/validate-credentials/single`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform,
            credentials: encryptedPayload[platform],
          }),
        }
      );

      const result = await response.json();

      setValidationStatus((prev) => ({
        ...prev,
        [platform]: {
          isValid: result.isValid,
          message: result.message,
          isValidating: false,
        },
      }));
    } catch (error) {
      setValidationStatus((prev) => ({
        ...prev,
        [platform]: {
          isValid: false,
          message: "Validation failed. Please try again.",
          isValidating: false,
        },
      }));
    }
  };

  const validateAllCredentials = async (): Promise<boolean> => {
    const credentialsToValidate = Object.entries(credentials).reduce(
      (acc, [platform, creds]) => {
        if (creds?.email && creds?.password) {
          acc[platform] = {
            email: creds.email,
            password: creds.password,
          };
        }
        return acc;
      },
      {} as Record<string, { email: string; password: string }>
    );

    if (Object.keys(credentialsToValidate).length === 0) {
      return true;
    }

    setIsValidatingAll(true);

    // set all validating states...
    setValidationStatus((prev) => {
      const newStatus = { ...prev };
      Object.keys(credentialsToValidate).forEach((platform) => {
        newStatus[platform] = {
          isValid: null,
          message: "Validating...",
          isValidating: true,
        };
      });
      return newStatus;
    });

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // 🔐 Encrypt before sending
      const encryptedPayload = encryptCredentialsForStorage(
        user.uid,
        credentialsToValidate
      );

      const response = await fetch(`${API_URL}/api/validate-credentials/all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credentials: encryptedPayload,
        }),
      });

      const results = await response.json();

      let allValid = true;
      setValidationStatus((prev) => {
        const newStatus = { ...prev };
        Object.entries(results).forEach(([platform, result]: [string, any]) => {
          newStatus[platform] = {
            isValid: result.isValid,
            message: result.message,
            isValidating: false,
          };
          if (!result.isValid) {
            allValid = false;
          }
        });
        return newStatus;
      });

      return allValid;
    } catch (error) {
      setValidationStatus((prev) => {
        const newStatus = { ...prev };
        Object.keys(credentialsToValidate).forEach((platform) => {
          newStatus[platform] = {
            isValid: false,
            message: "Validation failed. Please try again.",
            isValidating: false,
          };
        });
        return newStatus;
      });
      return false;
    } finally {
      setIsValidatingAll(false);
    }
  };

  const handleSave = async () => {
    // Check if there are credentials to validate
    const hasCredentialsToSave = Object.values(credentials).some(
      (cred) => cred?.email && cred?.password
    );

    if (!hasCredentialsToSave) {
      // If no credentials to save, just exit
      if (onExitEditMode) {
        onExitEditMode();
      }
      return;
    }

    // Step 1: Validate all credentials first
    setSaveStatus("validating");

    const allCredentialsValid = await validateAllCredentials();

    if (!allCredentialsValid) {
      setSaveStatus("validation-error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return;
    }

    // Step 2: If validation passes, proceed with saving
    setSaveStatus("saving");

    try {
      const user = auth.currentUser;
      if (user) {
        // Convert credentials to the format expected by savePlatformCredentials
        const credentialsToSave = Object.entries(credentials).reduce(
          (acc, [platform, creds]) => {
            if (creds?.email && creds?.password) {
              acc[platform] = {
                email: creds.email,
                password: creds.password,
              };
            }
            return acc;
          },
          {} as Record<string, { email: string; password: string }>
        );

        // Use the new savePlatformCredentials function which handles encryption
        await savePlatformCredentials(user.uid, credentialsToSave);

        // Refresh user details in parent component
        if (onRefresh) {
          await onRefresh();
        }

        setSaveStatus("saved");
        setEncryptionStatus("encrypted");
        setTimeout(() => {
          setSaveStatus("idle");
          if (onExitEditMode) {
            onExitEditMode();
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving credentials:", error);
      setSaveStatus("save-error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const getValidationIcon = (platform: string) => {
    const status = validationStatus[platform];
    if (!status) return null;

    if (status.isValidating) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }

    if (status.isValid === true) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }

    if (status.isValid === false) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }

    return null;
  };

  const getValidationMessage = (platform: string) => {
    const status = validationStatus[platform];
    if (!status || !status.message) return null;

    const textColor =
      status.isValid === true
        ? "text-green-500"
        : status.isValid === false
        ? "text-red-500"
        : "text-blue-500";

    return <p className={`text-sm mt-2 ${textColor}`}>{status.message}</p>;
  };

  const getEncryptionStatusIcon = () => {
    switch (encryptionStatus) {
      case "checking":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "encrypted":
        return <Lock className="w-4 h-4 text-green-500" />;
      case "not-encrypted":
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getEncryptionStatusMessage = () => {
    switch (encryptionStatus) {
      case "checking":
        return "Checking encryption status...";
      case "encrypted":
        return "Your credentials are encrypted and secure";
      case "not-encrypted":
        return "Credentials will be encrypted when saved";
      case "error":
        return "Error checking encryption status";
      default:
        return "";
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case "validating":
        return "Validating Credentials...";
      case "saving":
        return "Encrypting & Saving...";
      case "saved":
        return "Saved & Encrypted!";
      case "validation-error":
        return "Invalid Credentials - Fix Errors";
      case "save-error":
        return "Save Failed - Try Again";
      default:
        return "Save & Encrypt Credentials";
    }
  };

  const getSaveButtonClass = () => {
    switch (saveStatus) {
      case "validation-error":
        return "bg-red-600 border-red-600";
      case "save-error":
        return "bg-red-600 border-red-600";
      case "saved":
        return "bg-green-600 border-green-600";
      default:
        return "bg-transparent border border-gray";
    }
  };

  const getSaveButtonIcon = () => {
    switch (saveStatus) {
      case "validating":
        return <Loader2 className="w-4 h-4 mr-2 animate-spin" />;
      case "saving":
        return <Loader2 className="w-4 h-4 mr-2 animate-spin" />;
      case "saved":
        return <CheckCircle2 className="w-4 h-4 mr-2" />;
      case "validation-error":
        return <AlertCircle className="w-4 h-4 mr-2" />;
      case "save-error":
        return <AlertCircle className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="py-6 border border-gray rounded-xl">
      <Card className="grid grid-cols-7 gap-[52px] max-w-[100%] py-6 border-b border-gray rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Platform Credentials
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Store your job portal login credentials with bank-level encryption.
          </CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
          {/* Security Note with Encryption Status */}
          <div className="border border-[#371b7e] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-500">
                  Security & Encryption
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getEncryptionStatusIcon()}
                <span className="text-xs text-slate-400">
                  {getEncryptionStatusMessage()}
                </span>
              </div>
            </div>
            <p className="text-sm mt-1 text-slate-400 opacity-70">
              Your credentials are encrypted with AES-256 encryption before
              being stored. Each password is uniquely salted for maximum
              security.
            </p>
          </div>

          {/* Validation Status Banner */}
          {saveStatus === "validating" && (
            <div className="border border-blue-500 bg-blue-500/10 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm font-medium text-blue-500">
                  Validating Credentials
                </span>
              </div>
              <p className="text-sm mt-1 text-blue-400">
                Please wait while we verify your login credentials...
              </p>
            </div>
          )}

          {saveStatus === "validation-error" && (
            <div className="border border-red-500 bg-red-500/10 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-500">
                  Validation Failed
                </span>
              </div>
              <p className="text-sm mt-1 text-red-400">
                Please correct the invalid credentials before saving.
              </p>
            </div>
          )}

          {/* Platform Cards */}
          <div className="grid gap-6">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="border border-[#371b7e] rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}
                    >
                      <Icon
                        name={platform.iconName}
                        size={20}
                        ariaLabel={platform.name}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {platform.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getValidationIcon(platform.id)}
                    {isEditing &&
                      credentials[platform.id]?.email &&
                      credentials[platform.id]?.password && (
                        <Button
                          onClick={() => validateSinglePlatform(platform.id)}
                          disabled={
                            validationStatus[platform.id]?.isValidating ||
                            saveStatus === "validating"
                          }
                          size="sm"
                          variant="outline"
                          className="text-white border-gray"
                        >
                          {validationStatus[platform.id]?.isValidating
                            ? "Validating..."
                            : "Validate"}
                        </Button>
                      )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Email/Username Field */}
                      <div>
                        <Label className="block text-sm font-medium text-slate-500 mb-2">
                          Email/Username
                        </Label>
                        <Input
                          type="email"
                          value={credentials[platform.id]?.email || ""}
                          onChange={(e) =>
                            handleCredentialChange(
                              platform.id,
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="Enter your email or username"
                          required
                          className="text-white"
                          disabled={saveStatus === "validating"}
                        />
                      </div>

                      {/* Password Field */}
                      <div>
                        <Label className="flex items-center text-sm font-medium text-slate-500 mb-2">
                          Password
                          <Lock
                            className="w-3 h-3 ml-1 text-green-500"
                          />
                        </Label>
                        <div className="relative">
                          <Input
                            type={
                              showPasswords[platform.id] ? "text" : "password"
                            }
                            value={credentials[platform.id]?.password || ""}
                            onChange={(e) =>
                              handleCredentialChange(
                                platform.id,
                                "password",
                                e.target.value
                              )
                            }
                            placeholder="Enter your password"
                            required
                            className="text-white pr-10"
                            disabled={saveStatus === "validating"}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              togglePasswordVisibility(platform.id)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            disabled={saveStatus === "validating"}
                          >
                            {showPasswords[platform.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Validation Message */}
                    {getValidationMessage(platform.id)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {credentials[platform.id]?.email ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white opacity-70 flex items-center">
                              <span className="font-medium">Email:</span>
                              <span className="ml-2">
                                {credentials[platform.id]?.email}
                              </span>
                            </p>
                            <p className="text-white opacity-70 flex items-center">
                              <span className="font-medium">Password:</span>
                              <span className="ml-2">{"•".repeat(8)}</span>
                              <Lock
                                className="w-3 h-3 ml-2 text-green-500"
                              />
                            </p>
                          </div>
                          {validationStatus[platform.id]?.isValid !== null &&
                            getValidationIcon(platform.id)}
                        </div>
                        {getValidationMessage(platform.id)}
                      </>
                    ) : (
                      <p className="text-slate-500 italic opacity-70">
                        No credentials saved
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSave}
                disabled={
                  saveStatus === "validating" || saveStatus === "saving"
                }
                className={`w-fit px-8 text-white transition-colors ${getSaveButtonClass()}`}
              >
                {getSaveButtonIcon()}
                {getSaveButtonText()}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformCredentials;