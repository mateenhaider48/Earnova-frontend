"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: "image" | "video";
}

interface CompanyAds {
  _id: string;
  mediaUrl: string;
}

/*
============================================================
SAFE RESPONSE PARSER
============================================================
*/

const getResponseData = async (res: Response) => {
  const contentType =
    res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await res.json();
  }

  const text = await res.text();

  return {
    message:
      text ||
      `Server returned ${res.status} ${res.statusText}`,
  };
};

/*
============================================================
ADMIN TUTORIAL
============================================================
*/

export default function TutorialAdmin() {
  const [tutorials, setTutorials] =
    useState<Tutorial[]>([]);

  const [companyAds, setCompanyAds] =
    useState<CompanyAds[]>([]);
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [media, setMedia] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  /*
  ============================================================
  LOAD TUTORIALS
  ============================================================
  */

  const loadTutorials = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/get-all-tutorials`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data =
        await getResponseData(res);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to load tutorials (${res.status})`
        );
      }

      setTutorials(
        Array.isArray(data?.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error(
        "Load tutorials error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load tutorials."
      );
    }
  };

    const loadCompanyAds = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/get-companyAd`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data =
        await getResponseData(res);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to load tutorials (${res.status})`
        );
      }

      setCompanyAds(
        Array.isArray(data?.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error(
        "Load tutorials error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load tutorials."
      );
    }
  };

  /*
  ============================================================
  INITIAL LOAD
  ============================================================
  */

  useEffect(() => {
    loadTutorials();
    loadCompanyAds();
  }, []);

  /*
  ============================================================
  RESET FORM
  ============================================================
  */

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMedia(null);
    setEditingId(null);

    const input =
      document.getElementById(
        "tutorial-media"
      ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  };

  /*
  ============================================================
  SUBMIT
  ============================================================
  */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    if (!description.trim()) {
      toast.error(
        "Description is required."
      );
      return;
    }

    if (!editingId && !media) {
      toast.error(
        "Please select an image or video."
      );
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      if (media) {
        formData.append(
          "media",
          media
        );
      }

      const url = editingId
        ? `${API_URL}/api/admin/updateTutorial/${editingId}`
        : `${API_URL}/api/admin/create-tutorial`;

      const res = await fetch(
        url,
        {
          method: editingId
            ? "PUT"
            : "POST",

          credentials: "include",

          headers: {
            Accept: "application/json",
          },

          body: formData,
        }
      );

      const data =
        await getResponseData(res);

      console.log(
        "Tutorial response:",
        data
      );

      /*
      ========================================================
      ERROR RESPONSE
      ========================================================
      */

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Request failed (${res.status})`
        );
      }

      /*
      ========================================================
      SUCCESS TOAST
      ========================================================
      */

      toast.success(
        editingId
          ? "Tutorial updated successfully."
          : "Tutorial created successfully."
      );

      resetForm();

      await loadTutorials();
    } catch (error) {
      console.error(
        "Tutorial submit error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  EDIT
  ============================================================
  */

  const handleEdit = (
    tutorial: Tutorial
  ) => {
    setEditingId(
      tutorial._id
    );

    setTitle(
      tutorial.title
    );

    setDescription(
      tutorial.description
    );

    setMedia(null);

    const input =
      document.getElementById(
        "tutorial-media"
      ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    toast.success(
      "Tutorial loaded for editing."
    );
  };


  /*
  ============================================================
  DELETE
  ============================================================
  */

  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this tutorial?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const res =
        await fetch(
          `${API_URL}/api/admin/deleteTutorial/${id}`,
          {
            method: "DELETE",

            credentials: "include",

            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const data =
        await getResponseData(res);

      console.log(
        "Delete response:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Delete failed (${res.status})`
        );
      }

      toast.success(
        data?.message ||
          "Tutorial deleted successfully."
      );

      await loadTutorials();
    } catch (error) {
      console.error(
        "Delete tutorial error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Delete failed."
      );
    }
  };

    const handleDeleteAd = async (
    id: string
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this Ad?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const res =
        await fetch(
          `${API_URL}/api/admin/delete-companyAd/${id}`,
          {
            method: "DELETE",

            credentials: "include",

            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const data =
        await getResponseData(res);

      console.log(
        "Delete response:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Delete failed (${res.status})`
        );
      }

      toast.success(
        data?.message ||
          "Tutorial deleted successfully."
      );

      await loadTutorials();
    } catch (error) {
      console.error(
        "Delete tutorial error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Delete failed."
      );
    }
  };

   const [image, setImage] = useState<File | null>(null);

  
    const handleUpload = async () => {
      if (!image) {
        toast.error("Please select an image");
        return;
      }
  
      try {
        setLoading(true);
  
        const formData = new FormData();
  
        // IMPORTANT:
        // backend upload.single("image") hai
        formData.append("image", image);
  
        const response = await fetch(
          `${API_URL}/api/admin/create-companyAd`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to upload image"
          );
        }
  
        toast.success(
          data?.message ||
            "Income image uploaded successfully"
        );
  
        setImage(null);
  
        // input reset
        const input =
          document.getElementById(
            "income-image"
          ) as HTMLInputElement;
  
        if (input) {
          input.value = "";
        }
      } catch (error) {
        console.error(
          "Income Upload Error:",
          error
        );
  
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to upload image"
        );
      } finally {
        setLoading(false);
      }
    };
  

  /*
  ============================================================
  RETURN
  ============================================================
  */

  return (
    <>
      {/* =====================================================
          TOASTER
      ===================================================== */}

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontWeight: "600",
          },
        }}
      />
       <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">
        Upload Company Ads Images
      </h2>

      <input
        id="income-image"
        type="file"
        accept="image/*"
        onChange={(e) => {
          setImage(
            e.target.files?.[0] || null
          );
        }}
        className="mb-4 block w-full rounded-lg border p-3"
      />

      {image && (
        <div className="mb-4">
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="max-h-80 w-full rounded-xl object-contain"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={loading || !image}
        className="w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading
          ? "Uploading..."
          : "Upload Company Ads Images"}
      </button>
        <div className="space-y-4 mt-3">
            {companyAds.map(
              (tutorial) => (
                <div
                  key={
                    tutorial._id
                  }
                  className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow sm:flex-row"
                >
                  {/* MEDIA */}

                  <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:w-48">
                  
                      <img
                        src={
                          tutorial.mediaUrl
                        }
                        alt={
                          tutorial.mediaUrl
                        }
                        className="h-full w-full object-cover"
                      />
                  </div>



                  {/* ACTIONS */}

                  <div className="flex shrink-0 gap-2 sm:flex-col">

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteAd(
                          tutorial._id
                        )
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}

            {/* EMPTY */}

            {companyAds.length ===
              0 && (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
                No Ad found.
              </div>
            )}
          </div> 
    </div>

      <div className="py-4 sm:py-8">
        <div className="mx-auto max-w-5xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <h1 className="mb-6 text-3xl font-bold">
            Video Tutorials
          </h1>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-2xl bg-white p-5 shadow"
          >
            <h2 className="mb-5 text-xl font-bold">
              {editingId
                ? "Edit Tutorial"
                : "Add Tutorial"}
            </h2>

            {/* TITLE */}

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Tutorial title"
              className="mb-4 w-full rounded-xl border px-4 py-3 outline-none focus:border-yellow-500"
            />

            {/* DESCRIPTION */}

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Tutorial description"
              rows={4}
              className="mb-4 w-full rounded-xl border px-4 py-3 outline-none focus:border-yellow-500"
            />

            {/* MEDIA */}

            <div className="mb-5">
              <label
                htmlFor="tutorial-media"
                className="mb-2 block font-semibold"
              >
                {editingId
                  ? "Replace Image / Video (optional)"
                  : "Image / Video"}
              </label>

              <input
                id="tutorial-media"
                type="file"
                accept="image/*,video/*"
                onChange={(e) =>
                  setMedia(
                    e.target.files?.[0] ||
                      null
                  )
                }
                className="w-full rounded-xl border p-3"
              />

              {media && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected:{" "}
                  {media.name}
                </p>
              )}
            </div>

            {/* BUTTONS */}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-yellow-600 px-6 py-3 font-bold text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? editingId
                    ? "Updating..."
                    : "Uploading..."
                  : editingId
                  ? "Update Tutorial"
                  : "Add Tutorial"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="rounded-xl bg-gray-200 px-6 py-3 font-bold transition hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* =================================================
              TUTORIAL LIST
          ================================================= */}

          <div className="space-y-4">
            {tutorials.map(
              (tutorial) => (
                <div
                  key={
                    tutorial._id
                  }
                  className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow sm:flex-row"
                >
                  {/* MEDIA */}

                  <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:w-48">
                    {tutorial.mediaType ===
                    "video" ? (
                      <video
                        src={
                          tutorial.mediaUrl
                        }
                        className="h-full w-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={
                          tutorial.mediaUrl
                        }
                        alt={
                          tutorial.title
                        }
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold">
                      {
                        tutorial.title
                      }
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {
                        tutorial.description
                      }
                    </p>

                    <p className="mt-2 text-xs font-semibold uppercase text-yellow-700">
                      {
                        tutorial.mediaType
                      }
                    </p>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex shrink-0 gap-2 sm:flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          tutorial
                        )
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          tutorial._id
                        )
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}

            {/* EMPTY */}

            {tutorials.length ===
              0 && (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
                No tutorials found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}