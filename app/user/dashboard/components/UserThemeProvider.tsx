"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/*
============================================================
SITE SETTINGS
============================================================
*/

export interface SiteSettings {
  /*
  ------------------------------------------------------------
  BRAND
  ------------------------------------------------------------
  */

  siteName: string;
  favicon: string;

  /*
  ------------------------------------------------------------
  MAIN COLORS
  ------------------------------------------------------------
  */

  primaryColor: string;
  secondaryColor: string;

  backgroundColor: string;
  cardColor: string;

  textColor: string;
  mutedTextColor: string;

  /*
  ------------------------------------------------------------
  BUTTON
  ------------------------------------------------------------
  */

  buttonColor: string;
  buttonTextColor: string;
  buttonHoverColor: string;

  /*
  ------------------------------------------------------------
  BORDER
  ------------------------------------------------------------
  */

  borderColor: string;

  /*
  ------------------------------------------------------------
  SIDEBAR / HEADER
  ------------------------------------------------------------
  */

  sidebarColor: string;
  headerColor: string;

  /*
  ------------------------------------------------------------
  ACCENT
  ------------------------------------------------------------
  */

  accentColor: string;

  /*
  ------------------------------------------------------------
  GRADIENT
  ------------------------------------------------------------
  */

  gradientStart: string;
  gradientEnd: string;

  /*
  ------------------------------------------------------------
  LAYOUT
  ------------------------------------------------------------
  */

  gridColumns: number;
  borderRadius: string;
}

/*
============================================================
DEFAULT SETTINGS
============================================================
*/

const defaultSettings: SiteSettings = {
  /*
  BRAND
  */

  siteName: "",
  favicon: "",

  /*
  MAIN COLORS
  */

  primaryColor: "#000000",
  secondaryColor: "#6B7280",

  backgroundColor: "#F9FAFB",
  cardColor: "#FFFFFF",

  textColor: "#111827",
  mutedTextColor: "#6B7280",

  /*
  BUTTON
  */

  buttonColor: "#000000",
  buttonTextColor: "#FFFFFF",
  buttonHoverColor: "#222222",

  /*
  BORDER
  */

  borderColor: "#E5E7EB",

  /*
  SIDEBAR / HEADER
  */

  sidebarColor: "#000000",
  headerColor: "#FFFFFF",

  /*
  ACCENT
  */

  accentColor: "#7C60F4",

  /*
  GRADIENT
  */

  gradientStart: "#7C60F4",
  gradientEnd: "#E749A0",

  /*
  LAYOUT
  */

  gridColumns: 3,
  borderRadius: "12px",
};

/*
============================================================
CONTEXT TYPE
============================================================
*/

interface ThemeContextType {
  settings: SiteSettings;
  loading: boolean;
}

/*
============================================================
CONTEXT
============================================================
*/

const ThemeContext = createContext<ThemeContextType>({
  settings: defaultSettings,
  loading: true,
});

/*
============================================================
PROVIDER
============================================================
*/

export function UserThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] =
    useState<SiteSettings>(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  /*
  ============================================================
  LOAD SETTINGS
  ============================================================
  */

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/user/site-settings`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        /*
        --------------------------------------------------------
        CHECK RESPONSE
        --------------------------------------------------------
        */

        const contentType =
          response.headers.get("content-type");

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          throw new Error(
            `Theme API returned ${response.status} ${response.statusText}`
          );
        }

        const data =
          await response.json();
        /*
        --------------------------------------------------------
        APPLY SETTINGS
        --------------------------------------------------------
        */

        if (
          response.ok &&
          data?.data
        ) {
          setSettings({
            ...defaultSettings,
            ...data.data,
          });
        }
      } catch (error) {
        console.error(
          "Theme settings error:",
          error
        );

        /*
        --------------------------------------------------------
        DEFAULT SETTINGS REMAIN ACTIVE
        --------------------------------------------------------
        */
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  /*
  ============================================================
  APPLY CSS VARIABLES
  ============================================================
  */

  useEffect(() => {
    const root =
      document.documentElement;

    /*
    ------------------------------------------------------------
    MAIN COLORS
    ------------------------------------------------------------
    */

    root.style.setProperty(
      "--user-primary",
      settings.primaryColor
    );

    root.style.setProperty(
      "--user-secondary",
      settings.secondaryColor
    );

    root.style.setProperty(
      "--user-background",
      settings.backgroundColor
    );

    root.style.setProperty(
      "--user-card",
      settings.cardColor
    );

    root.style.setProperty(
      "--user-text",
      settings.textColor
    );

    root.style.setProperty(
      "--user-muted-text",
      settings.mutedTextColor
    );

    /*
    ------------------------------------------------------------
    BUTTON
    ------------------------------------------------------------
    */

    root.style.setProperty(
      "--user-button",
      settings.buttonColor
    );

    root.style.setProperty(
      "--user-button-text",
      settings.buttonTextColor
    );

    root.style.setProperty(
      "--user-button-hover",
      settings.buttonHoverColor
    );

    /*
    ------------------------------------------------------------
    BORDER
    ------------------------------------------------------------
    */

    root.style.setProperty(
      "--user-border",
      settings.borderColor
    );

    /*
    ------------------------------------------------------------
    SIDEBAR / HEADER
    ------------------------------------------------------------
    */

    root.style.setProperty(
      "--user-sidebar",
      settings.sidebarColor
    );

    root.style.setProperty(
      "--user-header",
      settings.headerColor
    );

    /*
    ------------------------------------------------------------
    ACCENT
    ------------------------------------------------------------
    */

    root.style.setProperty(
      "--user-accent",
      settings.accentColor
    );

    /*
    ------------------------------------------------------------
    GRADIENT
    ------------------------------------------------------------
    */

    root.style.setProperty(
      "--user-gradient-start",
      settings.gradientStart
    );

    root.style.setProperty(
      "--user-gradient-end",
      settings.gradientEnd
    );

    root.style.setProperty(
      "--user-gradient",
      `linear-gradient(
        to right,
        ${settings.gradientStart},
        ${settings.gradientEnd}
      )`
    );

    /*
    ------------------------------------------------------------
    BORDER RADIUS
    ------------------------------------------------------------
    */

    root.style.setProperty(
      "--user-radius",
      settings.borderRadius
    );

    /*
    ============================================================
    SITE TITLE
    ============================================================
    */

    document.title =
      settings.siteName;

    /*
    ============================================================
    FAVICON
    ============================================================
    */

    if (settings.favicon) {
      let favicon =
        document.querySelector(
          "link[rel='icon']"
        ) as HTMLLinkElement | null;

      if (!favicon) {
        favicon =
          document.createElement(
            "link"
          );

        favicon.rel = "icon";

        document.head.appendChild(
          favicon
        );
      }

      favicon.href =
        settings.favicon;
    }
  }, [settings]);

  /*
  ============================================================
  PROVIDER
  ============================================================
  */

  return (
    <ThemeContext.Provider
      value={{
        settings,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/*
============================================================
HOOK
============================================================
*/

export function useUserTheme() {
  return useContext(
    ThemeContext
  );
}