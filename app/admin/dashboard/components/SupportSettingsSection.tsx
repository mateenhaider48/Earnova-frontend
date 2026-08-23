"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  Send,
  MessageCircle,
  Mail,
  Users,
  Headphones,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

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

const defaultItem = (): SupportItem => ({
  title: "",
  description: "",
  link: "",
  buttonText: "Chat",
  enabled: true,
});

const defaultSupport: SupportData = {
  title: "Customer Support",
  description:
    "Need help? Our support team is available 24/7 to assist you with Recharge, Withdrawal, Account and Technical Issues.",

  telegram: {
    ...defaultItem(),
    title: "Telegram Support",
    description: "Fast response within minutes",
    buttonText: "Chat",
  },

  whatsapp: {
    ...defaultItem(),
    title: "WhatsApp Support",
    description: "Direct customer assistance",
    buttonText: "Chat",
  },

  email: {
    ...defaultItem(),
    title: "Email Support",
    description: "For business & account issues",
    buttonText: "Send",
  },

  whatsappGroup: {
    ...defaultItem(),
    title: "WhatsApp Group",
    description:
      "Join our official community for updates",
    buttonText: "Join",
  },
};

export default function SupportSettingsSection() {
  const [support, setSupport] =
    useState<SupportData>(defaultSupport);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /*
  ============================================================
  API HELPER
  ============================================================
  */

  const apiRequest = async (
    endpoint: string,
    options: RequestInit = {},
  ) => {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      },
    );

    const text = await response.text();

    let data: any = null;

    try {
      data = text
        ? JSON.parse(text)
        : null;
    } catch {
      throw new Error(
        `Server returned invalid JSON (${response.status}).`,
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Something went wrong.",
      );
    }

    return data;
  };

  /*
  ============================================================
  GET SUPPORT
  ============================================================
  */

  const fetchSupport = async () => {
    try {
      setLoading(true);

      /*
      Public/user GET API se current support
      configuration load hogi.
      */

      const data = await apiRequest(
        "/api/user/get-support",
        {
          method: "GET",
        },
      );

      if (data?.data) {
        setSupport({
          ...defaultSupport,
          ...data.data,

          telegram: {
            ...defaultSupport.telegram,
            ...(data.data.telegram || {}),
          },

          whatsapp: {
            ...defaultSupport.whatsapp,
            ...(data.data.whatsapp || {}),
          },

          email: {
            ...defaultSupport.email,
            ...(data.data.email || {}),
          },

          whatsappGroup: {
            ...defaultSupport.whatsappGroup,
            ...(data.data.whatsappGroup || {}),
          },
        });
      }
    } catch (error) {
      console.error(
        "fetchSupport error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load support.",
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
    fetchSupport();
  }, []);

  /*
  ============================================================
  UPDATE ROOT FIELD
  ============================================================
  */

  const updateRootField = (
    field: "title" | "description",
    value: string,
  ) => {
    setSupport((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
  ============================================================
  UPDATE SUPPORT ITEM
  ============================================================
  */

  const updateItem = (
    key:
      | "telegram"
      | "whatsapp"
      | "email"
      | "whatsappGroup",
    field: keyof SupportItem,
    value: string | boolean,
  ) => {
    setSupport((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        [field]: value,
      },
    }));
  };

  /*
  ============================================================
  SAVE SUPPORT
  ============================================================
  */

  const saveSupport = async () => {
    try {
      setSaving(true);

      const payload = {
        title: support.title.trim(),

        description:
          support.description.trim(),

        telegram: {
          ...support.telegram,
          title:
            support.telegram.title.trim(),
          description:
            support.telegram.description.trim(),
          link:
            support.telegram.link.trim(),
          buttonText:
            support.telegram.buttonText.trim(),
        },

        whatsapp: {
          ...support.whatsapp,
          title:
            support.whatsapp.title.trim(),
          description:
            support.whatsapp.description.trim(),
          link:
            support.whatsapp.link.trim(),
          buttonText:
            support.whatsapp.buttonText.trim(),
        },

        email: {
          ...support.email,
          title:
            support.email.title.trim(),
          description:
            support.email.description.trim(),
          link:
            support.email.link.trim(),
          buttonText:
            support.email.buttonText.trim(),
        },

        whatsappGroup: {
          ...support.whatsappGroup,
          title:
            support.whatsappGroup.title.trim(),
          description:
            support.whatsappGroup.description.trim(),
          link:
            support.whatsappGroup.link.trim(),
          buttonText:
            support.whatsappGroup.buttonText.trim(),
        },
      };

      /*
      Admin API
      */

      await apiRequest(
        "/api/admin/update-support",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );

      toast.success(
        "Support settings updated successfully.",
      );

      await fetchSupport();
    } catch (error) {
      console.error(
        "saveSupport error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update support.",
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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="mt-4 text-sm text-gray-500">
            Loading support settings...
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
    <section>
      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Support Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer support information shown
            on the user dashboard.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchSupport}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            onClick={saveSupport}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            <Save size={18} />

            {saving
              ? "Saving..."
              : "Save Support"}
          </button>
        </div>
      </div>

      {/* GENERAL SETTINGS */}

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Headphones size={20} />
          </div>

          <div>
            <h2 className="font-bold text-gray-900">
              General Support
            </h2>

            <p className="text-sm text-gray-500">
              Main heading and description.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <InputField
            label="Support Title"
            value={support.title}
            onChange={(value) =>
              updateRootField(
                "title",
                value,
              )
            }
          />

          <TextAreaField
            label="Support Description"
            value={support.description}
            onChange={(value) =>
              updateRootField(
                "description",
                value,
              )
            }
          />
        </div>
      </div>

      {/* SUPPORT CHANNELS */}

      <div className="grid gap-6 xl:grid-cols-2">
        <SupportEditor
          label="Telegram Support"
          icon={
            <Send size={21} />
          }
          iconClass="bg-sky-500"
          item={support.telegram}
          onChange={(field, value) =>
            updateItem(
              "telegram",
              field,
              value,
            )
          }
        />

        <SupportEditor
          label="WhatsApp Support"
          icon={
            <MessageCircle size={21} />
          }
          iconClass="bg-green-500"
          item={support.whatsapp}
          onChange={(field, value) =>
            updateItem(
              "whatsapp",
              field,
              value,
            )
          }
        />

        <SupportEditor
          label="Email Support"
          icon={
            <Mail size={21} />
          }
          iconClass="bg-yellow-600"
          item={support.email}
          onChange={(field, value) =>
            updateItem(
              "email",
              field,
              value,
            )
          }
        />

        <SupportEditor
          label="WhatsApp Group"
          icon={
            <Users size={21} />
          }
          iconClass="bg-green-500"
          item={support.whatsappGroup}
          onChange={(field, value) =>
            updateItem(
              "whatsappGroup",
              field,
              value,
            )
          }
        />
      </div>

      {/* BOTTOM SAVE */}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={saveSupport}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save Support Settings"}
        </button>
      </div>
    </section>
  );
}

/*
============================================================
SUPPORT EDITOR
============================================================
*/

function SupportEditor({
  label,
  icon,
  iconClass,
  item,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  iconClass: string;
  item: SupportItem;
  onChange: (
    field: keyof SupportItem,
    value: string | boolean,
  ) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${iconClass}`}
          >
            {icon}
          </div>

          <div>
            <h2 className="font-bold text-gray-900">
              {label}
            </h2>

            <p className="text-xs text-gray-500">
              Support channel
            </p>
          </div>
        </div>

        {/* ENABLE */}

        <label className="flex cursor-pointer items-center gap-2">
          <span className="text-xs font-medium text-gray-500">
            Enabled
          </span>

          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(e) =>
              onChange(
                "enabled",
                e.target.checked,
              )
            }
            className="h-4 w-4"
          />
        </label>
      </div>

      <div className="space-y-4">
        <InputField
          label="Title"
          value={item.title}
          onChange={(value) =>
            onChange(
              "title",
              value,
            )
          }
        />

        <TextAreaField
          label="Description"
          value={item.description}
          onChange={(value) =>
            onChange(
              "description",
              value,
            )
          }
        />

        <InputField
          label="Support Link"
          placeholder="https://..."
          value={item.link}
          onChange={(value) =>
            onChange(
              "link",
              value,
            )
          }
        />

        <InputField
          label="Button Text"
          value={item.buttonText}
          onChange={(value) =>
            onChange(
              "buttonText",
              value,
            )
          }
        />
      </div>
    </div>
  );
}

/*
============================================================
INPUT
============================================================
*/

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
      />
    </div>
  );
}

/*
============================================================
TEXTAREA
============================================================
*/

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <textarea
        rows={3}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
      />
    </div>
  );
}