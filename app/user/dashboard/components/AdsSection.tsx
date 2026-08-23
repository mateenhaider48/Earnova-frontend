"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CircleAlert,
  EyeIcon,
  Star,
  Wallet,
} from "lucide-react";

import { useUserTheme } from "./UserThemeProvider";

/*
============================================================
API
============================================================
*/

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ADS_API = `${API_URL}/api/user/get-ads`;
const COMPLETE_AD_API = `${API_URL}/api/user/complete-ad`;

/*
============================================================
CONSTANTS
============================================================
*/

const COMPLETED_ADS_STORAGE_KEY =
  "user_completed_ads_24h";

const TWENTY_FOUR_HOURS =
  24 * 60 * 60 * 1000;

/*
============================================================
TYPES
============================================================
*/

type Ad = {
  _id: string;
  title: string;
  description?: string;
  type: "image" | "video";
  mediaUrl: string;
  subscription?: any;
  isActive: boolean;
  createdAt?: string;
};

type CompletedAdRecord = {
  adId: string;
  completedAt: number;
};

type Step = "main" | "viewAd";

/*
============================================================
COMPONENT
============================================================
*/

export default function AdsSection({
  user,
}: {
  user: any;
}) {
  /*
  ============================================================
  THEME
  ============================================================
  */

  const { settings } = useUserTheme();

  const router = useRouter();
  const searchParams = useSearchParams();

  /*
  ============================================================
  BALANCE

  Backend response se local balance update hoga.
  ============================================================
  */

  const [localBalance, setLocalBalance] =
    useState<number>(
      Number(user?.balance ?? 0)
    );

  /*
  ============================================================
  THEME COLORS
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
    "var(--user-button)";

  const buttonTextColor =
    settings.buttonTextColor ||
    "var(--user-button-text)";

  const borderColor =
    `color-mix(in srgb, ${primaryColor} 25%, transparent)`;

  const gradient =
    `linear-gradient(
      to right,
      ${settings.gradientStart || primaryColor},
      ${settings.gradientEnd || secondaryColor}
    )`;

  /*
  ============================================================
  COMMON STYLES
  ============================================================
  */

  const buttonStyle = {
    background: gradient,
    color: buttonTextColor,
    borderColor,
    borderRadius:
      "var(--user-radius)",
  };

  const cardStyle = {
    backgroundColor: cardColor,
    borderRadius:
      "var(--user-radius)",
  };

  /*
  ============================================================
  CURRENT STEP
  ============================================================
  */

  const rawStep =
    searchParams.get("ads");

  const currentStep: Step =
    rawStep &&
    ["main", "viewAd"].includes(rawStep)
      ? (rawStep as Step)
      : "main";

  /*
  ============================================================
  STATE
  ============================================================
  */

  const [ads, setAds] =
    useState<Ad[]>([]);

  const [selectedAd, setSelectedAd] =
    useState<Ad | null>(null);

  const [adsLoading, setAdsLoading] =
    useState(true);

  const [adsError, setAdsError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [rating, setRating] =
    useState<number>(0);

  const [videoStarted, setVideoStarted] =
    useState(false);

  const [videoCompleted, setVideoCompleted] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  /*
  ============================================================
  COMPLETED ADS

  Frontend sirf UI se completed ad ko remove karta hai.
  ============================================================
  */

  const [completedAdIds, setCompletedAdIds] =
    useState<string[]>([]);

  /*
  ============================================================
  UPDATE LOCAL BALANCE WHEN USER PROP CHANGES
  ============================================================
  */

  useEffect(() => {
    const backendBalance =
      Number(user?.balance ?? 0);

    if (
      Number.isFinite(
        backendBalance
      )
    ) {
      setLocalBalance(
        backendBalance
      );
    }
  }, [user?.balance]);

  /*
  ============================================================
  LOAD COMPLETED ADS FROM LOCAL STORAGE
  ============================================================
  */

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          COMPLETED_ADS_STORAGE_KEY
        );

      if (!stored) {
        setCompletedAdIds([]);
        return;
      }

      const parsed =
        JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        localStorage.removeItem(
          COMPLETED_ADS_STORAGE_KEY
        );

        setCompletedAdIds([]);
        return;
      }

      const now =
        Date.now();

      const validRecords =
        parsed.filter(
          (
            record: CompletedAdRecord
          ) => {
            if (
              !record ||
              !record.adId ||
              !record.completedAt
            ) {
              return false;
            }

            return (
              now -
                Number(
                  record.completedAt
                ) <
              TWENTY_FOUR_HOURS
            );
          }
        );

      setCompletedAdIds(
        validRecords.map(
          (
            record: CompletedAdRecord
          ) =>
            record.adId
        )
      );

      localStorage.setItem(
        COMPLETED_ADS_STORAGE_KEY,
        JSON.stringify(
          validRecords
        )
      );
    } catch (error) {
    
      
      setCompletedAdIds([]);
    }
  }, []);

  /*
  ============================================================
  SAVE COMPLETED AD
  ============================================================
  */

  const saveCompletedAd =
    (adId: string) => {
      try {
        const now =
          Date.now();

        const stored =
          localStorage.getItem(
            COMPLETED_ADS_STORAGE_KEY
          );

        let records:
          CompletedAdRecord[] =
          [];

        if (stored) {
          const parsed =
            JSON.parse(stored);

          if (Array.isArray(parsed)) {
            records =
              parsed.filter(
                (
                  record: CompletedAdRecord
                ) =>
                  record &&
                  record.adId &&
                  record.completedAt &&
                  now -
                    Number(
                      record.completedAt
                    ) <
                    TWENTY_FOUR_HOURS
              );
          }
        }

        records =
          records.filter(
            (record) =>
              record.adId !==
              adId
          );

        records.push({
          adId,
          completedAt: now,
        });

        localStorage.setItem(
          COMPLETED_ADS_STORAGE_KEY,
          JSON.stringify(
            records
          )
        );

        setCompletedAdIds(
          records.map(
            (record) =>
              record.adId
          )
        );
      } catch (error) {
        

        setCompletedAdIds(
          (previous) => {
            if (
              previous.includes(
                adId
              )
            ) {
              return previous;
            }

            return [
              ...previous,
              adId,
            ];
          }
        );
      }
    };

  /*
  ============================================================
  REMOVE EXPIRED COMPLETED ADS
  ============================================================
  */

  useEffect(() => {
    const cleanupExpiredAds =
      () => {
        try {
          const stored =
            localStorage.getItem(
              COMPLETED_ADS_STORAGE_KEY
            );

          if (!stored) {
            return;
          }

          const parsed =
            JSON.parse(stored);

          if (!Array.isArray(parsed)) {
            return;
          }

          const now =
            Date.now();

          const validRecords =
            parsed.filter(
              (
                record: CompletedAdRecord
              ) =>
                record &&
                record.adId &&
                record.completedAt &&
                now -
                  Number(
                    record.completedAt
                  ) <
                  TWENTY_FOUR_HOURS
            );

          localStorage.setItem(
            COMPLETED_ADS_STORAGE_KEY,
            JSON.stringify(
              validRecords
            )
          );

          setCompletedAdIds(
            validRecords.map(
              (
                record: CompletedAdRecord
              ) =>
                record.adId
            )
          );
        } catch (error) {
        
        }
      };

    cleanupExpiredAds();

    const interval =
      setInterval(
        cleanupExpiredAds,
        60 * 1000
      );

    return () =>
      clearInterval(interval);
  }, []);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const setAdsSection = (
    section: Step
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set(
      "section",
      "ads"
    );

    params.set(
      "ads",
      section
    );

    router.replace(
      `?${params.toString()}`
    );
  };

  /*
  ============================================================
  FETCH ADS
  ============================================================
  */

  const fetchAds =
    async () => {
      try {
        setAdsLoading(true);
        setAdsError(null);

        const response =
          await fetch(
            ADS_API,
            {
              method:
                "GET",

              credentials:
                "include",

              headers: {
                Accept:
                  "application/json",
              },

              cache:
                "no-store",
            }
          );

        const contentType =
          response.headers.get(
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
            await response.text();

    

          throw new Error(
            `Ads API returned ${response.status} ${response.statusText}`
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to load ads."
          );
        }

        /*
        ========================================================
        GET ADS
        ========================================================
        */

        const fetchedAds =
          Array.isArray(
            data?.data
          )
            ? data.data
            : Array.isArray(
                data?.ads
              )
            ? data.ads
            : Array.isArray(
                data?.data?.ads
              )
            ? data.data.ads
            : [];

        /*
        ========================================================
        READ LOCAL STORAGE
        ========================================================
        */

        let storedCompletedIds =
          completedAdIds;

        try {
          const stored =
            localStorage.getItem(
              COMPLETED_ADS_STORAGE_KEY
            );

          if (stored) {
            const parsed =
              JSON.parse(
                stored
              );

            if (
              Array.isArray(
                parsed
              )
            ) {
              const now =
                Date.now();

              const validRecords =
                parsed.filter(
                  (
                    record: CompletedAdRecord
                  ) =>
                    record &&
                    record.adId &&
                    record.completedAt &&
                    now -
                      Number(
                        record.completedAt
                      ) <
                      TWENTY_FOUR_HOURS
                );

              storedCompletedIds =
                validRecords.map(
                  (
                    record: CompletedAdRecord
                  ) =>
                    record.adId
                );

              setCompletedAdIds(
                storedCompletedIds
              );

              localStorage.setItem(
                COMPLETED_ADS_STORAGE_KEY,
                JSON.stringify(
                  validRecords
                )
              );
            }
          }
        } catch (storageError) {
         
        }

        /*
        ========================================================
        FILTER COMPLETED ADS
        ========================================================
        */

        const availableAds =
          fetchedAds.filter(
            (ad: Ad) =>
              !storedCompletedIds.includes(
                ad._id
              )
          );

        setAds(
          availableAds
        );
      } catch (error: any) {
     

        setAdsError(
          error?.message ||
            "Failed to load advertisements."
        );

        setAds([]);
      } finally {
        setAdsLoading(
          false
        );
      }
    };

  /*
  ============================================================
  LOAD ADS
  ============================================================
  */

  useEffect(() => {
    fetchAds();
  }, []);

  /*
  ============================================================
  OPEN AD
  ============================================================
  */

  const openAd =
    (ad: Ad) => {
      if (
        completedAdIds.includes(
          ad._id
        )
      ) {
        setMessage(
          "You have already completed this advertisement."
        );

        return;
      }

      setSelectedAd(
        ad
      );

      setRating(
        0
      );

      setVideoStarted(
        false
      );

      setVideoCompleted(
        false
      );

      setMessage(
        null
      );

      setAdsSection(
        "viewAd"
      );
    };

  /*
  ============================================================
  RESET AD STATE
  ============================================================
  */

  const resetAdState =
    () => {
      setSelectedAd(
        null
      );

      setRating(
        0
      );

      setVideoStarted(
        false
      );

      setVideoCompleted(
        false
      );

      setMessage(
        null
      );
    };

  /*
  ============================================================
  BACK TO ADS
  ============================================================
  */

  const backToAds =
    () => {
      resetAdState();

      setAdsSection(
        "main"
      );
    };

  /*
  ============================================================
  SAFE JSON RESPONSE
  ============================================================
  */

  const parseResponse =
    async (
      response: Response
    ) => {
      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        contentType
          ?.toLowerCase()
          .includes(
            "application/json"
          )
      ) {
        return await response.json();
      }

      const text =
        await response.text();

      

      throw new Error(
        `Server returned ${response.status} ${response.statusText}`
      );
    };

  /*
  ============================================================
  COMPLETE AD
  ============================================================
  */

  const completeAd =
    async () => {
      if (!selectedAd) {
        setMessage(
          "Advertisement not found."
        );

        return;
      }

      /*
      ========================================================
      IMAGE VALIDATION
      ========================================================
      */

      if (
        selectedAd.type ===
          "image" &&
        rating === 0
      ) {
        setMessage(
          "Please rate the advertisement first."
        );

        return;
      }

      /*
      ========================================================
      VIDEO VALIDATION
      ========================================================
      */

      if (
        selectedAd.type ===
        "video"
      ) {
        if (!videoStarted) {
          setMessage(
            "Please start watching the video first."
          );

          return;
        }

        if (
          !videoCompleted
        ) {
          setMessage(
            "Please watch the complete video first."
          );

          return;
        }

        if (
          rating === 0
        ) {
          setMessage(
            "Please rate the advertisement first."
          );

          return;
        }
      }

      /*
      ========================================================
      DUPLICATE PROTECTION
      ========================================================
      */

      if (
        completedAdIds.includes(
          selectedAd._id
        )
      ) {
        setMessage(
          "You have already completed this advertisement."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        setMessage(
          null
        );

        /*
        ======================================================
        BACKEND REQUEST
        ======================================================
        */

        const response =
          await fetch(
            COMPLETE_AD_API,
            {
              method:
                "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  adId:
                    selectedAd._id,

                  rating,
                }),
            }
          );

        const data =
          await parseResponse(
            response
          );

        /*
        ======================================================
        ERROR
        ======================================================
        */

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to complete advertisement."
          );
        }

        /*
        ======================================================
        BACKEND SUCCESS RESPONSE

        Expected:

        data.data.adId
        data.data.adEarning
        data.data.balance
        data.data.adsWatchedInCurrentCycle
        data.data.dailyAds
        data.data.remainingAds
        data.data.cycleCompleted
        ======================================================
        */

        const backendData =
          data?.data ||
          {};

        const completedId =
          backendData?.adId ||
          selectedAd._id;

        /*
        ======================================================
        GET EARNING FROM BACKEND
        ======================================================
        */

        const adEarning =
          Number(
            backendData?.adEarning ??
              data?.adEarning ??
              0
          );

        /*
        ======================================================
        GET UPDATED BALANCE FROM BACKEND
        ======================================================
        */

        const backendBalance =
          backendData?.balance ??
          data?.balance;

        /*
        ======================================================
        UPDATE LOCAL BALANCE

        Backend ka actual balance UI mein show hoga.
        ======================================================
        */

        if (
          backendBalance !==
            undefined &&
          backendBalance !==
            null
        ) {
          const numericBalance =
            Number(
              backendBalance
            );

          if (
            Number.isFinite(
              numericBalance
            )
          ) {
            setLocalBalance(
              numericBalance
            );
          }
        } else if (
          Number.isFinite(
            adEarning
          )
        ) {
          /*
          ----------------------------------------------------
          Agar backend balance response mein nahi bhejta,
          to sirf temporary UI update.
          ----------------------------------------------------
          */

          setLocalBalance(
            (previous) =>
              previous +
              adEarning
          );
        }

        /*
        ======================================================
        SAVE COMPLETED AD

        24 hours tak same ad UI mein nahi ayega.
        ======================================================
        */

        saveCompletedAd(
          completedId
        );

        /*
        ======================================================
        REMOVE AD IMMEDIATELY

        Backend response aate hi list se khatam.
        ======================================================
        */

        setAds(
          (previous) =>
            previous.filter(
              (ad) =>
                ad._id !==
                completedId
            )
        );

        /*
        ======================================================
        REMOVE SELECTED AD
        ======================================================
        */

        setSelectedAd(
          null
        );

        /*
        ======================================================
        SUCCESS MESSAGE
        ======================================================
        */

        if (
          adEarning > 0
        ) {
          setMessage(
            `Ad completed successfully. ${adEarning} added to your balance.`
          );
        } else {
          setMessage(
            "Ad completed successfully."
          );
        }

        /*
        ======================================================
        REFRESH ADS

        fetchAds completed ad ko localStorage ki wajah
        se dobara UI mein nahi layega.
        ======================================================
        */

        await fetchAds();

        /*
        ======================================================
        RESET UI
        ======================================================
        */

        resetAdState();

        setAdsSection(
          "main"
        );
      } catch (error: any) {
      

        setMessage(
          error?.message ||
            "Failed to complete advertisement."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /*
  ============================================================
  COUNTERS
  ============================================================
  */

  const remainingAds =
    ads.length;

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
        color:
          textColor,
      }}
    >
      
      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="space-y-3 p-4 sm:p-6 lg:p-8">

        {/* ===================================================
            BALANCE
        =================================================== */}

        <div
          className="flex items-center justify-center border p-3"
          style={{
            ...cardStyle,
            borderColor,
          }}
        >
          <p
            className="mr-3 text-lg font-bold"
            style={{
              color:
                primaryColor,
            }}
          >
            Available Balance:
          </p>

          <h2
            className="font-bold sm:text-3xl"
            style={{
              color:
                textColor,
            }}
          >
            {localBalance}$
          </h2>
        </div>

        {/* ===================================================
            MESSAGE
        =================================================== */}

        {message && (
          <div
            className="flex items-start gap-2 border p-3 text-sm"
            style={{
              backgroundColor:
                `color-mix(in srgb, ${primaryColor} 10%, ${cardColor})`,

              borderColor,

              color:
                primaryColor,

              borderRadius:
                "var(--user-radius)",
            }}
          >
            <CircleAlert
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {message}
            </span>
          </div>
        )}

        {/* ==================================================
            MAIN ADS
        ================================================== */}

        {currentStep ===
          "main" && (
          <div
            className="p-3"
            style={
              cardStyle
            }
          >

            {/* ADS COUNTERS */}

            <div className="flex gap-3">

              <button
                type="button"
                className="h-9 w-full border text-sm font-semibold"
                style={
                  buttonStyle
                }
              >
                Total Ads :{" "}
                {ads.length}
              </button>

              <button
                type="button"
                className="h-9 w-full border text-sm font-semibold"
                style={
                  buttonStyle
                }
              >
                Remaining Ads :{" "}
                {remainingAds}
              </button>

            </div>

            {/* ADS */}

            <div className="mt-4">
              <div className="space-y-3">

                {/* LOADING */}

                {adsLoading && (
                  <div
                    className="border p-6 text-center"
                    style={{
                      ...cardStyle,

                      backgroundColor:
                        backgroundColor,

                      borderColor,
                    }}
                  >
                    <div
                      className="mx-auto h-6 w-6 animate-spin rounded-full border-2"
                      style={{
                        borderColor:
                          secondaryColor,

                        borderTopColor:
                          primaryColor,
                      }}
                    />

                    <p
                      className="mt-3 text-sm"
                      style={{
                        color:
                          secondaryColor,
                      }}
                    >
                      Loading ads...
                    </p>
                  </div>
                )}

                {/* ERROR */}

                {!adsLoading &&
                  adsError && (
                    <div
                      className="border p-4"
                      style={{
                        ...cardStyle,

                        backgroundColor:
                          backgroundColor,

                        borderColor,

                        color:
                          primaryColor,
                      }}
                    >
                      <div className="flex items-start gap-2">

                        <CircleAlert
                          size={18}
                          className="mt-0.5 shrink-0"
                        />

                        <div>
                          <p className="font-semibold">
                            Failed to load ads
                          </p>

                          <p
                            className="mt-1 text-xs"
                            style={{
                              color:
                                secondaryColor,
                            }}
                          >
                            {adsError}
                          </p>

                          <button
                            type="button"
                            onClick={
                              fetchAds
                            }
                            className="mt-3 h-8 border px-4 text-xs font-semibold"
                            style={
                              buttonStyle
                            }
                          >
                            Retry
                          </button>
                        </div>

                      </div>
                    </div>
                  )}

                {/* NO ADS */}

                {!adsLoading &&
                  !adsError &&
                  ads.length ===
                    0 && (
                    <div
                      className="border p-6 rounded-xl bg-gray-200 text-center"
                      style={{
                      

                        borderColor,
                        
                      }}
                    >
                      <Wallet
                        size={40}
                        className="mx-auto"
                        style={{
                          color:
                            secondaryColor,
                        }}
                      />

                      <p
                        className="mt-3 font-semibold"
                        style={{
                          color:
                            textColor,
                        }}
                      >
                        No ads available
                      </p>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color:
                            secondaryColor,
                        }}
                      >
                        There are currently
                        no active ads
                        available for your
                        subscription.
                      </p>
                    </div>
                  )}

                {/* ADS LIST */}

                {!adsLoading &&
                  !adsError &&
                  ads.map(
                    (ad) => (
                      <button
                        key={
                          ad._id
                        }
                        type="button"
                        disabled={
                          loading
                        }
                        onClick={() =>
                          openAd(
                            ad
                          )
                        }
                        className="flex w-full items-center gap-3 border p-4 text-left transition hover:opacity-90 disabled:opacity-50"
                        style={
                          buttonStyle
                        }
                      >

                        {/* MEDIA */}

                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden"
                          style={{
                            backgroundColor:
                              cardColor,

                            borderRadius:
                              "var(--user-radius)",
                          }}
                        >
                          {ad.type ===
                          "image" ? (
                            <img
                              src={
                                ad.mediaUrl
                              }
                              alt={
                                ad.title
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <video
                              src={
                                ad.mediaUrl
                              }
                              className="h-full w-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          )}
                        </div>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">

                          <p
                            className="truncate font-semibold"
                            style={{
                              color:
                                buttonTextColor,
                            }}
                          >
                            {ad.title}
                          </p>

                          <p
                            className="mt-1 line-clamp-2 text-xs"
                            style={{
                              color:
                                buttonTextColor,

                              opacity: 0.8,
                            }}
                          >
                            {ad.description ||
                              "Advertisement"}
                          </p>

                        </div>

                        <EyeIcon
                          size={20}
                          className="shrink-0"
                          style={{
                            color:
                              buttonTextColor,
                          }}
                        />

                      </button>
                    )
                  )}

                {/* BACK */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/user/dashboard"
                    )
                  }
                  className="mt-4 h-9 w-full border text-sm font-semibold"
                  style={
                    buttonStyle
                  }
                >
                  Back
                </button>

              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            VIEW AD
        ================================================== */}

        {currentStep ===
          "viewAd" &&
          selectedAd && (
            <div
              className="p-4"
              style={
                cardStyle
              }
            >

              {/* IMAGE AD */}

              {selectedAd.type ===
                "image" && (
                <>
                  <div className="overflow-hidden">
                    <img
                      src={
                        selectedAd.mediaUrl
                      }
                      alt={
                        selectedAd.title
                      }
                      className="h-40 w-full object-contain"
                    />
                  </div>

                  <div className="mb-4">
                    <h3
                      className="text-center text-lg font-bold"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      {
                        selectedAd.title
                      }
                    </h3>

                    {selectedAd.description && (
                      <p
                        className="mt-1 text-center text-sm"
                        style={{
                          color:
                            secondaryColor,
                        }}
                      >
                        {
                          selectedAd.description
                        }
                      </p>
                    )}
                  </div>

                  {/* RATING */}

                  <div
                    className="rounded-xl border p-1"
                    style={{
                      background:
                        gradient,

                      borderColor,
                    }}
                  >
                    <p
                      className="text-center text-sm font-semibold"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      Rate this advertisement
                    </p>

                    <div className="mt-1 flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <button
                            key={
                              star
                            }
                            type="button"
                            onClick={() => {
                              setRating(
                                star
                              );

                              setMessage(
                                null
                              );
                            }}
                            className="transition hover:scale-110"
                          >
                            <Star
                              size={22}
                              style={{
                                color:
                                  star <=
                                  rating
                                    ? primaryColor
                                    : secondaryColor,

                                fill:
                                  star <=
                                  rating
                                    ? primaryColor
                                    : "transparent",
                              }}
                            />
                          </button>
                        )
                      )}
                    </div>

                    <p
                      className="mt-2 text-center text-xs"
                      style={{
                        color:
                          secondaryColor,
                      }}
                    >
                      {rating ===
                      0
                        ? "Please select a rating"
                        : `You selected ${rating} out of 5 stars`}
                    </p>
                  </div>

                  {/* COMPLETE */}

                  <button
                    type="button"
                    disabled={
                      loading ||
                      rating === 0
                    }
                    onClick={
                      completeAd
                    }
                    className="mt-4 h-10 w-full border text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    style={
                      buttonStyle
                    }
                  >
                    {loading
                      ? "Completing..."
                      : "Complete Ad"}
                  </button>
                </>
              )}

              {/* VIDEO AD */}

              {selectedAd.type ===
                "video" && (
                <>
                  <div
                    className="overflow-hidden border bg-black"
                    style={{
                      borderColor,

                      borderRadius:
                        "var(--user-radius)",
                    }}
                  >
                    <video
                      src={
                        selectedAd.mediaUrl
                      }
                      controls
                      autoPlay
                      playsInline
                      className="max-h-[500px] w-full"
                      onPlay={() => {
                        setVideoStarted(
                          true
                        );

                        setMessage(
                          null
                        );
                      }}
                      onEnded={() => {
                        setVideoCompleted(
                          true
                        );

                        setMessage(
                          null
                        );
                      }}
                    />
                  </div>

                  {/* VIDEO RATING */}

                  <div
                    className="mt-2 rounded-xl border p-1"
                    style={{
                      background:
                      gradient,

                      borderColor,
                    }}
                  >
                    <p
                      className="text-center text-sm font-semibold"
                      style={{
                        color:
                          textColor,
                      }}
                    >
                      Rate this advertisement
                    </p>

                    <div className="mt-1 flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <button
                            key={
                              star
                            }
                            type="button"
                            onClick={() => {
                              setRating(
                                star
                              );

                              setMessage(
                                null
                              );
                            }}
                            className="transition hover:scale-110"
                          >
                            <Star
                              size={22}
                              style={{
                                color:
                                  star <=
                                  rating
                                    ? primaryColor
                                    : secondaryColor,

                                fill:
                                  star <=
                                  rating
                                    ? primaryColor
                                    : "transparent",
                              }}
                            />
                          </button>
                        )
                      )}
                    </div>

                    <p
                      className="mt-2 text-center text-xs"
                      style={{
                        color:
                          secondaryColor,
                      }}
                    >
                      {rating ===
                      0
                        ? "Please select a rating"
                        : `You selected ${rating} out of 5 stars`}
                    </p>
                  </div>

                  {/* WATCH / COMPLETE */}

                  {!videoCompleted ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          !videoStarted
                        ) {
                          setMessage(
                            "Please start watching the video first."
                          );

                          return;
                        }

                        if (
                          !rating
                        ) {
                          setMessage(
                            "Please rate this video"
                          );

                          return;
                        }

                        setMessage(
                          "Please watch the complete video first."
                        );
                      }}
                      className="mt-4 h-10 w-full border text-sm font-semibold"
                      style={
                        buttonStyle
                      }
                    >
                      Watch Video
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        loading ||
                        rating === 0
                      }
                      onClick={
                        completeAd
                      }
                      className="mt-4 h-10 w-full border text-sm font-semibold disabled:opacity-50"
                      style={
                        buttonStyle
                      }
                    >
                      {loading
                        ? "Completing..."
                        : "Complete Ad"}
                    </button>
                  )}
                </>
              )}

              {/* BACK */}

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  backToAds
                }
                className="mt-2 h-9 w-full border text-sm disabled:opacity-50"
                style={{
                 background:
                      gradient,

                  color:
                    buttonTextColor,

                  borderColor,

                  borderRadius:
                    "var(--user-radius)",
                }}
              >
                Back to Ads
              </button>
            </div>
          )}

        {/* ==================================================
            VIEW AD WITHOUT SELECTED AD
        ================================================== */}

        {currentStep ===
          "viewAd" &&
          !selectedAd && (
            <div
              className="p-6 text-center"
              style={
                cardStyle
              }
            >
              <CircleAlert
                size={45}
                className="mx-auto"
                style={{
                  color:
                    primaryColor,
                }}
              />

              <h2
                className="mt-3 font-bold"
                style={{
                  color:
                    textColor,
                }}
              >
                Advertisement not selected
              </h2>

              <p
                className="mt-1 text-sm"
                style={{
                  color:
                    secondaryColor,
                }}
              >
                Please select an
                advertisement first.
              </p>

              <button
                type="button"
                onClick={() =>
                  setAdsSection(
                    "main"
                  )
                }
                className="mt-4 h-9 w-full border text-sm font-semibold"
                style={
                  buttonStyle
                }
              >
                Back to Ads
              </button>
            </div>
          )}
      </div>
    </div>
  );
}