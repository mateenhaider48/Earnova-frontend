"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";

import toast from "react-hot-toast";

/*
============================================================
TYPES
============================================================
*/

interface Plan {
  _id: string;
  planName: string;
  amount: number;
  dailyAds: number;
  amountPerAd: number;
  planTimeLimit: number;
  isActive: boolean;
  planImage?: string;
}

interface PlanForm {
  planName: string;
  amount: string;
  dailyAds: string;
  amountPerAd: string;
  planTimeLimit: string;
  isActive: boolean;
  planImage: File | null;
}

/*
============================================================
INITIAL FORM
============================================================
*/

const initialForm: PlanForm = {
  planName: "",
  amount: "",
  dailyAds: "",
  amountPerAd: "",
  planTimeLimit: "",
  isActive: true,
  planImage: null,
};

/*
============================================================
COMPONENT
============================================================
*/

export default function PlansSection() {
  const [plans, setPlans] =
    useState<Plan[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [editingPlan, setEditingPlan] =
    useState<Plan | null>(null);

  const [form, setForm] =
    useState<PlanForm>(initialForm);

  /*
  ============================================================
  IMAGE PREVIEW
  ============================================================
  */

  const [imagePreview, setImagePreview] =
    useState<string>("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /*
  ============================================================
  API
  ============================================================
  */

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

  /*
  ============================================================
  GET ALL PLANS
  ============================================================
  */

  const fetchPlans = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/get-all-subscription`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
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
        const text =
          await response.text();

        console.error(
          "Get subscriptions returned non-JSON:",
          text,
        );

        throw new Error(
          `Server returned ${response.status} ${response.statusText}`,
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to fetch plans.",
        );
      }

      setPlans(
        Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.plans)
            ? data.plans
            : [],
      );
    } catch (error) {
      console.error(
        "Fetch Plans Error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch plans.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  INITIAL LOAD
  ============================================================
  */

  useEffect(() => {
    fetchPlans();
  }, []);

  /*
  ============================================================
  ADD PLAN
  ============================================================
  */

  const handleAddPlan = () => {
    setEditingPlan(null);

    setForm({
      ...initialForm,
    });

    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowModal(true);
  };

  /*
  ============================================================
  EDIT PLAN
  ============================================================
  */

  const handleEditPlan = (
    plan: Plan,
  ) => {
    setEditingPlan(plan);

    setForm({
      planName:
        plan.planName || "",

      amount:
        String(plan.amount ?? ""),

      dailyAds:
        String(plan.dailyAds ?? ""),

      amountPerAd:
        String(
          plan.amountPerAd ?? "",
        ),

      planTimeLimit:
        String(
          plan.planTimeLimit ?? "",
        ),

      isActive:
        plan.isActive ?? true,

      /*
      IMPORTANT:
      Existing Cloudinary URL is NOT a File.
      Only new selected image goes here.
      */

      planImage: null,
    });

    /*
    Existing Cloudinary image
    */

    setImagePreview(
      plan.planImage || "",
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowModal(true);
  };

  /*
  ============================================================
  IMAGE SELECT
  ============================================================
  */

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    /*
    IMAGE TYPE
    */

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      toast.error(
        "Please select a valid image.",
      );

      e.target.value = "";

      return;
    }

    /*
    5MB LIMIT
    */

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "Image size must be less than 5MB.",
      );

      e.target.value = "";

      return;
    }

    /*
    SAVE FILE
    IMPORTANT:
    planImage, NOT image
    */

    setForm(
      (previous) => ({
        ...previous,
        planImage: file,
      }),
    );

    /*
    LOCAL PREVIEW
    */

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(
      previewUrl,
    );
  };

  /*
  ============================================================
  REMOVE IMAGE
  ============================================================
  */

  const handleRemoveImage = () => {
    /*
    Remove selected/new file
    */

    setForm(
      (previous) => ({
        ...previous,
        planImage: null,
      }),
    );

    /*
    Clear preview
    */

    setImagePreview("");

    /*
    Clear file input
    */

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
  ============================================================
  CLOSE MODAL
  ============================================================
  */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingPlan(null);

    setForm({
      ...initialForm,
    });

    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
  ============================================================
  CREATE / UPDATE
  ============================================================
  */

  const handleSubmit = async (
    e: FormEvent,
  ) => {
    e.preventDefault();

    /*
    VALIDATION
    */

    if (
      !form.planName.trim() ||
      !form.amount ||
      !form.dailyAds ||
      !form.amountPerAd ||
      !form.planTimeLimit
    ) {
      toast.error(
        "Please fill all required fields.",
      );

      return;
    }

    try {
      setSaving(true);

      /*
      ========================================================
      FORMDATA
      ========================================================
      */

      const formData =
        new FormData();

      /*
      PLAN NAME
      */

      formData.append(
        "planName",
        form.planName.trim(),
      );

      /*
      AMOUNT
      */

      formData.append(
        "amount",
        String(
          Number(form.amount),
        ),
      );

      /*
      DAILY ADS
      */

      formData.append(
        "dailyAds",
        String(
          Number(form.dailyAds),
        ),
      );

      /*
      AMOUNT PER AD
      */

      formData.append(
        "amountPerAd",
        String(
          Number(
            form.amountPerAd,
          ),
        ),
      );

      /*
      PLAN TIME LIMIT
      */

      formData.append(
        "planTimeLimit",
        String(
          Number(
            form.planTimeLimit,
          ),
        ),
      );

      /*
      ACTIVE
      */

      formData.append(
        "isActive",
        String(
          form.isActive,
        ),
      );

      /*
      ========================================================
      IMAGE
      IMPORTANT:
      Backend:
      upload.single("planImage")

      Therefore frontend MUST use:
      "planImage"
      ========================================================
      */

      if (form.planImage) {
        formData.append(
          "image",
          form.planImage,
        );
      }

      /*
      ========================================================
      URL
      ========================================================
      */

      const url =
        editingPlan
          ? `${API_URL}/api/admin/update-subscription/${editingPlan._id}`
          : `${API_URL}/api/admin/create-subscriptions`;

      /*
      ========================================================
      REQUEST
      ========================================================
      */

      const response =
        await fetch(url, {
          method:
            editingPlan
              ? "PUT"
              : "POST",

          credentials:
            "include",

          /*
          IMPORTANT:
          DO NOT SET CONTENT-TYPE.
          Browser automatically creates:
          multipart/form-data; boundary=...
          */

          body: formData,
        });

      /*
      ========================================================
      RESPONSE TYPE
      ========================================================
      */

      const contentType =
        response.headers.get(
          "content-type",
        );

      if (
        !contentType?.includes(
          "application/json",
        )
      ) {
        const text =
          await response.text();

        console.error(
          "Subscription save returned non-JSON:",
          text,
        );

        throw new Error(
          `Server returned ${response.status} ${response.statusText}`,
        );
      }

      /*
      ========================================================
      RESPONSE JSON
      ========================================================
      */

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Something went wrong.",
        );
      }

      /*
      SUCCESS
      */

      toast.success(
        editingPlan
          ? "Plan updated successfully."
          : "Plan created successfully.",
      );

      /*
      CLOSE
      */

      closeModal();

      /*
      REFRESH
      */

      await fetchPlans();
    } catch (error) {
      console.error(
        "Subscription Submit Error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ============================================================
  DELETE PLAN
  ============================================================
  */

  const handleDeletePlan =
    async (
      id: string,
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this plan?",
        );

      if (!confirmed) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/admin/delete-subscription/${id}`,
            {
              method: "DELETE",
              credentials:
                "include",
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
          const text =
            await response.text();

          console.error(
            "Delete plan returned non-JSON:",
            text,
          );

          throw new Error(
            `Server returned ${response.status} ${response.statusText}`,
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to delete plan.",
          );
        }

        toast.success(
          "Plan deleted successfully.",
        );

        setPlans(
          (previous) =>
            previous.filter(
              (plan) =>
                plan._id !== id,
            ),
        );
      } catch (error) {
        console.error(
          "Delete Plan Error:",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete plan.",
        );
      }
    };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="mt-4 text-sm text-gray-500">
            Loading subscription plans...
          </p>
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
    <section>
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Subscription Plans
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage your subscription plans.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleAddPlan
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98]"
        >
          <Plus size={18} />

          Add Plan
        </button>
      </div>

      {/* ====================================================
          EMPTY STATE
      ==================================================== */}

      {plans.length ===
      0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <CreditCard
              size={30}
              className="text-gray-500"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            No Plans Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first subscription plan.
          </p>

          <button
            type="button"
            onClick={
              handleAddPlan
            }
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Plus size={18} />

            Create Plan
          </button>
        </div>
      ) : (
        /* ==================================================
           PLAN CARDS
        ================================================== */

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map(
            (plan) => (
              <div
                key={
                  plan._id
                }
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* ==================================================
                    PLAN IMAGE
                ================================================== */}

                {plan.planImage ? (
                  <div className="h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={
                        plan.planImage
                      }
                      alt={
                        plan.planName
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-400">
                      <ImageIcon
                        size={36}
                        className="mx-auto"
                      />

                      <p className="mt-2 text-sm">
                        No plan image
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  {/* PLAN HEADER */}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {
                          plan.planName
                        }
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Subscription Plan
                      </p>
                    </div>

                    {plan.isActive ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        <Check
                          size={
                            13
                          }
                        />

                        Active
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* AMOUNT */}

                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      Plan Amount
                    </p>

                    <div className="mt-1">
                      <span className="text-3xl font-bold text-gray-900">
                        Rs.{" "}
                        {
                          plan.amount
                        }
                      </span>
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="mt-6 space-y-4 border-t pt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Daily Ads
                      </span>

                      <span className="font-semibold text-gray-900">
                        {
                          plan.dailyAds
                        }
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Amount Per Ad
                      </span>

                      <span className="font-semibold text-gray-900">
                        {
                          plan.amountPerAd
                        }{" "}
                        %
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Plan Time Limit
                      </span>

                      <span className="font-semibold text-gray-900">
                        {
                          plan.planTimeLimit
                        }{" "}
                        Days
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-6 flex gap-3 border-t pt-5">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditPlan(
                          plan,
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Pencil
                        size={
                          16
                        }
                      />

                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeletePlan(
                          plan._id,
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2
                        size={
                          16
                        }
                      />

                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* ====================================================
          CREATE / EDIT MODAL
      ==================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPlan
                    ? "Edit Plan"
                    : "Create Plan"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter subscription plan details.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
              >
                <X
                  size={
                    20
                  }
                />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 p-6"
            >
              {/* ==================================================
                  IMAGE
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Plan Image{" "}
                  <span className="font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                {/* PREVIEW */}

                {imagePreview ? (
                  <div className="relative mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                    <img
                      src={
                        imagePreview
                      }
                      alt="Plan preview"
                      className="h-52 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={
                        handleRemoveImage
                      }
                      disabled={
                        saving
                      }
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:opacity-50"
                    >
                      <X
                        size={
                          18
                        }
                      />
                    </button>
                  </div>
                ) : (
                  <div className="mb-3 flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                    <div className="text-center text-gray-400">
                      <ImageIcon
                        size={
                          32
                        }
                        className="mx-auto"
                      />

                      <p className="mt-2 text-sm">
                        No image selected
                      </p>
                    </div>
                  </div>
                )}

                {/* FILE INPUT */}

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  disabled={
                    saving
                  }
                  className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-gray-400">
                  JPG, JPEG, PNG,
                  WEBP. Maximum
                  5MB.
                </p>
              </div>

              {/* ==================================================
                  PLAN NAME
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Plan Name
                </label>

                <input
                  type="text"
                  placeholder="Premium"
                  value={
                    form.planName
                  }
                  onChange={(
                    e,
                  ) =>
                    setForm(
                      (
                        previous,
                      ) => ({
                        ...previous,
                        planName:
                          e.target
                            .value,
                      }),
                    )
                  }
                  required
                  disabled={
                    saving
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black disabled:bg-gray-100"
                />
              </div>

              {/* ==================================================
                  AMOUNT
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Plan Amount
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="5000"
                  value={
                    form.amount
                  }
                  onChange={(
                    e,
                  ) =>
                    setForm(
                      (
                        previous,
                      ) => ({
                        ...previous,
                        amount:
                          e.target
                            .value,
                      }),
                    )
                  }
                  required
                  disabled={
                    saving
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black disabled:bg-gray-100"
                />
              </div>

              {/* ==================================================
                  DAILY ADS / AMOUNT PER AD
              ================================================== */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Daily Ads
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="20"
                    value={
                      form.dailyAds
                    }
                    onChange={(
                      e,
                    ) =>
                      setForm(
                        (
                          previous,
                        ) => ({
                          ...previous,
                          dailyAds:
                            e.target
                              .value,
                        }),
                      )
                    }
                    required
                    disabled={
                      saving
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Amount Per Ad
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="10"
                    value={
                      form.amountPerAd
                    }
                    onChange={(
                      e,
                    ) =>
                      setForm(
                        (
                          previous,
                        ) => ({
                          ...previous,
                          amountPerAd:
                            e.target
                              .value,
                        }),
                      )
                    }
                    required
                    disabled={
                      saving
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* ==================================================
                  PLAN TIME LIMIT
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Plan Time Limit
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="30"
                    value={
                      form.planTimeLimit
                    }
                    onChange={(
                      e,
                    ) =>
                      setForm(
                        (
                          previous,
                        ) => ({
                          ...previous,
                          planTimeLimit:
                            e.target
                              .value,
                        }),
                      )
                    }
                    required
                    disabled={
                      saving
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 outline-none transition focus:border-black disabled:bg-gray-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    Days
                  </span>
                </div>
              </div>

              {/* ==================================================
                  ACTIVE
              ================================================== */}

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    form.isActive
                  }
                  onChange={(
                    e,
                  ) =>
                    setForm(
                      (
                        previous,
                      ) => ({
                        ...previous,
                        isActive:
                          e.target
                            .checked,
                      }),
                    )
                  }
                  disabled={
                    saving
                  }
                  className="h-4 w-4 accent-black"
                />

                <span className="text-sm font-medium text-gray-700">
                  Active Plan
                </span>
              </label>

              {/* ==================================================
                  BUTTONS
              ================================================== */}

              <div className="flex gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingPlan
                      ? "Update Plan"
                      : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
