"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  Network,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PaymentSetting {
  _id: string;
  paymentName: string;
  paymentDetails: string;
  paymentNetwork?: string | null;
  paymentImage?: string | null;
  paymentQRCode?: string | null;
  isActive: boolean;
  minAmount?: number;
  maxAmount?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  paymentName: string;
  paymentDetails: string;
  paymentNetwork: string;
  isActive: boolean;
  minAmount: string;
  maxAmount: string;
}

const ENDPOINTS = {
  // =========================
  // DEPOSIT / PAYMENT SETTINGS
  // =========================
  get: `${API_URL}/api/admin/payment-settings`,
  create: `${API_URL}/api/admin/payment-settings`,
  update: (id: string) =>
    `${API_URL}/api/admin/payment-settings/${id}`,
  delete: (id: string) =>
    `${API_URL}/api/admin/payment-settings/${id}`,

  // =========================
  // WITHDRAWAL
  // =========================
  createWithdrawal: `${API_URL}/api/admin/withdrawl/method`,
};

export default function PaymentSettingsSection() {
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // true = withdrawal
  // false = deposit
  const [withdrwalMethod, setwithdrwalMethod] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    paymentName: "",
    paymentDetails: "",
    paymentNetwork: "",
    isActive: true,
    minAmount: "1",
    maxAmount: "",
  });

  // ============================================================
  // FETCH PAYMENT SETTINGS
  // ============================================================

  const fetchSettings = async () => {
    if (!API_URL) {
      toast.error("API URL is not configured");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(ENDPOINTS.get, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();

      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        console.error("Non JSON response:", text);

        throw new Error(
          `Server returned ${response.status} ${response.statusText}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch payment settings",
        );
      }

      setSettings(
        Array.isArray(data?.data)
          ? data.data
          : data?.data
            ? [data.data]
            : [],
      );
    } catch (error) {
      console.error("Fetch Payment Settings Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch payment settings",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!API_URL) {
      toast.error("NEXT_PUBLIC_API_URL is not configured");
      setLoading(false);
      return;
    }

    fetchSettings();
  }, []);

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setFormData({
      paymentName: "",
      paymentDetails: "",
      paymentNetwork: "",
      isActive: true,
      minAmount: "1",
      maxAmount: "",
    });

    setImageFile(null);
    setImagePreview(null);

    setQrCodeFile(null);
    setQrCodePreview(null);
  };

  // ============================================================
  // ADD DEPOSIT
  // ============================================================

  const handleAdd = () => {
    setwithdrwalMethod(false);
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  // ============================================================
  // ADD WITHDRAWAL
  // ============================================================

  const handleAddWithdrawal = () => {
    setwithdrwalMethod(true);
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (setting: PaymentSetting) => {
    setwithdrwalMethod(false);

    setEditingId(setting._id);

    setFormData({
      paymentName: setting.paymentName || "",
      paymentDetails: setting.paymentDetails || "",
      paymentNetwork: setting.paymentNetwork || "",
      isActive: setting.isActive ?? true,
      minAmount:
        setting.minAmount !== undefined
          ? String(setting.minAmount)
          : "1",
      maxAmount:
        setting.maxAmount !== null &&
        setting.maxAmount !== undefined
          ? String(setting.maxAmount)
          : "",
    });

    setImageFile(null);
    setQrCodeFile(null);

    setImagePreview(setting.paymentImage || null);
    setQrCodePreview(setting.paymentQRCode || null);

    setShowForm(true);
  };

  // ============================================================
  // CLOSE FORM
  // ============================================================

  const handleCloseForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setwithdrwalMethod(false);
    resetForm();
  };

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (
    field: keyof FormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // IMAGE / QR PREVIEW
  // ============================================================

  const validateAndPreviewImage = (
    file: File | null,
    type: "image" | "qr",
  ) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    const preview = URL.createObjectURL(file);

    if (type === "image") {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);
      setImagePreview(preview);
    } else {
      if (qrCodePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(qrCodePreview);
      }

      setQrCodeFile(file);
      setQrCodePreview(preview);
    }
  };

  // ============================================================
  // WITHDRAWAL SUBMIT
  // ONLY PAYMENT NAME + IMAGE
  // ============================================================

  const handleWithdrawalSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!API_URL) {
      toast.error("API URL is not configured");
      return;
    }

    const paymentName = formData.paymentName.trim();

    if (!paymentName) {
      toast.error("Withdrawal method name is required.");
      return;
    }

    try {
      setSaving(true);

      const body = new FormData();

      body.append("paymentName", paymentName);

      if (imageFile) {
        body.append("paymentImage", imageFile);
      }

      const response = await fetch(
        ENDPOINTS.createWithdrawal,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          body,
        },
      );

      const text = await response.text();

      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        console.error("Non JSON response:", text);

        throw new Error(
          `Server returned ${response.status} ${response.statusText}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to create withdrawal method.",
        );
      }

      toast.success(
        data?.message ||
          "Withdrawal method added successfully.",
      );

      setShowForm(false);
      setEditingId(null);
      setwithdrwalMethod(false);
      resetForm();
    } catch (error) {
      console.error(
        "Create Withdrawal Method Error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create withdrawal method.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DEPOSIT SUBMIT
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!API_URL) {
      toast.error("API URL is not configured");
      return;
    }

    const paymentName = formData.paymentName.trim();
    const paymentDetails = formData.paymentDetails.trim();
    const paymentNetwork = formData.paymentNetwork.trim();

    if (!paymentName) {
      toast.error("Payment name is required.");
      return;
    }

    if (!paymentDetails) {
      toast.error("Payment details are required.");
      return;
    }

    const parsedMinAmount =
      formData.minAmount.trim() === ""
        ? 1
        : Number(formData.minAmount);

    if (
      !Number.isFinite(parsedMinAmount) ||
      parsedMinAmount < 0
    ) {
      toast.error("Invalid minimum amount.");
      return;
    }

    const parsedMaxAmount =
      formData.maxAmount.trim() === ""
        ? null
        : Number(formData.maxAmount);

    if (
      parsedMaxAmount !== null &&
      (!Number.isFinite(parsedMaxAmount) ||
        parsedMaxAmount < 0)
    ) {
      toast.error("Invalid maximum amount.");
      return;
    }

    if (
      parsedMaxAmount !== null &&
      parsedMaxAmount < parsedMinAmount
    ) {
      toast.error(
        "Maximum amount cannot be less than minimum amount.",
      );
      return;
    }

    try {
      setSaving(true);

      const body = new FormData();

      body.append("paymentName", paymentName);
      body.append("paymentDetails", paymentDetails);
      body.append("paymentNetwork", paymentNetwork);
      body.append(
        "isActive",
        String(formData.isActive),
      );
      body.append(
        "minAmount",
        String(parsedMinAmount),
      );

      if (parsedMaxAmount !== null) {
        body.append(
          "maxAmount",
          String(parsedMaxAmount),
        );
      }

      if (imageFile) {
        body.append("paymentImage", imageFile);
      }

      if (qrCodeFile) {
        body.append("paymentQRCode", qrCodeFile);
      }

      const url = editingId
        ? ENDPOINTS.update(editingId)
        : ENDPOINTS.create;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        body,
      });

      const text = await response.text();

      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        console.error("Non JSON response:", text);

        throw new Error(
          `Server returned ${response.status} ${response.statusText}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to save payment setting.",
        );
      }

      toast.success(
        data?.message ||
          (editingId
            ? "Payment setting updated successfully."
            : "Payment method added successfully."),
      );

      setShowForm(false);
      setEditingId(null);
      setwithdrwalMethod(false);

      resetForm();

      await fetchSettings();
    } catch (error) {
      console.error(
        "Save Payment Setting Error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save payment setting.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment method?",
    );

    if (!confirmed) return;

    if (!API_URL) {
      toast.error("API URL is not configured");
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(
        ENDPOINTS.delete(id),
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const text = await response.text();

      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          `Server returned ${response.status} ${response.statusText}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete payment method.",
        );
      }

      toast.success(
        data?.message ||
          "Payment method deleted successfully.",
      );

      setSettings((prev) =>
        prev.filter((item) => item._id !== id),
      );

      if (editingId === id) {
        handleCloseForm();
      }
    } catch (error) {
      console.error(
        "Delete Payment Setting Error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete payment setting.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Payment Settings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage payment gateways users can use for
            deposits.
          </p>
        </div>

        <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 text-gray-500">
            <RefreshCw
              size={20}
              className="animate-spin"
            />
            Loading payment settings...
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Payment Settings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage JazzCash, EasyPaisa, USDT, bank and
            other payment gateways.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          {/* WITHDRAWAL */}

          <button
            type="button"
            onClick={handleAddWithdrawal}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            <Plus size={17} />
            Add Withdrawal Method
          </button>

          {/* DEPOSIT */}

          <button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            <Plus size={17} />
            Add Deposit Method
          </button>
        </div>
      </div>

      {/* FORM */}

      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {editingId
                  ? "Edit Payment Method"
                  : withdrwalMethod
                    ? "Add Withdrawal Method"
                    : "Add Payment Method"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {withdrwalMethod
                  ? "Configure the withdrawal method users will see."
                  : "Configure the payment gateway users will see."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseForm}
              disabled={saving}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={
              withdrwalMethod
                ? handleWithdrawalSubmit
                : handleSubmit
            }
            className="grid gap-5 md:grid-cols-2"
          >

            {/* PAYMENT NAME */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                {withdrwalMethod
                  ? "Withdrawal Method Name"
                  : "Payment Name"}
              </label>

              <div className="relative">
                <CreditCard
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={formData.paymentName}
                  onChange={(e) =>
                    handleChange(
                      "paymentName",
                      e.target.value,
                    )
                  }
                  placeholder={
                    withdrwalMethod
                      ? "e.g. JazzCash, EasyPaisa, USDT, Bank"
                      : "e.g. JazzCash, EasyPaisa, USDT, Bank"
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                />
              </div>

              <p className="mt-1.5 text-xs text-gray-500">
                {withdrwalMethod
                  ? "Withdrawal method name shown to users."
                  : "Payment method name shown to users."}
              </p>
            </div>

            {/* ================================================= */}
            {/* DEPOSIT ONLY FIELDS */}
            {/* ================================================= */}

            {!withdrwalMethod && (
              <>
                {/* PAYMENT DETAILS */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Payment Details
                  </label>

                  <div className="relative">
                    <Wallet
                      size={18}
                      className="absolute left-3 top-3 text-gray-400"
                    />

                    <textarea
                      value={formData.paymentDetails}
                      onChange={(e) =>
                        handleChange(
                          "paymentDetails",
                          e.target.value,
                        )
                      }
                      placeholder="03001234567 / IBAN / USDT wallet address"
                      disabled={saving}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-gray-500">
                    Number, account number, IBAN or wallet
                    address.
                  </p>
                </div>

                {/* NETWORK */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Payment Network
                    <span className="ml-1 font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">
                    <Network
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={formData.paymentNetwork}
                      onChange={(e) =>
                        handleChange(
                          "paymentNetwork",
                          e.target.value,
                        )
                      }
                      placeholder="e.g. TRC20 / ERC20"
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-gray-500">
                    Mainly for USDT.
                  </p>
                </div>

                {/* MINIMUM */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Minimum Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.minAmount}
                    onChange={(e) =>
                      handleChange(
                        "minAmount",
                        e.target.value,
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                  />
                </div>

                {/* MAXIMUM */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Maximum Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.maxAmount}
                    onChange={(e) =>
                      handleChange(
                        "maxAmount",
                        e.target.value,
                      )
                    }
                    placeholder="Leave empty for unlimited"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                  />
                </div>

                {/* QR CODE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Payment QR Code
                    <span className="ml-1 font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 transition hover:bg-gray-100">
                    <ImageIcon
                      size={22}
                      className="text-gray-500"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-700">
                        {qrCodeFile
                          ? qrCodeFile.name
                          : "Choose QR Code"}
                      </p>

                      <p className="text-xs text-gray-500">
                        JPG, PNG, WEBP • Max 5MB
                      </p>
                    </div>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      disabled={saving}
                      onChange={(e) =>
                        validateAndPreviewImage(
                          e.target.files?.[0] || null,
                          "qr",
                        )
                      }
                    />
                  </label>

                  {qrCodePreview && (
                    <div className="relative mt-3 w-fit">
                      <img
                        src={qrCodePreview}
                        alt="Payment QR code preview"
                        className="h-28 w-28 rounded-xl border border-gray-200 object-contain"
                      />

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          if (
                            qrCodePreview.startsWith(
                              "blob:",
                            )
                          ) {
                            URL.revokeObjectURL(
                              qrCodePreview,
                            );
                          }

                          setQrCodeFile(null);
                          setQrCodePreview(null);
                        }}
                        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      handleChange(
                        "isActive",
                        !formData.isActive,
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="text-sm font-semibold text-gray-700">
                      {formData.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    {formData.isActive ? (
                      <ToggleRight
                        size={28}
                        className="text-green-600"
                      />
                    ) : (
                      <ToggleLeft
                        size={28}
                        className="text-gray-400"
                      />
                    )}
                  </button>
                </div>
              </>
            )}

            {/* ================================================= */}
            {/* PAYMENT / WITHDRAWAL IMAGE */}
            {/* ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                {withdrwalMethod
                  ? "Withdrawal Image"
                  : "Payment Image"}

                <span className="ml-1 font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 transition hover:bg-gray-100">
                <ImageIcon
                  size={22}
                  className="text-gray-500"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-700">
                    {imageFile
                      ? imageFile.name
                      : withdrwalMethod
                        ? "Choose Withdrawal Image"
                        : "Choose Payment Image"}
                  </p>

                  <p className="text-xs text-gray-500">
                    JPG, PNG, WEBP • Max 5MB
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  disabled={saving}
                  onChange={(e) =>
                    validateAndPreviewImage(
                      e.target.files?.[0] || null,
                      "image",
                    )
                  }
                />
              </label>

              {imagePreview && (
                <div className="relative mt-3 w-fit">
                  <img
                    src={imagePreview}
                    alt={
                      withdrwalMethod
                        ? "Withdrawal image preview"
                        : "Payment image preview"
                    }
                    className="h-28 w-28 rounded-xl border border-gray-200 object-contain"
                  />

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      if (
                        imagePreview.startsWith("blob:")
                      ) {
                        URL.revokeObjectURL(
                          imagePreview,
                        );
                      }

                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* ACTIONS */}

            <div className="flex justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={17} />
                )}

                {saving
                  ? "Saving..."
                  : withdrwalMethod
                    ? "Add Withdrawal Method"
                    : editingId
                      ? "Update"
                      : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* PAYMENT CARDS */}
      {/* ======================================================== */}

      {settings.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <CreditCard
              size={28}
              className="text-gray-500"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            No payment methods
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add a payment gateway so users can deposit
            money.
          </p>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <Plus size={17} />
            Add Payment Method
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {settings.map((setting) => {
            const isDeleting =
              deletingId === setting._id;

            return (
              <div
                key={setting._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {setting.paymentImage && (
                  <div className="flex h-48 w-full items-center justify-center overflow-hidden bg-gray-100 p-3">
                    <img
                      src={setting.paymentImage}
                      alt={setting.paymentName}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}

                {setting.paymentQRCode && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Payment QR Code
                      </p>
                    </div>

                    <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-3">
                      <img
                        src={setting.paymentQRCode}
                        alt={`${setting.paymentName} QR Code`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {!setting.paymentImage && (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                          <CreditCard size={21} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Payment Method
                        </p>

                        <h3 className="truncate text-lg font-bold text-gray-900">
                          {setting.paymentName}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Payment Details
                    </p>

                    <p className="mt-2 break-all text-sm font-bold text-gray-900">
                      {setting.paymentDetails}
                    </p>

                    {setting.paymentNetwork && (
                      <div className="mt-3 flex items-center gap-2">
                        <Network
                          size={15}
                          className="text-gray-500"
                        />

                        <span className="text-xs font-semibold text-gray-700">
                          Network:
                        </span>

                        <span className="text-xs text-gray-600">
                          {setting.paymentNetwork}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Minimum
                      </p>

                      <p className="mt-1 font-bold text-gray-900">
                        {setting.minAmount ?? 1}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Maximum
                      </p>

                      <p className="mt-1 font-bold text-gray-900">
                        {setting.maxAmount ??
                          "Unlimited"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        setting.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {setting.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(setting)
                        }
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 transition hover:text-black disabled:opacity-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(setting._id)
                        }
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} />

                        {isDeleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}