"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { RootState } from "../redux/store";

export default function HomePage() {
  const router = useRouter();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/user/dashboard");
    }
  }, [isAuthenticated, user, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">
        Checking authentication...
      </p>
    </main>
  );
}
