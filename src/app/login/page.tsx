"use client";

import dynamic from "next/dynamic";

const LoginPage = dynamic(() => import("@/components/login-page"), { ssr: false });

export default function Page() {
  return <LoginPage />;
}
