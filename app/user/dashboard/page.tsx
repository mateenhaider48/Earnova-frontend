"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../../redux/store";
import { logout } from "../../../redux/slices/authSclice";

import { UserThemeProvider } from "./components/UserThemeProvider";

import UserDashboardContent from "./components/UserDashboardContent";
import EarningsSection from "./components/DepositSection";
import WithdrawSection from "./components/WithdrawSection";
import BuySubscriptionSection from "./components/BuySubscription";
import TeamSection from "./components/TeamSection";
import SupportSection from "./components/SupportSection";
import AdsSection from "./components/AdsSection";
import VideoTutorialPage from "./components/VideoTutorials";
import IncomeSection from "./components/IncomeSection";

export type Section =
  | "dashboard"
  | "earnings"
  | "withdraw"
  | "ads"
  | "team"
  | "subscription"
  | "support"
  | "tutorials"
  | "income"
  | "buy-subscription"
  | "wallet"
  | "profile";

/*
============================================================
API
============================================================
*/

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/*
============================================================
USER DASHBOARD
============================================================
*/

export default function UserDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  /*
  ============================================================
  FRESH USER STATE
  ============================================================
  */

  const [fetched, setFetched] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

  /*
  ============================================================
  AUTH CHECKING
  ============================================================
  */

  const [authChecking, setAuthChecking] = useState(true);

  /*
  ============================================================
  CURRENCY STATE
  ============================================================
  */

  const [currency, setCurrency] = useState<string>("USD");

  const [currencyLoading, setCurrencyLoading] =
    useState<boolean>(true);

  /*
  ============================================================
  SECTION FROM URL
  ============================================================
  */

  const sectionFromUrl = searchParams.get("section");

  const validSections: Section[] = [
    "dashboard",
    "earnings",
    "withdraw",
    "ads",
    "team",
    "subscription",
    "support",
    "tutorials",
    "income",
    "buy-subscription",
    "wallet",
    "profile",
  ];

  const activeSection: Section =
    validSections.includes(sectionFromUrl as Section)
      ? (sectionFromUrl as Section)
      : "dashboard";

  /*
  ============================================================
  CHANGE SECTION
  ============================================================
  */

  const setActiveSection = (section: Section) => {
    router.push(`/user/dashboard?section=${section}`);
  };

  /*
  ============================================================
  AUTH CHECK
  ============================================================
  */

  useEffect(() => {
    let cancelled = false;

    const verifyUser = async () => {
      /*
      --------------------------------------------------------
      Redux mein login hi nahi hai
      --------------------------------------------------------
      */

      if (!isAuthenticated) {
        if (!cancelled) {
          setAuthChecking(false);
          setLoading(false);
        }

        router.replace("/login");
        return;
      }

      /*
      --------------------------------------------------------
      Redux login hai, lekin DB se fresh user verify karo
      --------------------------------------------------------
      */

      try {
        setAuthChecking(true);
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_URL}/api/user/get-me`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const text = await res.text();

        let data: any = null;

        try {
          data = text ? JSON.parse(text) : null;
          console.log(data)
        } catch {
          throw new Error(
            `Server returned ${res.status} ${res.statusText}`
          );
        }

        /*
        --------------------------------------------------------
        USER NOT FOUND / TOKEN INVALID
        --------------------------------------------------------
        */

        if (res.status === 401 || res.status === 403) {
          console.log(
            "AUTH FAILED:",
            data?.message || "User is not authenticated."
          );

          /*
          ------------------------------------------------------
          Redux logout
          ------------------------------------------------------
          */

          dispatch(logout());

          /*
          ------------------------------------------------------
          Old localStorage auth data clear
          ------------------------------------------------------
          */

          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("savedUser");
            localStorage.removeItem("user");
            localStorage.removeItem("auth");
          }

          /*
          ------------------------------------------------------
          Fresh state clear
          ------------------------------------------------------
          */

          setFetched(null);
          setError(null);

          /*
          ------------------------------------------------------
          Login page
          ------------------------------------------------------
          */

          router.replace("/login");

          return;
        }

        /*
        --------------------------------------------------------
        Other API errors
        --------------------------------------------------------
        */

        if (!res.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to fetch user."
          );
        }

        /*
        --------------------------------------------------------
        FRESH USER
        --------------------------------------------------------
        */

        const freshUser =
          data?.data ??
          data?.user ??
          null;

        /*
        --------------------------------------------------------
        Agar API success hai lekin user null hai
        --------------------------------------------------------
        */

        if (!freshUser) {
          console.log("GET-ME SUCCESS BUT USER NOT FOUND");

          dispatch(logout());

          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("savedUser");
            localStorage.removeItem("user");
            localStorage.removeItem("auth");
          }

          setFetched(null);

          router.replace("/login");

          return;
        }

        /*
        --------------------------------------------------------
        User valid hai
        --------------------------------------------------------
        */

        if (!cancelled) {
          setFetched(freshUser);
          setError(null);
          setAuthChecking(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("verifyUser error:", err);

          /*
          ------------------------------------------------------
          Network/server error ko automatically logout nahi
          karna. Sirf actual 401/403 par logout hoga.
          ------------------------------------------------------
          */

          setError(
            err instanceof Error
              ? err.message
              : "Failed to verify user."
          );

          setAuthChecking(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    verifyUser();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, router, dispatch]);

  /*
  ============================================================
  GET CURRENCY
  ============================================================
  */

  useEffect(() => {
    let cancelled = false;

    const loadCurrency = async () => {
      try {
        setCurrencyLoading(true);

        const res = await fetch(
          `${API_URL}/api/user/getCurrency`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const text = await res.text();

        let data: any = null;

        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          throw new Error(
            `Currency server returned ${res.status} ${res.statusText}`
          );
        }

        if (!res.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to fetch currency."
          );
        }

        if (!cancelled) {
          const serverCurrency =
            data?.data?.currency;

          if (
            serverCurrency === "USD" ||
            serverCurrency === "PKR"
          ) {
            setCurrency(serverCurrency);
          } else {
            setCurrency("USD");
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "loadCurrency error:",
            err
          );

          setCurrency("USD");
        }
      } finally {
        if (!cancelled) {
          setCurrencyLoading(false);
        }
      }
    };

    loadCurrency();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  ============================================================
  IMPORTANT

  Fresh API user ko priority do.

  Agar API user valid hai:
      fetched

  Agar API verification abhi complete nahi:
      user temporarily use nahi hoga.
  ============================================================
  */

  const u = fetched;

  /*
  ============================================================
  AUTH / USER LOADING
  ============================================================
  */

  if (
    authChecking ||
    loading ||
    currencyLoading
  ) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          backgroundColor:
            "var(--user-background)",
          color:
            "var(--user-text)",
        }}
      >
        <div className="text-center">
          <div
            className="mx-auto h-7 w-7 animate-spin rounded-full border-2"
            style={{
              borderColor:
                "var(--user-secondary)",
              borderTopColor:
                "var(--user-primary)",
            }}
          />

          <p className="mt-3 text-sm">
            Verifying account...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  IF USER IS INVALID
  ============================================================
  */

  if (!isAuthenticated || !u) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          backgroundColor:
            "var(--user-background)",
          color:
            "var(--user-text)",
        }}
      >
        <div className="text-center">
          <p className="text-sm">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  RETURN
  ============================================================
  */

  return (
    <UserThemeProvider>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="fixed z-50 flex h-16 w-full items-center justify-between border-b px-4 sm:px-6 lg:px-8"
        style={{
          backgroundColor:
            "var(--user-header)",
          borderColor:
            "rgba(0,0,0,0.08)",
        }}
      >
        {/* BRAND */}

        <div className="flex gap-5">
          <div>
            <img
              className="h-8 w-8 rounded-full"
              src="/images/jazzcash.jpg"
              alt="IP-INVEST"
            />
          </div>

          <h1
            className="mt-1 text-lg font-bold"
            style={{
              color:
                "var(--user-text)",
            }}
          >
            IP-INVEST
          </h1>
        </div>

        {/* USER */}

        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
            style={{
              backgroundColor:
                "var(--user-primary)",
              color:
                "var(--user-button-text)",
            }}
          >
            {u?.name
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        className="min-h-screen overflow-x-hidden overflow-y-auto pt-16 lg:pl-64"
        style={{
          backgroundColor:
            "var(--user-background)",
          color:
            "var(--user-text)",
        }}
      >
        {/* ==================================================
            FRESH USER ERROR
        ================================================== */}

        {error && (
          <div
            className="mx-4 mt-3 border p-3 text-sm sm:mx-6 lg:mx-8"
            style={{
              backgroundColor:
                "var(--user-card)",
              color:
                "var(--user-text)",
              borderColor:
                "var(--user-border)",
              borderRadius:
                "var(--user-radius)",
            }}
          >
            {error}
          </div>
        )}

        {/* ==================================================
            DASHBOARD
        ================================================== */}

        {activeSection === "dashboard" && (
          <UserDashboardContent
            user={u}
            currency={currency}
            setActiveSection={
              setActiveSection
            }
          />
        )}

        {/* ==================================================
            EARNINGS / DEPOSIT
        ================================================== */}

        {activeSection === "earnings" && (
          <EarningsSection
            user={u}
          />
        )}

        {/* ==================================================
            WITHDRAW
        ================================================== */}

        {activeSection === "withdraw" && (
          <WithdrawSection
            user={u}
          />
        )}

        {/* ==================================================
            ADS
        ================================================== */}

        {activeSection === "ads" && (
          <AdsSection
            user={u}
            currency={currency}
          />

        )}

        {/* ==================================================
            SUBSCRIPTION
        ================================================== */}

        {activeSection === "subscription" && (
          <BuySubscriptionSection
            user={u}
            currency = {currency}
          />
        )}

        {/* ==================================================
            SUPPORT
        ================================================== */}

        {activeSection === "support" && (
          <SupportSection />
        )}

        {/* ==================================================
            TUTORIALS
        ================================================== */}

        {activeSection === "tutorials" && (
          <VideoTutorialPage />
        )}

        {/* ==================================================
            INCOME
        ================================================== */}

        {activeSection === "income" && (
          <IncomeSection />
        )}

        {/* ==================================================
            TEAM
        ================================================== */}

        {activeSection === "team" && (
          <TeamSection
            user={u}
          />
        )}

        {/* ==================================================
            PROFILE
        ================================================== */}

        {activeSection === "profile" && (
          <ProfilePlaceholder
            user={u}
            currency={currency}
          />
        )}
      </main>
    </UserThemeProvider>
  );
}

/*
============================================================
PROFILE
============================================================
*/

function ProfilePlaceholder({
  user,
  currency,
}: {
  user: any;
  currency: string;
}) {
  return (
    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{
        backgroundColor:
          "var(--user-background)",
      }}
    >
      <div
        className="border p-6 shadow-sm"
        style={{
          backgroundColor:
            "var(--user-card)",
          borderColor:
            "var(--user-border)",
          borderRadius:
            "var(--user-radius)",
        }}
      >
        <h2
          className="text-2xl font-bold"
          style={{
            color:
              "var(--user-text)",
          }}
        >
          Profile
        </h2>

        <p
          className="mt-2"
          style={{
            color:
              "var(--user-text-secondary)",
          }}
        >
          {user?.name}
        </p>

        <p
          className="mt-1"
          style={{
            color:
              "var(--user-text-secondary)",
          }}
        >
          {user?.cellNo}
        </p>

        <p
          className="mt-1"
          style={{
            color:
              "var(--user-text-secondary)",
          }}
        >
          Balance:{" "}
          {user?.balance ?? 0}{" "}
          {currency}
        </p>
      </div>
    </div>
  );
}
