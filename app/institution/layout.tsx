"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstitutionLayout() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/unauthorized");
  }, [router]);

  return null;
}
