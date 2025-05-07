"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ResponsivePageContainer } from "../responsivePageContainer/responsivePageContainer";

const faqs = [
  {
    question: "What is AiPply, and how does it help job seekers?",
    answer:
      "AiPply is a smart job application tool that automates and streamlines the job search process. It helps job seekers apply faster, track applications, and optimize their resumes for better visibility.",
  },
  {
    question: "How does AiPply ensure my applications stand out?",
    answer:
      "AiPply is a smart job application tool that automates and streamlines the job search process. It helps job seekers apply faster, track applications, and optimize their resumes for better visibility.",
  },
  {
    question: "Can AiPply help me with networking and recruiter outreach?",
    answer:
      "AiPply is a smart job application tool that automates and streamlines the job search process. It helps job seekers apply faster, track applications, and optimize their resumes for better visibility.",
  },
  {
    question: "Does AiPply support applications across multiple job platforms?",
    answer:
      "AiPply is a smart job application tool that automates and streamlines the job search process. It helps job seekers apply faster, track applications, and optimize their resumes for better visibility.",
  },
  {
    question: "Is AiPply free to use?",
    answer:
      "AiPply is a smart job application tool that automates and streamlines the job search process. It helps job seekers apply faster, track applications, and optimize their resumes for better visibility.",
  },
];

const FrequentlyAskedQuestionSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div id="faq">
      <ResponsivePageContainer>
        <div className="grid grid-cols-1 gap-12 custom-lg:gap-16 w-full py-24">
          <h1 className="text-[36px] font-semibold leading-[44px] font-manrope text-[#F5F5F6] text-center">
            Frequently asked questions
          </h1>
          <div className="flex flex-col gap-8">
            {faqs.map((faqItem, index) => (
              <div key={index}>
                <div
                  className={`flex flex-col ${
                    activeIndex === index ? "bg-primary-25 " : ""
                  }`}
                >
                  <div
                    key={index}
                    className={`flex flex-row justify-between text-left items-start w-full gap-2 pt-6 ${
                      index !== 0 ? "border-t border-[#1F242F]" : ""
                    }`}
                    onClick={() => toggleFAQ(index)}
                  >
                    <h2
                      className="text-[18px] font-[500px] text-[#F5F5F6] cursor-pointer font-manrope"
                      onClick={() => toggleFAQ(index)}
                    >
                      {faqItem.question}
                    </h2>
                    <button
                      className="items-start w-6 h-6 flex-shrink-0"
                      onClick={() => toggleFAQ(index)}
                    >
                      {activeIndex === index ? (
                        <Image
                          src="/static/icons/faqMinusBtn.svg"
                          alt="Collapse"
                          width={24}
                          height={24}
                        />
                      ) : (
                        <Image
                          src="/static/icons/faqPlusBtn.svg"
                          alt="Expand"
                          width={24}
                          height={24}
                        />
                      )}
                    </button>
                  </div>
                  <div>
                    {activeIndex === index && (
                      <div className="text-[16px] font-normal font-manrope text-[#94969C] mt-2 text-start">
                        {faqItem.answer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ResponsivePageContainer>
    </div>
  );
};

export default FrequentlyAskedQuestionSection;
