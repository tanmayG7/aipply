import Button from "@/components/common/button/button";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import TestimonialsCard from "@/components/card/testimonialsCard/testimonialsCard";
import React from "react";

const testimonialsData = [
  {
    name: "Sabya Sachi Mishra",
    designation: "Data Scientist",
    review:
      "Best decisions, 200+ application with a single click in a single day! WOW!",
    image: "/static/images/testimonialsabya.png",
  },
  {
    name: "Kunal Gupta",
    designation: "Sales Manager, InfoEdge",
    review:
      "Really helps automate the daily task of job search on multiple platforms.",
    image: "/static/images/testimonialkunal.png",
  },
  {
    name: "Kartikeya Madnani",
    designation: "Sales Development Representative, CultureX",
    review: "Have been a boon for me, found my next job within 2 weeks!",
    image: "/static/images/testimonialkartikeya.png",
  },
];

const TestimonialSection = () => {
  return (
    <div className="bg-[#0D0D0D] py-[37px]">
      <ResponsivePageContainer>
        <div className="grid grid-cols-1 gap-16">
          <div className="flex flex-col gap-4 w-full custom-md:w-[695px] m-auto">
            <div className="flex justify-center">
              <Button text="Testimonials" />
            </div>
            <div className="flex flex-col items-center gap-4">
              <h1 className="font-manrope font-semibold text-[36px] leading-[44px] text-[#F5F5F6]">
                Hear from our Happy Customers!
              </h1>
              <p className="font-manrope font-normal text-[20px] leading-[30px] text-[#CECFD2]">
                Helping people find their best fit, one job application at a
                time!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 custom-md:grid-cols-2 custom-lg:grid-cols-3 gap-10 pb-[27px]">
            {testimonialsData.map((testimonial, index) => (
              <TestimonialsCard
                key={index}
                name={testimonial.name}
                designation={testimonial.designation}
                review={testimonial.review}
                image={testimonial.image}
              />
            ))}
          </div>
        </div>
      </ResponsivePageContainer>
    </div>
  );
};

export default TestimonialSection;
