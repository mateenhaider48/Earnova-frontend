"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  Wallet,
  XCircle,
} from "lucide-react";

import { useUserTheme } from "./UserThemeProvider";

/*
============================================================
API
============================================================
*/

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/*
============================================================
TYPES
============================================================
*/


type CurrencyType = "USD" | "PKR";

type WithdrawMethod = {
  _id: string;
  paymentName?: string | null;
  paymentImage?: string | null;
  type?: "jazzcash" | "easypaisa" | "usdt" | "bank";
  description?: string;
  network?: string;
  minAmount?: number;
  maxAmount?: number;
  icon?: string;
  isActive?: boolean;
};

type WithdrawalAccount = {
  _id?: string;
  methodId: string;
  methodName: string;
  accountNumber?: string;
  walletAddress?: string;
  accountName?: string;
};

type Withdrawal = {
  _id: string;
  method: string;
  methodId?: string;
  amount: number;
  accountNumber?: string;
  walletAddress?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectionReason?: string;
};

type Step =
  | "main"
  | "methods"
  | "account"
  | "amount"
  | "confirm"
  | "success"
  | "history";

/*
============================================================
COMPONENT
============================================================
*/

export default function WithdrawSection({
  user,
}: {
  user: any;
}) {
  /*
  ============================================================
  THEME
  ============================================================
  */
  const { settings } = useUserTheme();
  const primaryColor =
    settings.primaryColor || "var(--user-primary)";

  const secondaryColor =
    settings.secondaryColor || "var(--user-secondary)";

  const backgroundColor =
    settings.backgroundColor || "var(--user-background)";

  const cardColor =
    settings.cardColor || "var(--user-card)";

  const textColor =
    settings.textColor || "var(--user-text)";

  const buttonColor =
    settings.buttonColor || "var(--user-button)";

  const buttonTextColor =
    settings.buttonTextColor || "var(--user-button-text)";

  const borderColor = `color-mix(in srgb, ${primaryColor} 25%, transparent)`;

  const gradient = `linear-gradient(
    to right,
    ${settings.gradientStart},
    ${settings.gradientEnd}
  )`;

  const buttonStyle = {
    background: gradient,
    color: buttonTextColor,
    borderColor,
    borderRadius: "var(--user-radius)",
  };

  const cardStyle = {
    backgroundColor: cardColor,
    borderRadius: "var(--user-radius)",
  };

  const inputStyle = {
    color: textColor,
    backgroundColor: cardColor,
    borderColor,
    borderRadius: "var(--user-radius)",
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  /*
  ============================================================
  CURRENCY
  ============================================================
  */

  const [currency, setCurrency] =
    useState<CurrencyType>("USD");

  const [currencyLoading, setCurrencyLoading] =
    useState(true);

  /*
  ============================================================
  CURRENCY SYMBOL
  ============================================================
  */

  const currencySymbol =
    currency === "PKR" ? "₨" : "$";

  /*
  ============================================================
  BALANCE
  ============================================================
  */

  const balance = Number(user?.balance ?? 50);

  /*
  ============================================================
  CURRENT STEP
  ============================================================
  */

  const rawStep = searchParams.get("withdraw");

  const currentStep: Step =
    rawStep &&
    [
      "main",
      "methods",
      "account",
      "amount",
      "confirm",
      "success",
      "history",
    ].includes(rawStep)
      ? (rawStep as Step)
      : "main";

  /*
  ============================================================
  STATE
  ============================================================
  */

  const [methods, setMethods] =
    useState<WithdrawMethod[]>([]);

  const [selectedMethod, setSelectedMethod] =
    useState<WithdrawMethod | null>(null);

  const [savedAccount, setSavedAccount] =
    useState<WithdrawalAccount | null>(null);

  const [accountValue, setAccountValue] =
    useState("");

  const [accountName, setAccountName] =
    useState("");

  const [withdrawAmount, setWithdrawAmount] =
    useState("");

  const [history, setHistory] =
    useState<Withdrawal[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [methodsLoading, setMethodsLoading] =
    useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  /*
  ============================================================
  API HELPER
  ============================================================
  */

  const apiRequest = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    if (!API_URL) {
      throw new Error(
        "NEXT_PUBLIC_API_URL is not configured."
      );
    }

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/json",
          ...(options.headers || {}),
        },
      }
    );

    const text = await response.text();

    let data: any = null;

    try {
      data = text
        ? JSON.parse(text)
        : null;
    } catch {
      throw new Error(
        `Server returned invalid JSON (${response.status}).`
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Something went wrong."
      );
    }

    return data;
  };

  /*
  ============================================================
  GET CURRENCY
  ============================================================
  */

  const fetchCurrency = async () => {
    try {
      setCurrencyLoading(true);

      const data = await apiRequest(
        "/api/user/getCurrency",
        {
          method: "GET",
        }
      );

      const currentCurrency =
        data?.data?.currency;

      if (
        currentCurrency === "USD" ||
        currentCurrency === "PKR"
      ) {
        setCurrency(currentCurrency);
      } else {
        setCurrency("USD");
      }
    } catch (error) {
      console.error(
        "fetchCurrency error:",
        error
      );

      setCurrency("USD");
    } finally {
      setCurrencyLoading(false);
    }
  };

  /*
  ============================================================
  GET WITHDRAW METHODS
  ============================================================
  */

  const fetchMethods = async () => {
    try {
      setMethodsLoading(true);
      setMessage(null);

      const data = await apiRequest(
        "/api/user/withdrawl/method",
        {
          method: "GET",
        }
      );

      /*
      Possible API responses:

      {
        success: true,
        data: [...]
      }

      OR

      {
        success: true,
        data: {
          methods: [...]
        }
      }
      */

      const apiMethods =
        Array.isArray(data?.data)
          ? data.data
          : Array.isArray(
                data?.data?.methods
              )
            ? data.data.methods
            : [];
      console.log(apiMethods)
      setMethods(apiMethods);
    } catch (error) {
      console.error(
        "fetchMethods error:",
        error
      );

      setMethods([]);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load withdrawal methods."
      );
    } finally {
      setMethodsLoading(false);
    }
  };

  /*
  ============================================================
  GET WITHDRAWAL HISTORY
  ============================================================
  */

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);

      const data = await apiRequest(
        "/api/user/withdrawal/history",
        {
          method: "GET",
        }
      );

      const apiHistory =
        Array.isArray(data?.data)
          ? data.data
          : Array.isArray(
                data?.data?.withdrawals
              )
            ? data.data.withdrawals
            : [];

      setHistory(apiHistory);
    } catch (error) {
      console.error(
        "fetchHistory error:",
        error
      );

      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  /*
  ============================================================
  INITIAL LOAD
  ============================================================
  */

  useEffect(() => {
    fetchCurrency();
    fetchMethods();
    fetchHistory();
  }, []);

  /*
  ============================================================
  LOAD ACCOUNT
  ============================================================
  */

  const fetchAccount = async (
    methodId: string
  ) => {
    try {
      setLoading(true);
      setMessage(null);

      const data = await apiRequest(
        `/api/user/withdrawal/account/${methodId}`,
        {
          method: "GET",
        }
      );

      const account =
        data?.data?.account ||
        data?.data ||
        null;

      if (account) {
        setSavedAccount(account);

        setAccountValue(
          account.accountNumber ||
            account.walletAddress ||
            ""
        );

        setAccountName(
          account.accountName || ""
        );
      } else {
        setSavedAccount(null);
        setAccountValue("");
        setAccountName("");
      }
    } catch (error) {
      /*
      Account not found should not block
      the user from creating a new account.
      */

      console.log(
        "No saved account:",
        error
      );

      setSavedAccount(null);
      setAccountValue("");
      setAccountName("");
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const goTo = (step: Step) => {
    router.push(
      `/user/dashboard?section=withdraw&withdraw=${step}`
    );
  };

  /*
  ============================================================
  SELECT METHOD
  ============================================================
  */

  const selectMethod = async (
    method: WithdrawMethod
  ) => {
    setSelectedMethod(method);

    setMessage(null);
    setSuccessMessage(null);

    await fetchAccount(method._id);

    goTo("account");
  };

  /*
  ============================================================
  SAVE ACCOUNT
  ============================================================
  */

  const saveAccount = async () => {
    if (!selectedMethod) {
      setMessage(
        "Please select withdrawal method."
      );

      return;
    }

    if (!accountValue.trim()) {
      setMessage(
        selectedMethod.type === "usdt"
          ? "Please enter your USDT wallet address."
          : "Please enter account number."
      );

      return;
    }

    if (
      selectedMethod.type !== "usdt" &&
      !accountName.trim()
    ) {
      setMessage(
        "Please enter account holder name."
      );

      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const payload: WithdrawalAccount = {
        methodId:
          selectedMethod._id,

        methodName:
          selectedMethod?.paymentName ?? "",

        accountNumber:
          selectedMethod.type !== "usdt"
            ? accountValue.trim()
            : undefined,

        walletAddress:
          selectedMethod.type === "usdt"
            ? accountValue.trim()
            : undefined,

        accountName:
          selectedMethod.type !== "usdt"
            ? accountName.trim()
            : undefined,
      };

      const data = await apiRequest(
        "/api/user/withdrawal/account",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const account =
        data?.data?.account ||
        data?.data ||
        payload;

      setSavedAccount(account);

      goTo("amount");
    } catch (error) {
      console.error(
        "saveAccount error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save withdrawal account."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  AMOUNT VALIDATION
  ============================================================
  */

  const continueAmount = () => {
    setMessage(null);

    if (!selectedMethod) {
      setMessage(
        "Withdrawal method is missing."
      );

      return;
    }

    if (!savedAccount) {
      setMessage(
        "Please setup your withdrawal account first."
      );

      return;
    }

    const amount = Number(
      withdrawAmount
    );

    const minimum =
      Number(
        selectedMethod.minAmount
      ) || 10;

    const maximum =
      Number(
        selectedMethod.maxAmount
      ) || 0;

    if (!amount || amount <= 0) {
      setMessage(
        "Please enter a valid amount."
      );

      return;
    }

    if (amount < minimum) {
      setMessage(
        `Minimum withdrawal amount is ${currencySymbol}${minimum}.`
      );

      return;
    }

    if (
      maximum > 0 &&
      amount > maximum
    ) {
      setMessage(
        `Maximum withdrawal amount is ${currencySymbol}${maximum}.`
      );

      return;
    }

    if (amount > balance) {
      setMessage(
        "Insufficient balance."
      );

      return;
    }

    goTo("confirm");
  };

  /*
  ============================================================
  SUBMIT WITHDRAWAL
  ============================================================
  */

  const submitWithdrawal = async () => {
    setMessage(null);

    if (!selectedMethod) {
      setMessage(
        "Withdrawal method is missing."
      );

      return;
    }

    if (!savedAccount) {
      setMessage(
        "Withdrawal account is missing."
      );

      return;
    }

    const amount = Number(
      withdrawAmount
    );

    if (!amount || amount <= 0) {
      setMessage(
        "Invalid withdrawal amount."
      );

      return;
    }

    if (amount > balance) {
      setMessage(
        "Insufficient balance."
      );

      return;
    }

    try {
      setLoading(true);

      const payload = {
        methodId:
          selectedMethod._id,

        amount,

        accountNumber:
          savedAccount.accountNumber,

        walletAddress:
          savedAccount.walletAddress,

        accountName:
          savedAccount.accountName,
      };

      const data = await apiRequest(
        "/api/user/withdrawal/create",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      setSuccessMessage(
        data?.message ||
          "Withdrawal request submitted successfully."
      );

      setWithdrawAmount("");

      await fetchHistory();

      goTo("success");
    } catch (error) {
      console.error(
        "submitWithdrawal error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit withdrawal request."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  DISPLAY ACCOUNT
  ============================================================
  */

  const displayAccount =
    savedAccount?.accountNumber ||
    savedAccount?.walletAddress ||
    accountValue ||
    "-";

  /*
  ============================================================
  STATUS BADGE
  ============================================================
  */

  const statusBadge = (
    status: Withdrawal["status"]
  ) => {
    if (status === "approved") {
      return (
        <span
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
          style={{
            backgroundColor:
              "rgba(34,197,94,0.15)",
            color: "#16a34a",
          }}
        >
          <CheckCircle2 size={12} />
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
          style={{
            backgroundColor:
              "rgba(239,68,68,0.15)",
            color: "#dc2626",
          }}
        >
          <XCircle size={12} />
          Rejected
        </span>
      );
    }

    return (
      <span
        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
        style={{
          backgroundColor:
            "rgba(234,179,8,0.15)",
          color: "#ca8a04",
        }}
      >
        <Clock3 size={12} />
        Pending
      </span>
    );
  };

  /*
  ============================================================
  THEME STYLES
  ============================================================
  */


  /*
  ============================================================
  LOADING CURRENCY
  ============================================================
  */

  if (currencyLoading) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center"
        style={{
          backgroundColor:
            "var(--user-background)",
          color:
            "var(--user-text)",
        }}
      >
        <div className="text-sm">
          Loading withdrawal settings...
        </div>
      </div>
    );
  }

  /*
  ============================================================
  UI
  ============================================================
  */

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor:
          "var(--user-background)",
        color:
          "var(--user-text)",
      }}
    >
    

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="space-y-3 p-4 sm:p-6 lg:p-8">

        {/* ==================================================
            BALANCE
        ================================================== */}

        {currentStep !== "success" && (
          <div
            className="flex items-center justify-center border p-3"
            style={cardStyle}
          >
            <p
              className="mr-3 text-lg font-bold"
              style={{
                color:
                  "var(--user-primary)",
              }}
            >
              Available Balance:
            </p>

            <h2
              className="font-bold sm:text-3xl"
              style={{
                color:
                 "var(--user-primary)",
              }}
            >
             {currencySymbol} {" "}
              {Number(balance).toFixed(3)}
            </h2>
          </div>
        )}

        {/* ==================================================
            MESSAGE
        ================================================== */}

        {message && (
          <div
            className="flex items-start gap-2 rounded-lg p-3 text-sm"
            style={{
              backgroundColor:
                "rgba(239,68,68,0.12)",
              color:
                "#dc2626",
              borderRadius:
                "var(--user-radius)",
            }}
          >
            <CircleAlert
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{message}</span>
          </div>
        )}

        {/* ==================================================
            MAIN
        ================================================== */}

        {currentStep === "main" && (
          <div
            className="p-3"
            style={cardStyle}
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  goTo("methods");
                }}
                className="h-9 w-full border text-sm font-semibold"
                style={buttonStyle}
              >
                Withdraw
              </button>

              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  goTo("history");
                }}
                className="h-9 w-full border text-sm font-semibold"
                style={buttonStyle}
              >
                Withdrawal History
              </button>
            </div>

            <div className="mt-4">
              <h2
                className="mb-3 py-2 text-center text-sm font-semibold"
                style={buttonStyle}
              >
                Withdrawal Instructions
              </h2>

              <div className="space-y-2">
                <p className="text-sm">
                  <b>1. Withdrawal Method:</b>{" "}
                  Select any available withdrawal
                  method.
                </p>

                <p className="text-sm">
                  <b>2. Account:</b>{" "}
                  Your withdrawal account is
                  saved once and reused.
                </p>

                <p className="text-sm">
                  <b>3. Amount:</b>{" "}
                  Enter the amount you want
                  to withdraw.
                </p>

                <p className="text-sm">
                  <b>4. Verification:</b>{" "}
                  Admin will review your request.
                </p>

                <p className="text-sm">
                  <b>5. Status:</b>{" "}
                  Track Pending, Approved or
                  Rejected from history.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/user/dashboard")
              }
              className="mt-4 h-9 w-full border text-sm"
              style={buttonStyle}
            >
              Back
            </button>
          </div>
        )}

        {/* ==================================================
            METHODS
        ================================================== */}

        {currentStep === "methods" && (
          <div
            className="p-4"
            style={cardStyle}
          >
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  goTo("main")
                }
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>

              <h2 className="flex-1 text-center font-bold">
                Withdrawal Methods
              </h2>

              <div className="w-9" />
            </div>

            {methodsLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading withdrawal methods...
              </div>
            ) : methods.filter(
                (method) =>
                  method.isActive !== false
              ).length === 0 ? (
              <div className="py-12 text-center">
                <Wallet
                  size={45}
                  className="mx-auto text-gray-400"
                />

                <p className="mt-3 font-semibold text-gray-600">
                  No withdrawal methods available.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {methods
                  .filter(
                    (method) =>
                      method.isActive !== false
                  )
                  .map((method) => (
                    <button
                      key={method._id}
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        selectMethod(method)
                      }
                      className="flex w-full items-center gap-3 border p-4 text-left transition hover:opacity-90 disabled:opacity-50"
                      style={{
                        
                        background: gradient,
                    
                        color:
                          "var(--user-button-text)",
                        borderRadius:
                          "var(--user-radius)",
                      }}
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden"
                        style={{
                          backgroundColor:
                            "var(--user-card)",
                          borderRadius:
                            "var(--user-radius)",
                        }}
                      >
                        {method.paymentImage || method.icon ? (
                          <img
                            src={method.paymentImage || method.icon || ""}
                            alt={method.paymentName || "Withdrawal method"}
                            className="h-10 w-10 object-contain"
                          />
                        ) : (
                          <span
                            className="text-sm font-bold"
                            style={{
                              color:
                                "var(--user-primary)",
                            }}
                          >
                            {(method.paymentName || "WM")
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {method.paymentName || "Withdrawal Method"}
                        </p>

                        <p className="text-xs opacity-80">
                          {method.description ||
                            `Withdraw through ${method.paymentName || "Withdrawal Method"}`}
                        </p>

                        {method.network && (
                          <p className="mt-1 text-xs font-medium">
                            Network:{" "}
                            {method.network}
                          </p>
                        )}

                        <p className="mt-1 text-xs opacity-80">
                          Minimum:{" "}
                          {currencySymbol}
                          {method.minAmount ||
                            10}
                        </p>

                        {method.maxAmount && (
                          <p className="text-xs opacity-80">
                            Maximum:{" "}
                            {currencySymbol}
                            {method.maxAmount}
                          </p>
                        )}
                      </div>

                      <ArrowRight
                        size={20}
                        className="shrink-0"
                      />
                    </button>
                  ))}

                <button
                  type="button"
                  onClick={() =>
                    goTo("main")
                  }
                  className="mt-4 h-9 w-full border text-sm"
                  style={buttonStyle}
                >
                  Back
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================
            ACCOUNT
        ================================================== */}

        {currentStep === "account" &&
          selectedMethod && (
            <div
              className="p-4"
              style={cardStyle}
            >
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    goTo("methods")
                  }
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <ArrowLeft size={20} />
                </button>

                <h2 className="flex-1 text-center font-bold">
                  {selectedMethod.paymentName} Account
                </h2>

                <div className="w-9" />
              </div>

              {savedAccount ? (
                <>
                  <div
                    className="border p-4"
                    style={{
                      backgroundColor:
                        "rgba(34,197,94,0.08)",
                      borderColor:
                        "rgba(34,197,94,0.35)",
                      borderRadius:
                        "var(--user-radius)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={20}
                        className="text-green-600"
                      />

                      <p className="font-semibold text-green-700">
                        Saved Account
                      </p>
                    </div>

                    <div className="mt-3 flex gap-4">
                      <p className="text-sm font-semibold">
                        {selectedMethod.type ===
                        "usdt"
                          ? "USDT Wallet Address"
                          : "Number"}
                        :
                      </p>

                      <p className="break-all font-semibold">
                        {displayAccount}
                      </p>
                    </div>

                    {savedAccount.accountName && (
                      <p className="mt-2 text-sm font-semibold">
                        Name:{" "}
                        <b>
                          {
                            savedAccount.accountName
                          }
                        </b>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      goTo("amount")
                    }
                    className="mt-4 h-9 w-full border text-sm font-semibold"
                    style={buttonStyle}
                  >
                    Continue
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSavedAccount(null);
                      setAccountValue("");
                      setAccountName("");
                    }}
                    className="mt-2 h-9 w-full border text-sm font-semibold"
                    style={buttonStyle}
                  >
                    Change Account
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="mb-4 p-3 text-sm"
                    style={{
                      backgroundColor:
                        "rgba(59,130,246,0.10)",
                      color:
                        "#2563eb",
                      borderRadius:
                        "var(--user-radius)",
                    }}
                  >
                    Set your withdrawal account.
                    You only need to do this once.
                    It will be reused for future
                    withdrawals.
                  </div>

                  {selectedMethod.type ===
                  "usdt" ? (
                    <>
                      <label className="mb-2 block text-sm font-semibold">
                        USDT Wallet Address
                      </label>

                      <input
                        type="text"
                        value={accountValue}
                        onChange={(e) =>
                          setAccountValue(
                            e.target.value
                          )
                        }
                        placeholder="Enter USDT wallet address"
                        className="w-full border px-3 py-2 text-sm outline-none"
                        style={inputStyle}
                      />
                    </>
                  ) : (
                    <>
                      <label className="mb-2 block text-sm font-semibold">
                        Account Number
                      </label>

                      <input
                        type="text"
                        value={accountValue}
                        onChange={(e) =>
                          setAccountValue(
                            e.target.value
                          )
                        }
                        placeholder="03XXXXXXXXX"
                        className="w-full border px-3 py-2 text-sm outline-none"
                        style={inputStyle}
                      />

                      <label className="mb-2 mt-4 block text-sm font-semibold">
                        Account Holder Name
                      </label>

                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) =>
                          setAccountName(
                            e.target.value
                          )
                        }
                        placeholder="Enter account holder name"
                        className="w-full border px-3 py-2 text-sm outline-none"
                        style={inputStyle}
                      />
                    </>
                  )}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={saveAccount}
                    className="mt-4 h-9 w-full border text-sm font-semibold disabled:opacity-50"
                    style={buttonStyle}
                  >
                    {loading
                      ? "Saving..."
                      : "Save & Continue"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      goTo("methods")
                    }
                    className="mt-2 h-9 w-full border bg-gray-100 text-sm text-gray-700"
                    style={{
                      borderRadius:
                        "var(--user-radius)",
                    }}
                  >
                    Back
                  </button>
                </>
              )}
            </div>
          )}

        {/* ==================================================
            AMOUNT
        ================================================== */}

        {currentStep === "amount" &&
          selectedMethod && (
            <div
              className="p-4"
              style={cardStyle}
            >
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    goTo("account")
                  }
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <ArrowLeft size={20} />
                </button>

                <h2 className="flex-1 text-center font-bold">
                  Withdrawal Amount
                </h2>

                <div className="w-9" />
              </div>

              <div
                className="p-3"
                style={{
                  background:
                    gradient,
                  borderRadius:
                    "var(--user-radius)",
                }}
              >
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500"
                  style={{
                    color: buttonTextColor
                  }}>
                    Method
                  </span>

                  <b
                   style={{
                    color: buttonTextColor
                  }} className="text-sm">
                    {selectedMethod.paymentName}
                  </b>
                </div>

                <div className="mt-2 flex justify-between gap-3">
                  <span 
                   style={{
                    color: buttonTextColor
                  }}
                  className="text-sm text-gray-500">
                    Account
                  </span>

                  <span
                   style={{
                    color: buttonTextColor
                  }} 
                  className="max-w-[65%] break-all text-right text-sm font-semibold">
                    {displayAccount}
                  </span>
                </div>

              
              </div>

              <label className="mb-2 mt-5 block text-sm font-semibold">
                Enter Amount
              </label>

              <input
                type="number"
                min={
                  selectedMethod.minAmount ||
                  10
                }
                max={Math.min(
                  balance,
                  selectedMethod.maxAmount ||
                    balance
                )}
                value={withdrawAmount}
                onChange={(e) =>
                  setWithdrawAmount(
                    e.target.value
                  )
                }
                placeholder="Enter withdrawal amount"
                className="w-full border px-3 py-3 text-sm outline-none"
                style={inputStyle}
              />

              <p className="mt-2 text-xs text-gray-500">
                Minimum:{" "}
                {currencySymbol}
                {selectedMethod.minAmount ||
                  10}

                {selectedMethod.maxAmount
                  ? ` | Maximum: ${currencySymbol}${selectedMethod.maxAmount}`
                  : ""}
              </p>

              <button
                type="button"
                onClick={continueAmount}
                className="mt-4 h-9 w-full border text-sm font-semibold"
                style={buttonStyle}
              >
                Continue
              </button>

              <button
                type="button"
                onClick={() =>
                  goTo("account")
                }
                className="mt-2 h-9 w-full border bg-gray-100 text-sm text-gray-700"
                style={{
                  borderRadius:
                    "var(--user-radius)",
                }}
              >
                Back
              </button>
            </div>
          )}

        {/* ==================================================
            CONFIRM
        ================================================== */}

        {currentStep === "confirm" &&
          selectedMethod && (
            <div
              className="p-4"
              style={cardStyle}
            >
              <div className="mb-4 flex items-center gap-3">
                <CircleAlert
                  size={28}
                  style={{
                    color:
                      "var(--user-primary)",
                  }}
                />

                <div>
                  <h2 className="font-bold">
                    Confirm Withdrawal
                  </h2>

                  <p className="text-xs text-gray-500">
                    Please check all details.
                  </p>
                </div>
              </div>

              <div
                className="p-4"
                style={{
                  background:
                    gradient,
                  borderRadius:
                    "var(--user-radius)",
                }}
              >
                <div 
                  style={{
                  color:buttonTextColor
                }}
              
                className="flex justify-between border-b pb-3">
                  <span 
                    style={{
                  color:buttonTextColor
                }}
                className="text-sm text-gray-500">
                    Method
                  </span>

                  <b>
                    {selectedMethod.paymentName}
                  </b>
                </div>

                <div 
                  style={{
                  color:buttonTextColor
                }}
                className="flex justify-between gap-3 border-b py-3">
                  <span 
                    style={{
                  color:buttonTextColor
                }}
                className="text-sm text-gray-500">
                    Account
                  </span>

                  <div   style={{
                  color:buttonTextColor
                }}className="flex max-w-[65%] gap-2">
                    <span className="break-all text-right text-sm font-semibold">
                      {displayAccount}
                    </span>

                    {displayAccount !==
                      "-" && (
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            displayAccount
                          )
                        }
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div   style={{
                  color:buttonTextColor
                }}
                className="flex justify-between border-b py-3">
                  <span   style={{
                  color:buttonTextColor
                }}
                 className="text-sm text-gray-500">
                    Amount
                  </span>

                  <b
                    className="text-lg"
                     style={{
                  color:buttonTextColor
                }}
                  >
                    {currencySymbol}
                    {withdrawAmount}
                  </b>
                </div>

                <div   style={{
                  color:buttonTextColor
                }}
                className="flex justify-between pt-3">
                  <span 
                    style={{
                  color:buttonTextColor
                }}
                className="text-sm text-gray-500">
                    Remaining Balance
                  </span>

                  <b   style={{
                  color:buttonTextColor
                }}>
                    {currencySymbol}
                    {Math.max(
                      0,
                      balance -
                        Number(
                          withdrawAmount ||
                            0
                        )
                    )}
                  </b>
                </div>
              </div>

              <div
                className="mt-4 p-3 text-xs"
                style={{
                  backgroundColor:
                    "rgba(234,179,8,0.10)",
                  color:
                    "#ca8a04",
                  borderRadius:
                    "var(--user-radius)",
                }}
              >
                Your withdrawal request will be
                reviewed by the admin.
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={submitWithdrawal}
                className="mt-4 h-10 w-full border text-sm font-semibold disabled:opacity-50"
                style={buttonStyle}
              >
                {loading
                  ? "Submitting..."
                  : "Confirm Withdrawal"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  goTo("amount")
                }
                className="mt-2 h-9 w-full border bg-gray-100 text-sm text-gray-700"
                style={{
                  borderRadius:
                    "var(--user-radius)",
                }}
              >
                Back
              </button>
            </div>
          )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {currentStep === "success" && (
          <div
            className="p-6 text-center"
            style={cardStyle}
          >
            <CheckCircle2
              size={70}
              className="mx-auto text-green-500"
            />

            <h2 className="mt-4 text-xl font-bold">
              Withdrawal Request Submitted
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {successMessage ||
                "Your withdrawal request has been submitted successfully."}
            </p>

            <p
              className="mt-4 p-3 text-sm"
              style={{
                backgroundColor:
                  "rgba(234,179,8,0.10)",
                color:
                  "#ca8a04",
                borderRadius:
                  "var(--user-radius)",
              }}
            >
              Status: <b>Pending</b>
            </p>

            <button
              type="button"
              onClick={() => {
                setMessage(null);
                fetchHistory();
                goTo("history");
              }}
              className="mt-4 h-9 w-full border text-sm font-semibold"
              style={buttonStyle}
            >
              View Withdrawal Status
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/user/dashboard"
                )
              }
              className="mt-2 h-9 w-full border bg-gray-100 text-sm text-gray-700"
              style={{
                borderRadius:
                  "var(--user-radius)",
              }}
            >
              Dashboard
            </button>
          </div>
        )}

        {/* ==================================================
            HISTORY
        ================================================== */}

        {currentStep === "history" && (
          <div
            className="p-4"
            style={cardStyle}
          >
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  goTo("main")
                }
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>

              <h2 className="flex-1 text-center font-bold">
                Withdrawal History
              </h2>

              <div className="w-9" />
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading withdrawal history...
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center">
                <Clock3
                  size={40}
                  className="mx-auto text-gray-400"
                />

                <p className="mt-3 text-sm text-gray-500">
                  No withdrawal history available.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="border p-2"
                    style={{
                      backgroundColor:
                        "var(--user-card)",
                      borderColor:
                        "rgba(0,0,0,0.10)",
                      borderRadius:
                        "var(--user-radius)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-xs">
                          {item.method}
                        </p>

                        <p className="text-xs text-gray-500">
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>

                      {statusBadge(
                        item.status
                      )}
                    </div>

                    <div className="mt-1 flex justify-between">
                      <span className="text-sm text-gray-500">
                        Amount
                      </span>

                      <b
                        style={{
                          color:
                            "var(--user-primary)",
                        }}
                      >
                        {currencySymbol}
                        {item.amount}
                      </b>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-sm text-gray-500">
                        Account
                      </span>

                      <span className="max-w-[65%] break-all text-right text-sm">
                        {item.accountNumber ||
                          item.walletAddress ||
                          "-"}
                      </span>
                    </div>

                    {item.rejectionReason && (
                      <div
                        className="mt-3 p-2 text-xs"
                        style={{
                          backgroundColor:
                            "rgba(239,68,68,0.10)",
                          color:
                            "#dc2626",
                          borderRadius:
                            "var(--user-radius)",
                        }}
                      >
                        Reason:{" "}
                        {item.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                goTo("main")
              }
              className="mt-4 h-9 w-full border text-sm"
              style={buttonStyle}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}