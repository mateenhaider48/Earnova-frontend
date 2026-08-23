"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { login } from "../../redux/slices/authSclice";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [cellNo, setCellNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!cellNo || !password) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`,
        {
          method: "POST",
          credentials:"include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cellNo,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save user + token in Redux
      dispatch(
        login({
          user: data.data.user,
          token: data.data.token,
        }),
      );



      toast.success(data.message || "Login successful!");

      setCellNo("");
      setPassword("");

      // Redirect after successful login
      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

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
        backgroundImage: "url('/images/background.png')",
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      {/* Login Card */}
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
        {/* Heading */}
        <div className="mb-6 text-center sm:mb-8">
          <h1
            className="
              text-2xl
              font-bold
              text-white
              sm:text-3xl
            "
          >
            Welcome Back
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
            Login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Cell Number */}
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

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-white/80 transition hover:text-white hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register */}
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
          Don't have an account?{" "}
          <Link
            href="/register"
            className="
              font-semibold
              text-white
              transition
              hover:underline
            "
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
