"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import {
  Users,
  UserCheck,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  CreditCard,
  Megaphone,
  Settings,
  ChevronDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  Clock,
  XCircle,
  List,
  CheckCircle,
  Headphones,
} from "lucide-react";

import toast, { Toaster } from "react-hot-toast";

import { RootState } from "../../../redux/store";
import { logout } from "../../../redux/slices/authSclice";

import DashboardOverview from "./components/DashboardOverview";
import PlansSection from "./components/PlansSection";
import AdsSection from "./components/AdsSection";
import PaymentSettingsSection from "./components/PaymentSettingsSection";
import DashboardUISettings from "./components/DashboardUISettings";

import DepositRequestsSection from "./components/DepositRequestsSection";
import WithdrawalRequestsSection from "./components/WithdrawalRequestsSection";
import SupportSettingsSection from "./components/SupportSettingsSection";
import TutorialAdmin from "./components/VideoTutorials";
import IncomeSection from "./components/IncomeSection";

// =========================================================
// SECTION TYPES
// =========================================================

type Section =
  | "dashboard"
  | "users"
  | "active-users"
  | "plans"
  | "deposit-all"
  | "deposit-pending"
  | "deposit-rejected"
  | "deposit-successful"
  | "withdrawal-all"
  | "withdrawal-pending"
  | "withdrawal-rejected"
  | "withdrawal-successful"
  | "payment-settings"
  | "ads"
  | "support-settings"
  | "tutorials"
  | "income"
  | "UI-settings";

