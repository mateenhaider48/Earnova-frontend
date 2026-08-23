"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [cellNo, setCellNo] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  // Get reset information
  useEffect(() => {
    const savedCellNo =
      sessionStorage.getItem("resetCellNo");

    const savedOtp =
      sessionStorage.getItem("resetOtp");

    if (!savedCellNo || !savedOtp) {
      toast.error("Reset session expired");
      router.replace("/forgot-password");
      return;
    }

    setCellNo(savedCellNo);
    setOtp(savedOtp);
  }, [router]);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (password.length < 8) {
      toast.error(
        "Password must be at least 8 characters"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cellNo,
            otp,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Password reset failed"
        );
      }

      toast.success(
        data.message ||
          "Password reset successfully!"
      );

      // Clear reset session
      sessionStorage.removeItem("resetCellNo");
      sessionStorage.removeItem("resetOtp");

      setPassword("");
      setConfirmPassword("");

      // Redirect to login
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        flex min-h-screen w-full
        items-center justify-center
        overflow-y-auto
        bg-gray-100
        bg-cover bg-center bg-no-repeat
        px-4 py-6
        sm:px-6 sm:py-8
        md:px-8
      "
      style={{
        backgroundImage:
          "url('/images/background.png')",
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      {/* Reset Password Card */}
      <div
        className="
          w-full
          max-w-sm
          rounded-2xl
          border border-white/20
          bg-black/20
          p-5
          shadow-2xl
          backdrop-blur-md

          sm:max-w-md
          sm:p-7

          md:p-8
        "
      >
        {/* Heading */}
        <div className="mb-7 text-center sm:mb-8">
          <h1
            className="
              text-2xl
              font-bold
              text-white
              sm:text-3xl
            "
          >
            Reset Password
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-white/70
              sm:text-base
            "
          >
            Create a new password for your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* New Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              New Password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                disabled={loading}
                className="
                  w-full
                  rounded-lg
                  border border-white/30
                  bg-white/10
                  px-3.5 py-3
                  pr-11
                  text-sm
                  text-white
                  placeholder-white/50
                  outline-none
                  backdrop-blur-sm
                  transition

                  focus:border-white
                  focus:bg-white/15

                  sm:px-4
                  sm:pr-12
                  sm:text-base

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-white/70
                  transition
                  hover:text-white
                  disabled:opacity-50
                "
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
                disabled={loading}
                className="
                  w-full
                  rounded-lg
                  border border-white/30
                  bg-white/10
                  px-3.5 py-3
                  pr-11
                  text-sm
                  text-white
                  placeholder-white/50
                  outline-none
                  backdrop-blur-sm
                  transition

                  focus:border-white
                  focus:bg-white/15

                  sm:px-4
                  sm:pr-12
                  sm:text-base

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev
                  )
                }
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-white/70
                  transition
                  hover:text-white
                  disabled:opacity-50
                "
              >
                {showConfirmPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">
              Password requirements:
            </p>

            <p
              className={`mt-1 text-xs ${
                password.length >= 8
                  ? "text-green-300"
                  : "text-white/50"
              }`}
            >
              • At least 8 characters
            </p>

            <p
              className={`text-xs ${
                password &&
                password === confirmPassword
                  ? "text-green-300"
                  : "text-white/50"
              }`}
            >
              • Passwords must match
            </p>
          </div>

          {/* Reset Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-lg
              bg-white
              py-3
              text-sm
              font-semibold
              text-black
              shadow-lg
              transition

              hover:bg-white/90
              active:scale-[0.98]

              sm:text-base

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
          </button>
        </form>

        {/* Login */}
        <p
          className="
            mt-5
            text-center
            text-xs
            text-white/70

            sm:mt-6
            sm:text-sm
          "
        >
          Remember your password?{" "}
          <Link
            href="/login"
            className="
              font-semibold
              text-white
              transition
              hover:underline
            "
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
