"use client";

import { useEffect, useState } from "react";
import {
  Play,
  X,
} from "lucide-react";

import { useUserTheme } from "./UserThemeProvider";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: "image" | "video";
}

export default function VideoTutorialPage() {
  const { settings } = useUserTheme();

  /*
  ============================================================
  THEME
  ============================================================
  */

  const primaryColor =
    settings.primaryColor ||
    "var(--user-primary)";

  const secondaryColor =
    settings.secondaryColor ||
    "var(--user-secondary)";

  const backgroundColor =
    settings.backgroundColor ||
    "var(--user-background)";

  const cardColor =
    settings.cardColor ||
    "var(--user-card)";

  const textColor =
    settings.textColor ||
    "var(--user-text)";

  const buttonColor =
    settings.buttonColor ||
    primaryColor;

  const buttonTextColor =
    settings.buttonTextColor ||
    "var(--user-button-text)";

  const secondaryTextColor =
    "var(--user-text-secondary)";

  const gradientStart =
    settings.gradientStart ||
    primaryColor;

  const gradientEnd =
    settings.gradientEnd ||
    secondaryColor;

  const gradient =
    `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`;

  const borderColor =
    `color-mix(in srgb, ${primaryColor} 30%, transparent)`;

  const playBackground =
    `color-mix(in srgb, ${primaryColor} 12%, ${cardColor})`;

  const playColor =
    primaryColor;

  /*
  ============================================================
  STATE
  ============================================================
  */

  const [tutorials, setTutorials] =
    useState<Tutorial[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selected, setSelected] =
    useState<Tutorial | null>(null);

  /*
  ============================================================
  LOAD TUTORIALS
  ============================================================
  */

  useEffect(() => {
    let cancelled = false;

    const loadTutorials =
      async () => {
        try {
          setLoading(true);

          const res =
            await fetch(
              `${API_URL}/api/user/tutorial`,
              {
                method: "GET",
                cache: "no-store",
                credentials: "include",
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const contentType =
            res.headers.get(
              "content-type"
            );

          if (
            !contentType
              ?.toLowerCase()
              .includes(
                "application/json"
              )
          ) {
            const text =
              await res.text();

            console.error(
              "Tutorial API returned non JSON:",
              text
            );

            throw new Error(
              `Server returned ${res.status} ${res.statusText}`
            );
          }

          const data =
            await res.json();

          console.log(
            "TUTORIAL API RESPONSE:",
            data
          );

          if (!res.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                "Failed to load tutorials."
            );
          }

          if (!cancelled) {
            setTutorials(
              data?.data || []
            );
          }
        } catch (error) {
          console.error(
            "Tutorial load error:",
            error
          );

          if (!cancelled) {
            setTutorials([]);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadTutorials();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  ============================================================
  CLOSE MODAL
  ============================================================
  */

  const closeModal = () => {
    setSelected(null);
  };

  /*
  ============================================================
  ESC KEY
  ============================================================
  */

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          backgroundColor,
          color: textColor,
        }}
      >
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-4"
            style={{
              borderColor:
                `color-mix(in srgb, ${primaryColor} 20%, transparent)`,
              borderTopColor:
                primaryColor,
            }}
          />

          <p
            className="mt-3 text-sm font-medium"
            style={{
              color: textColor,
            }}
          >
            Loading tutorials...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  RETURN
  ============================================================
  */

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-6 sm:px-6">

        {/* ==================================================
            TUTORIAL LIST
        ================================================== */}

        {tutorials.map(
          (tutorial) => (
            <button
              key={tutorial._id}
              type="button"
              onClick={() =>
                setSelected(
                  tutorial
                )
              }
              className="mb-5 flex w-full items-center gap-4 p-5 text-left shadow-md transition hover:scale-[1.01]"
              style={{
                background:gradient,
                borderLeft:
                  `4px solid ${buttonTextColor}`,
                borderRadius:
                  "var(--user-radius)",
              }}
            >
              {/* CONTENT */}

              <div className="min-w-0 flex-1">

                <h2
                  className="text-md font-bold"
                  style={{
                    color:
                      buttonTextColor
                  }}
                >
                  {tutorial.title}
                </h2>

                <p
                  className="text-xs"
                  style={{
                    color:
                      buttonTextColor,
                  }}
                >
                  {
                    tutorial.description
                  }
                </p>

              </div>

              {/* PLAY */}

              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    playBackground,
                }}
              >
                <Play
                  size={23}
                  fill={playColor}
                  color={gradient}
                />
              </div>

            </button>
          )
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {tutorials.length === 0 && (
          <div
            className="p-4 text-center shadow-sm"
            style={{
              backgroundColor:
                cardColor,
              color:
                secondaryTextColor,
              borderRadius:
                "var(--user-radius)",
            }}
          >
            No tutorials available.
          </div>
        )}

      </div>

      {/* ======================================================
          MEDIA MODAL
      ====================================================== */}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-h-[95vh] w-full max-w-4xl overflow-hidden shadow-2xl"
            style={{
              backgroundColor:
                "#000000",
              borderRadius:
                "var(--user-radius)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* ==================================================
                CLOSE BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={closeModal}
              className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition hover:scale-105"
              style={{
                background:
                  gradient,
                color:
                  buttonTextColor,
              }}
              aria-label="Close"
            >
              <X size={25} />
            </button>

            {/* ==================================================
                TITLE
            ================================================== */}

            <div
              className="absolute left-4 top-4 z-20 max-w-[70%] px-3 py-2 shadow-lg"
              style={{
                background:
                  `color-mix(in srgb, ${cardColor} 90%, transparent)`,
                color:
                  textColor,
                borderRadius:
                  "var(--user-radius)",
              }}
            >
              <p className="font-bold">
                {selected.title}
              </p>
            </div>

            {/* ==================================================
                IMAGE
            ================================================== */}

            {selected.mediaType ===
              "image" && (
              <img
                src={
                  selected.mediaUrl
                }
                alt={
                  selected.title
                }
                className="max-h-[90vh] w-full object-contain"
              />
            )}

            {/* ==================================================
                VIDEO
            ================================================== */}

            {selected.mediaType ===
              "video" && (
              <video
                src={
                  selected.mediaUrl
                }
                controls
                autoPlay
                playsInline
                className="max-h-[90vh] w-full"
              />
            )}

          </div>
        </div>
      )}
    </div>
  );
}