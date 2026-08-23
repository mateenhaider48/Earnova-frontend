"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [cellNo, setCellNo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!cellNo) {
      toast.error("Please enter your cell number");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cellNo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send OTP"
        );
      }

      toast.success(data.message || "OTP sent successfully!");

      // Save cell number temporarily
      sessionStorage.setItem("resetCellNo", cellNo);

      setTimeout(() => {
        router.push("/verify-otp");
      }, 800);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-screen w-full items-center justify-center overflow-y-auto bg-cover bg-center bg-no-repeat px-4 py-6 sm:px-6"
      style={{
        backgroundImage: "url('/images/background.png')",
      }}
    >
      <Toaster position="top-right" />

      <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-black/20 p-5 shadow-2xl backdrop-blur-md sm:max-w-md sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm text-white/70 sm:text-base">
            Enter your cell number and we'll send you an OTP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Cell Number
            </label>

            <input
              type="tel"
              placeholder="03XXXXXXXXX"
              value={cellNo}
              onChange={(e) => setCellNo(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition focus:border-white focus:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/70">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-white hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
