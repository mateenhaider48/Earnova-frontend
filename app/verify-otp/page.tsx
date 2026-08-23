"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function VerifyOtpPage() {
  const router = useRouter();

  const [cellNo, setCellNo] = useState("");
  const [otp, setOtp] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    []
  );

  useEffect(() => {
    const savedCellNo =
      sessionStorage.getItem("resetCellNo");

    if (!savedCellNo) {
      router.replace("/forgot-password");
      return;
    }

    setCellNo(savedCellNo);
  }, [router]);

  const handleChange = (
    index: number,
    value: string
  ) => {
    // Only numbers
    const number = value.replace(/\D/g, "");

    if (!number) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];

    // Only take one digit
    newOtp[index] = number[0];

    setOtp(newOtp);

    // Move to next box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      // Current box has value
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        return;
      }

      // Current box empty → move back
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();

        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }

    // Arrow Left
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow Right
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];

    pastedData
      .split("")
      .forEach((digit, index) => {
        newOtp[index] = digit;
      });

    setOtp(newOtp);

    // Focus appropriate box
    const nextIndex = Math.min(
      pastedData.length,
      5
    );

    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter the complete OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cellNo,
            otp: otpValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid OTP"
        );
      }

      toast.success(
        data.message || "OTP verified successfully!"
      );

      sessionStorage.setItem(
        "resetOtp",
        otpValue
      );

      setTimeout(() => {
        router.push("/reset-password");
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
        backgroundImage:
          "url('/images/background.png')",
      }}
    >
      <Toaster position="top-right" />

      <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-black/20 p-5 shadow-2xl backdrop-blur-md sm:max-w-md sm:p-8">

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Verify OTP
          </h1>

          <p className="mt-2 text-sm text-white/70 sm:text-base">
            Enter the 6-digit OTP sent to your phone
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* OTP Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={
                  index === 0
                    ? "one-time-code"
                    : "off"
                }
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(
                    index,
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(index, e)
                }
                onPaste={handlePaste}
                disabled={loading}
                className="
                  h-12
                  w-10
                  rounded-lg
                  border border-white/30
                  bg-white/10
                  text-center
                  text-xl
                  font-bold
                  text-white
                  outline-none
                  backdrop-blur-sm
                  transition

                  focus:border-white
                  focus:bg-white/20
                  focus:ring-2
                  focus:ring-white/20

                  sm:h-14
                  sm:w-12
                  sm:text-2xl

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            ))}
          </div>

          {/* Verify Button */}
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
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>

        {/* Change Number */}
        <p className="mt-6 text-center text-sm text-white/70">
          Wrong number?{" "}
          <Link
            href="/forgot-password"
            className="font-semibold text-white hover:underline"
          >
            Change Number
          </Link>
        </p>
      </div>
    </main>
  );
}
