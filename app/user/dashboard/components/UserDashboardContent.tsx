"use client";

import { useEffect, useState } from "react";
import { FaTelegram, FaYoutube } from "react-icons/fa";
import {
  Wallet,
  DollarSign,
  Network,
  ListCheck,
  Package,
  Phone,
  CopyIcon,
} from "lucide-react";

import { useUserTheme } from "./UserThemeProvider";
import toast from "react-hot-toast";

interface Props {
  user: any;

  // Currency UserDashboard se aa rahi hai
  currency: string;

  setActiveSection: (
    section:
      | "dashboard"
      | "earnings"
      | "withdraw"
      | "ads"
      | "team"
      | "subscription"
      | "support"
      | "tutorials"
      | "income"
      | "profile",
  ) => void;
}
interface CompanyAds {
  _id: string;
  image: string;
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export default function UserDashboardContent({
  user,
  currency,
  setActiveSection,
}: Props) {
  const { settings } = useUserTheme();
  const [companyAds ,setCompanyAds] = useState<CompanyAds[]>([])
  /*
  ============================================================
  TEAM / BANNER IMAGES
  ============================================================
  */

      const loadCompanyAds = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/user/get-companyAd`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to load tutorials (${res.status})`
        );
      }

      setCompanyAds(
        Array.isArray(data?.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error(
        "Load tutorials error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load tutorials."
      );
    }
  };


  /*
  ============================================================
  FRESH USER DATA
  ============================================================
  */

  const [fetched, setFetched] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

  /*
  ============================================================
  TEAM IMAGE SLIDER
  ============================================================
  */
useEffect(() => {
  loadCompanyAds();
}, []);

