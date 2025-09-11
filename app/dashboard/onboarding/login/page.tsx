/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "@/lib/firebaseConfig/firebaseConfig";
import { LoginForm } from "@/components/login-form";
import TestimonialsCard from "@/components/testimonialsCard/testimonialsCard";
import { testimonials } from "@/lib/staticData";
import Head from "next/head";

export default function LoginPage() {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLeftClick = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleRightClick = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentTestimonial = testimonials[currentTestimonialIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      handleRightClick();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentTestimonialIndex]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      await authenticateUser(
        email,
        password,
        (path: string) => {
          router.push(path);
        },
        false,
        setError
      );
    } catch (error: any) {
      if (error.message === "GOOGLE_ONLY_ACCOUNT") {
        setError("This email is registered with Google. Please use 'Sign in with Google' or set up a password below.");
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Aipply</title>
        <meta
          name="description"
          content="Login to your Aipply account to start applying for jobs."
        />
      </Head>
      <div className="flex w-full min-h-screen bg-[#020218] overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-center w-full px-4 sm:px-6 lg:px-8">
          <div className="lg:w-[60%] w-full max-w-md mx-auto items-center justify-center pt-14 lg:pt-0">
            <LoginForm
              onLogin={handleLogin}
              loading={loading}
              errorText={error}
            />
          </div>
          <div className="lg:flex hidden">
            <TestimonialsCard
              image={currentTestimonial.image}
              comment={currentTestimonial.comment}
              name={currentTestimonial.name}
              position={currentTestimonial.position}
              stars={currentTestimonial.stars}
              linkedinProfileUrl={currentTestimonial.linkedinProfileUrl}
              onLeftClick={handleLeftClick}
              onRightClick={handleRightClick}
            />
          </div>
        </div>
      </div>
    </>
  );
}
