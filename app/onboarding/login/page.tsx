/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/firebaseConfig/firebaseConfig";
import { LoginForm } from "@/components/login-form";
import TestimonialsCard from "@/components/testimonialsCard/testimonialsCard";
import { testimonials } from "@/lib/staticData";

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

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      await loginUser(email, password, (path: string) => router.push(path));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full bg-[#020218]">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center w-full">
        <div className="md:w-[60%] w-fit m-auto items-center justify-center">
          <LoginForm onLogin={handleLogin} loading={loading} error={error} />
        </div>
        <div className="md:flex hidden">
          <TestimonialsCard
            image={currentTestimonial.image}
            comment={currentTestimonial.comment}
            name={currentTestimonial.name}
            position={currentTestimonial.position}
            stars={currentTestimonial.stars}
            onLeftClick={handleLeftClick}
            onRightClick={handleRightClick}
          />
        </div>
      </div>
    </div>
  );
}
