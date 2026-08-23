"use client";

import { useEffect, useState } from "react";
import {
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";
import { Mail, Headphones } from "lucide-react";

import { useUserTheme } from "./UserThemeProvider";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/*
============================================================
TYPES
============================================================
*/

interface SupportItem {
  title: string;
  description: string;
  link: string;
  buttonText: string;
  enabled: boolean;
}

interface SupportData {
  title: string;
  description: string;
  telegram: SupportItem;
  whatsapp: SupportItem;
  email: SupportItem;
  whatsappGroup: SupportItem;
}

/*
============================================================
GET SUPPORT URL
============================================================
*/

function getSupportUrl(
  link: string,
  type:
    | "telegram"
    | "whatsapp"
    | "email"
    | "whatsappGroup",
) {
  if (!link) return "";

  const cleanLink = String(link).trim();

  if (!cleanLink) return "";

  /*
  ============================================================
  EMAIL
  ============================================================
  */

  if (type === "email") {
    const email = cleanLink
      .replace(/^mailto:/i, "")
      .trim();

    if (!email) return "";

    /*
    Gmail compose page.
    Is se browser ka mail app open hone ke bajaye
    Gmail ka compose page directly open hoga.
    */

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      email,
    )}`;
  }

  /*
  ============================================================
  WHATSAPP
  ============================================================
  */

  if (type === "whatsapp") {
    if (
      cleanLink.startsWith("http://") ||
      cleanLink.startsWith("https://")
    ) {
      return cleanLink;
    }

    const phone = cleanLink.replace(
      /[^\d]/g,
      "",
    );

    if (!phone) return "";

    return `https://wa.me/${phone}`;
  }

  /*
  ============================================================
  WHATSAPP GROUP
  ============================================================
  */

  if (type === "whatsappGroup") {
    if (
      cleanLink.startsWith("http://") ||
      cleanLink.startsWith("https://")
    ) {
      return cleanLink;
    }

    if (
      cleanLink.startsWith(
        "chat.whatsapp.com/",
      )
    ) {
      return `https://${cleanLink}`;
    }

    return `https://${cleanLink}`;
  }

  /*
  ============================================================
  TELEGRAM
  ============================================================
  */

  if (type === "telegram") {
    if (
      cleanLink.startsWith("http://") ||
      cleanLink.startsWith("https://")
    ) {
      return cleanLink;
    }

    if (cleanLink.startsWith("@")) {
      return `https://t.me/${cleanLink.substring(
        1,
      )}`;
    }

    if (cleanLink.startsWith("t.me/")) {
      return `https://${cleanLink}`;
    }

    return `https://t.me/${cleanLink}`;
  }

  /*
  ============================================================
  OTHER
  ============================================================
  */

  if (
    cleanLink.startsWith("http://") ||
    cleanLink.startsWith("https://")
  ) {
    return cleanLink;
  }

  return `https://${cleanLink}`;
}

/*
============================================================
SUPPORT CARD
============================================================
*/

function SupportCard({
  item,
  type,
  icon,
  iconBackground,
  gradient,
  buttonTextColor,
  borderColor,
  cardColor,
}: {
  item: SupportItem;
  type:
    | "telegram"
    | "whatsapp"
    | "email"
    | "whatsappGroup";
  icon: React.ReactNode;
  iconBackground: string;
  gradient: string;
  buttonTextColor: string;
  borderColor: string;
  cardColor: string;
}) {
  const url = getSupportUrl(
    item?.link || "",
    type,
  );

  return (
    <div
      className="mb-3 flex min-h-[78px] items-center gap-3 rounded-2xl px-3 py-3 shadow-sm sm:gap-4 sm:px-5"
      style={{
        backgroundColor: cardColor,
        borderLeft: `4px solid ${borderColor}`,
      }}
    >
      {/* ==================================================
          ICON
      ================================================== */}

      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14"
        style={{
          background: iconBackground,
        }}
      >
        {icon}
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="min-w-0 flex-1">
        <h2
          className="truncate text-sm font-bold sm:text-xl"
          style={{
            color: "#111111",
          }}
        >
          {item?.title || "Support"}
        </h2>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 sm:text-sm">
          {item?.description || ""}
        </p>
      </div>

      {/* ==================================================
          BUTTON
      ================================================== */}

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl px-4 py-2 text-center text-xs font-bold shadow-sm transition hover:scale-[1.02] sm:px-6 sm:py-3 sm:text-sm"
          style={{
            background: gradient,
            color: buttonTextColor,
          }}
        >
          {item?.buttonText || "Open"}
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="shrink-0 cursor-not-allowed rounded-xl px-4 py-2 text-xs font-bold opacity-50 sm:px-6 sm:py-3 sm:text-sm"
          style={{
            background: gradient,
            color: buttonTextColor,
          }}
        >
          {item?.buttonText || "Open"}
        </button>
      )}
    </div>
  );
}

/*
============================================================
SUPPORT SECTION
============================================================
*/

