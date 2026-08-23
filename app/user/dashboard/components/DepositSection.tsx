"use client";

import { useEffect, useState } from "react";
import { useUserTheme } from "./UserThemeProvider";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CopyIcon,
  ImageUp,
  XCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const METHODS_API = `${API_URL}/api/user/payment-settings`;
const CREATE_DEPOSIT_API = `${API_URL}/api/user/deposit/create`;
const HISTORY_API = `${API_URL}/api/user/deposit/history`;
const CURRENCY_API = `${API_URL}/api/user/getCurrency`;

type DepositMethod = {
  _id: string;
  paymentName: string;
  type?: string;
  description?: string;
  paymentImage?: string;
  paymentDetails?: string;
  paymentNetwork?: string;
  paymentQRCode?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  isActive?: boolean;
};

type DepositHistoryItem = {
  _id: string;
  amount: number;
  currency?: string;
  status: string;
  method?: string;
  transactionId?: string;
  createdAt?: string;
};

type AdminCurrency = "USD" | "PKR";

export default function DepositSection({
  user,
}: {
  user: any;
}) {
  const { settings } = useUserTheme();

  const router = useRouter();
  const searchParams = useSearchParams();

  const balance = user?.balance ?? 0;

  /*
  ============================================================
  URL SECTIONS
  ============================================================

  ?section=earnings&deposit=main
  ?section=earnings&deposit=methods
  ?section=earnings&deposit=form
  ?section=earnings&deposit=transaction
  ?section=earnings&deposit=history
  ============================================================
  */

  const depositSection =
    searchParams.get("deposit") || "main";

  /*
  ============================================================
  PLAN DATA
  ============================================================
  */

  const planId =
    searchParams.get("planId");

  const planAmount =
    searchParams.get("planAmount");

  const planName =
    searchParams.get("planName");

  /*
  ============================================================
  CHANGE DEPOSIT SECTION

  IMPORTANT:
  Existing URL params such as:
  planId
  planAmount
  planName
  dailyAds
  amountPerAd
  planTimeLimit
  planImage

  are preserved.
  ============================================================
  */

  const setDepositSection = (
    section: string,
  ) => {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set(
      "section",
      "earnings",
    );

    params.set(
      "deposit",
      section,
    );

    router.replace(
      `?${params.toString()}`,
    );
  };

  /*
  ============================================================
  THEME
  ============================================================
  */

  const primaryColor =
    settings.primaryColor ||
    "var(--user-primary)";

  const secondaryColor =
    settings.secondaryColor ||
    "var(--user-secondary)";

  const backgroundColor =
    settings.backgroundColor ||
    "var(--user-background)";

  const cardColor =
    settings.cardColor ||
    "var(--user-card)";

  const textColor =
    settings.textColor ||
    "var(--user-text)";

  const buttonColor =
    settings.buttonColor ||
    "var(--user-button)";

  const buttonTextColor =
    settings.buttonTextColor ||
    "var(--user-button-text)";

  const borderColor =
    `color-mix(in srgb, ${primaryColor} 25%, transparent)`;

  const gradient =
    `linear-gradient(
      to right,
      ${settings.gradientStart},
      ${settings.gradientEnd}
    )`;

  const buttonStyle = {
    background: gradient,
    color: buttonTextColor,
    borderColor,
    borderRadius:
      "var(--user-radius)",
  };

  const cardStyle = {
    backgroundColor: cardColor,
    borderRadius:
      "var(--user-radius)",
  };

  const inputStyle = {
    color: textColor,
    backgroundColor: cardColor,
    borderColor,
    borderRadius:
      "var(--user-radius)",
  };

  /*
  ============================================================
  CURRENCY
  ============================================================
  */

  const [adminCurrency, setAdminCurrency] =
    useState<AdminCurrency>("PKR");

  const [currencyLoading, setCurrencyLoading] =
    useState(true);

  const currencySign =
    adminCurrency === "USD"
      ? "$"
      : "₨";

  /*
  ============================================================
  STATE
  ============================================================
  */

  const [methods, setMethods] =
    useState<DepositMethod[]>([]);

  const [selectedMethod, setSelectedMethod] =
    useState<DepositMethod | null>(null);

  const [amount, setAmount] =
    useState("");

  const [transactionId, setTransactionId] =
    useState("");

  const [receipt, setReceipt] =
    useState<File | null>(null);

  const [receiptPreview, setReceiptPreview] =
    useState<string | null>(null);

  const [history, setHistory] =
    useState<DepositHistoryItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [methodsLoading, setMethodsLoading] =
    useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  /*
  ============================================================
  COUNTDOWN
  ============================================================
  */

  const [timeLeft, setTimeLeft] =
    useState(15 * 60);

  /*
  ============================================================
  FETCH ADMIN CURRENCY
  ============================================================
  */

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        setCurrencyLoading(true);

        const response = await fetch(
          CURRENCY_API,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept:
                "application/json",
            },
          },
        );

        const contentType =
          response.headers.get(
            "content-type",
          );

        if (
          !contentType?.includes(
            "application/json",
          )
        ) {
          throw new Error(
            `Server returned ${response.status} ${response.statusText}`,
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to get currency.",
          );
        }

        const currencyValue =
          String(
            data?.data?.currency ??
              data?.currency ??
              data?.data ??
              "PKR",
          ).toUpperCase();

        if (
          currencyValue === "USD"
        ) {
          setAdminCurrency("USD");
        } else {
          setAdminCurrency("PKR");
        }
      } catch (err) {
        console.error(
          "Currency Error:",
          err,
        );

        setAdminCurrency("PKR");
      } finally {
        setCurrencyLoading(false);
      }
    };

    fetchCurrency();
  }, []);

  /*
  ============================================================
  RESTORE DEPOSIT DATA

  PLAN AMOUNT HAS PRIORITY.

  Agar user kisi plan se aya hai:
  planAmount -> amount

  Agar planAmount nahi hai:
  sessionStorage -> amount
  ============================================================
  */

  useEffect(() => {
    try {
      const savedMethod =
        sessionStorage.getItem(
          "deposit_selected_method",
        );

      const savedAmount =
        sessionStorage.getItem(
          "deposit_amount",
        );

      const savedTransactionId =
        sessionStorage.getItem(
          "deposit_transaction_id",
        );

      if (savedMethod) {
        setSelectedMethod(
          JSON.parse(savedMethod),
        );
      }

      const numericPlanAmount =
        Number(planAmount);

      if (
        planAmount &&
        !Number.isNaN(
          numericPlanAmount,
        ) &&
        numericPlanAmount > 0
      ) {
        setAmount(
          planAmount,
        );

        sessionStorage.setItem(
          "deposit_amount",
          planAmount,
        );
      } else if (
        savedAmount !== null
      ) {
        setAmount(
          savedAmount,
        );
      }

      if (
        savedTransactionId !==
        null
      ) {
        setTransactionId(
          savedTransactionId,
        );
      }
    } catch (error) {
      console.error(
        "Failed to restore deposit data:",
        error,
      );
    }
  }, [planAmount]);

  /*
  ============================================================
  USDT DETECTION
  ============================================================
  */

  const isUSDT =
    selectedMethod?.paymentName
      ?.toLowerCase()
      .includes("usdt") ||
    selectedMethod?.type
      ?.toLowerCase()
      .includes("usdt") ||
    selectedMethod?.currency
      ?.toLowerCase()
      .includes("usdt");

  const methodCurrency =
    selectedMethod?.currency ||
    (isUSDT
      ? "USDT"
      : adminCurrency);

  /*
  ============================================================
  PAYMENT IMAGE
  ============================================================
  */

  const paymentImage =
    selectedMethod?.paymentImage;

  /*
  ============================================================
  QR CODE
  ============================================================
  */

  const paymentQRCode =
    selectedMethod?.paymentQRCode;

  /*
  ============================================================
  FETCH PAYMENT METHODS
  ============================================================
  */

  useEffect(() => {
    if (currencyLoading) {
      return;
    }

    const fetchMethods = async () => {
      try {
        setMethodsLoading(true);
        setError(null);

        const response = await fetch(
          METHODS_API,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept:
                "application/json",
            },
          },
        );

        const contentType =
          response.headers.get(
            "content-type",
          );

        if (
          !contentType?.includes(
            "application/json",
          )
        ) {
          throw new Error(
            `Server returned ${response.status} ${response.statusText}`,
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load deposit methods.",
          );
        }

        const backendMethods =
          Array.isArray(data?.data)
            ? data.data
            : [];

        const activeMethods =
          backendMethods.filter(
            (
              method: DepositMethod,
            ) =>
              method.isActive !==
              false,
          );

        const filteredMethods =
          activeMethods.filter(
            (
              method: DepositMethod,
            ) => {
              const paymentName =
                method.paymentName?.toLowerCase() ||
                "";

              const type =
                method.type?.toLowerCase() ||
                "";

              const currency =
                method.currency?.toLowerCase() ||
                "";

              const methodIsUSDT =
                paymentName.includes(
                  "usdt",
                ) ||
                type.includes(
                  "usdt",
                ) ||
                currency.includes(
                  "usdt",
                );

              if (
                adminCurrency ===
                "USD"
              ) {
                return methodIsUSDT;
              }

              return !methodIsUSDT;
            },
          );

        setMethods(
          filteredMethods,
        );

        if (selectedMethod) {
          const selectedStillValid =
            filteredMethods.some(
              (
                method: DepositMethod,
              ) =>
                method._id ===
                selectedMethod._id,
            );

          if (
            !selectedStillValid
          ) {
            setSelectedMethod(
              null,
            );

            sessionStorage.removeItem(
              "deposit_selected_method",
            );

            /*
            Plan amount ko remove NAHI karna.
            Agar user plan se aya hai to
            planAmount URL mein available hai.
            */

            if (
              !planAmount
            ) {
              sessionStorage.removeItem(
                "deposit_amount",
              );
            }

            sessionStorage.removeItem(
              "deposit_transaction_id",
            );

            if (
              depositSection ===
                "form" ||
              depositSection ===
                "transaction"
            ) {
              setDepositSection(
                "methods",
              );
            }
          }
        }
      } catch (err: any) {
        console.error(
          "Deposit Methods Error:",
          err,
        );

        setError(
          err?.message ||
            "Failed to load deposit methods.",
        );
      } finally {
        setMethodsLoading(false);
      }
    };

    fetchMethods();
  }, [
    adminCurrency,
    currencyLoading,
  ]);

  /*
  ============================================================
  FETCH HISTORY
  ============================================================
  */

  useEffect(() => {
    if (
      depositSection !==
      "history"
    ) {
      return;
    }

    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        setError(null);

        const response = await fetch(
          HISTORY_API,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept:
                "application/json",
            },
          },
        );

        const contentType =
          response.headers.get(
            "content-type",
          );

        if (
          !contentType?.includes(
            "application/json",
          )
        ) {
          throw new Error(
            `Server returned ${response.status} ${response.statusText}`,
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load deposit history.",
          );
        }

        setHistory(
          Array.isArray(data?.data)
            ? data.data
            : [],
        );
      } catch (err: any) {
        console.error(
          "Deposit History Error:",
          err,
        );

        setError(
          err?.message ||
            "Failed to load deposit history.",
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [depositSection]);

  /*
  ============================================================
  START COUNTDOWN
  ============================================================
  */

  useEffect(() => {
    if (
      depositSection !==
      "transaction"
    ) {
      return;
    }

    setTimeLeft(
      15 * 60,
    );

    const interval =
      setInterval(() => {
        setTimeLeft(
          (previous) => {
            if (
              previous <= 1
            ) {
              clearInterval(
                interval,
              );

              return 0;
            }

            return (
              previous - 1
            );
          },
        );
      }, 1000);

    return () =>
      clearInterval(
        interval,
      );
  }, [depositSection]);

  /*
  ============================================================
  FORMAT COUNTDOWN
  ============================================================
  */

  const minutes =
    Math.floor(
      timeLeft / 60,
    )
      .toString()
      .padStart(2, "0");

  const seconds =
    (timeLeft % 60)
      .toString()
      .padStart(2, "0");

  /*
  ============================================================
  SELECT PAYMENT METHOD

  IMPORTANT:
  Gateway select hote hi planAmount
  automatically amount mein set hoga.
  ============================================================
  */

  const selectMethod = (
    method: DepositMethod,
  ) => {
    setSelectedMethod(
      method,
    );

    const numericPlanAmount =
      Number(planAmount);

    const selectedPlanAmount =
      planAmount &&
      !Number.isNaN(
        numericPlanAmount,
      ) &&
      numericPlanAmount > 0
        ? planAmount
        : "";

    setAmount(
      selectedPlanAmount,
    );

    setTransactionId(
      "",
    );

    setReceipt(null);

    setReceiptPreview(
      null,
    );

    setError(null);

    setSuccess(null);

    sessionStorage.setItem(
      "deposit_selected_method",
      JSON.stringify(
        method,
      ),
    );

    /*
    ============================================================
    PLAN AMOUNT SAVE
    ============================================================
    */

    if (
      selectedPlanAmount
    ) {
      sessionStorage.setItem(
        "deposit_amount",
        selectedPlanAmount,
      );
    } else {
      sessionStorage.removeItem(
        "deposit_amount",
      );
    }

    sessionStorage.removeItem(
      "deposit_transaction_id",
    );

    setDepositSection(
      "form",
    );
  };

  /*
  ============================================================
  RECEIPT CHANGE
  ============================================================
  */

  const handleReceiptChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setError(
        "Please upload an image receipt.",
      );

      return;
    }

    setReceipt(file);

    setReceiptPreview(
      URL.createObjectURL(
        file,
      ),
    );

    setError(null);
  };

  /*
  ============================================================
  CREATE DEPOSIT
  ============================================================
  */

  const createDeposit =
    async () => {
      if (!selectedMethod) {
        setError(
          "Please select a deposit method.",
        );

        return;
      }

      const numericAmount =
        Number(amount);

      if (
        !amount ||
        Number.isNaN(
          numericAmount,
        ) ||
        numericAmount <= 0
      ) {
        setError(
          "Please enter a valid deposit amount.",
        );

        return;
      }

      if (
        selectedMethod.minAmount !==
          undefined &&
        numericAmount <
          selectedMethod.minAmount
      ) {
        setError(
          `Minimum deposit is ${selectedMethod.minAmount} ${methodCurrency}.`,
        );

        return;
      }

      if (
        selectedMethod.maxAmount !==
          undefined &&
        numericAmount >
          selectedMethod.maxAmount
      ) {
        setError(
          `Maximum deposit is ${selectedMethod.maxAmount} ${methodCurrency}.`,
        );

        return;
      }

      /*
      ----------------------------------------------------------
      USDT
      ----------------------------------------------------------
      */

      if (isUSDT) {
        if (
          !transactionId.trim()
        ) {
          setError(
            "Please enter the TRC20 transaction ID.",
          );

          return;
        }
      }

      /*
      ----------------------------------------------------------
      PAKISTAN
      ----------------------------------------------------------
      */

      if (!isUSDT) {
        if (!receipt) {
          setError(
            "Please upload your payment receipt.",
          );

          return;
        }
      }

      try {
        setLoading(true);

        setError(null);

        setSuccess(null);

        const formData =
          new FormData();

      

        formData.append(
          "methodId",
          selectedMethod._id,
        );

        formData.append(
          "amount",
          String(
            numericAmount,
          ),
        );

        /*
        Plan ID backend ko bhi bhej rahe hain
        agar available ho.
        */

        if (planId) {
          formData.append(
            "planId",
            planId,
          );
        }
        console.log(planId)


        if (isUSDT) {
          formData.append(
            "transactionId",
            transactionId.trim(),
          );
        }

        if (
          !isUSDT &&
          receipt
        ) {
          formData.append(
            "receipt",
            receipt,
          );
        }

        const response =
          await fetch(
            CREATE_DEPOSIT_API,
            {
              method: "POST",
              credentials:
                "include",
              body: formData,
            },
          );

        const contentType =
          response.headers.get(
            "content-type",
          );

        if (
          !contentType?.includes(
            "application/json",
          )
        ) {
          throw new Error(
            `Server returned ${response.status} ${response.statusText}`,
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to create deposit.",
          );
        }

        setSuccess(
          data?.message ||
            "Deposit submitted successfully.",
        );

        setAmount("");

        setTransactionId("");

        setReceipt(null);

        setReceiptPreview(
          null,
        );

        sessionStorage.removeItem(
          "deposit_selected_method",
        );

        sessionStorage.removeItem(
          "deposit_amount",
        );

        sessionStorage.removeItem(
          "deposit_transaction_id",
        );

        setTimeout(() => {
          setDepositSection(
            "history",
          );
        }, 1000);
      } catch (err: any) {
        console.error(
          "Create Deposit Error:",
          err,
        );

        setError(
          err?.message ||
            "Failed to submit deposit.",
        );
      } finally {
        setLoading(false);
      }
    };

  /*
  ============================================================
  COPY
  ============================================================
  */

  const copyToClipboard =
    async (
      value?: string,
    ) => {
      if (!value) return;

      try {
        await navigator.clipboard.writeText(
          value,
        );

        setSuccess(
          "Copied successfully.",
        );

        setTimeout(() => {
          setSuccess(null);
        }, 1500);
      } catch {
        setError(
          "Failed to copy.",
        );
      }
    };

  /*
  ============================================================
  INSTRUCTIONS
  ============================================================
  */

  const depositInstructions =
    [
      {
        id: 1,
        title:
          "Minimum Deposit",
        description: `The minimum deposit amount is ${currencySign}10.`,
      },
      {
        id: 2,
        title:
          "Payment Method",
        description:
          "Send your deposit using the selected payment method.",
      },
      {
        id: 3,
        title:
          "Payment Details",
        description:
          "Make sure to use the correct account number or wallet address provided below.",
      },
      {
        id: 4,
        title:
          "Transaction ID",
        description:
          "After completing the payment, enter your transaction ID for verification.",
      },
      {
        id: 5,
        title:
          "Verification",
        description:
          "Your deposit will be reviewed and verified by our team.",
      },
      {
        id: 6,
        title:
          "Processing Time",
        description:
          "Deposits are normally processed within 5–30 minutes.",
      },
      {
        id: 7,
        title:
          "Important",
        description:
          "Do not send funds to an incorrect account or wallet address. Incorrect payments may not be recoverable.",
      },
    ];

  /*
  ============================================================
  RETURN
  ============================================================
  */

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      
      {/* CONTENT */}

      <div className="space-y-2 p-4 sm:p-6 lg:p-8">
        {/* BALANCE */}

        {depositSection !==
          "transaction" && (
          <div
            className="flex items-center justify-center border p-3"
            style={{
              ...cardStyle,
              borderColor,
            }}
          >
            <p
              className="mr-3 text-lg font-bold"
              style={{
                color:
                  primaryColor,
              }}
            >
              Balance:
            </p>

            <h2
              className="font-bold sm:text-3xl"
              style={{
                color:
                  textColor,
              }}
            >
               {currencySign === "$"?"":"Rs"}{" "}
              {Number(
                balance,
              ).toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 0,
                },
              )}     {currencySign === "$"?"$":""}
            </h2>
          </div>
        )}
        {/* MAIN */}

        {depositSection ===
          "main" && (
          <>
            <div
              className="grid p-2"
              style={
                cardStyle
              }
            >
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() =>
                    setDepositSection(
                      "methods",
                    )
                  }
                  className="h-8 w-full border text-sm font-semibold"
                  style={
                    buttonStyle
                  }
                >
                  Deposit
                </button>

                <button
                  onClick={() =>
                    setDepositSection(
                      "history",
                    )
                  }
                  className="h-8 w-full border text-sm font-semibold"
                  style={
                    buttonStyle
                  }
                >
                  Deposit History
                </button>
              </div>
            </div>

            <div
              className="grid gap-2 p-2"
              style={
                cardStyle
              }
            >
              <div className="flex gap-4">
                <h1
                  className="h-8 w-full border pt-1 text-center text-sm font-semibold"
                  style={
                    buttonStyle
                  }
                >
                  Instructions
                </h1>

                <button
                  onClick={() =>
                    router.push(
                      "/user/dashboard",
                    )
                  }
                  className="h-8 w-full border text-sm font-semibold"
                  style={
                    buttonStyle
                  }
                >
                  Back
                </button>
              </div>

              {depositInstructions.map(
                (
                  item,
                  i,
                ) => (
                  <div
                    key={
                      item.id
                    }
                    className="mb-1 text-left"
                  >
                    <h3
                      className="font-semibold"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      {i + 1}.{" "}
                      {
                        item.title
                      }
                    </h3>

                    <p
                      className="text-sm"
                      style={{
                        color:
                          secondaryColor,
                      }}
                    >
                      {
                        item.description
                      }
                    </p>
                  </div>
                ),
              )}
            </div>
          </>
        )}

        {/* METHODS */}

        {depositSection ===
          "methods" && (
          <div
            className="grid gap-2 p-2"
            style={
              cardStyle
            }
          >
            <h1
              className="mb-2 text-center font-bold"
              style={{
                color:
                  textColor,
              }}
            >
              Deposit Methods
            </h1>

            {currencyLoading ||
            methodsLoading ? (
              <div className="py-10 text-center">
                <p
                  style={{
                    color:
                      secondaryColor,
                  }}
                >
                  Loading deposit methods...
                </p>
              </div>
            ) : methods.length ===
              0 ? (
              <div className="py-10 text-center">
                <p
                  style={{
                    color:
                      secondaryColor,
                  }}
                >
                  {adminCurrency ===
                  "USD"
                    ? "No USDT deposit methods available."
                    : "No Pakistan deposit methods available."}
                </p>
              </div>
            ) : (
              methods.map(
                (
                  method,
                ) => (
                  <button
                    key={
                      method._id
                    }
                    onClick={() =>
                      selectMethod(
                        method,
                      )
                    }
                  >
                    <div
                      className="mb-2 overflow-hidden border"
                      style={{
                        borderColor,
                        borderRadius:
                          "var(--user-radius)",
                      }}
                    >
                      <div
                        className="flex items-center justify-center gap-4 p-4"
                        style={{
                          background:
                            gradient,
                        }}
                      >
                        <div className="h-12 w-12 shrink-0">
                          {method.paymentImage ? (
                            <img
                              className="h-full w-full rounded-lg object-cover"
                              src={
                                method.paymentImage
                              }
                              alt={
                                method.paymentName
                              }
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center rounded-lg text-xs font-bold"
                              style={{
                                backgroundColor:
                                  cardColor,
                                color:
                                  primaryColor,
                              }}
                            >
                              {method.paymentName
                                ?.charAt(
                                  0,
                                )
                                .toUpperCase()}
                            </div>
                          )}
                        </div>

                        <span className="flex-1">
                          <p
                            className="text-left text-md font-semibold"
                            style={{
                              color:
                                buttonTextColor,
                            }}
                          >
                            {
                              method.paymentName
                            }
                          </p>

                          <p
                            className="text-left text-xs"
                            style={{
                              color:
                                buttonTextColor,
                            }}
                          >
                            {method.description ||
                              `Deposit using ${method.paymentName}`}
                          </p>
                        </span>

                        <ArrowRight
                          size={
                            16
                          }
                          style={{
                            color:
                              buttonTextColor,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                ),
              )
            )}

            <button
              onClick={() =>
                setDepositSection(
                  "main",
                )
              }
              className="h-8 w-full border text-sm font-semibold"
              style={
                buttonStyle
              }
            >
              Back
            </button>
          </div>
        )}

        {/* FORM */}

        {depositSection ===
          "form" &&
          selectedMethod && (
            <div
              className="grid gap-2 p-2"
              style={
                cardStyle
              }
            >
              <p
                className="p-2 text-left text-lg"
                style={{
                  color:
                    textColor,
                }}
              >
                Deposit Amount
              </p>

              <input
                type="number"
                value={
                  amount
                }
                onChange={(
                  e,
                ) => {
                  const value =
                    e.target
                      .value;

                  setAmount(
                    value,
                  );

                  sessionStorage.setItem(
                    "deposit_amount",
                    value,
                  );
                }}
                placeholder={
                  isUSDT
                    ? "Enter USDT amount"
                    : "Please Enter the deposit amount"
                }
                required
                min={
                  selectedMethod.minAmount ||
                  1
                }
                max={
                  selectedMethod.maxAmount
                }
                step={
                  isUSDT
                    ? "0.000001"
                    : "1"
                }
                className="w-full border px-2 py-2 text-sm outline-none"
                style={
                  inputStyle
                }
              />

              {(selectedMethod.minAmount !==
                undefined ||
                selectedMethod.maxAmount !==
                  undefined) && (
                <p
                  className="px-2 text-xs"
                  style={{
                    color:
                      secondaryColor,
                  }}
                >
                  {selectedMethod.minAmount !==
                    undefined &&
                    `Minimum: ${currencySign}${selectedMethod.minAmount}`}

                  {selectedMethod.maxAmount !==
                    undefined &&
                    ` | Maximum: ${currencySign}${selectedMethod.maxAmount}`}
                </p>
              )}

              <p
                className="p-2 text-left text-lg"
                style={{
                  color:
                    textColor,
                }}
              >
                Deposit Platform
              </p>

              <div
                className="w-full rounded-lg bg-gray-200 px-2 py-2 text-center"
                style={{
                  borderColor,
                }}
              >
                <p
                  className="mb-3 text-md font-semibold"
                  style={{
                    color:
                      textColor,
                  }}
                >
                  {selectedMethod.paymentName.toUpperCase()}
                </p>

                {paymentImage && (
                  <img
                    src={
                      paymentImage
                    }
                    alt={
                      selectedMethod.paymentName
                    }
                    className="mx-auto rounded-xl border object-cover"
                    style={{
                      borderColor,
                    }}
                  />
                )}

                <p
                  className="mt-3 text-sm"
                  style={{
                    color:
                      secondaryColor,
                  }}
                >
                  Currency:{" "}
                  <strong>
                    {isUSDT
                      ? "USDT"
                      : adminCurrency}
                  </strong>
                </p>
              </div>

              <div className="mt-3 flex items-center justify-center gap-4">
                <button
                  onClick={() =>
                    setDepositSection(
                      "transaction",
                    )
                  }
                  disabled={
                    !amount ||
                    Number(
                      amount,
                    ) <= 0
                  }
                  className="h-8 w-full border text-sm font-semibold disabled:opacity-50"
                  style={
                    buttonStyle
                  }
                >
                  Deposit Now
                </button>

                <button
                  onClick={() => {
                    setSelectedMethod(
                      null,
                    );

                    sessionStorage.removeItem(
                      "deposit_selected_method",
                    );

                    /*
                    Plan amount ko preserve
                    karo agar plan selected hai.
                    */

                    if (
                      !planAmount
                    ) {
                      sessionStorage.removeItem(
                        "deposit_amount",
                      );
                    }

                    sessionStorage.removeItem(
                      "deposit_transaction_id",
                    );

                    setDepositSection(
                      "methods",
                    );
                  }}
                  className="h-8 w-full border text-sm font-semibold"
                  style={
                    buttonStyle
                  }
                >
                  Back
                </button>
              </div>
            </div>
          )}

        {/* TRANSACTION */}

        {depositSection ===
          "transaction" &&
          selectedMethod && (
            <div
              className="grid gap-2 p-2"
              style={
                cardStyle
              }
            >
              {/* WARNING */}

              <div className="flex gap-4">
                <CircleAlert
                  size={
                    28
                  }
                  style={{
                    color:
                      "#FE0032",
                  }}
                />

                <p
                  className="text-lg font-bold"
                  style={{
                    color:
                      "#FE0032",
                  }}
                >
                  {isUSDT
                    ? "Warning"
                    : "Warning (وارننگ)"}
                </p>
              </div>

              {/* PAKISTAN WARNING */}

              {!isUSDT && (
                <p
                  className="mt-2 text-center text-md"
                  style={{
                    color:
                      "#FE0032",
                  }}
                >
                  Please use the same wallet to
                  pay and upload the payment
                  receipt to avoid payment
                  failure. Please make payment to
                  the account number below.
                  <br />
                  <br />
                  ادائیگی کرنے کے لیے براہ کرم وہی
                  والٹ استعمال کریں اور ادائیگی کی
                  رسید اپ لوڈ کریں۔ براہ کرم نیچے
                  دیئے گئے اکاؤنٹ نمبر پر ادائیگی
                  کریں۔
                </p>
              )}

              {/* USDT WARNING */}

              {isUSDT && (
                <p
                  className="mt-2 text-center text-md"
                  style={{
                    color:
                      "#FE0032",
                  }}
                >
                  Please make your payment only
                  to the USDT TRC20 wallet shown
                  below. Verify the wallet address
                  and QR code carefully before
                  sending your funds. After
                  payment, enter your TRC20
                  transaction ID for verification.
                </p>
              )}

              {/* PAYMENT DETAILS */}

              <div
                className={`mt-3 rounded-xl bg-gray-200 ${
                  isUSDT
                    ? ""
                    : "px-3 py-4"
                }`}
                style={{
                  borderColor,
                }}
              >
                {/* PAKISTAN ACCOUNT */}

                {!isUSDT &&
                  selectedMethod.paymentDetails && (
                    <div className="flex justify-between pt-3">
                      <p
                        className="text-md"
                        style={{
                          color:
                            textColor,
                        }}
                      >
                        Wallet
                      </p>

                      <div className="flex max-w-[70%] items-center gap-2">
                        <div className="h-6 w-6 rounded-lg">
                          <img
                            src={
                              paymentImage
                            }
                            alt="paymentimage"
                          />
                        </div>

                        <p
                          className="break-all text-right text-md"
                          style={{
                            color:
                              textColor,
                          }}
                        >
                          {
                            selectedMethod.paymentName
                          }
                        </p>
                      </div>
                    </div>
                  )}

                {!isUSDT &&
                  selectedMethod.paymentDetails && (
                    <div className="flex justify-between pt-3">
                      <p
                        className="text-md"
                        style={{
                          color:
                            textColor,
                        }}
                      >
                        Account
                      </p>

                      <div className="flex max-w-[70%] items-center gap-2">
                        <p
                          className="break-all text-right text-md"
                          style={{
                            color:
                              textColor,
                          }}
                        >
                          <u>
                            {
                              selectedMethod.paymentDetails
                            }
                          </u>
                        </p>

                        <button
                          onClick={() =>
                            copyToClipboard(
                              selectedMethod.paymentDetails,
                            )
                          }
                          style={{
                            color:
                              primaryColor,
                          }}
                        >
                          <CopyIcon
                            size={
                              18
                            }
                          />
                        </button>
                      </div>
                    </div>
                  )}

                {/* USDT QR CODE */}

                {isUSDT && (
                  <>
                    {paymentQRCode ? (
                      <div>
                        <img
                          src={
                            paymentQRCode
                          }
                          alt="USDT TRC20 QR Code"
                          className="mx-auto h-full w-full rounded-xl border bg-white object-contain"
                          style={{
                            borderColor,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="py-5 text-center">
                        <p
                          className="text-sm"
                          style={{
                            color:
                              "#FE0032",
                          }}
                        >
                          USDT QR code is
                          not available.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* AMOUNT */}

                {!isUSDT && (
                  <div className="flex justify-between pt-4">
                    <p
                      className="text-md italic"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      Amount
                    </p>

                    <p
                      className="text-md"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      {currencySign}{" "}
                      <span
                        className="text-lg font-semibold"
                        style={{
                          color:
                            "#166534",
                        }}
                      >
                        {Number(
                          amount ||
                            0,
                        ).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          },
                        )}
                      </span>
                    </p>
                  </div>
                )}

                {/* COUNTDOWN */}

                {!isUSDT && (
                  <div className="flex justify-between pb-3 pt-3">
                    <p
                      className="text-md"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      Countdown
                    </p>

                    <p
                      className="text-md font-bold"
                      style={{
                        color:
                          "#FE0032",
                      }}
                    >
                      {timeLeft ===
                      0
                        ? "Expired"
                        : `${minutes}:${seconds}`}
                    </p>
                  </div>
                )}
              </div>

              {/* USDT DETAILS */}

              {isUSDT && (
                <>
                  <div className="flex justify-between pt-3">
                    <p
                      className="text-md italic"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      Network
                    </p>

                    <p
                      className="break-all text-right text-md italic"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      {
                        selectedMethod.paymentNetwork
                      }
                    </p>
                  </div>

                  {/* WALLET ADDRESS */}

                  <div className="flex flex-col pt-3">
                    <p
                      className="text-md italic"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      Wallet Address
                    </p>

                    <div className="flex items-center">
                      <p
                        className="rounded-xl bg-gray-100 text-left text-xs"
                        style={{
                          color:
                            textColor,
                        }}
                        title={
                          selectedMethod.paymentDetails
                        }
                      >
                        {
                          selectedMethod.paymentDetails
                        }
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            selectedMethod.paymentDetails,
                          )
                        }
                        style={{
                          color:
                            primaryColor,
                        }}
                        className="shrink-0 rounded-lg p-2 italic transition hover:bg-gray-100"
                      >
                        <CopyIcon
                          size={
                            20
                          }
                        />
                      </button>
                    </div>
                  </div>

                  {/* USDT AMOUNT */}

                  <div className="flex justify-between pt-4">
                    <p
                      className="text-md italic"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      Amount
                    </p>

                    <p
                      className="text-sm"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      USDT{" "}
                      <span
                        className="text-lg font-semibold italic"
                        style={{
                          color:
                            "#166534",
                        }}
                      >
                        {Number(
                          amount ||
                            0,
                        ).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 6,
                          },
                        )}
                      </span>
                    </p>
                  </div>

                  <div className="flex justify-between pb-3 pt-3">
                    <p
                      className="text-md italic"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      Countdown
                    </p>

                    <p
                      className="text-md font-bold italic"
                      style={{
                        color:
                          "#FE0032",
                      }}
                    >
                      {timeLeft ===
                      0
                        ? "Expired"
                        : `${minutes}:${seconds}`}
                    </p>
                  </div>
                </>
              )}

              {/* TRANSACTION ID */}

              {isUSDT ? (
                <div className="mt-4">
                  <p
                    className="mb-2 text-lg"
                    style={{
                      color:
                        textColor,
                    }}
                  >
                    TRC20 Transaction ID
                  </p>

                  <input
                    type="text"
                    value={
                      transactionId
                    }
                    onChange={(
                      e,
                    ) => {
                      const value =
                        e.target
                          .value;

                      setTransactionId(
                        value,
                      );

                      sessionStorage.setItem(
                        "deposit_transaction_id",
                        value,
                      );
                    }}
                    placeholder="Enter TRC20 transaction ID"
                    className="w-full border px-3 py-2 text-sm outline-none"
                    style={
                      inputStyle
                    }
                  />
                </div>
              ) : null}

              {/* PAKISTAN RECEIPT */}

              {!isUSDT && (
                <div className="mt-4">
                  <p className="text-lg text-[#FC4E8A]">
                    📍 Upload image (ایک تصویر
                    اپ لوڈ کریں)
                  </p>

                  <label
                    className="mx-auto mt-2 flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed"
                    style={{
                      borderColor:
                        primaryColor,
                    }}
                  >
                    {receiptPreview ? (
                      <img
                        src={
                          receiptPreview
                        }
                        alt="Receipt Preview"
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      <>
                        <ImageUp
                          size={
                            30
                          }
                          style={{
                            color:
                              primaryColor,
                          }}
                        />

                        <p
                          className="mt-2 text-center"
                          style={{
                            color:
                              primaryColor,
                          }}
                        >
                          Upload Receipt
                        </p>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={
                        handleReceiptChange
                      }
                    />
                  </label>
                </div>
              )}

              {/* USDT NOTE */}

              {isUSDT && (
                <p
                  className="mt-3 text-center text-sm"
                  style={{
                    color:
                      secondaryColor,
                  }}
                >
                  After sending USDT through
                  TRC20, enter the transaction ID
                  above. No receipt image is
                  required for USDT.
                </p>
              )}

              {/* CONFIRM */}

              <button
                onClick={
                  createDeposit
                }
                disabled={
                  loading ||
                  timeLeft === 0
                }
                className="mt-4 h-8 w-full border text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                style={
                  buttonStyle
                }
              >
                {loading
                  ? "Submitting..."
                  : timeLeft ===
                    0
                    ? "Time Expired"
                    : "Confirm"}
              </button>

              {/* BACK */}

              <button
                onClick={() =>
                  setDepositSection(
                    "form",
                  )
                }
                disabled={
                  loading
                }
                className="mt-2 h-8 w-full border text-sm font-semibold disabled:opacity-50"
                style={
                  buttonStyle
                }
              >
                Back
              </button>
            </div>
          )}

        {/* HISTORY */}

        {depositSection ===
          "history" && (
          <div
            className="grid gap-2 p-2"
            style={
              cardStyle
            }
          >
            <h1
              className="mb-3 text-center font-bold"
              style={{
                color:
                  textColor,
              }}
            >
              Deposit History
            </h1>

            {historyLoading ? (
              <div className="py-10 text-center">
                <p
                  style={{
                    color:
                      secondaryColor,
                  }}
                >
                  Loading history...
                </p>
              </div>
            ) : history.length ===
              0 ? (
              <div className="py-10 text-center">
                <p
                  style={{
                    color:
                      secondaryColor,
                  }}
                >
                  No deposit history available.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map(
                  (
                    item,
                  ) => (
                    <div
                      key={
                        item._id
                      }
                      className="border bg-gray-200 p-3"
                      style={{
                        borderColor,
                        borderRadius:
                          "var(--user-radius)",
                      }}
                    >
                      <div className="flex justify-between">
                        <p
                          className="font-semibold"
                          style={{
                            color:
                              textColor,
                          }}
                        >
                          {item.method?.toLocaleUpperCase() ||
                            "Deposit"}
                        </p>

                        <p
                          className="font-bold"
                          style={{
                            color:
                              primaryColor,
                          }}
                        >
                          {item.currency
                            ?.toUpperCase() ===
                          "USDT"
                            ? "USDT"
                            : currencySign}{" "}
                          {Number(
                            item.amount,
                          ).toLocaleString(
                            undefined,
                            {
                              maximumFractionDigits:
                                item.currency
                                  ?.toUpperCase() ===
                                "USDT"
                                  ? 6
                                  : 2,
                            },
                          )}
                        </p>
                      </div>

                      <div className="mt-1 flex justify-between gap-2">
                        {item.createdAt && (
                          <p
                            className="mt-1 text-xs"
                            style={{
                              color:
                                secondaryColor,
                            }}
                          >
                            {new Date(
                              item.createdAt,
                            ).toLocaleString()}
                          </p>
                        )}

                        <p className="shrink-0 text-xs font-semibold">
                          {statusBadge(
                            item.status as
                              | "pending"
                              | "approved"
                              | "rejected",
                          )}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            <button
              onClick={() =>
                setDepositSection(
                  "main",
                )
              }
              className="h-8 w-full border text-sm font-semibold"
              style={
                buttonStyle
              }
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected";

const statusBadge = (
  status: PaymentStatus,
) => {
  if (
    status ===
    "approved"
  ) {
    return (
      <span
        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
        style={{
          backgroundColor:
            "rgba(34,197,94,0.15)",
          color:
            "#16a34a",
        }}
      >
        <CheckCircle2
          size={12}
        />
        Approved
      </span>
    );
  }

  if (
    status ===
    "rejected"
  ) {
    return (
      <span
        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
        style={{
          backgroundColor:
            "rgba(239,68,68,0.15)",
          color:
            "#dc2626",
        }}
      >
        <XCircle
          size={12}
        />
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
        color:
          "#ca8a04",
      }}
    >
      <Clock3
        size={12}
      />
      Pending
    </span>
  );
};
