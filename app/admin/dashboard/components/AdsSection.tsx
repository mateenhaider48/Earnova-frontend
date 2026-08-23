"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Megaphone,
  Pencil,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ================= TYPES =================


interface Ad {
  _id: string;
  title: string;
  description?: string;

  adType: "image" | "video";
  mediaUrl?: string;



  isActive: boolean;

  createdAt?: string;
}

interface AdForm {
  title: string;
  description: string;
  adType: "image" | "video";
  isActive: boolean;
}

const initialForm: AdForm = {
  title: "",
  description: "",
  adType: "image",
  isActive: true,
};

// ================= COMPONENT =================

export default function AdsSection() {
  const [ads, setAds] = useState<Ad[]>([]);


  const [showForm, setShowForm] = useState(false);

  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const [form, setForm] = useState<AdForm>(initialForm);

  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] = useState(false);

  const [fetchingPlans, setFetchingPlans] = useState(false);

  const [togglingAdId, setTogglingAdId] = useState<string | null>(null);

  // ================= FETCH ADS =================

  const fetchAds = async () => {
    try {
      setFetching(true);

      const response = await fetch(`${API_URL}/api/admin/get-ads`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      console.log("ADS:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch ads");
      }

      setAds(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch ads",
      );
    } finally {
      setFetching(false);
    }
  };



  // ================= INITIAL FETCH =================

  useEffect(() => {
    fetchAds();
  }, []);

  // ================= FORM CHANGE =================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= MEDIA CHANGE =================

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (form.adType === "image" && !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      e.target.value = "";
      return;
    }

    if (form.adType === "video" && !file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      e.target.value = "";
      return;
    }

    setMediaFile(file);

    const previewUrl = URL.createObjectURL(file);

    setMediaPreview(previewUrl);
  };

  // ================= AD TYPE CHANGE =================

  const handleAdTypeChange = (type: "image" | "video") => {
    setForm((prev) => ({
      ...prev,
      adType: type,
    }));

    setMediaFile(null);
    setMediaPreview(null);
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.title.trim()) {
    toast.error("Ad title is required");
    return;
  }

  if (!form.description.trim()) {
    toast.error("Ad description is required");
    return;
  }

  // New ad requires media
  if (!editingAd && !mediaFile) {
    toast.error(`Please upload an ${form.adType}`);
    return;
  }

  try {
    setLoading(true);

    const url = editingAd
      ? `${API_URL}/api/admin/update-ad/${editingAd._id}`
      : `${API_URL}/api/admin/create-ads`;

    const method = editingAd ? "PUT" : "POST";

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("type", form.adType);
    formData.append("isActive", String(form.isActive));

    // IMPORTANT:
    // Backend: upload.single("screenshot")
    if (mediaFile) {
      formData.append("media", mediaFile);
    }

    const response = await fetch(url, {
      method,
      credentials: "include",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          (editingAd
            ? "Failed to update ad"
            : "Failed to create ad"),
      );
    }

    toast.success(
      editingAd
        ? "Ad updated successfully"
        : "Ad created successfully",
    );

    closeForm();

    await fetchAds();
  } catch (error) {
    console.error("Ad Submit Error:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Something went wrong",
    );
  } finally {
    setLoading(false);
  }
};

  // ================= EDIT =================

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);



    setForm({
      title: ad.title || "",
      description: ad.description || "",
      adType: ad.adType || "image",
      isActive: ad.isActive,
    });

    setMediaFile(null);

    setMediaPreview(ad.mediaUrl || null);

    setShowForm(true);
  };

  // ================= DELETE =================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this advertisement?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/delete-ad/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete ad");
      }

      toast.success("Ad deleted successfully");

      await fetchAds();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete ad",
      );
    }
  };

  // ================= TOGGLE STATUS =================

  const handleToggleStatus = async (ad: Ad) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/toggle-ad/${ad._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      // Pehle text lo — directly response.json() mat karo
      const text = await response.text();
      console.log(text)
      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response from toggle API:", text);

        throw new Error(
          `Server returned ${response.status} ${response.statusText}`,
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update ad status");
      }

      toast.success(
        ad.isActive
          ? "Ad deactivated successfully"
          : "Ad activated successfully",
      );

      await fetchAds();
    } catch (error) {
      console.error("Toggle Ad Error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to update ad status",
      );
    }
  };

  // ================= CLOSE FORM =================

  const closeForm = () => {
    setShowForm(false);

    setEditingAd(null);

    setForm(initialForm);

    setMediaFile(null);

    setMediaPreview(null);
  };

  // ================= RENDER =================

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ads Management</h2>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage advertisements.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              closeForm();
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          {showForm ? (
            <>
              <X size={18} />
              Close
            </>
          ) : (
            <>
              <Plus size={18} />
              Create Ad
            </>
          )}
        </button>
      </div>

      {/* ================= FORM ================= */}

      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
              <Megaphone size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                {editingAd ? "Edit Advertisement" : "Create Advertisement"}
              </h3>

              <p className="text-sm text-gray-500">
                Add advertisement details, media and subscription plan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ================= TITLE + PLAN ================= */}

            <div className="grid gap-5 md:grid-cols-2">
              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ad Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter ad title"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>
            </div>

            {/* ================= DESCRIPTION ================= */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter advertisement description"
                rows={4}
                disabled={loading}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* ================= AD TYPE ================= */}

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Advertisement Type
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* IMAGE */}

                <button
                  type="button"
                  onClick={() => handleAdTypeChange("image")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    form.adType === "image"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <ImageIcon size={22} />

                  <div>
                    <p className="font-semibold">Image Ad</p>

                    <p
                      className={`text-xs ${
                        form.adType === "image"
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      JPG, PNG, WEBP
                    </p>
                  </div>
                </button>

                {/* VIDEO */}

                <button
                  type="button"
                  onClick={() => handleAdTypeChange("video")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    form.adType === "video"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Video size={22} />

                  <div>
                    <p className="font-semibold">Video Ad</p>

                    <p
                      className={`text-xs ${
                        form.adType === "video"
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      MP4, WEBM, MOV
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* ================= FILE UPLOAD ================= */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Upload {form.adType === "image" ? "Image" : "Video"}
              </label>

              <input
                type="file"
                accept={form.adType === "image" ? "image/*" : "video/*"}
                onChange={handleMediaChange}
                disabled={loading}
                className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-black file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800"
              />

              {/* PREVIEW */}

              {mediaPreview && (
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="mb-3 text-xs font-semibold text-gray-500">
                    Preview
                  </p>

                  {form.adType === "image" ? (
                    <img
                      src={mediaPreview}
                      alt="Ad preview"
                      className="max-h-64 w-full rounded-lg object-contain"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      controls
                      className="max-h-64 w-full rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>

            {/* ================= STATUS ================= */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: !prev.isActive,
                  }))
                }
                disabled={loading}
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-3 transition hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-700">
                  {form.isActive ? "Active" : "Inactive"}
                </span>

                {form.isActive ? (
                  <ToggleRight size={26} className="text-green-600" />
                ) : (
                  <ToggleLeft size={26} className="text-gray-400" />
                )}
              </button>
            </div>

            {/* ================= BUTTONS ================= */}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {loading
                  ? editingAd
                    ? "Updating..."
                    : "Creating..."
                  : editingAd
                    ? "Update Ad"
                    : "Create Ad"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= ADS LIST ================= */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-semibold text-gray-900">All Advertisements</h3>

            <p className="mt-1 text-xs text-gray-500">
              Total Ads: {ads.length}
            </p>
          </div>

          <button
            onClick={fetchAds}
            disabled={fetching}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            {fetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {fetching ? (
          <div className="flex min-h-48 items-center justify-center">
            <p className="text-sm text-gray-500">Loading advertisements...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Megaphone size={25} className="text-gray-500" />
            </div>

            <h3 className="font-semibold text-gray-900">No advertisements</h3>

            <p className="mt-1 text-sm text-gray-500">
              Create your first advertisement.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="mt-5 flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              <Plus size={17} />
              Create Ad
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {ads.map((ad) => {
    

              return (
                <div key={ad._id} className="p-5 hover:bg-gray-50 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* INFO */}

                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                        <Megaphone size={20} />
                      </div>

                      <div className="min-w-0">
                        {/* TITLE + STATUS */}

                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {ad.title}
                          </h4>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              ad.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {ad.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {/* DESCRIPTION */}

                        {ad.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {ad.description}
                          </p>
                        )}

                        

                        {/* TAGS */}

  
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex shrink-0 items-center gap-2">
                      {/* TOGGLE */}

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(ad)}
                        disabled={togglingAdId === ad._id}
                        className="rounded-lg border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title={ad.isActive ? "Deactivate Ad" : "Activate Ad"}
                      >
                        {ad.isActive ? (
                          <ToggleRight size={19} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={19} className="text-gray-500" />
                        )}
                      </button>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() => handleEdit(ad)}
                        disabled={togglingAdId === ad._id}
                        className="rounded-lg border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-100"
                        title="Edit Ad"
                      >
                        <Pencil size={18} />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() => handleDelete(ad._id)}
                        className="rounded-lg border border-red-200 p-2.5 text-red-600 hover:bg-red-50"
                        title="Delete Ad"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
