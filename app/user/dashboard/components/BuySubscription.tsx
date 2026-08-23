"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  Crown,
  Wallet,
  Loader2,
  X,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { useUserTheme } from "./UserThemeProvider";

/*
============================================================
API
============================================================
*/

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const SUBSCRIPTION_API = `${API_URL}/api/user/get-all-subscription`;

/* 
============================================================ 
TYPES 
============================================================ 
*/

type Subscription = {
  _id: string;

  planName: string;

  amount: number;

  dailyAds: number;

  amountPerAd: number;

  planTimeLimit: number;

  isActive?: boolean;

  planImage?: string;

  createdAt?: string;

  updatedAt?: string;

  [key: string]: any;
};

type SubscriptionCheck = {
  hasActivePlan: boolean;

  currentPlanId?: string;

  currentPlanName?: string;

  currentPlanPrice?: number;

  currentPlanStartDate?: string;

  currentPlanEndDate?: string;

  usedDays?: number;

  totalDays?: number;

  remainingDays?: number;

  remainingValue?: number;

  newPlanName?: string;

  newPlanPrice?: number;

  additionalAmount?: number;

  [key: string]: any;
};

/* 
============================================================ 
COMPONENT 
============================================================ 
*/
export default function SubscriptionSection({
  user,
  currency,
}: {
  user: any;
  currency: any;
}) {
  const { settings } = useUserTheme();

  const router = useRouter();

  /* 
  ============================================================ 
  STATE 
  ============================================================ 
  */

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);

  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(
    null,
  );

  /* 
  ============================================================ 
  SELECTED PLAN 
  ============================================================ 
  */

  const [selectedPlan, setSelectedPlan] = useState<Subscription | null>(null);

  /* 
  ============================================================ 
  PAYMENT CHOICE MODAL 
  ============================================================ 
  */

  const [showPaymentChoice, setShowPaymentChoice] = useState(false);

  /* 
  ============================================================ 
  SUBSCRIPTION CHECK 
  ============================================================ 
  */

  const [upgradeInfo, setUpgradeInfo] = useState<SubscriptionCheck | null>(
    null,
  );

  /* 
  ============================================================ 
  PROCESSING 
  ============================================================ 
  */

  const [processing, setProcessing] = useState(false);

  /* 
  ============================================================ 
  MESSAGE 
  ============================================================ 
  */

  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(
    null,
  );

  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );

  /* 
  ============================================================ 
  FETCH SUBSCRIPTIONS 
  ============================================================ 
  */

  useEffect(() => {
    let mounted = true;

    const fetchSubscriptions = async () => {
      try {
        setSubscriptionsLoading(true);
        setSubscriptionsError(null);

        const response = await fetch(SUBSCRIPTION_API, {
          method: "GET",

          credentials: "include",

          headers: {
            Accept: "application/json",
          },

          cache: "no-store",
        });

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await response.text();

          throw new Error(
            `Subscription API returned ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        console.log("Subscription API response:", data);

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load subscription plans.",
          );
        }

        if (!mounted) {
          return;
        }

        /* 
        ====================================================== 
        GET PLANS 
        ====================================================== 
        */

        let plans: Subscription[] = [];

        if (Array.isArray(data?.data)) {
          plans = data.data;
        } else if (Array.isArray(data?.data?.subscriptions)) {
          plans = data.data.subscriptions;
        } else if (Array.isArray(data?.subscriptions)) {
          plans = data.subscriptions;
        }

        /* 
        ====================================================== 
        ONLY ACTIVE PLANS 
        ====================================================== 
        */

        plans = plans.filter((plan) => plan?.isActive !== false);

        setSubscriptions(plans);
      } catch (error: any) {
        if (mounted) {
          setSubscriptionsError(
            error?.message || "Failed to load subscription plans.",
          );

          setSubscriptions([]);
        }
      } finally {
        if (mounted) {
          setSubscriptionsLoading(false);
        }
      }
    };

    fetchSubscriptions();

    return () => {
      mounted = false;
    };
  }, []);

  /* 
  ============================================================ 
  API HELPER 
  ============================================================ 
 
  IMPORTANT: 
  Prevent: 
 
  http://localhost:5000http://localhost:5000/... 
 
  ============================================================ 
  */

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    /* 
    ========================================================== 
    NORMALIZE URL 
    ========================================================== 
    */

    const cleanEndpoint = endpoint.trim();

    const requestUrl =
      cleanEndpoint.startsWith("http://") ||
      cleanEndpoint.startsWith("https://")
        ? cleanEndpoint
        : `${API_URL}/${cleanEndpoint.replace(/^\/+/, "")}`;

    console.log("API REQUEST:", requestUrl);

    /* 
    ========================================================== 
    FETCH 
    ========================================================== 
    */

    const response = await fetch(requestUrl, {
      ...options,

      credentials: "include",

      headers: {
        Accept: "application/json",

        /* 
          Only add JSON Content-Type if 
          body is NOT FormData. 
          */

        ...(options.body instanceof FormData
          ? {}
          : {
              "Content-Type": "application/json",
            }),

        ...(options.headers || {}),
      },
    });

    /* 
    ========================================================== 
    READ RESPONSE 
    ========================================================== 
    */

    const text = await response.text();

    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Server returned invalid JSON (${response.status}).`);
    }

    /* 
    ========================================================== 
    ERROR 
    ========================================================== 
    */

    if (!response.ok) {
      throw new Error(
        data?.message || `Request failed with status ${response.status}.`,
      );
    }

    return data;
  };

  /* 
  ============================================================ 
  SELECT SUBSCRIPTION 
  ============================================================ 
  */

  const selectSubscription = async (subscription: Subscription) => {
    try {
      setProcessing(true);

      setSubscriptionMessage(null);
      setMessageType(null);

      setSelectedPlan(subscription);

      setUpgradeInfo(null);

      /* 
      ======================================================== 
      CHECK CURRENT SUBSCRIPTION 
      ======================================================== 
      */

      const data = await apiRequest("/api/user/check-subscription", {
        method: "POST",

        body: JSON.stringify({
          planId: subscription._id,
        }),
      });

      console.log("CHECK SUBSCRIPTION RESPONSE:", data);

      /* 
      ======================================================== 
      CHECK DATA 
      ======================================================== 
      */

      const checkData = data?.data || {};

      /* 
      ======================================================== 
      STORE 
      ======================================================== 
      */

      setUpgradeInfo(checkData);

      /* 
      ======================================================== 
      SHOW PAYMENT OPTIONS 
      ======================================================== 
      */

      setShowPaymentChoice(true);
    } catch (error: any) {
      setSubscriptionMessage(
        error?.message || "Unable to check current subscription.",
      );

      setMessageType("error");

      setSelectedPlan(null);

      setUpgradeInfo(null);
    } finally {
      setProcessing(false);
    }
  };

  /* 
  ============================================================ 
  REQUIRED AMOUNT 
  ============================================================ 
 
  NEW PLAN: 
      full plan amount 
 
  UPGRADE: 
      additionalAmount calculated by backend 
 
  ============================================================ 
  */

  const getRequiredAmount = () => {
    if (!selectedPlan) {
      return 0;
    }

    if (upgradeInfo?.hasActivePlan) {
      return Number(upgradeInfo.additionalAmount || 0);
    }

    return Number(selectedPlan.amount || 0);
  };

  /* 
  ============================================================ 
  REQUIRED PAYMENT 
  ============================================================ 
  */

  const requiredAmount = getRequiredAmount();

  /* 
  ============================================================ 
  AVAILABLE BALANCE 
  ============================================================ 
  */

  const availableBalance = Number(user?.balance ?? 0);

  /* 
  ============================================================ 
  CAN PAY FROM BALANCE 
  ============================================================ 
  */

  const canPayFromBalance =
    availableBalance - Number(upgradeInfo?.currentPlanPrice) >= requiredAmount;

  /* 
  ============================================================ 
  SUBSCRIBE FROM BALANCE 
  ============================================================ 
 
  This API is ONLY called when user chooses 
  "Pay From Current Balance". 
 
  Backend should: 
  - verify balance 
  - verify current plan 
  - calculate amount again 
  - deduct/freeze balance 
  - create pending request 
 
  ============================================================ 
  */

  const subscribeFromBalance = async () => {
    if (!selectedPlan) {
      return;
    }

    /* 
      ======================================================== 
      FRONTEND SAFETY CHECK 
      ======================================================== 
      */

    if (!canPayFromBalance) {
      setSubscriptionMessage(
        `Insufficient balance. You need Rs. ${formatMoney(
          requiredAmount,
        )} but your available balance is Rs. ${formatMoney(availableBalance)}.`,
      );

      setMessageType("error");

      return;
    }

    try {
      setProcessing(true);

      setSubscriptionMessage(null);
      setMessageType(null);

      /* 
        ====================================================== 
        BALANCE API 
        ====================================================== 
        */

      const data = await apiRequest("/api/user/balance-request", {
        method: "POST",

        body: JSON.stringify({
          planId: selectedPlan._id,

          paymentMethod: "balance",
        }),
      });

      console.log("BALANCE REQUEST RESPONSE:", data);

      /* 
        ====================================================== 
        CLOSE MODAL 
        ====================================================== 
        */

      setShowPaymentChoice(false);

      /* 
        ====================================================== 
        SUCCESS 
        ====================================================== 
        */

      setSubscriptionMessage(
        data?.message ||
          "Subscription request submitted successfully. Your balance has been deducted/frozen and the request is pending admin approval.",
      );

      setMessageType("success");

      setSelectedPlan(null);

      setUpgradeInfo(null);
    } catch (error: any) {
      setSubscriptionMessage(
        error?.message || "Unable to submit subscription request.",
      );

      setMessageType("error");
    } finally {
      setProcessing(false);
    }
  };

  /* 
  ============================================================ 
  PAY NOW / DEPOSIT PAGE 
  ============================================================ 
 
  IMPORTANT: 
 
  If normal subscription: 
      amount = selectedPlan.amount 
 
  If upgrade: 
      amount = upgradeInfo.additionalAmount 
 
  We DO NOT send full new plan amount 
  during upgrade. 
 
  ============================================================ 
  */
  const continueToPayment = () => {
    if (!selectedPlan) return;

    const paymentAmount = upgradeInfo?.hasActivePlan
      ? Number(upgradeInfo.additionalAmount || 0)
      : Number(selectedPlan.amount || 0);

    if (!paymentAmount || paymentAmount <= 0) {
      setSubscriptionMessage("Invalid payment amount.");
      setMessageType("error");
      return;
    }

    const params = new URLSearchParams();

    // Open deposit section
    params.set("section", "earnings");
    params.set("deposit", "methods");

    // Plan information
    params.set("planId", selectedPlan._id);
    params.set("amount", String(paymentAmount));
    params.set("planAmount", String(Number(selectedPlan.amount || 0)));
    params.set("planName", selectedPlan.planName || "");

    if (selectedPlan.planImage) {
      params.set("planImage", selectedPlan.planImage);
    }

    params.set("dailyAds", String(Number(selectedPlan.dailyAds || 0)));

    params.set("amountPerAd", String(Number(selectedPlan.amountPerAd || 0)));

    params.set(
      "planTimeLimit",
      String(Number(selectedPlan.planTimeLimit || 0)),
    );

    // Upgrade information
    if (upgradeInfo?.hasActivePlan) {
      params.set("upgrade", "true");

      params.set("currentPlanId", upgradeInfo.currentPlanId || "");

      params.set("currentPlanName", upgradeInfo.currentPlanName || "");

      params.set(
        "currentPlanPrice",
        String(Number(upgradeInfo.currentPlanPrice || 0)),
      );

      params.set(
        "remainingValue",
        String(Number(upgradeInfo.remainingValue || 0)),
      );

      params.set(
        "remainingDays",
        String(Number(upgradeInfo.remainingDays || 0)),
      );

      params.set(
        "additionalAmount",
        String(Number(upgradeInfo.additionalAmount || 0)),
      );
    } else {
      params.set("upgrade", "false");
    }

    // Close modal
    setShowPaymentChoice(false);

    // Go to deposit page
    router.push(`/user/dashboard?${params.toString()}`);
  };

  /* 
  ============================================================ 
  CLOSE PAYMENT MODAL 
  ============================================================ 
  */

  const closePaymentChoice = () => {
    if (processing) {
      return;
    }

    setShowPaymentChoice(false);

    setSelectedPlan(null);

    setUpgradeInfo(null);

    setSubscriptionMessage(null);

    setMessageType(null);
  };

  /* 
  ============================================================ 
  FORMAT MONEY 
  ============================================================ 
  */

  const formatMoney = (value: number) => {
    return Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* 
  ============================================================ 
  RENDER 
  ============================================================ 
  */

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: settings.backgroundColor,

        color: settings.textColor,
      }}
    >
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        {/* ================================================== 
            SUCCESS / ERROR MESSAGE 
        ================================================== */}

        {subscriptionMessage && (
          <div
            className="flex items-start gap-3 rounded-xl border p-4"
            style={{
              backgroundColor:
                messageType === "success"
                  ? "rgba(34,197,94,0.10)"
                  : "rgba(239,68,68,0.10)",

              borderColor:
                messageType === "success"
                  ? "rgba(34,197,94,0.30)"
                  : "rgba(239,68,68,0.30)",

              color: messageType === "success" ? "#16a34a" : "#dc2626",

              borderRadius: settings.borderRadius,
            }}
          >
            {messageType === "success" ? (
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            ) : (
              <CircleAlert size={20} className="mt-0.5 shrink-0" />
            )}

            <p className="text-sm font-medium">{subscriptionMessage}</p>
          </div>
        )}

        {/* ================================================== 
            BALANCE 
        ================================================== */}

        <div
          className="flex items-center justify-center rounded-xl border p-3"
          style={{
            backgroundColor: settings.cardColor,

            borderColor: settings.secondaryColor,

            borderRadius: settings.borderRadius,
          }}
        >
          <p
            className="mr-3 text-lg font-bold"
            style={{
              color: settings.textColor,
            }}
          >
            Available Balance:
          </p>

          <h2
            className="font-bold sm:text-3xl"
            style={{
              color: settings.textColor,
            }}
          >
           {currency === "PKR" ? "Rs": ""} {availableBalance.toFixed(0)}  {currency === "PKR" ? "": "$"}
          </h2>
        </div>

        {/* ================================================== 
            MAIN SUBSCRIPTION CONTAINER 
        ================================================== */}

        <div
          className="rounded-xl p-4"
          style={{
            background: `linear-gradient(to right, ${settings.gradientStart}, ${settings.gradientEnd})`,

            borderRadius: settings.borderRadius,
          }}
        >
          {/* ================================================== 
              TITLE 
          ================================================== */}

          <div className="mb-5 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: settings.cardColor,

                color: settings.primaryColor,

                borderRadius: "9999px",
              }}
            >
              <Crown size={25} />
            </div>

            <h2
              className="mt-3 text-xl font-bold"
              style={{
                color: settings.buttonTextColor,
              }}
            >
              Choose Your Subscription
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color: settings.buttonTextColor,

                opacity: 0.9,
              }}
            >
              Select a plan to continue with your subscription.
            </p>
          </div>

          {/* ================================================== 
              LOADING 
          ================================================== */}

          {subscriptionsLoading && (
            <div
              className="rounded-xl p-8 text-center"
              style={{
                backgroundColor: settings.cardColor,

                borderRadius: settings.borderRadius,
              }}
            >
              <Loader2
                size={28}
                className="mx-auto animate-spin"
                style={{
                  color: settings.primaryColor,
                }}
              />

              <p
                className="mt-3 text-sm"
                style={{
                  color: settings.secondaryColor,
                }}
              >
                Loading subscription plans...
              </p>
            </div>
          )}

          {/* ================================================== 
              ERROR 
          ================================================== */}

          {!subscriptionsLoading && subscriptionsError && (
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: settings.cardColor,

                border: `1px solid ${settings.primaryColor}40`,

                borderRadius: settings.borderRadius,

                color: settings.primaryColor,
              }}
            >
              <div className="flex items-start gap-2">
                <CircleAlert size={18} className="mt-0.5 shrink-0" />

                <div>
                  <p className="font-semibold">Failed to load subscriptions</p>

                  <p className="mt-1 text-xs">{subscriptionsError}</p>
                </div>
              </div>
            </div>
          )}

          {/* ================================================== 
              NO PLANS 
          ================================================== */}

          {!subscriptionsLoading &&
            !subscriptionsError &&
            subscriptions.length === 0 && (
              <div
                className="rounded-xl p-8 text-center"
                style={{
                  backgroundColor: settings.cardColor,

                  border: `1px solid ${settings.secondaryColor}`,

                  borderRadius: settings.borderRadius,
                }}
              >
                <Wallet
                  size={40}
                  className="mx-auto"
                  style={{
                    color: settings.secondaryColor,
                  }}
                />

                <p
                  className="mt-3 font-semibold"
                  style={{
                    color: settings.textColor,
                  }}
                >
                  No subscription plans available
                </p>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: settings.secondaryColor,
                  }}
                >
                  There are currently no active subscription plans.
                </p>
              </div>
            )}

          {/* ================================================== 
              PLANS 
          ================================================== */}

          {!subscriptionsLoading &&
            !subscriptionsError &&
            subscriptions.length > 0 && (
              <div className="space-y-3">
                {subscriptions.map((subscription) => {
                  const hasImage = Boolean(subscription.planImage);

                  /* 
                    ========================================== 
                    IMAGE PLAN 
                    ========================================== 
                    */

                  if (hasImage) {
                    return (
                      <button
                        key={subscription._id}
                        type="button"
                        disabled={processing}
                        onClick={() => selectSubscription(subscription)}
                        className="group block w-full overflow-hidden transition active:scale-[0.99] disabled:opacity-60"
                        style={{
                          borderRadius: settings.borderRadius,

                          border: `1px solid ${settings.secondaryColor}40`,
                        }}
                      >
                        <img
                          src={subscription.planImage}
                          alt={subscription.planName || "Subscription Plan"}
                          className="block max-h-[550px] w-full object-cover transition duration-300 group-hover:scale-[1.01]"
                          loading="lazy"
                        />
                      </button>
                    );
                  }

                  /* 
                    ========================================== 
                    TEXT PLAN 
                    ========================================== 
                    */

                  return (
                    <button
                      key={subscription._id}
                      type="button"
                      disabled={processing}
                      onClick={() => selectSubscription(subscription)}
                      className="w-full rounded-xl border p-5 text-left transition hover:opacity-90 disabled:opacity-60"
                      style={{
                        backgroundColor: settings.cardColor,

                        borderColor: settings.secondaryColor,

                        borderRadius: settings.borderRadius,

                        color: settings.textColor,
                      }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold">
                            {subscription.planName}
                          </h3>

                          <p
                            className="mt-1 text-sm"
                            style={{
                              color: settings.secondaryColor,
                            }}
                          >
                            {subscription.dailyAds} daily ads
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold">
                            Rs. {formatMoney(subscription.amount)}
                          </p>

                          <ArrowRight
                            size={18}
                            className="ml-auto mt-1"
                            style={{
                              color: settings.primaryColor,
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      {/* ==================================================== 
          PAYMENT CHOICE MODAL 
      ==================================================== */}

      {showPaymentChoice && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-5 shadow-2xl"
            style={{
              backgroundColor: settings.cardColor,

              color: settings.textColor,

              borderRadius: settings.borderRadius,
            }}
          >
            {/* ================================================== 
                  MODAL HEADER 
              ================================================== */}

            <div className="flex items-center justify-between">
              <div />

              <h2 className="text-lg font-bold">Subscription</h2>

              <button
                type="button"
                disabled={processing}
                onClick={closePaymentChoice}
                className="rounded-full p-2"
                style={{
                  backgroundColor: `${settings.primaryColor}12`,

                  color: settings.primaryColor,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ================================================== 
                  PLAN INFO 
              ================================================== */}
            {(upgradeInfo?.currentPlanPrice ?? 0) > selectedPlan.amount ? (
              <>
                {upgradeInfo?.hasActivePlan && (
                  <div
                    className="mt-5 rounded-xl border p-4"
                    style={{
                      borderColor: settings.secondaryColor,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={18}
                        style={{
                          color: settings.primaryColor,
                        }}
                      />

                      <p className="text-sm font-bold">
                        You Already Have an Active Plan
                      </p>
                    </div>

                    <p
                      className="mt-2 text-lg font-bold"
                      style={{
                        color: settings.primaryColor,
                      }}
                    >
                      {upgradeInfo.currentPlanName}
                    </p>

                    <div className="mt-3 space-y-2 text-sm">
                      {/* CURRENT PRICE */}

                      <div className="flex justify-between gap-3">
                        <span
                          style={{
                            color: settings.secondaryColor,
                          }}
                        >
                          Current Plan Price
                        </span>

                        <b>
                          Rs.{" "}
                          {formatMoney(
                            Number(upgradeInfo.currentPlanPrice || 0),
                          )}
                        </b>
                      </div>

                      {/* DAYS USED */}

                      <div className="flex justify-between gap-3">
                        <span
                          style={{
                            color: settings.secondaryColor,
                          }}
                        >
                          Days Used
                        </span>

                        <b>
                          {upgradeInfo.usedDays ?? 0} /{" "}
                          {upgradeInfo.totalDays ?? 0}
                        </b>
                      </div>

                      {/* REMAINING DAYS */}

                      <div className="flex justify-between gap-3">
                        <span
                          style={{
                            color: settings.secondaryColor,
                          }}
                        >
                          Remaining Days
                        </span>

                        <b>{upgradeInfo.remainingDays ?? 0}</b>
                      </div>

                      {/* REMAINING VALUE */}

                      <div className="flex justify-between gap-3">
                        <span
                          style={{
                            color: settings.secondaryColor,
                          }}
                        >
                          Remaining Plan Value
                        </span>

                        <b>
                          Rs.{" "}
                          {formatMoney(Number(upgradeInfo.remainingValue || 0))}
                        </b>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {" "}
                <div className="mt-4 text-center">
                  <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${settings.primaryColor}15`,

                      color: settings.primaryColor,
                    }}
                  >
                    <Crown size={28} />
                  </div>

                  <h3 className="mt-3 text-xl font-bold">
                    {selectedPlan.planName}
                  </h3>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: settings.secondaryColor,
                    }}
                  >
                    New Plan Price:{" "}
                    <b
                      style={{
                        color: settings.textColor,
                      }}
                    >
                      Rs. {formatMoney(selectedPlan.amount)}
                    </b>
                  </p>
                </div>
                {/* ================================================== 
                  CURRENT PLAN / UPGRADE 
              ================================================== */}
                {upgradeInfo?.hasActivePlan && (
                  <div
                    className="mt-5 rounded-xl border p-4"
                    style={{
                      borderColor: settings.secondaryColor,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={18}
                        style={{
                          color: settings.primaryColor,
                        }}
                      />

                      <p className="text-sm font-bold">
                        You Already Have an Active Plan
                      </p>
                    </div>

                    <p
                      className="mt-2 text-lg font-bold"
                      style={{
                        color: settings.primaryColor,
                      }}
                    >
                      {upgradeInfo.currentPlanName}
                    </p>

                    <div className="mt-3 space-y-2 text-sm">
                      {/* CURRENT PRICE */}

                      <div className="flex justify-between gap-3">
                        <span
                          style={{
                            color: settings.secondaryColor,
                          }}
                        >
                          Current Plan Price
                        </span>

                        <b>
                          Rs.{" "}
                          {formatMoney(
                            Number(upgradeInfo.currentPlanPrice || 0),
                          )}
                        </b>
                      </div>

                      {/* DAYS USED */}

                      <div className="flex justify-between gap-3">
                        <span
                          style={{
                            color: settings.secondaryColor,
                          }}
                        >
                          Days Used
                        </span>

                        <b>
                          {upgradeInfo.usedDays ?? 0} /{" "}
                          {upgradeInfo.totalDays ?? 0}
                        </b>
                      </div>

                      {/* REMAINING DAYS */}

                      <div className="flex justify-between gap-3">
                        <span
                          style={{
                            color: settings.secondaryColor,
                          }}
                        >
                          Remaining Days
                        </span>

                        <b>{upgradeInfo.remainingDays ?? 0}</b>
                      </div>

                      {/* REMAINING VALUE */}

                      <div className="flex justify-between gap-3">
                        <span
                          style={{
                            color: settings.secondaryColor,
                          }}
                        >
                          Remaining Plan Value
                        </span>

                        <b>
                          Rs.{" "}
                          {formatMoney(Number(upgradeInfo.remainingValue || 0))}
                        </b>
                      </div>

                      {/* ADDITIONAL PAYMENT */}

                      <div
                        className="mt-3 border-t pt-3"
                        style={{
                          borderColor: settings.secondaryColor,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">
                            Additional Amount
                          </span>

                          <b
                            className="text-xl"
                            style={{
                              color: settings.primaryColor,
                            }}
                          >
                            Rs.{" "}
                            {formatMoney(
                              Math.abs(
                                Number(upgradeInfo?.additionalAmount ?? 0) -
                                  Number(
                                    availableBalance -
                                      Number(
                                        upgradeInfo?.currentPlanPrice ?? 0,
                                      ),
                                  ) +
                                  Number(upgradeInfo?.remainingValue ?? 0),
                              ),
                            )}
                          </b>
                        </div>
                      </div>
                    </div>

                    {/* INFO */}

                    <div
                      className="mt-3 rounded-lg p-3 text-xs"
                      style={{
                        backgroundColor: `${settings.primaryColor}10`,
                      }}
                    >
                      Your remaining current-plan value will be adjusted against
                      the new plan. You only need to pay the additional amount
                      shown above.
                    </div>
                  </div>
                )}
                {/* ================================================== 
                  NO ACTIVE PLAN 
              ================================================== */}
                {!upgradeInfo?.hasActivePlan && (
                  <div
                    className="mt-5 rounded-xl p-4"
                    style={{
                      backgroundColor: `${settings.primaryColor}10`,
                    }}
                  >
                    <p className="text-sm font-semibold">
                      You don't have an active subscription.
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: settings.secondaryColor,
                      }}
                    >
                      You need to pay the full plan price to activate this
                      subscription.
                    </p>
                  </div>
                )}
                {/* ================================================== 
                  PAYMENT SUMMARY 
              ================================================== */}
                <div
                  className="mt-4 rounded-xl border p-4"
                  style={{
                    borderColor: settings.secondaryColor,
                  }}
                >
                  <div className="flex justify-between gap-3 text-sm">
                    <span
                      style={{
                        color: settings.secondaryColor,
                      }}
                    >
                      Your Balance
                    </span>

                    <b>
                      Rs.{" "}
                      {formatMoney(
                        availableBalance -
                          Number(upgradeInfo?.currentPlanPrice),
                      )}
                    </b>
                  </div>

                  <div className="mt-2 flex justify-between gap-3 text-sm">
                    <span
                      style={{
                        color: settings.secondaryColor,
                      }}
                    >
                      Amount Required
                    </span>

                    <b
                      style={{
                        color: settings.primaryColor,
                      }}
                    >
                      Rs. {formatMoney(requiredAmount)}
                    </b>
                  </div>

                  <div className="mt-3 border-t pt-3">
                    {canPayFromBalance ? (
                      <p
                        className="text-xs font-medium"
                        style={{
                          color: "#16a34a",
                        }}
                      >
                        ✓ Your balance is enough. You can pay directly from your
                        account balance.
                      </p>
                    ) : (
                      <p
                        className="text-xs font-medium"
                        style={{
                          color: "#dc2626",
                        }}
                      >
                        ✕ Your balance is not enough. Please deposit the
                        required amount and upload payment proof.
                      </p>
                    )}
                  </div>
                </div>
                {/* ================================================== 
                  BALANCE WARNING 
              ================================================== */}
                {!canPayFromBalance && (
                  <div
                    className="mt-4 flex items-start gap-2 rounded-lg p-3 text-xs"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.10)",

                      color: "#dc2626",
                    }}
                  >
                    <CircleAlert size={16} className="mt-0.5 shrink-0" />

                    <p>
                      You need Rs.{" "}
                      {formatMoney(
                        Math.abs(
                          Number(upgradeInfo?.additionalAmount ?? 0) -
                            Number(
                              availableBalance -
                                Number(upgradeInfo?.currentPlanPrice ?? 0),
                            ) +
                            Number(upgradeInfo?.remainingValue ?? 0),
                        ),
                      )}{" "}
                      but your balance is only Rs.{" "}
                      {formatMoney(
                        availableBalance -
                          Number(upgradeInfo?.currentPlanPrice),
                      )}
                      . Use Pay Now to deposit the required amount.
                    </p>
                  </div>
                )}
                {/* ================================================== 
                  PAYMENT OPTIONS 
              ================================================== */}
                <div className="mt-5 space-y-3">
                  {/* ================================================== 
                    BALANCE PAYMENT 
                ================================================== */}

                  <button
                    type="button"
                    disabled={processing || !canPayFromBalance}
                    onClick={subscribeFromBalance}
                    className="w-full border p-4 text-left transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: `linear-gradient(to right, ${settings.gradientStart}, ${settings.gradientEnd})`,

                      color: settings.buttonTextColor,

                      borderColor: settings.secondaryColor,

                      borderRadius: settings.borderRadius,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {processing ? (
                        <Loader2 size={22} className="animate-spin" />
                      ) : (
                        <Wallet size={22} />
                      )}

                      <div className="flex-1">
                        <p className="font-bold">
                          {processing
                            ? "Processing..."
                            : "Pay From Current Balance"}
                        </p>

                        <p className="mt-1 text-xs opacity-80">
                          Required: Rs.{" "}
                         {formatMoney(
  Math.abs(
    Number(upgradeInfo?.additionalAmount ?? 0) -
      Number(
        availableBalance -
          Number(upgradeInfo?.currentPlanPrice ?? 0)
      ) +
      Number(upgradeInfo?.remainingValue ?? 0)
  )
)}
                        </p>

                        <p className="mt-1 text-xs opacity-80">
                          Amount will be deducted/ frozen by the backend.
                        </p>
                      </div>

                      <ArrowRight size={19} />
                    </div>
                  </button>

                  {/* ================================================== 
                    PAY NOW 
                ================================================== */}

                  <button
                    type="button"
                    disabled={processing}
                    onClick={continueToPayment}
                    className="w-full border p-4 text-left transition hover:opacity-90 disabled:opacity-50"
                    style={{
                      backgroundColor: settings.cardColor,

                      borderColor: settings.secondaryColor,

                      color: settings.textColor,

                      borderRadius: settings.borderRadius,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet
                        size={22}
                        style={{
                          color: settings.primaryColor,
                        }}
                      />

                      <div className="flex-1">
                        <p className="font-bold">Pay Now</p>

                        <p
                          className="mt-1 text-xs"
                          style={{
                            color: settings.secondaryColor,
                          }}
                        >
                          Deposit Rs. {formatMoney(requiredAmount)} and upload
                          payment proof.
                        </p>

                        <p
                          className="mt-1 text-xs font-semibold"
                          style={{
                            color: settings.primaryColor,
                          }}
                        >
                          Amount to deposit: Rs. {formatMoney(requiredAmount)}
                        </p>
                      </div>

                      <ArrowRight
                        size={19}
                        style={{
                          color: settings.primaryColor,
                        }}
                      />
                    </div>
                  </button>

                  {/* ================================================== 
                    CANCEL 
                ================================================== */}

                  <button
                    type="button"
                    disabled={processing}
                    onClick={closePaymentChoice}
                    className="w-full py-2 text-sm font-medium"
                    style={{
                      color: settings.secondaryColor,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