useEffect(() => {
  if (companyAds.length <= 1) return;

  const interval = setInterval(() => {
    setCurrentTeamIndex((prev) => {
      if (prev >= companyAds.length - 1) {
        return 0;
      }

      return prev + 1;
    });
  }, 3000);

  return () => clearInterval(interval);
}, [companyAds.length]);

  /*
  ============================================================
  GET CURRENT USER

  Backend:
  GET /api/user/get-me

  Fresh API user first.
  ============================================================
  */

  useEffect(() => {
    let cancelled = false;

    const loadMe = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/user/get-me`, {
          method: "GET",

          credentials: "include",

          headers: {
            Accept: "application/json",
          },

          cache: "no-store",
        });

        const contentType = res.headers.get("content-type");

        if (!contentType?.toLowerCase().includes("application/json")) {
          const text = await res.text();

          console.error("get-me returned non JSON:", text);

          throw new Error(`Server returned ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message || data?.error || "Failed to fetch user",
          );
        }

        if (!cancelled) {
          /*
          ------------------------------------------------------
          BACKEND RESPONSE

          {
            success: true,
            data: user
          }
          ------------------------------------------------------
          */

          setFetched(data?.data ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("loadMe error:", err);

          setError(err instanceof Error ? err.message : "Failed to fetch user");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMe();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  ============================================================
  CURRENT USER

  Fresh API user first.
  Redux user is fallback.
  ============================================================
  */

  const u = fetched ?? user;

  /*
  ============================================================
  USER DATA
  ============================================================
  */

  const userName = u?.name || "User";

  const balance = Number(u?.balance ?? 0);

  const earning = Number(u?.earning ?? 0);

  const adsWatched = Number(u?.adsWatched ?? u?.watchedInCurrentCycle ?? 0);

  const subscription = u?.subscription;

  /*
  ============================================================
  SUBSCRIPTION NAME
  ============================================================
  */

  const planName =
    typeof subscription === "object"
      ? subscription?.planName
      : u?.subscription?.planName || u?.planName || null;

  const hasSubscription = Boolean(subscription || planName);

  /*
  ============================================================
  EARNING DATA
  ============================================================
  */

  const todayEarning = Number(u?.todayEarning ?? u?.todaysEarning ?? 0);

  const yesterdayEarning = Number(
    u?.yesterdayEarning ?? u?.yesterdaysEarning ?? 0,
  );

  const weeklyEarning = Number(u?.weeklyEarning ?? u?.weekEarning ?? 0);

  const monthlyEarning = Number(u?.monthlyEarning ?? u?.monthEarning ?? 0);

  /*
  ============================================================
  REFERRAL LINK
  ============================================================
  */

  const referralLink =
    u?.referralLink || u?.refLink || u?.referralCode
      ? u?.referralLink || u?.reflink || u?.referralCode
      : "";

  /*
  ============================================================
  COPY REFERRAL LINK
  ============================================================
  */

  const copyReferralLink = async () => {
    if (!u?.reflink) return;

    const text = `${FRONTEND_URL}/register?ref=${String(u?.reflink)}`;

    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }

      // Fallback
      const textarea = document.createElement("textarea");

      textarea.value = text;

      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const copied = document.execCommand("copy");

      document.body.removeChild(textarea);

      if (!copied) {
        throw new Error("Copy command failed");
      }
    } catch (error) {
      console.error("Copy referral link error:", error);

      // Last fallback: user ko manually copy karne do
      try {
        window.prompt("Copy your referral link:", text);
      } catch (fallbackError) {
        console.error("Copy fallback error:", fallbackError);
      }
    }
  };
  /*
  ============================================================
  RETURN
  ============================================================
  */

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{
        backgroundColor: "var(--user-background)",
      }}
    >
      <div className="space-y-2 p-4 sm:p-6 lg:p-8">
        {/* ==================================================
            ACCOUNT REFRESH STATUS
        ================================================== */}

        {(loading || error) && (
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
            style={{
              backgroundColor: error
                ? "rgba(239,68,68,0.15)"
                : "rgba(234,179,8,0.15)",

              color: error ? "#dc2626" : "#ca8a04",

              borderRadius: "var(--user-radius)",
            }}
          >
            {loading
              ? "Refreshing account data…"
              : `Couldn't refresh account: ${error}`}
          </div>
        )}

        {/* ==================================================
            BANNER
        ================================================== */}

        <div className="overflow-hidden rounded-2xl bg-white">
          <div className="relative flex justify-center">
            {companyAds.map((url, index) => (
              <img
                key={index}
                src={url.image}
                alt={`Team ${index + 1}`}
                className={`team-image h-50 w-full ${
                  index === currentTeamIndex ? "active" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* ==================================================
            USER
        ================================================== */}

        <section>
          <div className="flex items-center justify-between rounded-xl border bg-white p-1 pr-2">
            <div className="flex gap-4  ">
              <div>
                <img
                  className="h-16 w-16 rounded-full"
                  src="/images/avatar.jpg"
                  alt="User"
                />
              </div>

              <h2 className="mt-4 text-xl font-bold text-black sm:text-3xl">
                {userName}
              </h2>
            </div>
            {!hasSubscription && (
              <p className="mt-1 h-5 w-auto rounded-xl border-1 border-black bg-gradient-to-r from-[#7C60F4] to-[#E749A0] px-1 text-xs text-white">
                No Plan
              </p>
            )}
            {planName && (
              <p className="">
                <img
                  src={user?.subscription?.activePlanImage}
                  alt="plan"
                  className="w-12 h-12 rounded-xl"
                />
              </p>
            )}
          </div>
        </section>

        {/* ==================================================
            BALANCE
        ================================================== */}

        <div className="flex items-center justify-center rounded-xl border-1 p-2 bg-white text-center">
          <p className="text-lg font-bold text-red-700">
            Balance:{" "}
            <span className="text-center font-bold sm:text-3xl">
              {currency === "PKR" ? "Rs" : ""} {balance.toFixed(0)}{" "}
              {currency === "PKR" ? "" : "$"}
            </span>
          </p>
        </div>

        {/* ==================================================
            MENU / STATS
        ================================================== */}

        <div className="grid grid-cols-4 rounded-lg py-2 bg-white xl:grid-cols-4">
          <StatCard
            title="Deposit"
            icon={Wallet}
            onClick={() => setActiveSection("earnings")}
            colorIcon="#EEC835"
          />

          <StatCard
            title="Withdraw"
            icon={DollarSign}
            onClick={() => setActiveSection("withdraw")}
            colorIcon="#229CC1"
          />

          <StatCard
            title="Task"
            value={String(adsWatched)}
            icon={ListCheck}
            onClick={() => setActiveSection("ads")}
            colorIcon="#721cab"
          />

          <StatCard
            title="My Team"
            value={hasSubscription ? "Active" : "No Plan"}
            icon={Network}
            onClick={() => setActiveSection("team")}
            colorIcon="#00B46A"
          />

          <StatCard
            title="Plan"
            value={planName || "No Plan"}
            icon={Package}
            onClick={() => setActiveSection("subscription")}
            colorIcon="#188bf7"
          />

          <StatCard
            title="Support"
            icon={Phone}
            onClick={() => setActiveSection("support")}
            colorIcon="#19dd9c"
          />

          <StatCard
            title="Youtube"
            value={String(adsWatched)}
            icon={FaYoutube}
            onClick={() => setActiveSection("tutorials")}
            colorIcon="#eb212b"
          />

          <StatCard
            title="Income"
            value={`${earning.toFixed(2)} ${currency}`}
            icon={FaTelegram}
            onClick={() => setActiveSection("income")}
            colorIcon="#1c48c2"
          />
        </div>

        {/* ==================================================
            EARNINGS
        ================================================== */}

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-white p-2 xl:grid-cols-4">
          <CARDDesign
            day="Today's Earning"
            value={`${todayEarning.toFixed(2)} ${currency}`}
            colorBg="bg-red-600"
          />

          <CARDDesign
            day="Yesterday's Earning"
            value={`${yesterdayEarning.toFixed(2)} ${currency}`}
            colorBg="bg-green-600"
          />

          <CARDDesign
            day="Weekly Earning"
            value={`${weeklyEarning.toFixed(2)} ${currency}`}
            colorBg="bg-yellow-600"
          />

          <CARDDesign
            day="Monthly Earning"
            value={`${monthlyEarning.toFixed(2)} ${currency}`}
            colorBg="bg-blue-600"
          />
        </div>

        {/* ==================================================
            REFERRAL LINK
        ================================================== */}

        <div className="flex items-center rounded-xl bg-white text-center">
          <p className="mx-auto p-1 text-xs">Ref Link</p>

          <div className="flex items-center justify-center gap-2 p-1">
            <input
              type="text"
              value={`${FRONTEND_URL}/register?ref=${String(u?.reflink || "")}`}
              readOnly
              placeholder="Reference link"
              className="h-8 rounded-md border-1 border-gray-300 px-2 text-center text-xs outline-none"
            />

            <button
              type="button"
              onClick={copyReferralLink}
              style={{
                background: `linear-gradient(to right, ${settings.gradientStart}, ${settings.gradientEnd})`,
              }}
              className="flex h-8 w-8 items-center justify-center rounded-md border-1 text-white"
            >
              <CopyIcon size={20} />
            </button>
          </div>
        </div>
        {/* ==================================================
{/* ==================================================
    WITHDRAWAL NOTIFICATION SLIDER
================================================== */}
<div className="mt-2 w-full  h-60 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
  <div className="relative h-60 overflow-hidden">

    <div className="withdrawal-track">

      {/* CARD 1 */}
      <div className="withdrawal-item">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg">
          💰
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-800">
            Congratulations Ali 🎉
          </p>

          <p className="truncate text-[11px] text-gray-500">
            You have withdrawn <span className="font-semibold text-green-600">$50</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
          Withdrawn
        </span>
      </div>

      {/* CARD 2 */}
      <div className="withdrawal-item">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
          💵
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-800">
            Congratulations Ahmed 🎉
          </p>

          <p className="truncate text-[11px] text-gray-500">
            You have withdrawn <span className="font-semibold text-green-600">$100</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
          Withdrawn
        </span>
      </div>

      {/* CARD 3 */}
      <div className="withdrawal-item">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg">
          💎
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-800">
            Congratulations Usman 🎉
          </p>

          <p className="truncate text-[11px] text-gray-500">
            You have withdrawn <span className="font-semibold text-green-600">$75</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
          Withdrawn
        </span>
      </div>

      {/* CARD 4 */}
      <div className="withdrawal-item">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg">
          🤑
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-800">
            Congratulations Hamza 🎉
          </p>

          <p className="truncate text-[11px] text-gray-500">
            You have withdrawn <span className="font-semibold text-green-600">$150</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
          Withdrawn
        </span>
      </div>

      {/* CARD 5 */}
      <div className="withdrawal-item">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-lg">
          💸
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-800">
            Congratulations Hassan 🎉
          </p>

          <p className="truncate text-[11px] text-gray-500">
            You have withdrawn <span className="font-semibold text-green-600">$200</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
          Withdrawn
        </span>
      </div>

         <div className="withdrawal-item">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg">
          💰
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-800">
            Congratulations Ali 🎉
          </p>

          <p className="truncate text-[11px] text-gray-500">
            You have withdrawn <span className="font-semibold text-green-600">$50</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
          Withdrawn
        </span>
      </div>

      {/* CARD 2 */}
      <div className="withdrawal-item">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
          💵
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-800">
            Congratulations Ahmed 🎉
          </p>

          <p className="truncate text-[11px] text-gray-500">
            You have withdrawn <span className="font-semibold text-green-600">$100</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
          Withdrawn
        </span>
      </div>

      {/* CARD 3 */}
      <div className="withdrawal-item">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg">
          💎
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-800">
            Congratulations Usman 🎉
          </p>

          <p className="truncate text-[11px] text-gray-500">
            You have withdrawn <span className="font-semibold text-green-600">$75</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
          Withdrawn
        </span>
      </div>

      {/* CARD 4 */}
      <div className="withdrawal-item">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg">
          🤑
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-800">
            Congratulations Hamza 🎉
          </p>

          <p className="truncate text-[11px] text-gray-500">
            You have withdrawn <span className="font-semibold text-green-600">$150</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
          Withdrawn
        </span>
      </div>

      {/* CARD 5 */}
      <div className="withdrawal-item">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-lg">
          💸
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-800">
            Congratulations Hassan 🎉
          </p>

          <p className="truncate text-[11px] text-gray-500">
            You have withdrawn <span className="font-semibold text-green-600">$200</span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
          Withdrawn
        </span>
      </div>


    </div>
  </div>
</div>

      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ title, icon: Icon, onClick, colorIcon }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 text-left transition hover:-translate-y-0.5 hover:shadow-md"
      style={{
        backgroundColor: "var(--user-card)",

        borderRadius: "var(--user-radius)",

        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      <div className="text-center">
        <div
          className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-sm"
          style={{
            backgroundColor: colorIcon,

            color: "white",
          }}
        >
          <Icon size={26} />
        </div>

        <p className="text-xs font-medium text-gray-500">{title}</p>
      </div>
    </button>
  );
}

/* ============================================================
   EARNING CARD
============================================================ */

export function CARDDesign({ day, value, icon: Icon, colorBg }: any) {
  return (
    <div className={`${colorBg} rounded-md p-1`}>
      <p className="text-center text-[10px] font-semibold text-white">{day}</p>

      <p className="text-center text-sm text-white">{value}</p>
    </div>
  );
}
