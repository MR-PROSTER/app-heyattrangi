"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstitutionSignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/unauthorized");
  }, [router]);

  return null;
}
