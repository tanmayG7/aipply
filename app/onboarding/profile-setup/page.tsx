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
    <div className="h-screen flex items-center justify-center bg-[#050513]">
      <div className="flex flex-col w-[30%]">
        <Card className="text-white">
          <CardHeader className="text-center items-center ">
            <Image
              src={"/static/icons/aipplyLogo.svg"}
              alt="Aipply Logo"
              width={142}
              height={48}
            />
            <CardTitle className="text-display-sm-semibold font-inter">
              Hello Gwen, Create your profile
            </CardTitle>
            <div className="text-text-md-regular font-inter text-[#94969C]">
              Apply privately to thousands of tech companies and start-ups with
              one profile.
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {page === 1 && (
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-6">
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
                      placeholder="Enter your LinkedIn Profile URL"
                      value={formData.linkedinProfile}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                {page > 1 && (
                  <Button type="button" onClick={handleBack}>
                    Back
                  </Button>
                )}
                {page < 6 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
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
