"use client";
import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import TestimonialsCard from "@/components/testimonialsCard/testimonialsCard";
import { testimonials } from "@/lib/staticData";

export default function LoginPage() {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

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

  return (
    <div className="flex w-full h-full bg-[#020218]">
      <div className="grid grid-cols-2 items-center justify-center w-full">
        <div className="w-[60%] m-auto items-center justify-center">
          <LoginForm />
        </div>
        <div>
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
