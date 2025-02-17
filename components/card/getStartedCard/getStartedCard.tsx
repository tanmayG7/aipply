import React, { useEffect, useState } from "react";
import { firestore, auth } from "@/lib/firebaseConfig/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

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

  return (
    <div className="flex flex-col gap-6 border-[1px] bg-[#0C111D] border-[#1F242F] px-6 py-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-text-sm-bold font-inter text-white">
          Getting Started
        </h2>
        <p className="text-text-md-regular font-inter text-white">
          Congratulations! You’ve set up your account.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-row h-[16px] gap-1">
          {Object.keys(checkedFields).map((field, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                backgroundColor: checkedFields[field as Field]
                  ? "green"
                  : "#e0e0e0",
                height: "100%",
                borderRadius:
                  index === 0
                    ? "5px 0 0 5px"
                    : index === 4
                    ? "0 5px 5px 0"
                    : "0",
              }}
            ></div>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-row justify-between">
            <li className={"flex flex-row text-text-md-semibold gap-4"}>
              <input
                type="checkbox"
                checked={checkedFields.profile}
                onChange={() => handleCheckboxChange("profile")}
              />
              Update your profile
            </li>
            <Image
              src={"/static/icons/arrow-right.svg"}
              width={20}
              height={20}
              alt="arrow"
            />
          </div>

          <div className="flex flex-row justify-between">
            <li className={"flex flex-row text-text-md-semibold gap-4"}>
              <input
                type="checkbox"
                checked={checkedFields.cv}
                onChange={() => handleCheckboxChange("cv")}
              />
              Upload an ATS Friendly CV
            </li>
            <Image
              src={"/static/icons/arrow-right.svg"}
              width={20}
              height={20}
              alt="arrow"
            />
          </div>

          <div className="flex flex-row justify-between">
            <li className={"flex flex-row text-text-md-semibold gap-4"}>
              <input
                type="checkbox"
                checked={checkedFields.coverLetter}
                onChange={() => handleCheckboxChange("coverLetter")}
              />
              Upload your cover letter
            </li>
            <Image
              src={"/static/icons/arrow-right.svg"}
              width={20}
              height={20}
              alt="arrow"
            />
          </div>

          <div className="flex flex-row justify-between">
            <li className={"flex flex-row text-text-md-semibold gap-4"}>
              <input
                type="checkbox"
                checked={checkedFields.firstJob}
                onChange={() => handleCheckboxChange("firstJob")}
              />
              Apply your first job
            </li>
            <Image
              src={"/static/icons/arrow-right.svg"}
              width={20}
              height={20}
              alt="arrow"
            />
          </div>

          <div className="flex flex-row justify-between">
            <li className={"flex flex-row text-text-md-semibold gap-4"}>
              <input
                type="checkbox"
                checked={checkedFields.community}
                onChange={() => handleCheckboxChange("community")}
              />
              Join community
            </li>
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
