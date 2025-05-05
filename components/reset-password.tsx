"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Image from "next/image";
import Link from "next/link";
// import { sendPasswordResetEmail } from "@/lib/firebaseConfig/firebaseConfig"; 

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState(""); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // await sendPasswordResetEmail(email); 
      setSuccess("Password reset email sent successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="absolute top-[80px] left-[80px]">
        <Link href="/">
          <Image
            src={"/static/icons/aipplyLogo.svg"}
            alt="Aipply Logo"
            width={142}
            height={48}
          />
        </Link>
      </div>
      <div className="flex justify-center items-center min-h-screen">
        <Card className="flex flex-col gap-8 text-white max-w-[408px]">
          <CardHeader className="flex flex-col gap-6 text-center items-center ">
            <div className="grid gap-3">
              <CardTitle className="text-[27px] custom-sm:text-display-sm-semibold font-inter">
                Reset your password
              </CardTitle>
              <p className="text-[#94969C] font-inter text-text-md-regular">
                Resetting your password will log you out of all existing
                sessions.
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-8">
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
                    placeholder="Enter your email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <div className="grid gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Reseting..." : "Reset Password"}
                  </Button>
                  <p className="text-text-sm-regular font-inter text-[#CECFD2] text-center">
                    Having trouble?{" "}
                    <span className="text-text-sm-semibold cursor-pointer">
                      Send us an email.
                    </span>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
