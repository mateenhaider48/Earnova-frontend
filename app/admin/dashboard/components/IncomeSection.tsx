"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export default function IncomeAdmin() {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
        `${API_URL}/api/admin/create-income`,
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

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">
        Upload Income Image
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
          : "Upload Income Image"}
      </button>
    </div>
  );
}