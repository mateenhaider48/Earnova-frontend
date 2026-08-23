"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [cellNo, setCellNo] = useState("");
  const [password, setPassword] = useState("");
  const [reflink, setReflink] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
  ============================================================
  GET REF FROM URL
  Example:
  /register?ref=ABC123
  ============================================================
  */

  useEffect(() => {
    const ref = searchParams.get("ref");
    console.log(ref)
    if (ref) {
      setReflink(ref.trim());
    }
  }, [searchParams]);

  /*
  ============================================================
  REGISTER
  ============================================================
  */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!name.trim() || !cellNo.trim() || !password) {
      toast.error("Please fill all required fields");
      return;
    }

    if (password.length < 8) {
      toast.error(
        "Password must be at least 8 characters"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            cellNo: cellNo.trim(),
            password,
            reflink: reflink.trim() || null,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let data: any = {};

      if (
        contentType
          ?.toLowerCase()
          .includes("application/json")
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Signup returned non JSON:",
          text
        );

        throw new Error(
          `Server returned ${response.status} ${response.statusText}`
        );
      }

      console.log("SIGNUP RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Registration failed"
        );
      }

      toast.success(
        data?.message ||
          "Registration successful!"
      );

      setName("");
      setCellNo("");
      setPassword("");

      // URL se referral aya tha to successful signup
      // ke baad clear kar dete hain.
      setReflink("");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

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
        lg:px-10
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

      {/* ==================================================
          REGISTER CARD
      ================================================== */}

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
          lg:max-w-md
          xl:p-9
        "
      >
        {/* ==================================================
            HEADING
        ================================================== */}

        <div className="mb-6 text-center sm:mb-8">
          <h1
            className="
              text-2xl
              font-bold
              text-white
              sm:text-3xl
            "
          >
            Create Account
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-white/80
              sm:text-base
              md:text-lg
            "
          >
            Register your account to continue
          </p>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-5"
        >
          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              disabled={loading}
              className="
                w-full
                rounded-lg
                border border-white/30
                bg-white/10
                px-3.5 py-3
                text-sm
                text-white
                placeholder-white/50
                outline-none
                backdrop-blur-sm
                transition
                focus:border-white
                focus:bg-white/15
                sm:px-4
                sm:text-base
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          {/* CELL NUMBER */}

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Cell Number
            </label>

            <input
              type="tel"
              placeholder="03XXXXXXXXX"
              value={cellNo}
              onChange={(e) =>
                setCellNo(e.target.value)
              }
              required
              disabled={loading}
              className="
                w-full
                rounded-lg
                border border-white/30
                bg-white/10
                px-3.5 py-3
                text-sm
                text-white
                placeholder-white/50
                outline-none
                backdrop-blur-sm
                transition
                focus:border-white
                focus:bg-white/15
                sm:px-4
                sm:text-base
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
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
                  px-3.5 py-3 pr-11
                  text-sm
                  text-white
                  placeholder-white/50
                  outline-none
                  backdrop-blur-sm
                  transition
                  focus:border-white
                  focus:bg-white/15
                  sm:px-4
                  sm:py-3
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

            <p className="mt-1 text-xs text-white/50">
              Password must be at least 8 characters
            </p>
          </div>

          {/* ==================================================
              REFERRAL
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Referral Code{" "}
              <span className="font-normal text-white/50">
                (Optional)
              </span>
            </label>

            <input
              type="text"
              placeholder="Enter referral code"
              value={reflink}
              onChange={(e) =>
                setReflink(
                  e.target.value
                )
              }
              disabled={loading}
              className="
                w-full
                rounded-lg
                border border-white/30
                bg-white/10
                px-3.5 py-3
                text-sm
                text-white
                placeholder-white/50
                outline-none
                backdrop-blur-sm
                transition
                focus:border-white
                focus:bg-white/15
                sm:px-4
                sm:text-base
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            {reflink && (
              <p className="mt-1 text-xs text-green-300">
                Referral code detected:{" "}
                {reflink}
              </p>
            )}
          </div>

          {/* REGISTER BUTTON */}

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
              ? "Creating Account..."
              : "Register"}
          </button>
        </form>

        {/* LOGIN */}

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
          Already have an account?{" "}

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