export default function SupportSection() {
  const { settings } = useUserTheme();

  /*
  ============================================================
  STATE
  ============================================================
  */

  const [support, setSupport] =
    useState<SupportData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

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

  const buttonTextColor =
    settings.buttonTextColor ||
    "var(--user-button-text)";

  const gradient =
    `linear-gradient(to right, ${
      settings.gradientStart ||
      primaryColor
    }, ${
      settings.gradientEnd ||
      secondaryColor
    })`;

  const borderColor =
    primaryColor;

  /*
  ============================================================
  GET SUPPORT FROM DATABASE
  ============================================================
  */

  useEffect(() => {
    let cancelled = false;

    const loadSupport = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_URL}/api/user/get-support`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        const contentType =
          res.headers.get(
            "content-type",
          );

        if (
          !contentType
            ?.toLowerCase()
            .includes(
              "application/json",
            )
        ) {
          const text =
            await res.text();

          console.error(
            "get-support returned non JSON:",
            text,
          );

          throw new Error(
            `Server returned ${res.status} ${res.statusText}`,
          );
        }

        const data =
          await res.json();

        console.log(
          "SUPPORT API RESPONSE:",
          data,
        );

        if (!res.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to load support.",
          );
        }

        if (!cancelled) {
          const supportData =
            data?.data ??
            data?.support ??
            null;

          setSupport(
            supportData,
          );
        }
      } catch (err) {
        console.error(
          "Support load error:",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load support.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSupport();

    return () => {
      cancelled = true;
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
        }}
      >
        <div className="text-center">
          <div
            className="mx-auto h-9 w-9 animate-spin rounded-full border-4"
            style={{
              borderColor:
                "rgba(194,145,0,0.20)",
              borderTopColor:
                primaryColor,
            }}
          />

          <p
            className="mt-3 text-sm"
            style={{
              color: textColor,
            }}
          >
            Loading support...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  ERROR
  ============================================================
  */

  if (error || !support) {
    return (
      <div
        className="min-h-screen p-5"
        style={{
          backgroundColor,
        }}
      >
        <div
          className="rounded-2xl p-6 text-center shadow-sm"
          style={{
            backgroundColor:
              cardColor,
          }}
        >
          <p className="font-semibold text-red-600">
            {error ||
              "Support information unavailable."}
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
      className="min-h-screen overflow-y-auto"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-6 sm:px-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-7 text-center">

          {/* HEADPHONE */}

          <div
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full shadow-lg sm:h-24 sm:w-24"
            style={{
              background: gradient,
            }}
          >
            <Headphones
              size={42}
              strokeWidth={2}
              color="white"
            />
          </div>

          {/* TITLE */}

          <h1
            className="text-3xl font-bold sm:text-4xl"
            style={{
              color: textColor,
            }}
          >
            {support.title ||
              "Customer Support"}
          </h1>

          {/* DESCRIPTION */}

          <p
            className="mx-auto mt-2 max-w-xl text-sm leading-7 sm:text-base"
            style={{
              color:
                "var(--user-text-secondary)",
            }}
          >
            {support.description}
          </p>
        </div>

        {/* ==================================================
            TELEGRAM
        ================================================== */}

        {support.telegram?.enabled && (
          <SupportCard
            item={support.telegram}
            type="telegram"
            icon={
              <FaTelegramPlane
                size={28}
                color="white"
              />
            }
            iconBackground="#29A9E0"
            gradient={gradient}
            buttonTextColor={
              buttonTextColor
            }
            borderColor={
              borderColor
            }
            cardColor={
              cardColor
            }
          />
        )}

        {/* ==================================================
            WHATSAPP
        ================================================== */}

        {support.whatsapp?.enabled && (
          <SupportCard
            item={support.whatsapp}
            type="whatsapp"
            icon={
              <FaWhatsapp
                size={28}
                color="white"
              />
            }
            iconBackground="#25D366"
            gradient={gradient}
            buttonTextColor={
              buttonTextColor
            }
            borderColor={
              borderColor
            }
            cardColor={
              cardColor
            }
          />
        )}

        {/* ==================================================
            EMAIL
        ================================================== */}

        {support.email?.enabled && (
          <SupportCard
            item={support.email}
            type="email"
            icon={
              <Mail
                size={28}
                color="white"
              />
            }
            iconBackground="linear-gradient(135deg, #D5A500, #A87500)"
            gradient={gradient}
            buttonTextColor={
              buttonTextColor
            }
            borderColor={
              borderColor
            }
            cardColor={
              cardColor
            }
          />
        )}

        {/* ==================================================
            WHATSAPP GROUP
        ================================================== */}

        {support.whatsappGroup?.enabled && (
          <SupportCard
            item={support.whatsappGroup}
            type="whatsappGroup"
            icon={
              <FaWhatsapp
                size={28}
                color="white"
              />
            }
            iconBackground="#25D366"
            gradient={gradient}
            buttonTextColor={
              buttonTextColor
            }
            borderColor={
              borderColor
            }
            cardColor={
              cardColor
            }
          />
        )}

        {/* ==================================================
            NO ACTIVE SUPPORT
        ================================================== */}

        {!support.telegram?.enabled &&
          !support.whatsapp?.enabled &&
          !support.email?.enabled &&
          !support.whatsappGroup
            ?.enabled && (
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                backgroundColor:
                  cardColor,
              }}
            >
              <p
                className="font-semibold"
                style={{
                  color: textColor,
                }}
              >
                No support channels
                are currently
                available.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
