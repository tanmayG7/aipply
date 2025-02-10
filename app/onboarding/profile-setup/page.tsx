"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function ProfileSetup() {
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    currentJobTitle: "",
    aimingJobTitle: "",
    currentCTC: "",
    expectedCTC: "",
    linkedinProfile: "",
  });
  const router = useRouter();

  const handleNext = () => setPage((prev) => prev + 1);
  const handleBack = () => setPage((prev) => prev - 1);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
    router.push("/next-step");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#020218]">
      <div className="flex flex-col gap-[60px]">
        <div className="flex gap-4 top-[80px] absolute left-1/2 transform -translate-x-1/2 items-center justify-center md:max-w-[520px] w-full">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`w-[10%] p-[2px] ${
                page - 1 > index ? "bg-[#5D29FF]" : "bg-white"
              }`}
            ></div>
          ))}
        </div>
        <Card className="text-white flex flex-col md:gap-[80px] gap-10">
          <CardHeader className="flex flex-col gap-10 text-center items-center md:min-w-[594px] w-full">
            <Image
              src={"/static/icons/aipplyLogo.svg"}
              alt="Aipply Logo"
              width={224}
              height={76}
            />
            <div className="grid grid-cols-1 gap-3">
              <CardTitle className="text-display-sm-semibold font-inter">
                Hello Gwen, Create your profile
              </CardTitle>
              <div className="text-text-md-regular font-inter text-[#94969C]">
                Apply privately to thousands of tech companies and start-ups
                with one profile.
              </div>
            </div>
          </CardHeader>
          <CardContent className="md:w-[80%] w-full m-auto">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {page === 1 && (
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 md:gap-6 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Enter your First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Enter your Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      type="text"
                      placeholder="Enter your Mobile Number"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}
              {page === 2 && (
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="currentJobTitle">Current Job Title</Label>
                    <Input
                      id="currentJobTitle"
                      name="currentJobTitle"
                      type="text"
                      placeholder="Enter your Current Job Title"
                      value={formData.currentJobTitle}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-text-sm-regular font-inter text-[#94969C]">
                      Ex: Marketing Manager, Software Engineer, Sales Associate.
                    </p>
                  </div>
                </div>
              )}
              {page === 3 && (
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="aimingJobTitle">Aiming Job Title</Label>
                    <Input
                      id="aimingJobTitle"
                      name="aimingJobTitle"
                      type="text"
                      placeholder="Enter the Job Title you are aiming for"
                      value={formData.aimingJobTitle}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-text-sm-regular font-inter text-[#94969C]">
                      Ex: Marketing Manager, Software Engineer, Sales Associate.
                    </p>
                  </div>
                </div>
              )}
              {page === 4 && (
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="currentCTC">Current CTC</Label>
                    <Input
                      id="currentCTC"
                      name="currentCTC"
                      type="text"
                      placeholder="Enter your Current CTC"
                      value={formData.currentCTC}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-text-sm-regular font-inter text-[#94969C]">
                      Ex: 10LPA, 20LPA, 30LPA.
                    </p>
                  </div>
                </div>
              )}
              {page === 5 && (
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="expectedCTC">Expected CTC</Label>
                    <Input
                      id="expectedCTC"
                      name="expectedCTC"
                      type="text"
                      placeholder="Enter your Expected CTC"
                      value={formData.expectedCTC}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-text-sm-regular font-inter text-[#94969C]">
                      Ex: 10LPA, 20LPA, 30LPA.
                    </p>
                  </div>
                </div>
              )}
              {page === 6 && (
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                    <Input
                      id="linkedinProfile"
                      name="linkedinProfile"
                      type="text"
                      placeholder="https://"
                      value={formData.linkedinProfile}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between gap-16">
                {page > 1 && (
                  <Button type="button" onClick={handleBack}>
                    <Image
                      src="/static/icons/arrow-left.svg"
                      alt="Back"
                      width={24}
                      height={24}
                    />
                    Back
                  </Button>
                )}
                {page < 6 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <Image
                      src="/static/icons/arrow-right.svg"
                      alt="Back"
                      width={24}
                      height={24}
                    />
                  </Button>
                ) : (
                  <Button type="submit">Submit</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
