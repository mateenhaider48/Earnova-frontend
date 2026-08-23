"use client";

import {
  Users,
  UserCheck,
  ShieldCheck,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface User {
  name: string;
  cellNo: string;
  role: string;
}

interface Props {
  user: User;
}

const API_URL = "http://localhost:5000";
export default function DashboardOverview({ user }: Props) {
  const [countPlans, setCountPlan] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [activePlanUserCount, setPlanActiveUserCount] = useState(0);
  const fetchData = async () => {
    try {
      // Get all plans
      const response = await fetch(
        `${API_URL}/api/admin/get-all-subscription`,
        {
          credentials: "include",
        },
      );

      const planData = await response.json();

      if (!response.ok) {
        throw new Error(planData.message || "Failed to fetch plans");
      }

      // Get all users
      const userResponse = await fetch(`${API_URL}/api/admin/get-all-user`, {
        credentials: "include",
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.message || "Failed to fetch users");
      }

      // Count plans
      setCountPlan(Array.isArray(planData.data) ? planData.data.length : 0);

      let userCount = 0;
      let adminCount = 0;
      let activeUsers = 0;

      for (const currentUser of userData.data) {
        if (currentUser.role === "user") {
          userCount++;
        } else if (currentUser.role === "admin") {
          adminCount++;
        }

        if (currentUser.subscription != null) {
          activeUsers++;
        }
      }

      setUserCount(userCount);
      setAdminCount(adminCount);
      setPlanActiveUserCount(activeUsers);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard data",
      );
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6 rounded-2xl bg-black p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm text-white/60">Welcome back</p>

        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{user.name}</h1>

        <p className="mt-2 text-sm text-white/60">
          Manage your platform from the admin dashboard.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users size={22} />} title="Total Users" value={String(userCount)} />

        <StatCard
          icon={<UserCheck size={22} />}
          title="Plan Active Users"
          value={String(activePlanUserCount)}
        />

        <StatCard
          icon={<CreditCard size={22} />}
          title="Plans"
          value={String(countPlans)}
        />

        <StatCard icon={<ShieldCheck size={22} />} title="Admins" value={String(adminCount)} />
      </div>

    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-gray-100 p-3 text-gray-700">{icon}</div>
      </div>

      <p className="mt-5 text-sm text-gray-500">{title}</p>

      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
