"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Crown,
} from "lucide-react";
import toast from "react-hot-toast";

// ============================================================
// PLAN TYPE
// ============================================================

type SubscriptionPlan = {
  _id?: string;
  planName?: string;
  amount?: number;
  dailyAds?: number;
  amountPerAd?: number;
  planTimeLimit?: number;
};

// ============================================================
// TYPE
// ============================================================

type DepositRequest = {
  _id: string;

  status?: string;

  amount?: number;

  currency?: string;

  user?: {
    _id?: string;
    name?: string;
    email?: string;
    cellNo?: string;
    balance?: number;
  } | null;

  paymentMethod?: {
    _id?: string;
    name?: string;
    paymentName?: string;
    paymentImage?: string;
    paymentNetwork?: string;
    paymentDetails?: string;
  } | null;

  method?: {
    _id?: string;
    paymentName?: string;
    paymentImage?: string;
    paymentNetwork?: string;
    paymentDetails?: string;
  } | null;

  gateway?: string;

  transactionId?: string;

  transaction?: string;

  transactionDisplay?: string;

  screenshot?: string;

  // ==========================================================
  // SUBSCRIPTION PLAN
  // ==========================================================

  planId?: SubscriptionPlan | string | null;

  subscription?: SubscriptionPlan | string | null;

  createdAt?: string;

  updatedAt?: string;

  depositNumber?: string;

  [key: string]: any;
};

// ============================================================
// API
// ============================================================

const api = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

// ============================================================
// PROPS
// ============================================================

type Props = {
  activeSection:
    | "deposit-all"
    | "deposit-pending"
    | "deposit-rejected"
    | "deposit-successful";
};

// ============================================================
// COMPONENT
// ============================================================

