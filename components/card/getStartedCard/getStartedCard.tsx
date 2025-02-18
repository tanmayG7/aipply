import React, { useEffect, useState } from "react";
import { firestore, auth } from "@/lib/firebaseConfig/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

const GetStartedCard = () => {
  const [checkedFields, setCheckedFields] = useState({
    profile: false,
    cv: false,
    coverLetter: false,
    firstJob: false,
    community: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCheckedFields({
            profile:
              !!userData.education &&
              !!userData.workExperience &&
              !!userData.skills &&
              !!userData.achievements,
            cv: !!userData.cv,
            coverLetter: !!userData.coverLetter,
            firstJob: !!userData.firstJob,
            community: !!userData.community,
          });
        }
      }
    };

    fetchUserData();
  }, []);

  type Field = "profile" | "cv" | "coverLetter" | "firstJob" | "community";

  const handleCheckboxChange = (field: Field) => {
    setCheckedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const calculateProgress = () => {
    const totalFields = Object.keys(checkedFields).length;
    const checkedCount = Object.values(checkedFields).filter(Boolean).length;
    return (checkedCount / totalFields) * 100;
  };

  return (
    <div className="flex flex-col gap-6 border-[1px] bg-[#0C111D] border-[#1F242F] px-6 py-6 rounded-xl">
      <div className="flex flex-col gap-4">
        <h2 className="text-text-sm-bold font-inter text-white">
          Getting Started
        </h2>
        <p className="text-text-md-regular font-inter text-white">
          Congratulations! You’ve set up your account.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative w-[full] h-[16px] bg-[#e0e0e0] rounded-full">
          <div
            className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
          {/* <p className="absolute right-4">{calculateProgress()}%</p> */}
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex flex-row gap-4 items-center">
              <Checkbox
                checked={checkedFields.profile}
                onCheckedChange={() => handleCheckboxChange("profile")}
              />
              <Link
                href="/complete-profile"
                className="hover:text-green-600"
              >
                Update your profile
              </Link>
            </div>
            <Image
              src={"/static/icons/arrow-right.svg"}
              width={20}
              height={20}
              alt="arrow"
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex flex-row gap-4 items-center">
              <Checkbox
                checked={checkedFields.cv}
                onCheckedChange={() => handleCheckboxChange("cv")}
              />
              <Link
                href="/complete-profile"
                className="hover:text-green-600"
              >
                Upload an ATS Friendly CV
              </Link>
            </div>
            <Image
              src={"/static/icons/arrow-right.svg"}
              width={20}
              height={20}
              alt="arrow"
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex flex-row gap-4 items-center">
              <Checkbox
                checked={checkedFields.coverLetter}
                onCheckedChange={() => handleCheckboxChange("coverLetter")}
              />
              <Link
                href="/complete-profile"
                className="hover:text-green-600"
              >
                <p>Upload your cover letter</p>
              </Link>
            </div>
            <Image
              src={"/static/icons/arrow-right.svg"}
              width={20}
              height={20}
              alt="arrow"
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex flex-row gap-4 items-center">
              <Checkbox
                checked={checkedFields.firstJob}
                onCheckedChange={() => handleCheckboxChange("firstJob")}
              />
              <Link
                href="/job-board"
                className="hover:text-green-600"
              >
                Apply your first job
              </Link>
            </div>
            <Image
              src={"/static/icons/arrow-right.svg"}
              width={20}
              height={20}
              alt="arrow"
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex flex-row gap-4 items-center">
              <Checkbox
                checked={checkedFields.community}
                onCheckedChange={() => handleCheckboxChange("community")}
              />
              <Link
                href="https://chat.whatsapp.com/your-whatsapp-community-link"
                className="hover:text-green-600"
              >
                Join community
              </Link>
            </div>
            <Image
              src={"/static/icons/arrow-right.svg"}
              width={20}
              height={20}
              alt="arrow"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStartedCard;
