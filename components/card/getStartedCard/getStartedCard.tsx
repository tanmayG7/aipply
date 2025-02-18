import React, { useEffect, useState } from "react";
import { firestore, auth } from "@/lib/firebaseConfig/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface GetStartedCardProps {
  appliedJoblength: number;
}

const GetStartedCard: React.FC<GetStartedCardProps> = ({
  appliedJoblength,
}) => {
  const [checkedFields, setCheckedFields] = useState({
    profile: false,
    cv: false,
    coverLetter: false,
    firstJob: false,
    community: false,
  });

  const [loading, setLoading] = useState(true);


  const fetchUserData = async (uid: string) => {
    const userDoc = await getDoc(doc(firestore, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setCheckedFields({
        profile:
          !!userData.education &&
          !!userData.experience &&
          !!userData.skills &&
          !!userData.achievements,
        cv: !!userData.cv,
        coverLetter: !!userData.coverLetter,
        firstJob: appliedJoblength > 0 || !!userData.firstJob,
        community: !!userData.community,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [appliedJoblength]);

  type Field = "profile" | "cv" | "coverLetter" | "firstJob" | "community";

  const handleCheckboxChange = (field: Field) => {
    setCheckedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

    if (field === "community") {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        updateDoc(userDocRef, {
          community: !checkedFields.community,
        });
      }
    }
  };

  const calculateProgress = () => {
    const totalFields = Object.keys(checkedFields).length;
    const checkedCount = Object.values(checkedFields).filter(Boolean).length;
    return (checkedCount / totalFields) * 100;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
            <Link href="/complete-profile" className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row gap-4 items-center">
                <Checkbox
                  disabled={true}
                  checked={checkedFields.profile}
                  onCheckedChange={() => handleCheckboxChange("profile")}
                />
                <span className="hover:text-green-600">Update your profile</span>
              </div>
              <Image
                src={"/static/icons/arrow-right.svg"}
                width={20}
                height={20}
                alt="arrow"
              />
            </Link>
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <Link href="/complete-profile" className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row gap-4 items-center">
                <Checkbox
                  disabled={true}
                  checked={checkedFields.cv}
                  onCheckedChange={() => handleCheckboxChange("cv")}
                />
                <span className="hover:text-green-600">Upload an ATS Friendly CV</span>
              </div>
              <Image
                src={"/static/icons/arrow-right.svg"}
                width={20}
                height={20}
                alt="arrow"
              />
            </Link>
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <Link href="/complete-profile" className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row gap-4 items-center">
                <Checkbox
                  disabled={true}
                  checked={checkedFields.coverLetter}
                  onCheckedChange={() => handleCheckboxChange("coverLetter")}
                />
                <span className="hover:text-green-600">Upload your cover letter</span>
              </div>
              <Image
                src={"/static/icons/arrow-right.svg"}
                width={20}
                height={20}
                alt="arrow"
              />
            </Link>
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <Link href="/job-board" className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row gap-4 items-center">
                <Checkbox
                  disabled={true}
                  checked={checkedFields.firstJob}
                  onCheckedChange={() => handleCheckboxChange("firstJob")}
                />
                <span className="hover:text-green-600">Apply your first job</span>
              </div>
              <Image
                src={"/static/icons/arrow-right.svg"}
                width={20}
                height={20}
                alt="arrow"
              />
            </Link>
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <Link href="https://chat.whatsapp.com/your-whatsapp-community-link" className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row gap-4 items-center">
                <Checkbox
                  disabled={true}
                  checked={checkedFields.community}
                  onCheckedChange={() => handleCheckboxChange("community")}
                />
                <span className="hover:text-green-600">Join community</span>
              </div>
              <Image
                src={"/static/icons/arrow-right.svg"}
                width={20}
                height={20}
                alt="arrow"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStartedCard;
