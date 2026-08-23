"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  X,
  RefreshCw,
  ReceiptText,
  Smartphone,
  Clock3,
  CircleCheck,
  CircleX,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestType = "deposit" | "withdraw";
type RequestStatus = "pending" | "approved" | "rejected";

interface WalletRequest {
  _id: string;
  user:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
        cellNo?: string;
      };
  type: RequestType;
  amount: number;
  transactionId?: string;
  paymentNumber?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminWalletRequests() {
  const [requests, setRequests] = useState<WalletRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // =========================
  // FETCH REQUESTS
  // =========================

  const fetchRequests = async (showLoader = true) => {
    if (!API_URL) {
      toast.error("API URL is not configured.");
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetch(
        `${API_URL}/api/admin/wallet-requests`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const text = await response.text();

      let data: {
        success?: boolean;
        message?: string;
        data?: WalletRequest[];
      } | null = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server returned an invalid response.");
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to fetch wallet requests. Status: ${response.status}`,
        );
      }

      setRequests(data?.data || []);
    } catch (error) {
      console.error("Fetch wallet requests error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch wallet requests.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchRequests();
  }, []);

  // =========================
  // APPROVE / REJECT
  // =========================

  const handleAction = async (
    request: WalletRequest,
    action: "approve" | "reject",
  ) => {
    if (!API_URL) {
      toast.error("API URL is not configured.");
      return;
    }

    if (request.status !== "pending") {
      toast.error("This request has already been processed.");
      return;
    }

    const actionText =
      action === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this ${request.type} request of Rs. ${Number(
        request.amount,
      ).toLocaleString()}?`,
    );

    if (!confirmed) return;

    try {
      setProcessingId(request._id);

      const response = await fetch(
        `${API_URL}/api/admin/wallet-requests/${request._id}/${action}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      const text = await response.text();

      let data: {
        success?: boolean;
        message?: string;
        data?: WalletRequest;
      } | null = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server returned an invalid response.");
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to ${actionText} request. Status: ${response.status}`,
        );
      }

      toast.success(
        data?.message ||
          `${request.type} request ${action}d successfully.`,
      );

      // Update UI immediately
      if (data?.data) {
        setRequests((prev) =>
          prev.map((item) =>
            item._id === request._id
              ? data.data!
              : item,
          ),
        );
      } else {
        // Fallback
        setRequests((prev) =>
          prev.map((item) =>
            item._id === request._id
              ? {
                  ...item,
                  status:
                    action === "approve"
                      ? "approved"
                      : "rejected",
                }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error(
        `${actionText} wallet request error:`,
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${actionText} request.`,
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================
  // STATUS CONFIG
  // =========================

  const getStatusConfig = (status: RequestStatus) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved",
          icon: <CircleCheck size={13} />,
          className: "text-green-600",
          background: "rgba(34,197,94,0.10)",
        };

      case "rejected":
        return {
          label: "Rejected",
          icon: <CircleX size={13} />,
          className: "text-red-600",
          background: "rgba(239,68,68,0.10)",
        };

      default:
        return {
          label: "Pending",
          icon: <Clock3 size={13} />,
          className: "text-yellow-600",
          background: "rgba(234,179,8,0.10)",
        };
    }
  };

  // =========================
  // USER INFO
  // =========================

  const getUserName = (user: WalletRequest["user"]) => {
    if (typeof user === "string") {
      return user;
    }

    return (
      user?.name ||
      user?.cellNo ||
      user?._id
    );
  };

  // =========================
  // COUNTS
  // =========================

  const pendingCount = requests.filter(
    (request) => request.status === "pending",
  ).length;

  const depositCount = requests.filter(
    (request) => request.type === "deposit",
  ).length;

  const withdrawCount = requests.filter(
    (request) => request.type === "withdraw",
  ).length;

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
              <ReceiptText size={27} />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Wallet Requests
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Review deposit and withdrawal requests submitted
              by users.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchRequests(false)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ========================= */}
        {/* STATS */}
        {/* ========================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <StatCard
            title="Pending Requests"
            value={pendingCount}
            icon={<Clock3 size={21} />}
          />

          <StatCard
            title="Deposit Requests"
            value={depositCount}
            icon={<ArrowDownToLine size={21} />}
          />

          <StatCard
            title="Withdraw Requests"
            value={withdrawCount}
            icon={<ArrowUpFromLine size={21} />}
          />

        </div>

        {/* ========================= */}
        {/* REQUESTS */}
        {/* ========================= */}

        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

          <div className="border-b p-6">
            <h2 className="text-xl font-extrabold">
              All Wallet Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Approve or reject pending requests.
            </p>
          </div>

          <div className="p-6">

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />

                <p className="mt-3 text-sm text-gray-500">
                  Loading wallet requests...
                </p>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <ReceiptText
                    size={28}
                    className="text-gray-500"
                  />
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  No wallet requests
                </h3>

                <p className="mt-1 max-w-md text-sm text-gray-500">
                  Deposit and withdrawal requests from users
                  will appear here.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {requests.map((request,i) => {
                  const status = getStatusConfig(
                    request.status,
                  );

                  const isProcessing =
                    processingId === request._id;

                  return (
                    <div
                      key={i}
                      className="rounded-2xl border p-5 transition hover:shadow-sm"
                    >

                      {/* TOP */}

                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                        {/* REQUEST INFO */}

                        <div className="flex items-start gap-4">

                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                              request.type === "deposit"
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {request.type ===
                            "deposit" ? (
                              <ArrowDownToLine
                                size={22}
                              />
                            ) : (
                              <ArrowUpFromLine
                                size={22}
                              />
                            )}
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-base font-extrabold capitalize">
                                {request.type}
                              </h3>

                              <span
                                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}
                                style={{
                                  backgroundColor:
                                    status.background,
                                }}
                              >
                                {status.icon}
                                {status.label}
                              </span>

                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                              Request ID: {request._id}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              User:{" "}
                              <span className="font-semibold text-gray-700">
                                {getUserName(
                                  request.user,
                                )}
                              </span>
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {new Date(
                                request.createdAt,
                              ).toLocaleString()}
                            </p>

                          </div>
                        </div>

                        {/* AMOUNT */}

                        <div className="xl:text-right">

                          <p className="text-xs text-gray-500">
                            Amount
                          </p>

                          <p className="mt-1 text-2xl font-extrabold">
                            Rs.{" "}
                            {Number(
                              request.amount,
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>

                      {/* DETAILS */}

                      <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3">

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Request Type
                          </p>

                          <p className="mt-1 text-sm font-bold capitalize">
                            {request.type}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {request.type ===
                            "deposit"
                              ? "Transaction ID"
                              : "Payment Number"}
                          </p>

                          <div className="mt-1 flex items-center gap-2">

                            {request.type ===
                            "deposit" ? (
                              <ReceiptText
                                size={15}
                                className="text-gray-400"
                              />
                            ) : (
                              <Smartphone
                                size={15}
                                className="text-gray-400"
                              />
                            )}

                            <p className="break-all text-sm font-semibold">
                              {request.type ===
                              "deposit"
                                ? request.transactionId ||
                                  "N/A"
                                : request.paymentNumber ||
                                  "N/A"}
                            </p>

                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Status
                          </p>

                          <p
                            className={`mt-1 text-sm font-bold capitalize ${status.className}`}
                          >
                            {request.status}
                          </p>
                        </div>

                      </div>

                      {/* ACTIONS */}

                      {request.status ===
                        "pending" && (
                        <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">

                          <button
                            type="button"
                            onClick={() =>
                              handleAction(
                                request,
                                "reject",
                              )
                            }
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X size={17} />

                            {isProcessing
                              ? "Processing..."
                              : "Reject"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleAction(
                                request,
                                "approve",
                              )
                            }
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Check size={17} />
                                Approve
                              </>
                            )}
                          </button>

                        </div>
                      )}

                    </div>
                  );
                })}

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}


/* ========================================================= */
/* STAT CARD */
/* ========================================================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-extrabold">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
          {icon}
        </div>

      </div>

    </div>
  );
}