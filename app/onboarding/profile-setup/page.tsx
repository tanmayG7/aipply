/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { auth } from "@/lib/firebaseConfig/firebaseConfig";

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

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFormData((prevData) => ({ ...prevData, email: user.email || "" }));
    }
  }, []);

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    mobileNumber: false,
    email: false,
    currentJobTitle: false,
    aimingJobTitle: false,
    currentCTC: false,
    expectedCTC: false,
    linkedinProfile: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validatePage = () => {
    const newErrors = { ...errors };
    if (page === 1) {
      newErrors.firstName = !formData.firstName;
      newErrors.lastName = !formData.lastName;
      newErrors.mobileNumber = !formData.mobileNumber;
      newErrors.email = !formData.email;
    } else if (page === 2) {
      newErrors.currentJobTitle = !formData.currentJobTitle;
    } else if (page === 3) {
      newErrors.aimingJobTitle = !formData.aimingJobTitle;
    } else if (page === 4) {
      newErrors.currentCTC = !formData.currentCTC;
    } else if (page === 5) {
      newErrors.expectedCTC = !formData.expectedCTC;
    } else if (page === 6) {
      newErrors.linkedinProfile = !formData.linkedinProfile;
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleNext = () => {
    if (validatePage()) {
      setPage((prev) => prev + 1);
    }
  };
  const handleBack = () => setPage((prev) => prev - 1);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePage()) {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          await saveUserProfile(user.uid, formData);
          router.push("/home");
        }
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    }
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
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && (
                        <p className="text-red-500">First Name is required</p>
                      )}
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
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && (
                        <p className="text-red-500">Last Name is required</p>
                      )}
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
                      className={errors.mobileNumber ? "border-red-500" : ""}
                    />
                    {errors.mobileNumber && (
                      <p className="text-red-500">Mobile Number is required</p>
                    )}
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
                      readOnly
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500">Email is required</p>
                    )}
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
                      className={errors.currentJobTitle ? "border-red-500" : ""}
                    />
                    {errors.currentJobTitle && (
                      <p className="text-red-500">
                        Current Job Title is required
                      </p>
                    )}
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
                    <select
                      id="aimingJobTitle"
                      name="aimingJobTitle"
                      value={formData.aimingJobTitle}
                      onChange={handleChange}
                      required
                      className={`p-3 text-text-sm-regular font-inter text-[#94969C] bg-gray ${
                        errors.aimingJobTitle ? "border-red-500" : ""
                      }`}
                    >
                      <option value="" disabled>
                        Select your aiming job title
                      </option>
                      <option value="Content Writing">Content Writing</option>
                      <option value="Data Analyst">Data Analyst</option>
                      <option value="Data Engineer">Data Engineer</option>
                      <option value="Digital Marketing">
                        Digital Marketing
                      </option>
                      <option value="Information Technology">
                        Information Technology
                      </option>
                      <option value="Operations">Operations</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Software Developer">
                        Software Developer
                      </option>
                    </select>
                    {errors.aimingJobTitle && (
                      <p className="text-red-500">
                        Aiming Job Title is required
                      </p>
                    )}
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
                      className={errors.currentCTC ? "border-red-500" : ""}
                    />
                    {errors.currentCTC && (
                      <p className="text-red-500">Current CTC is required</p>
                    )}
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
                      className={errors.expectedCTC ? "border-red-500" : ""}
                    />
                    {errors.expectedCTC && (
                      <p className="text-red-500">Expected CTC is required</p>
                    )}
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
                      className={errors.linkedinProfile ? "border-red-500" : ""}
                    />
                    {errors.linkedinProfile && (
                      <p className="text-red-500">
                        LinkedIn Profile is required
                      </p>
                    )}
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
                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
