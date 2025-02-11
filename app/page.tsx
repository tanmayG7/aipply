"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAuthToken } from "../lib/firebaseConfig/firebaseConfig";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkAuthToken((path: string) => {
      router.push(path);
    });
  }, [router]);

  return (
    <div className="w-[30%] m-auto items-center justify-center">
      <div>This is Home page</div>
    </div>
  );
}
