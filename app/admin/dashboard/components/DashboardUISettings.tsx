"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Palette, Save, RefreshCw, DollarSign } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type CurrencyType = "USD" | "PKR";

interface SiteSettings {
  siteName: string;
  favicon: string;

  primaryColor: string;
  secondaryColor: string;

  backgroundColor: string;
  cardColor: string;

  textColor: string;
  mutedTextColor: string;

  buttonColor: string;
  buttonTextColor: string;
  buttonHoverColor: string;

  borderColor: string;

  sidebarColor: string;
  headerColor: string;

  accentColor: string;

  gradientStart: string;
  gradientEnd: string;

  gridColumns: number;
  borderRadius: string;
}

const defaultSettings: SiteSettings = {
  siteName: "My Platform",
  favicon: "",

  primaryColor: "#000000",
  secondaryColor: "#6B7280",

  backgroundColor: "#F9FAFB",
  cardColor: "#FFFFFF",

  textColor: "#111827",
  mutedTextColor: "#6B7280",

  buttonColor: "#000000",
  buttonTextColor: "#FFFFFF",
  buttonHoverColor: "#222222",

  borderColor: "#E5E7EB",

  sidebarColor: "#000000",
  headerColor: "#FFFFFF",

  accentColor: "#7C60F4",

  gradientStart: "#7C60F4",
  gradientEnd: "#E749A0",

  gridColumns: 3,
  borderRadius: "12px",
};

