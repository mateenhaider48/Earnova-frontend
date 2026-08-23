"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  User,
  Check,
  X,
  RefreshCw,
  Clock,
  CalendarDays,
  Phone,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// =========================
// API ENDPOINTS
// =========================

const ENDPOINTS = {
  pending: `${API_URL}/api/admin/pending-payments`,

  approve: (id: string) =>
    `${API_URL}/api/admin/approve-payment/${id}`,

  reject: (id: string) =>
    `${API_URL}/api/admin/reject-payment/${id}`,
};

// =========================
// TYPES
// =========================

interface UserData {
  _id: string;
  name?: string;
  cellNo?: string;
}

interface SubscriptionData {
  _id: string;
  planName?: string;
  amount?: number;
  dailyAds?: number;
  amountPerAd?: number;
  planTimeLimit?: number;
}

interface PaymentRequest {
  _id: string;

  user: UserData | string;

  subscription: SubscriptionData | string;

  transactionId: string;

  screenshot?: string;

  status: "pending" | "approved" | "rejected";

  createdAt?: string;

  updatedAt?: string;
}

// =========================
// COMPONENT
// =========================

export default function PaymentRequestsSection() {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  // =========================
  // FETCH PENDING PAYMENTS
  // =========================

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        ENDPOINTS.pending,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "Non JSON response:",
          text
        );

        throw new Error(
          `Server returned ${response.status} ${response.statusText}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch payment requests"
        );
      }

      setPayments(
        Array.isArray(data.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error(
        "Fetch Payment Requests Error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch payment requests"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL FETCH
  // =========================

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // =========================
  // APPROVE PAYMENT
  // =========================

  const handleApprove = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this payment request?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      const response = await fetch(
        ENDPOINTS.approve(id),
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "Non JSON response:",
          text
        );

        throw new Error(
          `Server returned ${response.status} ${response.statusText}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to approve payment"
        );
      }

      toast.success(
        data.message ||
          "Payment approved successfully"
      );

      // Remove from pending list
      setPayments((prev) =>
        prev.filter(
          (payment) =>
            payment._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Approve Payment Error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to approve payment"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================
  // REJECT PAYMENT
  // =========================

  const handleReject = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this payment request?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      const response = await fetch(
        ENDPOINTS.reject(id),
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "Non JSON response:",
          text
        );

        throw new Error(
          `Server returned ${response.status} ${response.statusText}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reject payment"
        );
      }

      toast.success(
        data.message ||
          "Payment rejected successfully"
      );

      // Remove from pending list
      setPayments((prev) =>
        prev.filter(
          (payment) =>
            payment._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Reject Payment Error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reject payment"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================
  // USER HELPER
  // =========================

  const getUser = (
    user: UserData | string
  ): UserData | null => {
    if (
      typeof user === "object" &&
      user !== null
    ) {
      return user;
    }

    return null;
  };

  // =========================
  // SUBSCRIPTION HELPER
  // =========================

  const getSubscription = (
    subscription:
      | SubscriptionData
      | string
  ): SubscriptionData | null => {
    if (
      typeof subscription === "object" &&
      subscription !== null
    ) {
      return subscription;
    }

    return null;
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (
    date?: string
  ) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString(
      "en-PK",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =========================
  // SCREENSHOT URL
  // =========================

  const getScreenshotUrl = (
    screenshot?: string
  ) => {
    if (!screenshot) return null;

    /*
     * Agar backend already complete URL
     * return kar raha hai:
     *
     * https://example.com/uploads/payment.jpg
     *
     * to same URL use hoga.
     */

    if (
      screenshot.startsWith("http://") ||
      screenshot.startsWith("https://")
    ) {
      return screenshot;
    }

    /*
     * Agar backend sirf relative path
     * return karta hai:
     *
     * /uploads/payment.jpg
     *
     * to API URL ke saath combine hoga.
     */

    if (screenshot.startsWith("/")) {
      return `${API_URL}${screenshot}`;
    }

    return `${API_URL}/${screenshot}`;
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw
            size={30}
            className="animate-spin text-gray-700"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading payment requests...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // TOTAL PENDING AMOUNT
  // =========================

  const pendingAmount =
    payments.reduce(
      (total, payment) => {
        const subscription =
          getSubscription(
            payment.subscription
          );

        return (
          total +
          Number(
            subscription?.amount ?? 0
          )
        );
      },
      0
    );

  // =========================
  // RENDER
  // =========================

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Subscription Requests
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage pending subscription
            payments.
          </p>
        </div>

        <button
          onClick={fetchPendingPayments}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ================= STATS ================= */}

      <div className="grid gap-4 sm:grid-cols-2">

        {/* Pending Requests */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Pending Requests
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900">
                {payments.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <Clock
                size={23}
                className="text-yellow-600"
              />
            </div>

          </div>
        </div>

        {/* Pending Amount */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Pending Amount
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900">
                {pendingAmount}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CreditCard
                size={23}
                className="text-green-600"
              />
            </div>

          </div>
        </div>

      </div>

      {/* ================= EMPTY ================= */}

      {payments.length === 0 ? (

        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <CreditCard
              size={28}
              className="text-gray-500"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            No pending requests
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            There are currently no subscription
            payment requests waiting for approval.
          </p>

        </div>

      ) : (

        /* ================= REQUESTS ================= */

        <div className="space-y-5">

          {payments.map(
            (payment) => {

              const user =
                getUser(
                  payment.user
                );

              const subscription =
                getSubscription(
                  payment.subscription
                );

              const screenshot =
                getScreenshotUrl(
                  payment.screenshot
                );

              const isProcessing =
                processingId ===
                payment._id;

              return (
                <div
                  key={payment._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >

                  {/* ================= CARD HEADER ================= */}

                  <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                        <CreditCard
                          size={20}
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Subscription Purchase
                        </h3>

                        <p className="text-xs text-gray-500">
                          Request ID:{" "}
                          {payment._id}
                        </p>
                      </div>

                    </div>

                    <span className="flex w-fit items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700">
                      <Clock size={13} />
                      Pending
                    </span>

                  </div>

                  {/* ================= DETAILS ================= */}

                  <div className="grid gap-6 p-5 lg:grid-cols-2">

                    {/* ================= USER ================= */}

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                      <div className="mb-4 flex items-center gap-2">
                        <User size={18} />

                        <h4 className="font-semibold text-gray-900">
                          User Information
                        </h4>
                      </div>

                      <div className="space-y-4">

                        {/* USER NAME */}

                        <div>
                          <p className="text-xs text-gray-500">
                            Name
                          </p>

                          <p className="mt-0.5 font-semibold text-gray-900">
                            {user?.name ||
                              "N/A"}
                          </p>
                        </div>

                        {/* CELL NUMBER */}

                        {user?.cellNo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">

                            <Phone
                              size={15}
                            />

                            <span>
                              {user.cellNo}
                            </span>

                          </div>
                        )}

                      </div>
                    </div>

                    {/* ================= SUBSCRIPTION ================= */}

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                      <div className="mb-4 flex items-center gap-2">

                        <CreditCard
                          size={18}
                        />

                        <h4 className="font-semibold text-gray-900">
                          Subscription Plan
                        </h4>

                      </div>

                      <div className="space-y-3">

                        {/* PLAN NAME */}

                        <div>
                          <p className="text-xs text-gray-500">
                            Plan
                          </p>

                          <p className="mt-0.5 text-lg font-bold text-gray-900">
                            {subscription?.planName ||
                              "N/A"}
                          </p>
                        </div>

                        {/* PLAN DETAILS */}

                        <div className="grid grid-cols-2 gap-3">

                          <div className="rounded-lg bg-white p-3">

                            <p className="text-xs text-gray-500">
                              Amount
                            </p>

                            <p className="mt-1 font-bold text-gray-900">
                              {subscription?.amount ??
                                0}
                            </p>

                          </div>

                          <div className="rounded-lg bg-white p-3">

                            <p className="text-xs text-gray-500">
                              Daily Ads
                            </p>

                            <p className="mt-1 font-bold text-gray-900">
                              {subscription?.dailyAds ??
                                "N/A"}
                            </p>

                          </div>

                          <div className="rounded-lg bg-white p-3">

                            <p className="text-xs text-gray-500">
                              Amount / Ad
                            </p>

                            <p className="mt-1 font-bold text-gray-900">
                              {subscription?.amountPerAd ??
                                "N/A"}
                            </p>

                          </div>

                          <div className="rounded-lg bg-white p-3">

                            <p className="text-xs text-gray-500">
                              Duration
                            </p>

                            <p className="mt-1 font-bold text-gray-900">
                              {subscription?.planTimeLimit
                                ? `${subscription.planTimeLimit} Days`
                                : "N/A"}
                            </p>

                          </div>

                        </div>

                      </div>
                    </div>

                  </div>

                  {/* ================= TRANSACTION SCREENSHOT ================= */}

                  <div className="border-t border-gray-200 p-5">

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-2">

                        <ImageIcon
                          size={18}
                        />

                        <h4 className="font-semibold text-gray-900">
                          Transaction Screenshot
                        </h4>

                      </div>

                      {screenshot && (
                        <a
                          href={
                            screenshot
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink
                            size={15}
                          />

                          Open Full Image
                        </a>
                      )}

                    </div>

                    {screenshot ? (

                      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">

                        <img
                          src={
                            screenshot
                          }
                          alt="Transaction payment screenshot"
                          className="max-h-[500px] w-full object-contain"
                        />

                      </div>

                    ) : (

                      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">

                        <ImageIcon
                          size={40}
                          className="text-gray-400"
                        />

                        <p className="mt-3 text-sm font-medium text-gray-600">
                          No transaction screenshot
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          User did not upload payment proof.
                        </p>

                      </div>

                    )}

                  </div>

                  {/* ================= PAYMENT INFO ================= */}

                  <div className="border-t border-gray-200 px-5 py-4">

                    <div className="grid gap-4 sm:grid-cols-2">

                      {/* TRANSACTION ID */}

                      <div>

                        <p className="text-xs text-gray-500">
                          Transaction ID
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                          {payment.transactionId ||
                            "N/A"}
                        </p>

                      </div>

                      {/* REQUESTED AT */}

                      <div>

                        <p className="text-xs text-gray-500">
                          Requested At
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-900">

                          <CalendarDays
                            size={14}
                          />

                          {formatDate(
                            payment.createdAt
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* ================= ACTIONS ================= */}

                  <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 p-5 sm:flex-row sm:justify-end">

                    {/* REJECT */}

                    <button
                      type="button"
                      onClick={() =>
                        handleReject(
                          payment._id
                        )
                      }
                      disabled={
                        isProcessing
                      }
                      className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <X size={17} />

                      {isProcessing
                        ? "Processing..."
                        : "Reject"}

                    </button>

                    {/* APPROVE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleApprove(
                          payment._id
                        )
                      }
                      disabled={
                        isProcessing
                      }
                      className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <Check size={17} />

                      {isProcessing
                        ? "Processing..."
                        : "Approve"}

                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}