export default function DepositRequestsSection({
  activeSection,
}: Props) {
  // ==========================================================
  // ALL
  // ==========================================================

  const [all, setAll] =
    useState<DepositRequest[]>([]);

  // ==========================================================
  // PENDING
  // ==========================================================

  const [pending, setPending] =
    useState<DepositRequest[]>([]);

  // ==========================================================
  // APPROVED
  // ==========================================================

  const [approved, setApproved] =
    useState<DepositRequest[]>([]);

  // ==========================================================
  // REJECTED
  // ==========================================================

  const [rejected, setRejected] =
    useState<DepositRequest[]>([]);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  // ==========================================================
  // ERROR
  // ==========================================================

  const [error, setError] =
    useState("");

  // ==========================================================
  // ACTION LOADING
  // ==========================================================

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  // ==========================================================
  // FETCH DEPOSITS
  // ==========================================================

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${api}/api/admin/deposits/requests`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          },
        );

      const result =
        await response.json();

      console.log(
        "ADMIN DEPOSIT REQUESTS:",
        result,
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to load deposits.",
        );
      }

      setAll(
        result?.data?.all || [],
      );

      setPending(
        result?.data?.pending || [],
      );

      setApproved(
        result?.data?.approved || [],
      );

      setRejected(
        result?.data?.rejected || [],
      );
    } catch (error: any) {
      console.error(
        "fetchDeposits error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to load deposits.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchDeposits();
  }, []);

  // ==========================================================
  // APPROVE / REJECT
  // ==========================================================

  const updateDepositStatus = async (
    requestId: string,
    status:
      | "approved"
      | "rejected",
  ) => {
    try {
      setActionLoading(
        `${requestId}-${status}`,
      );

      const response =
        await fetch(
          `${api}/api/admin/deposits/${requestId}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({
              status,
            }),
          },
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Failed to ${status} deposit.`,
        );
      }

      toast.success(
        status === "approved"
          ? "Deposit approved successfully."
          : "Deposit rejected successfully.",
      );

      await fetchDeposits();
    } catch (error: any) {
      console.error(
        "updateDepositStatus error:",
        error,
      );

      toast.error(
        error?.message ||
          `Failed to ${status} deposit.`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================================
  // CURRENT DATA
  // ==========================================================

  const currentData =
    activeSection ===
    "deposit-pending"
      ? pending
      : activeSection ===
          "deposit-rejected"
        ? rejected
        : activeSection ===
            "deposit-successful"
          ? approved
          : all;

  // ==========================================================
  // TITLE
  // ==========================================================

  const title =
    activeSection ===
    "deposit-pending"
      ? "Pending Deposits"
      : activeSection ===
          "deposit-rejected"
        ? "Rejected Deposits"
        : activeSection ===
            "deposit-successful"
          ? "Successful Deposits"
          : "All Deposit Requests";

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2
            size={20}
            className="animate-spin"
          />

          Loading deposits...
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Failed to load deposits
        </h2>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={fetchDeposits}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="w-full min-w-0 space-y-5">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">

        <div className="min-w-0">
          <h2 className="truncate text-2xl font-bold text-gray-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage deposit requests and
            subscription payments.
          </p>
        </div>

        {/* ==================================================
            COUNTS
        ================================================== */}

        <div className="flex shrink-0 flex-wrap gap-2">

          {/* ALL */}

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2">
            <p className="text-xs text-gray-500">
              All
            </p>

            <p className="text-lg font-bold text-gray-900">
              {all.length}
            </p>
          </div>

          {/* PENDING */}

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2">
            <p className="text-xs text-gray-500">
              Pending
            </p>

            <p className="text-lg font-bold text-orange-500">
              {pending.length}
            </p>
          </div>

          {/* SUCCESSFUL */}

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2">
            <p className="text-xs text-gray-500">
              Successful
            </p>

            <p className="text-lg font-bold text-green-600">
              {approved.length}
            </p>
          </div>

          {/* REJECTED */}

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2">
            <p className="text-xs text-gray-500">
              Rejected
            </p>

            <p className="text-lg font-bold text-red-500">
              {rejected.length}
            </p>
          </div>

        </div>
      </div>

      {/* ====================================================
          TABLE
      ==================================================== */}

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* IMPORTANT:
            Table ko parent ke bahar nahi jane dena.
        */}

        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-[90px] table-fixed">

            {/* =================================================
                COLUMN WIDTHS
            ================================================= */}

            <colgroup>

              <col className="w-[13%]" />

              <col className="w-[18%]" />

              <col className="w-[12%]" />

              <col className="w-[15%]" />

              <col className="w-[10%]" />

              <col className="w-[10%]" />

              <col className="w-[12%]" />

              <col className="w-[14%]" />

            </colgroup>

            {/* =================================================
                HEAD
            ================================================= */}

            <thead className="bg-gray-900 text-white">

              <tr>

                <th className="px-4 py-4 text-left text-sm font-semibold">
                  User
                </th>

                <th className="px-2 py-4 text-left text-sm font-semibold">
                  Plan
                </th>

                <th className=" py-4 text-left text-sm font-semibold">
                  Gateway
                </th>

                <th className=" py-4 text-left text-sm font-semibold">
                  Transaction
                </th>

                <th className=" py-4 text-left text-sm font-semibold">
                  Amount
                </th>

                <th className="py-4 text-left text-sm font-semibold">
                  Status
                </th>

                <th className="px-4 py-4 text-left text-sm font-semibold">
                  Initiated
                </th>

                <th className=" py-4 text-left text-sm font-semibold">
                  Actions
                </th>

              </tr>

            </thead>

            {/* =================================================
                BODY
            ================================================= */}

            <tbody>

              {currentData.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No deposit requests found.
                  </td>

                </tr>

              ) : (

                currentData.map(
                  (item) => {

                    // =========================================
                    // STATUS
                    // =========================================

                    const status =
                      String(
                        item.status ||
                          "pending",
                      ).toLowerCase();

                    // =========================================
                    // ACTION LOADING
                    // =========================================

                    const approveLoading =
                      actionLoading ===
                      `${item._id}-approved`;

                    const rejectLoading =
                      actionLoading ===
                      `${item._id}-rejected`;

                    const isActionLoading =
                      approveLoading ||
                      rejectLoading;

                    // =========================================
                    // PLAN
                    // =========================================

                    const plan =
                      item.planId &&
                      typeof item.planId ===
                        "object"
                        ? item.planId
                        : item.subscription &&
                            typeof item.subscription ===
                              "object"
                          ? item.subscription
                          : null;

                    // =========================================
                    // PAYMENT METHOD
                    // =========================================

                    const paymentMethod =
                      item.paymentMethod  

                    return (

                      <tr
                        key={item._id}
                        className="border-t border-gray-100 align-top hover:bg-gray-50"
                      >

                        {/* =================================
                            USER
                        ================================= */}

                        <td className="max-w-0 overflow-hidden px-2 py-4">

                          <div className="min-w-0">

                            <p className="truncate font-medium text-gray-900">
                              {item.user?.name ||
                                item.user?.email ||
                                "Unknown User"}
                            </p>

                            {item.user?.cellNo && (
                              <p className="truncate text-xs text-gray-500">
                                {item.user.cellNo}
                              </p>
                            )}

                            {item.user?.email && (
                              <p className="truncate text-xs text-gray-500">
                                {item.user.email}
                              </p>
                            )}

                          </div>

                        </td>

                        {/* =================================
                            PLAN
                        ================================= */}

                        <td className="max-w-0 overflow-hidden  py-4">

                          {plan ? (

                            <div className="min-w-0">

                              <div className="flex min-w-0 items-center gap-2">

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                  <Crown
                                    size={16}
                                  />
                                </div>

                                <div className="min-w-0">

                                  <p
                                    className="truncate font-semibold text-gray-900"
                                    title={
                                      plan.planName ||
                                      "Unknown Plan"
                                    }
                                  >
                                    {plan.planName ||
                                      "Unknown Plan"}
                                  </p>

                                  <p className="text-xs font-medium text-purple-600">
                                    Subscription
                                  </p>

                                </div>

                              </div>

                              {plan.amount !==
                                undefined && (
                                <p className="mt-2 truncate text-xs text-gray-500">

                                  Plan Price:{" "}

                                  <span className="font-semibold text-gray-700">
                                    Rs.{" "}
                                    {Number(
                                      plan.amount,
                                    ).toLocaleString()}
                                  </span>

                                </p>
                              )}

                              {plan.dailyAds !==
                                undefined && (
                                <p className="mt-1 truncate text-xs text-gray-500">

                                  Daily Ads:{" "}

                                  <span className="font-medium text-gray-700">
                                    {plan.dailyAds}
                                  </span>

                                </p>
                              )}

                              {plan.planTimeLimit !==
                                undefined && (
                                <p className="mt-1 truncate text-xs text-gray-500">

                                  Duration:{" "}

                                  <span className="font-medium text-gray-700">
                                    {plan.planTimeLimit} days
                                  </span>

                                </p>
                              )}

                            </div>

                          ) : (

                            <span className="text-sm text-gray-400">
                              —
                            </span>

                          )}

                        </td>

                        {/* =================================
                            GATEWAY
                        ================================= */}

                        <td className="max-w-0 overflow-hidden py-4">

                          <p
                            className="truncate text-sm text-gray-700"
                            title={
                              item.gateway ||
                              paymentMethod?.paymentName ||
                              ""
                            }
                          >
                            {item.gateway ||
                              paymentMethod?.paymentName ||
                              "Balance"}
                          </p>

                          {paymentMethod
                            ?.paymentNetwork && (
                            <p className="truncate text-xs text-gray-500">
                              {
                                paymentMethod.paymentNetwork
                              }
                            </p>
                          )}

                        </td>

                        {/* =================================
                            TRANSACTION
                        ================================= */}

                        <td className="max-w-0 overflow-hidden py-4">

                          <p
                            className="break-all text-sm text-gray-700"
                            title={
                              item.transactionId ||
                              ""
                            }
                          >
                            {item.transactionId ||
                              item.depositNumber ||
                              "—"}
                          </p>

                        </td>

                        {/* =================================
                            AMOUNT
                        ================================= */}

                        <td className=" py-4">

                          <span className="whitespace-nowrap font-semibold text-gray-900">
                            {Number(
                              item.amount || 0,
                            ).toLocaleString()}{" "}
                            {item.currency || ""}
                          </span>

                        </td>

                        {/* =================================
                            STATUS
                        ================================= */}

                        <td className=" py-4">

                          <span
                            className={`inline-flex whitespace-nowrap items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              status ===
                              "pending"
                                ? "bg-orange-100 text-orange-700"
                                : status ===
                                    "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : status ===
                                        "approved" ||
                                      status ===
                                        "success" ||
                                      status ===
                                        "successful"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >

                            {status ===
                            "approved"
                              ? "Successful"
                              : status}

                          </span>

                        </td>

                        {/* =================================
                            DATE
                        ================================= */}

                        <td className="px-2 py-4">

                          <p className="whitespace-nowrap text-sm text-gray-500">
                            {item.createdAt
                              ? new Date(
                                  item.createdAt,
                                ).toLocaleDateString()
                              : "—"}
                          </p>

                          {item.createdAt && (
                            <p className="whitespace-nowrap text-xs text-gray-400">
                              {new Date(
                                item.createdAt,
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute:
                                    "2-digit",
                                },
                              )}
                            </p>
                          )}

                        </td>

                        {/* =================================
                            ACTIONS
                        ================================= */}

                        <td className="px-2 py-4">

                          {status ===
                          "pending" ? (

                            <div className="flex min-w-[105px] flex-col gap-1.5">

                              {/* APPROVE */}

                              <button
                                type="button"
                                disabled={
                                  isActionLoading
                                }
                                onClick={() =>
                                  updateDepositStatus(
                                    item._id,
                                    "approved",
                                  )
                                }
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {approveLoading ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <CheckCircle
                                    size={15}
                                  />
                                )}

                                Approve

                              </button>

                              {/* REJECT */}

                              <button
                                type="button"
                                disabled={
                                  isActionLoading
                                }
                                onClick={() =>
                                  updateDepositStatus(
                                    item._id,
                                    "rejected",
                                  )
                                }
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {rejectLoading ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <XCircle
                                    size={15}
                                  />
                                )}

                                Reject

                              </button>

                            </div>

                          ) : (

                            <span className="whitespace-nowrap text-xs text-gray-400">
                              No actions
                            </span>

                          )}

                        </td>

                      </tr>

                    );
                  },
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}