export default function SiteCustomizationSection() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  const [currency, setCurrency] = useState<CurrencyType>("USD");

  const [loading, setLoading] = useState(true);

  const [currencyLoading, setCurrencyLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [currencySaving, setCurrencySaving] = useState(false);

  /*
  ============================================================
  FETCH SITE SETTINGS
  ============================================================
  */

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/admin/site-settings`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

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
        throw new Error(data?.message || "Failed to load settings");
      }

      if (data?.data) {
        setSettings({
          ...defaultSettings,
          ...data.data,
        });
      }
    } catch (error) {
      console.error("fetchSettings error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to load settings",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  FETCH CURRENCY
  ============================================================
  */

  const fetchCurrency = async () => {
    try {
      setCurrencyLoading(true);

      const response = await fetch(`${API_URL}/api/admin/getCurrency`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

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
        throw new Error(data?.message || "Failed to load currency");
      }

      const currentCurrency = data?.data?.currency;

      if (currentCurrency === "USD" || currentCurrency === "PKR") {
        setCurrency(currentCurrency);
      }
    } catch (error) {
      console.error("fetchCurrency error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to load currency",
      );
    } finally {
      setCurrencyLoading(false);
    }
  };

  useEffect(() => {
    if (!API_URL) {
      toast.error("NEXT_PUBLIC_API_URL is not configured");
      setLoading(false);
      setCurrencyLoading(false);
      return;
    }

    fetchSettings();
    fetchCurrency();
  }, []);

  /*
  ============================================================
  HANDLE CHANGE
  ============================================================
  */

  const handleChange = <K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
  ============================================================
  UPDATE CURRENCY
  ============================================================
  */

  const updateCurrency = async (newCurrency: CurrencyType) => {
    if (!API_URL) {
      toast.error("API URL is not configured");
      return;
    }

    try {
      setCurrencySaving(true);

      const response = await fetch(`${API_URL}/api/admin/update-currency`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          currency: newCurrency,
        }),
      });

      console.log("STATUS:", response.status);
      console.log("URL:", response.url);

      const text = await response.text();

      console.log("RAW RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned invalid JSON.");
      }

      console.log("PARSED RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update currency.");
      }
      const updatedCurrency = data?.data?.currency;

      if (updatedCurrency === "USD" || updatedCurrency === "PKR") {
        setCurrency(updatedCurrency);
      } else {
        setCurrency(newCurrency);
      }

      toast.success(`Currency changed to ${newCurrency} successfully.`);
    } catch (error) {
      console.error("updateCurrency error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to update currency",
      );
    } finally {
      setCurrencySaving(false);
    }
  };

  /*
  ============================================================
  SAVE SITE SETTINGS
  ============================================================
  */

  const saveSettings = async () => {
    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/admin/site-settings`, {
        method: "PUT",

        credentials: "include",

        headers: {
          "Content-Type": "application/json",

          Accept: "application/json",
        },

        body: JSON.stringify(settings),
      });

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
        throw new Error(data?.message || "Failed to save settings");
      }

      if (data?.data) {
        setSettings({
          ...defaultSettings,
          ...data.data,
        });
      }

      toast.success("User dashboard design updated!");
    } catch (error) {
      console.error("saveSettings error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading || currencyLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw size={22} className="animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  /*
  ============================================================
  COLOR SETTINGS
  ============================================================
  */

  const colors: {
    key: keyof SiteSettings;
    label: string;
  }[] = [
    {
      key: "primaryColor",
      label: "Primary Color",
    },

    {
      key: "secondaryColor",
      label: "Secondary Color",
    },

    {
      key: "backgroundColor",
      label: "Background Color",
    },

    {
      key: "cardColor",
      label: "Card Color",
    },

    {
      key: "textColor",
      label: "Text Color",
    },

    {
      key: "mutedTextColor",
      label: "Muted Text Color",
    },

    {
      key: "buttonColor",
      label: "Button Color",
    },

    {
      key: "buttonTextColor",
      label: "Button Text Color",
    },

    {
      key: "buttonHoverColor",
      label: "Button Hover Color",
    },

    {
      key: "borderColor",
      label: "Border Color",
    },

    {
      key: "sidebarColor",
      label: "Sidebar Color",
    },

    {
      key: "headerColor",
      label: "Header Color",
    },

    {
      key: "accentColor",
      label: "Accent Color",
    },

    {
      key: "gradientStart",
      label: "Gradient Start",
    },

    {
      key: "gradientEnd",
      label: "Gradient End",
    },
  ];

  /*
  ============================================================
  UI
  ============================================================
  */

  return (
    <div className="space-y-6">
      {/* ======================================================
          TITLE
      ====================================================== */}

      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Palette size={24} />
          User Dashboard Customization
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          These settings control the colors, layout and currency of the user
          dashboard.
        </p>
      </div>

      {/* ======================================================
          CURRENCY SETTINGS
      ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
            <DollarSign size={22} className="text-gray-700" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Currency Settings
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Select the currency used throughout the entire platform.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* USD */}

          <button
            type="button"
            disabled={currencySaving}
            onClick={() => updateCurrency("USD")}
            className={`rounded-xl border p-5 text-left transition ${
              currency === "USD"
                ? "border-black bg-gray-50 ring-2 ring-black"
                : "border-gray-200 bg-white hover:border-gray-400"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">USD</p>

                <p className="mt-1 text-sm text-gray-500">US Dollar ($)</p>
              </div>

              <span className="text-2xl font-bold text-gray-900">$</span>
            </div>

            {currency === "USD" && (
              <p className="mt-3 text-xs font-semibold text-green-600">
                Currently Active
              </p>
            )}
          </button>

          {/* PKR */}

          <button
            type="button"
            disabled={currencySaving}
            onClick={() => updateCurrency("PKR")}
            className={`rounded-xl border p-5 text-left transition ${
              currency === "PKR"
                ? "border-black bg-gray-50 ring-2 ring-black"
                : "border-gray-200 bg-white hover:border-gray-400"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">PKR</p>

                <p className="mt-1 text-sm text-gray-500">
                  Pakistani Rupee (₨)
                </p>
              </div>

              <span className="text-2xl font-bold text-gray-900">₨</span>
            </div>

            {currency === "PKR" && (
              <p className="mt-3 text-xs font-semibold text-green-600">
                Currently Active
              </p>
            )}
          </button>
        </div>

        {currencySaving && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw size={16} className="animate-spin" />
            Updating currency...
          </div>
        )}
      </div>

      {/* ======================================================
          SITE INFORMATION
      ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-bold">Site Information</h3>

        <div className="grid gap-5 md:grid-cols-2">
          {/* SITE NAME */}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Site Name
            </label>

            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange("siteName", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="My Platform"
            />
          </div>

          {/* FAVICON */}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Favicon URL
            </label>

            <input
              type="text"
              value={settings.favicon}
              onChange={(e) => handleChange("favicon", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="https://example.com/favicon.png"
            />
          </div>
        </div>
      </div>

      {/* ======================================================
          COLORS
      ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-bold">Dashboard Colors</h3>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((item) => {
            const value = settings[item.key];

            return (
              <div key={item.key}>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {item.label}
                </label>

                <div className="flex gap-2">
                  <input
                    type="color"
                    value={typeof value === "string" ? value : "#000000"}
                    onChange={(e) =>
                      handleChange(
                        item.key,
                        e.target.value as SiteSettings[typeof item.key],
                      )
                    }
                    className="h-11 w-14 cursor-pointer rounded-lg border"
                  />

                  <input
                    type="text"
                    value={typeof value === "string" ? value : ""}
                    onChange={(e) =>
                      handleChange(
                        item.key,
                        e.target.value as SiteSettings[typeof item.key],
                      )
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
                    placeholder="#000000"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* GRADIENT PREVIEW */}

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold">
            Dashboard Gradient Preview
          </label>

          <div
            className="h-16 w-full rounded-xl"
            style={{
              background: `linear-gradient(
                to right,
                ${settings.gradientStart},
                ${settings.gradientEnd}
              )`,
            }}
          />
        </div>
      </div>

      {/* ======================================================
          LAYOUT
      ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-bold">User Dashboard Layout</h3>

        <div className="grid gap-5 md:grid-cols-2">
          {/* GRID */}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Grid Columns
            </label>

            <select
              value={settings.gridColumns}
              onChange={(e) =>
                handleChange("gridColumns", Number(e.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
            >
              <option value={1}>1 Column</option>

              <option value={2}>2 Columns</option>

              <option value={3}>3 Columns</option>

              <option value={4}>4 Columns</option>

              <option value={5}>5 Columns</option>

              <option value={6}>6 Columns</option>
            </select>
          </div>

          {/* BORDER */}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Border Radius
            </label>

            <select
              value={settings.borderRadius}
              onChange={(e) => handleChange("borderRadius", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
            >
              <option value="0px">Square</option>

              <option value="6px">Small</option>

              <option value="12px">Medium</option>

              <option value="18px">Large</option>

              <option value="24px">Extra Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================
          LIVE PREVIEW
      ====================================================== */}

      <div
        className="rounded-2xl border p-6 shadow-sm"
        style={{
          backgroundColor: settings.backgroundColor,
          borderColor: settings.borderColor,
          borderRadius: settings.borderRadius,
        }}
      >
        <h3
          className="mb-4 text-lg font-bold"
          style={{
            color: settings.textColor,
          }}
        >
          Dashboard Preview
        </h3>

        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: settings.cardColor,
            borderRadius: settings.borderRadius,
            border: `1px solid ${settings.borderColor}`,
          }}
        >
          <p
            className="text-sm font-semibold"
            style={{
              color: settings.textColor,
            }}
          >
            {settings.siteName}
          </p>

          <p
            className="mt-1 text-sm"
            style={{
              color: settings.mutedTextColor,
            }}
          >
            User dashboard preview
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg px-5 py-2 text-sm font-semibold"
              style={{
                backgroundColor: settings.buttonColor,
                color: settings.buttonTextColor,
                borderRadius: settings.borderRadius,
              }}
            >
              Button
            </button>

            <div
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(
                  to right,
                  ${settings.gradientStart},
                  ${settings.gradientEnd}
                )`,
                borderRadius: settings.borderRadius,
              }}
            >
              Gradient
            </div>

            <div
              className="rounded-lg px-5 py-2 text-sm font-semibold"
              style={{
                backgroundColor: settings.accentColor,
                color: "#FFFFFF",
                borderRadius: settings.borderRadius,
              }}
            >
              Accent
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          SAVE
      ====================================================== */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}

          {saving ? "Saving..." : "Save User Dashboard Design"}
        </button>
      </div>
    </div>
  );
}
