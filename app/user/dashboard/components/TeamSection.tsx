"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Users,
  Wallet,
  ArrowUpFromLine,
  Crown,
  ChevronRight,
  DollarSign,
} from "lucide-react";

import { useUserTheme } from "./UserThemeProvider";

/*
============================================================
TYPES
============================================================
*/

type TeamSectionType = "report" | "myTeam";

type TeamMember = {
  id: string;
  name: string;
  phone: string;
  level: number;
  recharge: number;
  withdraw: number;
  status: "Active" | "Inactive";
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/*
============================================================
COMPONENT
============================================================
*/

export default function TeamSection({
  user,
}: {
  user: any;
}) {
  const { settings } = useUserTheme();

  const router = useRouter();
  const searchParams = useSearchParams();

  /*
  ============================================================
  CURRENT SECTION
  ============================================================
  */

  const rawSection = searchParams.get("team");

  const currentSection: TeamSectionType =
    rawSection === "myTeam" ? "myTeam" : "report";

  /*
  ============================================================
  STATE
  ============================================================
  */

  const [search, setSearch] = useState("");

  const [selectedLevel, setSelectedLevel] =
    useState<number>(1);

  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>([]);

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
    settings?.primaryColor ||
    "var(--user-primary)";

  const secondaryColor =
    settings?.secondaryColor ||
    "var(--user-secondary)";

  const backgroundColor =
    settings?.backgroundColor ||
    "var(--user-background)";

  const cardColor =
    settings?.cardColor ||
    "var(--user-card)";

  const textColor =
    settings?.textColor ||
    "var(--user-text)";

  const gradientStart =
    settings?.gradientStart ||
    "#7C60F4";

  const gradientEnd =
    settings?.gradientEnd ||
    "#E749A0";

  const gradient = `linear-gradient(
    to right,
    ${gradientStart},
    ${gradientEnd}
  )`;

  /*
  ============================================================
  LOAD TEAM
  ============================================================
  */

  useEffect(() => {
    let cancelled = false;

    const loadTeam = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_URL}/api/user/get-teams`,
          {
            method: "GET",

            credentials: "include",

            headers: {
              Accept: "application/json",
            },

            cache: "no-store",
          }
        );

        const contentType =
          res.headers.get("content-type") || "";

        if (
          !contentType
            .toLowerCase()
            .includes("application/json")
        ) {
          const text = await res.text();

          console.error(
            "get-teams returned non JSON:",
            text
          );

          throw new Error(
            `Server returned ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json();
        console.log(data)

        if (!res.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to load team"
          );
        }

        /*
        ========================================================
        BACKEND RESPONSE SUPPORT

        Expected:

        {
          success: true,
          data: {
            level1: [],
            level2: [],
            level3: []
          }
        }

        OR:

        {
          success: true,
          data: []
        }
        ========================================================
        */

        const responseData =
          data?.data;

        let members: any[] = [];

        if (
          responseData &&
          !Array.isArray(responseData)
        ) {
          members = [
            ...(responseData?.level1 || []),
            ...(responseData?.level2 || []),
            ...(responseData?.level3 || []),
          ];
        } else if (
          Array.isArray(responseData)
        ) {
          members = responseData;
        }

        /*
        ========================================================
        NORMALIZE BACKEND DATA
        ========================================================
        */

        const normalized: TeamMember[] =
          members.map(
            (member: any) => {
              const level =
                Number(
                  member?.level ??
                    member?.teamLevel ??
                    1
                );

              const recharge =
                Number(
                  member?.recharge ??
                    member?.totalRecharge ??
                    member?.deposit ??
                    member?.balanceRecharge ??
                    0
                );

              const withdraw =
                Number(
                  member?.withdraw ??
                    member?.totalWithdraw ??
                    member?.withdrawAmount ??
                    0
                );

              const isActive =
                member?.isActive !== false &&
                member?.status !==
                  "Inactive";

              return {
                id: String(
                  member?._id ??
                    member?.id ??
                    `${level}-${Math.random()}`
                ),

                name:
                  member?.name ||
                  member?.username ||
                  "User",

                phone:
                  member?.cellNo ||
                  member?.phone ||
                  member?.mobile ||
                  "N/A",

                level:
                  level >= 1 && level <= 3
                    ? level
                    : 3,

                recharge,

                withdraw,

                status: isActive
                  ? "Active"
                  : "Inactive",
              };
            }
          );

        if (!cancelled) {
          setTeamMembers(normalized);
        }
      } catch (err) {
        console.error(
          "Load team error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load team"
          );

          setTeamMembers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTeam();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const setTeamSection = (
    section: TeamSectionType
  ) => {
    router.replace(
      `?section=team&team=${section}`
    );
  };

  /*
  ============================================================
  SEARCH
  ============================================================
  */

  const filteredMembers = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return teamMembers;
    }

    return teamMembers.filter(
      (member) =>
        member.name
          .toLowerCase()
          .includes(value) ||
        member.phone
          .toLowerCase()
          .includes(value)
    );
  }, [search, teamMembers]);

  /*
  ============================================================
  TOTAL STATS
  ============================================================
  */

  const totalRecharge =
    teamMembers.reduce(
      (total, member) =>
        total + Number(member.recharge || 0),
      0
    );

  const totalWithdraw =
    teamMembers.reduce(
      (total, member) =>
        total + Number(member.withdraw || 0),
      0
    );

  /*
  ============================================================
  LEVEL MEMBERS
  ============================================================
  */

  const selectedLevelMembers =
    filteredMembers.filter(
      (member) =>
        member.level === selectedLevel
    );

  /*
  ============================================================
  LEVEL RECHARGE
  ============================================================
  */

  const selectedLevelRecharge =
    teamMembers
      .filter(
        (member) =>
          member.level === selectedLevel
      )
      .reduce(
        (total, member) =>
          total +
          Number(member.recharge || 0),
        0
      );

  /*
  ============================================================
  LEVEL RECHARGE COUNT
  ============================================================
  */

  const selectedLevelRechargeCount =
    teamMembers.filter(
      (member) =>
        member.level === selectedLevel &&
        Number(member.recharge || 0) > 0
    ).length;

  /*
  ============================================================
  LEVEL COUNTS
  ============================================================
  */

  const getLevelCount = (
    level: number
  ) =>
    teamMembers.filter(
      (member) =>
        member.level === level
    ).length;

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
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-transparent"
          style={{
            borderTopColor:
              primaryColor,
            borderRightColor:
              secondaryColor,
          }}
        />
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
      <div className="mx-auto max-w-7xl space-y-3 p-4 sm:p-6 lg:p-8">

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            className="rounded-xl border p-3 text-sm font-semibold"
            style={{
              backgroundColor:
                "rgba(239,68,68,0.10)",
              color: "#dc2626",
              borderColor:
                "rgba(239,68,68,0.25)",
              borderRadius:
                "var(--user-radius)",
            }}
          >
            {error}
          </div>
        )}

        {/* ==================================================
            TABS
        ================================================== */}

        <div className="grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={() =>
              setTeamSection("report")
            }
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-bold transition"
            style={{
              background:
                currentSection === "report"
                  ? gradient
                  : cardColor,

              color:
                currentSection === "report"
                  ? "#FFFFFF"
                  : textColor,

              borderColor:
                currentSection === "report"
                  ? secondaryColor
                  : "rgba(0,0,0,0.08)",
            }}
          >
            <Users size={20} />

            Team Reports
          </button>

          <button
            type="button"
            onClick={() =>
              setTeamSection("myTeam")
            }
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-bold transition"
            style={{
              background:
                currentSection === "myTeam"
                  ? gradient
                  : cardColor,

              color:
                currentSection === "myTeam"
                  ? "#FFFFFF"
                  : textColor,

              borderColor:
                currentSection === "myTeam"
                  ? secondaryColor
                  : "rgba(0,0,0,0.08)",
            }}
          >
            <Users size={20} />

            My Team
          </button>

        </div>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div
          className="rounded-2xl border shadow-sm"
          style={{
            backgroundColor: cardColor,
            borderColor:
              "rgba(0,0,0,0.08)",
            borderRadius:
              "var(--user-radius)",
          }}
        >
          <div
            className="flex items-center gap-3 rounded-xl border px-4"
            style={{
            
              borderColor:
                "rgba(0,0,0,0.08)",
            }}
          >
            <Search
              size={20}
              className="shrink-0 opacity-50"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search team member..."
              className="h-12 w-full bg-transparent text-sm outline-none"
              style={{
                color: textColor,
              }}
            />
          </div>
        </div>

        {/* ==================================================
            TEAM REPORT
        ================================================== */}

        {currentSection === "report" && (
          <>
            {/* TEAM COMMISSION */}

            <div
              className="flex items-center gap-3 rounded-2xl p-3 shadow-sm"
              style={{
                background: gradient,
              }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black">
                <DollarSign size={20} />
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">
                  Team Commission:
                </p>

                <p className="text-lg font-bold text-white">
                  500$
                </p>
              </div>
            </div>

            {/* TOTAL STATS */}

            <div className="grid grid-cols-2 gap-3">

              <StatCard
                icon={
                  <Wallet size={20} />
                }
                title="Team Recharge"
                value={`Rs ${totalRecharge.toFixed(
                  2
                )}`}
                gradient={gradient}
              />

              <StatCard
                icon={
                  <ArrowUpFromLine
                    size={20}
                  />
                }
                title="Team Withdraw"
                value={`Rs ${totalWithdraw.toFixed(
                  2
                )}`}
                gradient={gradient}
              />

            </div>

            {/* LEVEL TABS */}

            <div className="grid grid-cols-3 gap-2">

              {[1, 2, 3].map(
                (level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setSelectedLevel(
                        level
                      )
                    }
                    className="h-10 rounded-2xl border text-sm font-bold transition"
                    style={{
                      background:
                        selectedLevel ===
                        level
                          ? gradient
                          : cardColor,

                      color:
                        selectedLevel ===
                        level
                          ? "#FFFFFF"
                          : textColor,

                      borderColor:
                        selectedLevel ===
                        level
                          ? secondaryColor
                          : "rgba(0,0,0,0.08)",
                    }}
                  >
                    Level {level}
                  </button>
                )
              )}

            </div>

            {/* LEVEL REPORT */}

            <div className="grid grid-cols-1 gap-3">

              <ReportCard
                icon={
                  <Wallet size={22} />
                }
                title="Recharge Amount (Rs)"
                value={selectedLevelRecharge.toFixed(
                  2
                )}
                gradient={gradient}
              />

              <ReportCard
                icon={
                  <Users size={22} />
                }
                title="Recharge Number"
                value={
                  selectedLevelRechargeCount
                }
                gradient={gradient}
              />

            </div>

            {/* TEAM MEMBERS */}

            <div
              className="rounded-2xl border p-4 shadow-sm"
              style={{
                backgroundColor: cardColor,
                borderColor:
                  "rgba(0,0,0,0.08)",
              }}
            >
              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{
                      color: textColor,
                    }}
                  >
                    Team Members
                  </h2>

                  <p className="text-xs opacity-60">
                    Level {selectedLevel}
                  </p>
                </div>

                <Users
                  size={24}
                  className="opacity-50"
                />

              </div>

              <div className="space-y-3">

                {selectedLevelMembers.map(
                  (member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      cardColor={cardColor}
                      textColor={textColor}
                      primaryColor={
                        primaryColor
                      }
                    />
                  )
                )}

                {selectedLevelMembers.length ===
                  0 && (
                  <EmptyTeam
                    backgroundColor="white"
                  />
                )}

              </div>
            </div>
          </>
        )}

        {/* ==================================================
            MY TEAM
        ================================================== */}

        {currentSection === "myTeam" && (
          <div className="space-y-4">

            {/* LEVEL SUMMARY */}

            <div className="grid grid-cols-3 gap-3">

              {[1, 2, 3].map(
                (level) => {

                  const count =
                    getLevelCount(
                      level
                    );

                  return (
                    <div
                      key={level}
                      className="rounded-2xl p-4 text-center"
                      style={{
                        background:
                          gradient,
                      }}
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                        <Crown size={20} />
                      </div>

                      <p className="mt-2 text-xs font-semibold text-white">
                        Level {level}
                      </p>

                      <p className="mt-1 text-xl font-bold text-white">
                        {count}
                      </p>
                    </div>
                  );
                }
              )}

            </div>

            {/* ALL MEMBERS */}

            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: cardColor,
                borderColor:
                  "rgba(0,0,0,0.08)",
              }}
            >
              <h2
                className="mb-4 text-lg font-bold"
                style={{
                  color: textColor,
                }}
              >
                My Team Members
              </h2>

              <div className="space-y-3">

                {filteredMembers.map(
                  (member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      cardColor={cardColor}
                      textColor={textColor}
                      primaryColor={
                        primaryColor
                      }
                    />
                  )
                )}

                {filteredMembers.length ===
                  0 && (
                  <EmptyTeam
                    backgroundColor={
                      backgroundColor
                    }
                  />
                )}

              </div>
            </div>

          </div>
        )}

        {/* ==================================================
            BACK
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            router.push(
              "/user/dashboard"
            )
          }
          className="h-9 w-full rounded-xl text-sm text-white"
          style={{
            background: gradient,
            borderRadius:
              "var(--user-radius)",
          }}
        >
          Back
        </button>

      </div>
    </div>
  );
}

/*
============================================================
STAT CARD
============================================================
*/

function StatCard({
  icon,
  title,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <div
      className="rounded-2xl p-3 shadow-sm"
      style={{
        background: gradient,
      }}
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
        {icon}
      </div>

      <p className="mt-3 text-center text-xs font-semibold text-white sm:text-sm">
        {title}
      </p>

      <p className="mt-2 text-center text-lg font-bold text-white sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

/*
============================================================
REPORT CARD
============================================================
*/

function ReportCard({
  icon,
  title,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <div
      className="rounded-2xl border p-4 shadow-sm"
      style={{
        background: gradient,
      }}
    >
      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-semibold text-white sm:text-sm">
            {title}
          </p>

          <p className="mt-1 text-xl font-bold text-white">
            {value}
          </p>

        </div>

      </div>
    </div>
  );
}

/*
============================================================
TEAM MEMBER CARD
============================================================
*/

function TeamMemberCard({
  member,
  cardColor,
  textColor,
  primaryColor,
}: {
  member: TeamMember;
  cardColor: string;
  textColor: string;
  primaryColor: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border p-3"
      style={{
        backgroundColor: cardColor,
        borderColor:
          "rgba(0,0,0,0.08)",
      }}
    >
      {/* AVATAR */}

      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold"
        style={{
          backgroundColor:
            `color-mix(in srgb, ${primaryColor} 15%, white)`,
          color: primaryColor,
        }}
      >
        {member.name
          .charAt(0)
          .toUpperCase()}
      </div>

      {/* INFO */}

      <div className="min-w-0 flex-1">

        <p
          className="truncate text-sm font-bold"
          style={{
            color: textColor,
          }}
        >
          {member.name}
        </p>

        <p className="mt-0.5 text-xs opacity-60">
          {member.phone}
        </p>

        <div className="mt-1 flex gap-2">

          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor:
                `color-mix(in srgb, ${primaryColor} 15%, white)`,
              color: primaryColor,
            }}
          >
            Level {member.level}
          </span>

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              member.status ===
              "Active"
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {member.status}
          </span>

        </div>

      </div>

      <ChevronRight
        size={20}
        className="shrink-0 opacity-40"
      />

    </div>
  );
}

/*
============================================================
EMPTY TEAM
============================================================
*/

function EmptyTeam({
  backgroundColor,
}: {
  backgroundColor: string;
}) {
  return (
    <div
      className="rounded-xl p-8 text-center"
      style={{
        backgroundColor,
      }}
    >
      <Users
        size={40}
        className="mx-auto opacity-20"
      />

      <p className="mt-3 text-sm font-semibold opacity-50">
        No team members found
      </p>
    </div>
  );
}