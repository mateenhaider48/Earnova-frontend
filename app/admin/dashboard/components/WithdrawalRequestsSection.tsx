"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

type WithdrawalRequest = {
  _id: string;

  status?: string;

  amount?: number;

  currency?: string;

  user?: {
    _id?: string;
    name?: string;
    email?: string;
    cellNo?: string;
    reflink?: string | null;
    role?: string;
    [key: string]: any;
  };

  method?: string;

  methodId?: string;

  withdrawalMethod?: {
    _id?: string;
    name?: string;
    paymentName?: string;
    [key: string]: any;
  } | null;

  accountNumber?: string;

  walletAddress?: string;

  accountName?: string;

  rejectionReason?: string;

  createdAt?: string;

  updatedAt?: string;

  [key: string]: any;
};


type Props = {
  activeSection:
    | "withdrawal-all"
    | "withdrawal-pending"
    | "withdrawal-rejected"
    | "withdrawal-successful";
};


const api =
  process.env.NEXT_PUBLIC_API_URL;


export default function WithdrawalRequestsSection({
  activeSection,
}: Props) {

  // =========================================================
  // STATES
  // =========================================================

  const [all, setAll] =
    useState<WithdrawalRequest[]>([]);

  const [pending, setPending] =
    useState<WithdrawalRequest[]>([]);

  const [rejected, setRejected] =
    useState<WithdrawalRequest[]>([]);

  const [successful, setSuccessful] =
    useState<WithdrawalRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);


  // =========================================================
  // FETCH ALL WITHDRAWAL REQUESTS
  // ONE API
  // =========================================================

  const fetchWithdrawals = async () => {

    try {

      setLoading(true);

      setError("");


      const response = await fetch(
        `${api}/api/admin/withdrawals/requests`,
        {
          method: "GET",
          credentials: "include",
        },
      );


      const result =
        await response.json();


      console.log(
        "Withdrawal response:",
        result,
      );


      if (!response.ok) {

        throw new Error(
          result?.message ||
            "Failed to load withdrawals.",
        );

      }


      setAll(
        result?.data?.all || [],
      );


      setPending(
        result?.data?.pending || [],
      );


      setRejected(
        result?.data?.rejected || [],
      );


      setSuccessful(
        result?.data?.successful || [],
      );


    } catch (error: any) {

      console.error(
        "fetchWithdrawals error:",
        error,
      );


      setError(
        error?.message ||
          "Failed to load withdrawals.",
      );


    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    fetchWithdrawals();

  }, []);


  // =========================================================
  // APPROVE / REJECT
  // =========================================================

  const updateWithdrawalStatus = async (
    withdrawalId: string,
    status: "approved" | "rejected",
  ) => {

    try {

      setActionLoading(
        `${withdrawalId}-${status}`,
      );


      const response = await fetch(
        `${api}/api/admin/withdrawals/${withdrawalId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            status,
          }),
        },
      );


      const result =
        await response.json();


      console.log(
        "Update withdrawal:",
        result,
      );


      if (!response.ok) {

        throw new Error(
          result?.message ||
            `Failed to ${status} withdrawal.`,
        );

      }


      // =====================================================
      // REFRESH DATA
      // =====================================================

      await fetchWithdrawals();


    } catch (error: any) {

      console.error(
        `updateWithdrawalStatus ${status} error:`,
        error,
      );


      alert(
        error?.message ||
          `Failed to ${status} withdrawal.`,
      );


    } finally {

      setActionLoading(null);

    }

  };


  // =========================================================
  // CURRENT DATA
  // =========================================================

  const currentData =
    activeSection ===
    "withdrawal-pending"

      ? pending

      : activeSection ===
          "withdrawal-rejected"

        ? rejected

        : activeSection ===
            "withdrawal-successful"

          ? successful

          : all;


  // =========================================================
  // TITLE
  // =========================================================

  const title =
    activeSection ===
    "withdrawal-pending"

      ? "Pending Withdrawals"

      : activeSection ===
          "withdrawal-rejected"

        ? "Rejected Withdrawals"

        : activeSection ===
            "withdrawal-successful"

          ? "Successful Withdrawals"

          : "All Withdrawal Requests";


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white">

        <div className="flex items-center gap-2 text-gray-500">

          <Loader2
            size={20}
            className="animate-spin"
          />

          Loading withdrawals...

        </div>

      </div>

    );

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

        <h2 className="font-semibold text-red-700">
          Failed to load withdrawals
        </h2>


        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>


        <button
          type="button"
          onClick={fetchWithdrawals}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Retry
        </button>

      </div>

    );

  }


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="space-y-5">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

        <div>

          <h2 className="text-2xl font-bold text-gray-900">
            {title}
          </h2>


          <p className="mt-1 text-sm text-gray-500">
            Manage withdrawal requests.
          </p>

        </div>


        {/* ===================================================
            COUNTS
        =================================================== */}

        <div className="flex flex-wrap gap-2">


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


          {/* REJECTED */}

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2">

            <p className="text-xs text-gray-500">
              Rejected
            </p>


            <p className="text-lg font-bold text-red-500">
              {rejected.length}
            </p>

          </div>


          {/* SUCCESSFUL */}

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2">

            <p className="text-xs text-gray-500">
              Successful
            </p>


            <p className="text-lg font-bold text-green-600">
              {successful.length}
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full">


            {/* =================================================
                TABLE HEADER
            ================================================= */}

            <thead className="bg-gray-900 text-white">

              <tr>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  User
                </th>


                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Method
                </th>


                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Account
                </th>


                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Amount
                </th>


                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Status
                </th>


                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Initiated
                </th>


                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Actions
                </th>

              </tr>

            </thead>


            {/* =================================================
                TABLE BODY
            ================================================= */}

            <tbody>


              {currentData.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-gray-500"
                  >

                    No withdrawal requests found.

                  </td>

                </tr>

              ) : (

                currentData.map(
                  (item) => {

                    const status =
                      String(
                        item.status ||
                          "pending",
                      ).toLowerCase();


                    const isPending =
                      status === "pending";


                    const approving =
                      actionLoading ===
                      `${item._id}-approved`;


                    const rejecting =
                      actionLoading ===
                      `${item._id}-rejected`;


                    return (

                      <tr
                        key={item._id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >


                        {/* =================================================
                            USER
                        ================================================= */}

                        <td className="px-5 py-4">

                          <p className="font-medium text-gray-900">

                            {item.user?.name ||
                              item.user?.email ||
                              "Unknown User"}

                          </p>


                          {item.user?.cellNo && (

                            <p className="text-xs text-gray-500">

                              {item.user.cellNo}

                            </p>

                          )}

                        </td>


                        {/* =================================================
                            METHOD
                        ================================================= */}

                        <td className="px-5 py-4 text-sm text-gray-700">

                          {item.withdrawalMethod
                            ?.paymentName ||

                            item.withdrawalMethod
                              ?.name ||

                            item.method ||

                            "-"}

                        </td>


                        {/* =================================================
                            ACCOUNT
                        ================================================= */}

                        <td className="px-5 py-4">


                          {item.accountNumber ? (

                            <>

                              {item.accountName && (

                                <p className="text-sm font-medium text-gray-900">

                                  {item.accountName}

                                </p>

                              )}


                              <p className="text-xs text-gray-500">

                                {item.accountNumber}

                              </p>

                            </>

                          ) : item.walletAddress ? (

                            <p className="max-w-[220px] truncate text-xs text-gray-700">

                              {item.walletAddress}

                            </p>

                          ) : (

                            "-"

                          )}

                        </td>


                        {/* =================================================
                            AMOUNT
                        ================================================= */}

                        <td className="px-5 py-4">

                          <span className="font-semibold text-gray-900">

                            {item.amount ?? 0}

                            {" "}

                            {item.currency || ""}

                          </span>

                        </td>


                        {/* =================================================
                            STATUS
                        ================================================= */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              status ===
                              "pending"

                                ? "bg-orange-100 text-orange-700"

                                : status ===
                                    "rejected"

                                  ? "bg-red-100 text-red-700"

                                  : status ===
                                      "approved"

                                    ? "bg-green-100 text-green-700"

                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >

                            {status ===
                            "approved"
                              ? "successful"
                              : status}

                          </span>

                        </td>


                        {/* =================================================
                            DATE
                        ================================================= */}

                        <td className="px-5 py-4 text-sm text-gray-500">

                          {item.createdAt

                            ? new Date(
                                item.createdAt,
                              ).toLocaleString()

                            : "-"}

                        </td>


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <td className="px-5 py-4">


                          {isPending ? (

                            <div className="flex flex-wrap items-center gap-2">


                              {/* APPROVE */}

                              <button
                                type="button"

                                disabled={
                                  !!actionLoading
                                }

                                onClick={() =>
                                  updateWithdrawalStatus(
                                    item._id,
                                    "approved",
                                  )
                                }

                                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {approving ? (

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
                                  !!actionLoading
                                }

                                onClick={() =>
                                  updateWithdrawalStatus(
                                    item._id,
                                    "rejected",
                                  )
                                }

                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {rejecting ? (

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

                            <span className="text-xs text-gray-400">
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