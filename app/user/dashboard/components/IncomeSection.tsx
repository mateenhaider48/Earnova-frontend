"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

function IncomeSection() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getIncome = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/user/get-income`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();
        

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to get income"
          );
        }

     
        const incomeData = Array.isArray(
          data?.data
        )
          ? data.data
          : [];

        const imageUrls = incomeData
          .map(
            (item: any) =>
              item?.image
          )
          .filter(Boolean);

        setImages(imageUrls);
      } catch (error) {
        console.error(
          "Get Income Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getIncome();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        Loading...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        No income images available
      </div>
    );
  }

  return (
    <div className="w-full">
      {images.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt={`Income ${index + 1}`}
          className="block w-full object-contain m-0 p-0"
        />
      ))}
    </div>
  );
}

export default IncomeSection;