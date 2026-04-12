"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const lang = navigator.language?.slice(0, 2);
    const locale = lang === "es" ? "es" : "en";
    router.replace(`/${locale}/`);
  }, [router]);

  return null;
}