// =========================================================
// ADMIN DASHBOARD
// =========================================================

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  const [depositOpen, setDepositOpen] = useState(true);

  const [withdrawalOpen, setWithdrawalOpen] = useState(true);

  // =========================================================
  // AUTH CHECK
  // =========================================================

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    dispatch(logout());

    toast.success("Logged out successfully");

    router.replace("/login");
  };

  // =========================================================
  // AUTH LOADING
  // =========================================================

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  // =========================================================
  // SECTION TITLE
  // =========================================================

  const getSectionTitle = () => {
    switch (activeSection) {
      case "dashboard":
        return "Dashboard";

      case "users":
        return "Users";

      case "active-users":
        return "Active Users";

      case "plans":
        return "Subscription Plans";

      case "deposit-all":
        return "All Deposit Requests";

      case "deposit-pending":
        return "Pending Deposits";

      case "deposit-rejected":
        return "Rejected Deposits";

      case "deposit-successful":
        return "Successful Deposits";

      case "withdrawal-all":
        return "All Withdrawal Requests";

      case "withdrawal-pending":
        return "Pending Withdrawals";

      case "withdrawal-rejected":
        return "Rejected Withdrawals";

      case "withdrawal-successful":
        return "Successful Withdrawals";

      case "payment-settings":
        return "Payment Settings";

      case "ads":
        return "Ads Management";

      case "UI-settings":
        return "UI Settings";

      case "support-settings":
        return "Support Settings";

        
      case "tutorials":
        return "Tutorials";

      case "income":
        return "Income";  
      default:
        return "Dashboard";
    }
  };

  // =========================================================
  // SECTION CHANGE
  // =========================================================

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  // =========================================================
  // DEPOSIT ACTIVE
  // =========================================================

  const isDepositActive =
    activeSection === "deposit-all" ||
    activeSection === "deposit-pending" ||
    activeSection === "deposit-rejected" ||
    activeSection === "deposit-successful";

  // =========================================================
  // WITHDRAWAL ACTIVE
  // =========================================================

  const isWithdrawalActive =
    activeSection === "withdrawal-all" ||
    activeSection === "withdrawal-pending" ||
    activeSection === "withdrawal-rejected" ||
    activeSection === "withdrawal-successful";

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ===================================================== */}
      {/* MOBILE HEADER */}
      {/* ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-800 bg-black px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-white transition hover:bg-white/10"
        >
          <Menu size={24} />
        </button>

        <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* ===================================================== */}
      {/* MOBILE OVERLAY */}
      {/* ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===================================================== */}
      {/* SIDEBAR */}
      {/* ===================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-black text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* ================================================= */}
        {/* LOGO */}
        {/* ================================================= */}

        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h2 className="font-bold text-white">Admin Panel</h2>

              <p className="text-xs text-white/50">Management</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* ================================================= */}
        {/* ADMIN INFO */}
        {/* ================================================= */}

        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white font-bold text-black">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{user.name}</p>

              <p className="truncate text-xs text-white/50">{user.cellNo}</p>

              <span className="mt-1 inline-block rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-300">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {/* ================================================= */}
          {/* DASHBOARD */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => handleSectionChange("dashboard")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "dashboard"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          {/* ================================================= */}
          {/* USERS */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => handleSectionChange("users")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "users"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users size={19} />
            <span>Users</span>
          </button>

          {/* ================================================= */}
          {/* ACTIVE USERS */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => handleSectionChange("active-users")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "active-users"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <UserCheck size={19} />
            <span>Active Users</span>
          </button>

          {/* ================================================= */}
          {/* SUBSCRIPTION PLANS */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => handleSectionChange("plans")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "plans"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <CreditCard size={19} />

            <span>Subscription Plans</span>
          </button>

          {/* ================================================= */}
          {/* DEPOSITS DROPDOWN */}
          {/* ================================================= */}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setDepositOpen(!depositOpen)}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                isDepositActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <ArrowDownToLine size={19} />

                <span>Deposits</span>
              </div>

              <ChevronDown
                size={17}
                className={`transition-transform ${
                  depositOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {depositOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                {/* ALL DEPOSITS */}

                <button
                  type="button"
                  onClick={() => handleSectionChange("deposit-all")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeSection === "deposit-all"
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <List size={16} />

                  <span>All Deposit Requests</span>
                </button>

                {/* PENDING */}

                <button
                  type="button"
                  onClick={() => handleSectionChange("deposit-pending")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeSection === "deposit-pending"
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Clock size={16} />

                  <span>Pending Deposits</span>
                </button>

                {/* REJECTED */}

                <button
                  type="button"
                  onClick={() => handleSectionChange("deposit-rejected")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeSection === "deposit-rejected"
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <XCircle size={16} />

                  <span>Rejected Deposits</span>
                </button>

                {/* SUCCESSFUL */}

                <button
                  type="button"
                  onClick={() => handleSectionChange("deposit-successful")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeSection === "deposit-successful"
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <CheckCircle size={16} />

                  <span>Successful Deposits</span>
                </button>
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* WITHDRAWALS DROPDOWN */}
          {/* ================================================= */}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setWithdrawalOpen(!withdrawalOpen)}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                isWithdrawalActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <ArrowUpFromLine size={19} />

                <span>Withdrawals</span>
              </div>

              <ChevronDown
                size={17}
                className={`transition-transform ${
                  withdrawalOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {withdrawalOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                {/* ALL WITHDRAWALS */}

                <button
                  type="button"
                  onClick={() => handleSectionChange("withdrawal-all")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeSection === "withdrawal-all"
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <List size={16} />

                  <span>All Withdrawal Requests</span>
                </button>

                {/* PENDING */}

                <button
                  type="button"
                  onClick={() => handleSectionChange("withdrawal-pending")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeSection === "withdrawal-pending"
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Clock size={16} />

                  <span>Pending Withdrawals</span>
                </button>

                {/* REJECTED */}

                <button
                  type="button"
                  onClick={() => handleSectionChange("withdrawal-rejected")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeSection === "withdrawal-rejected"
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <XCircle size={16} />

                  <span>Rejected Withdrawals</span>
                </button>

                {/* SUCCESSFUL */}

                <button
                  type="button"
                  onClick={() => handleSectionChange("withdrawal-successful")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeSection === "withdrawal-successful"
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <CheckCircle size={16} />

                  <span>Successful Withdrawals</span>
                </button>
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* PAYMENT SETTINGS */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => handleSectionChange("payment-settings")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "payment-settings"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings size={19} />

            <span>Payment Settings</span>
          </button>

          {/* ================================================= */}
          {/* ADS */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => handleSectionChange("ads")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "ads"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Megaphone size={19} />

            <span>Ads Management</span>
          </button>

          {/* ================================================= */}
          {/* SUPPORT SETTINGS */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => handleSectionChange("support-settings")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "support-settings"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Headphones size={19} />

            <span>Support Settings</span>
          </button>

          
          <button
            type="button"
            onClick={() => handleSectionChange("tutorials")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "tutorials"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings size={19} />

            <span>Tutorials</span>
          </button>
           <button
            type="button"
            onClick={() => handleSectionChange("income")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "income"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings size={19} />

            <span>Set Income Page</span>
          </button>
          {/* ================================================= */}
          {/* UI SETTINGS */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => handleSectionChange("UI-settings")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              activeSection === "UI-settings"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings size={19} />

            <span>UI Settings</span>
          </button>
        </nav>

        {/* ================================================= */}
        {/* LOGOUT */}
        {/* ================================================= */}

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ===================================================== */}
      {/* MAIN */}
      {/* ===================================================== */}

      <div className="lg:pl-72">
        {/* ================================================= */}
        {/* DESKTOP HEADER */}
        {/* ================================================= */}

        <header className="hidden h-16 items-center justify-between border-b border-gray-200 bg-white px-6 lg:flex">
          <h1 className="text-lg font-bold text-gray-900">
            {getSectionTitle()}
          </h1>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>

              <p className="text-xs text-gray-500">Administrator</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          {/* ================================================= */}
          {/* DASHBOARD */}
          {/* ================================================= */}

          {activeSection === "dashboard" && <DashboardOverview user={user} />}

          {/* ================================================= */}
          {/* USERS */}
          {/* ================================================= */}

          {activeSection === "users" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">Users</h2>

              <p className="mt-2 text-gray-500">Manage all registered users.</p>
            </div>
          )}

          {/* ================================================= */}
          {/* ACTIVE USERS */}
          {/* ================================================= */}

          {activeSection === "active-users" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">Active Users</h2>

              <p className="mt-2 text-gray-500">
                Manage users with active subscriptions.
              </p>
            </div>
          )}

          {/* ================================================= */}
          {/* PLANS */}
          {/* ================================================= */}

          {activeSection === "plans" && <PlansSection />}

          {/* ================================================= */}
          {/* DEPOSITS */}
          {/* ================================================= */}

          {(activeSection === "deposit-all" ||
            activeSection === "deposit-pending" ||
            activeSection === "deposit-rejected" ||
            activeSection === "deposit-successful") && (
            <DepositRequestsSection activeSection={activeSection} />
          )}

          {/* ================================================= */}
          {/* WITHDRAWALS */}
          {/* ================================================= */}

          {(activeSection === "withdrawal-all" ||
            activeSection === "withdrawal-pending" ||
            activeSection === "withdrawal-rejected" ||
            activeSection === "withdrawal-successful") && (
            <WithdrawalRequestsSection activeSection={activeSection} />
          )}

          {/* ================================================= */}
          {/* PAYMENT SETTINGS */}
          {/* ================================================= */}

          {activeSection === "payment-settings" && <PaymentSettingsSection />}

          {/* ================================================= */}
          {/* ADS */}
          {/* ================================================= */}

          {activeSection === "ads" && <AdsSection />}

          {activeSection === "support-settings" && <SupportSettingsSection />}

           {activeSection === "tutorials" && <TutorialAdmin />}

            {activeSection === "income" && <IncomeSection />}
          {/* ================================================= */}
          {/* UI SETTINGS */}
          {/* ================================================= */}

          {activeSection === "UI-settings" && <DashboardUISettings />}
        </div>
      </div>

      {/* ===================================================== */}
      {/* TOASTER */}
      {/* ===================================================== */}

      <Toaster position="top-right" />
    </main>
  );
}
