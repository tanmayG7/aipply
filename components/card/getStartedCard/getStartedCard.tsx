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
  },[]);

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
    <div className="flex flex-col gap-6 border-[1px] bg-[#0C111D] border-[#1F242F] px-4 py-6 rounded-xl relative overflow-hidden">
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold font-inter text-white">
          Getting Started
        </h2>
        <p className="text-sm font-normal font-inter text-white/90 leading-relaxed">
          Congratulations! You've set up your account.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative w-full h-4 bg-[#e0e0e0] rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center gap-3">
            <Link
              href="/dashboard/complete-profile"
              className="flex flex-row justify-between items-center w-full min-w-0"
            >
              <div className="flex flex-row gap-3 items-center min-w-0 flex-1">
                <Checkbox
                  disabled={true}
                  checked={checkedFields.profile}
                  onCheckedChange={() => handleCheckboxChange("profile")}
                  className="flex-shrink-0"
                />
                <span className="hover:text-green-600 text-sm truncate">
                  Update your profile
                </span>
              </div>
              <Image
                src={"/static/icons/arrow-right.svg"}
                width={16}
                height={16}
                alt="arrow"
                className="flex-shrink-0"
              />
            </Link>
          </div>

          <div className="flex flex-row justify-between items-center gap-3">
            <Link
              href="/dashboard/complete-profile"
              className="flex flex-row justify-between items-center w-full min-w-0"
            >
              <div className="flex flex-row gap-3 items-center min-w-0 flex-1">
                <Checkbox
                  disabled={true}
                  checked={checkedFields.cv}
                  onCheckedChange={() => handleCheckboxChange("cv")}
                  className="flex-shrink-0"
                />
                <span className="hover:text-green-600 text-sm truncate">
                  Upload an ATS Friendly CV
                </span>
              </div>
              <Image
                src={"/static/icons/arrow-right.svg"}
                width={16}
                height={16}
                alt="arrow"
                className="flex-shrink-0"
              />
            </Link>
          </div>

          <div className="flex flex-row justify-between items-center gap-3">
            <Link
              href="/dashboard/complete-profile"
              className="flex flex-row justify-between items-center w-full min-w-0"
            >
              <div className="flex flex-row gap-3 items-center min-w-0 flex-1">
                <Checkbox
                  disabled={true}
                  checked={checkedFields.coverLetter}
                  onCheckedChange={() => handleCheckboxChange("coverLetter")}
                  className="flex-shrink-0"
                />
                <span className="hover:text-green-600 text-sm truncate">
                  Upload your cover letter
                </span>
              </div>
              <Image
                src={"/static/icons/arrow-right.svg"}
                width={16}
                height={16}
                alt="arrow"
                className="flex-shrink-0"
              />
            </Link>
          </div>

          <div className="flex flex-row justify-between items-center gap-3">
            <Link
              href="/dashboard/job-board"
              className="flex flex-row justify-between items-center w-full min-w-0"
            >
              <div className="flex flex-row gap-3 items-center min-w-0 flex-1">
                <Checkbox
                  disabled={true}
                  checked={checkedFields.firstJob}
                  onCheckedChange={() => handleCheckboxChange("firstJob")}
                  className="flex-shrink-0"
                />
                <span className="hover:text-green-600 text-sm truncate">
                  Apply your first job
                </span>
              </div>
              <Image
                src={"/static/icons/arrow-right.svg"}
                width={16}
                height={16}
                alt="arrow"
                className="flex-shrink-0"
              />
            </Link>
          </div>

          <div className="flex flex-row justify-between items-center gap-3">
            <Link
              href="/features/join-community"
              className="flex flex-row justify-between items-center w-full min-w-0"
            >
              <div className="flex flex-row gap-3 items-center min-w-0 flex-1">
                <Checkbox
                  disabled={true}
                  checked={checkedFields.community}
                  onCheckedChange={() => handleCheckboxChange("community")}
                  className="flex-shrink-0"
                />
                <span className="hover:text-green-600 text-sm truncate">Join community</span>
              </div>
              <Image
                src="/static/icons/arrow-right.svg"
                width={16}
                height={16}
                alt="arrow"
                className="flex-shrink-0"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute hidden custom-md:flex top-0 left-0 w-[100%] h-[1px] ">
        <Image
          src={"/static/icons/gradientLine.svg"}
          fill
          alt="gradient line"
        />
      </div>
    </div>
  );
};

export default GetStartedCard;
