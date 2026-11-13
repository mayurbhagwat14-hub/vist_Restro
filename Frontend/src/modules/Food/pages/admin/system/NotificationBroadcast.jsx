import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Cake,
  Calendar,
  CheckCheck,
  Gift,
  Heart,
  Loader2,
  RefreshCw,
  Search,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { adminAPI } from "@food/api";

const TARGET_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "USER", label: "Users" },
  { value: "CUSTOM", label: "Particular Persons (By Phone)" },
];

const BIRTHDAY_TEMPLATES = [
  {
    label: "🎉 20% Birthday Discount",
    title: "🎉 Happy Birthday from VIST!",
    message: "Wishing you a joyful Happy Birthday! 🎂 Treat yourself to your favorite food today with 20% OFF using code BDAY20!",
  },
  {
    label: "🎂 Special Celebration Treat",
    title: "🎂 A Special Birthday Treat For You!",
    message: "Happy Birthday! May your day be filled with happiness, sweet memories, and delicious food. Enjoy a special dining treat on us!",
  },
  {
    label: "🎁 Free Dessert / Starter",
    title: "🎁 Birthday Sweet Surprise!",
    message: "It's your special day! Order today and enjoy a complimentary dessert or surprise starter with your feast. Celebrate with VIST!",
  },
];

const ANNIVERSARY_TEMPLATES = [
  {
    label: "💍 Romantic Dinner Milestone",
    title: "💍 Happy Anniversary from VIST!",
    message: "Wishing you a very Happy Anniversary! 🥂 Celebrate your love and togetherness with a delicious dinner feast today.",
  },
  {
    label: "❤️ Special Milestone Treat",
    title: "❤️ Happy Anniversary! Celebrate Love",
    message: "Cheers to another year of love! Make your anniversary celebration unforgettable with special discounts on your favorite dishes today.",
  },
];

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTomorrowString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getRows = (response) => {
  const payload = response?.data?.data;
  return (
    payload?.items ||
    payload?.restaurants ||
    payload?.partners ||
    payload?.customers ||
    payload?.users ||
    payload?.data ||
    payload?.rows ||
    response?.data?.items ||
    []
  );
};

const normalizeRecipients = (response, ownerType, mapper) =>
  getRows(response)
    .map((item) => mapper(item, ownerType))
    .filter((item) => item.ownerId);

const toDateLabel = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function NotificationBroadcast() {
  const [activeTab, setActiveTab] = useState("OCCASION"); // 'OCCASION' | 'STANDARD'

  // Standard Broadcast Form
  const [standardForm, setStandardForm] = useState({
    title: "",
    message: "",
    targetType: "ALL",
  });
  const [standardSearch, setStandardSearch] = useState("");
  const [allStandardRecipients, setAllStandardRecipients] = useState([]);
  const [selectedStandardRecipients, setSelectedStandardRecipients] = useState([]);
  const [standardRecipientLoading, setStandardRecipientLoading] = useState(false);

  // Occasion Broadcast Form
  const [occasionType, setOccasionType] = useState("BIRTHDAY"); // 'BIRTHDAY' | 'ANNIVERSARY'
  const [occasionDate, setOccasionDate] = useState(getTodayString());
  const [occasionForm, setOccasionForm] = useState({
    title: BIRTHDAY_TEMPLATES[0].title,
    message: BIRTHDAY_TEMPLATES[0].message,
  });
  const [occasionUsers, setOccasionUsers] = useState([]);
  const [selectedOccasionUserIds, setSelectedOccasionUserIds] = useState([]);
  const [occasionLoading, setOccasionLoading] = useState(false);
  const [occasionSearch, setOccasionSearch] = useState("");

  // History & Submitting
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState(null);

  // Load history
  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await adminAPI.getBroadcastNotifications({ page: 1, limit: 50 });
      setHistory(response?.data?.data?.items || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load standard custom recipients
  const loadStandardRecipients = async () => {
    try {
      setStandardRecipientLoading(true);
      const [customersRes] = await Promise.all([
        adminAPI.getCustomers({ page: 1, limit: 500 }),
      ]);
      const customers = normalizeRecipients(customersRes, "USER", (item, ownerType) => ({
        ownerType,
        ownerId: String(item?._id || item?.id || ""),
        phone: String(item?.phone || "").trim(),
        name: String(item?.name || "Customer").trim(),
        label: String(item?.phone || item?.name || "User").trim(),
        subLabel: [item?.name, item?.email].filter(Boolean).join(" • "),
      }));
      setAllStandardRecipients(customers);
    } catch {
      setAllStandardRecipients([]);
    } finally {
      setStandardRecipientLoading(false);
    }
  };

  // Load occasion recipients (Birthday / Anniversary)
  const loadOccasionRecipients = async () => {
    try {
      setOccasionLoading(true);
      const res = await adminAPI.getOccasionRecipients({
        type: occasionType.toLowerCase(),
        date: occasionDate,
      });
      const data = res?.data?.data || {};
      const users = data.users || [];

      // Sort users with active FCM tokens to the top so admin sees push-ready devices first
      const sortedUsers = [...users].sort((a, b) => {
        if (a.hasFcm && !b.hasFcm) return -1;
        if (!a.hasFcm && b.hasFcm) return 1;
        return (a.phone || "").localeCompare(b.phone || "");
      });

      setOccasionUsers(sortedUsers);
      // Select all by default
      setSelectedOccasionUserIds(sortedUsers.map((u) => u._id));
    } catch {
      setOccasionUsers([]);
      setSelectedOccasionUserIds([]);
    } finally {
      setOccasionLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (activeTab === "OCCASION") {
      loadOccasionRecipients();
    }
  }, [activeTab, occasionType, occasionDate]);

  useEffect(() => {
    if (activeTab === "STANDARD" && standardForm.targetType === "CUSTOM" && allStandardRecipients.length === 0) {
      loadStandardRecipients();
    }
  }, [activeTab, standardForm.targetType, allStandardRecipients.length]);

  // Template switch helper
  const handleSelectTemplate = (template) => {
    setOccasionForm({
      title: template.title,
      message: template.message,
    });
  };

  // Switch occasion type
  const handleOccasionTypeChange = (type) => {
    setOccasionType(type);
    const templates = type === "BIRTHDAY" ? BIRTHDAY_TEMPLATES : ANNIVERSARY_TEMPLATES;
    setOccasionForm({
      title: templates[0].title,
      message: templates[0].message,
    });
  };

  // Filtered Occasion Users - Search by Phone Number or Name
  const filteredOccasionUsers = useMemo(() => {
    const q = occasionSearch.trim().toLowerCase();
    if (!q) return occasionUsers;
    return occasionUsers.filter(
      (u) =>
        u.phone?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [occasionUsers, occasionSearch]);

  // Occasion user selection helpers
  const handleToggleOccasionUser = (id) => {
    setSelectedOccasionUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllOccasion = () => {
    setSelectedOccasionUserIds(occasionUsers.map((u) => u._id));
  };

  const handleSelectOnlyFcmOccasion = () => {
    setSelectedOccasionUserIds(
      occasionUsers.filter((u) => u.hasFcm).map((u) => u._id)
    );
  };

  const handleDeselectAllOccasion = () => {
    setSelectedOccasionUserIds([]);
  };

  // Filtered Standard Recipients
  const filteredStandardRecipients = useMemo(() => {
    const keyword = String(standardSearch || "").trim().toLowerCase();
    if (!keyword) return allStandardRecipients;
    return allStandardRecipients.filter((item) =>
      [item.phone, item.label, item.subLabel, item.name]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [allStandardRecipients, standardSearch]);

  const selectedStandardKeys = useMemo(
    () => new Set(selectedStandardRecipients.map((item) => `${item.ownerType}:${item.ownerId}`)),
    [selectedStandardRecipients]
  );

  const toggleStandardRecipient = (recipient) => {
    const key = `${recipient.ownerType}:${recipient.ownerId}`;
    setSelectedStandardRecipients((prev) =>
      prev.some((item) => `${item.ownerType}:${item.ownerId}` === key)
        ? prev.filter((item) => `${item.ownerType}:${item.ownerId}` !== key)
        : [...prev, recipient]
    );
  };

  // Submit Occasion Broadcast
  const handleOccasionSubmit = async (e) => {
    e.preventDefault();
    if (!occasionForm.title.trim() || !occasionForm.message.trim()) {
      setFeedbackBanner({ type: "error", message: "Please provide both title and message." });
      return;
    }
    if (selectedOccasionUserIds.length === 0) {
      setFeedbackBanner({ type: "error", message: "Please select at least one recipient phone number to send greetings." });
      return;
    }

    const selectedUsers = occasionUsers.filter((u) => selectedOccasionUserIds.includes(u._id));
    const targets = selectedUsers.map((u) => ({
      ownerType: "USER",
      ownerId: u._id,
      label: u.phone || u.name,
      subLabel: [u.name, u.phone].filter(Boolean).join(" • "),
    }));

    try {
      setSubmitting(true);
      setFeedbackBanner(null);
      await adminAPI.createBroadcastNotification({
        title: occasionForm.title.trim(),
        message: occasionForm.message.trim(),
        targetType: occasionType,
        targetIds: selectedOccasionUserIds,
        targets,
      });

      const pushCount = selectedUsers.filter((u) => u.hasFcm).length;
      const phoneList = selectedUsers.map((u) => u.phone).filter(Boolean).join(", ");
      setFeedbackBanner({
        type: "success",
        message: `Successfully dispatched ${occasionType === "BIRTHDAY" ? "Birthday" : "Anniversary"} greeting to ${selectedOccasionUserIds.length} recipient(s) (${pushCount} received instant FCM push popup on phone)! Targets: ${phoneList}`,
      });

      window.dispatchEvent(new Event("adminBroadcastUpdated"));
      await loadHistory();
    } catch (err) {
      setFeedbackBanner({
        type: "error",
        message: err?.response?.data?.message || err.message || "Failed to send greeting broadcast.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Standard Broadcast
  const handleStandardSubmit = async (event) => {
    event.preventDefault();
    if (!standardForm.title.trim() || !standardForm.message.trim()) {
      setFeedbackBanner({ type: "error", message: "Please enter title and message." });
      return;
    }
    if (standardForm.targetType === "CUSTOM" && selectedStandardRecipients.length === 0) {
      setFeedbackBanner({ type: "error", message: "Please select at least one recipient." });
      return;
    }

    try {
      setSubmitting(true);
      setFeedbackBanner(null);
      await adminAPI.createBroadcastNotification({
        title: standardForm.title.trim(),
        message: standardForm.message.trim(),
        targetType: standardForm.targetType,
        targetIds:
          standardForm.targetType === "CUSTOM"
            ? selectedStandardRecipients.map((item) => item.ownerId)
            : [],
        targets:
          standardForm.targetType === "CUSTOM"
            ? selectedStandardRecipients.map((item) => ({
                ownerType: item.ownerType,
                ownerId: item.ownerId,
                label: item.phone || item.label,
                subLabel: item.subLabel,
              }))
            : [],
      });
      setStandardForm({ title: "", message: "", targetType: "ALL" });
      setSelectedStandardRecipients([]);
      setStandardSearch("");
      setFeedbackBanner({
        type: "success",
        message: "Broadcast notification sent successfully!",
      });
      window.dispatchEvent(new Event("adminBroadcastUpdated"));
      await loadHistory();
    } catch (err) {
      setFeedbackBanner({
        type: "error",
        message: err?.response?.data?.message || err.message || "Failed to send broadcast.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm("Are you sure you want to delete this broadcast?")) return;
    try {
      await adminAPI.deleteBroadcastNotification(id);
      window.dispatchEvent(new Event("adminBroadcastUpdated"));
      await loadHistory();
    } catch {}
  };

  // Metrics
  const totalOccasionCount = occasionUsers.length;
  const fcmActiveCount = occasionUsers.filter((u) => u.hasFcm).length;
  const selectedOccasionUsers = occasionUsers.filter((u) => selectedOccasionUserIds.includes(u._id));
  const selectedFcmCount = selectedOccasionUsers.filter((u) => u.hasFcm).length;
  const selectedNoFcmCount = selectedOccasionUsers.length - selectedFcmCount;

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackBanner && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold ${
            feedbackBanner.type === "success"
              ? "bg-[#FAF5ED] text-[#5C381E] border-2 border-[#5C381E]/30"
              : "bg-red-50 text-red-800 border-2 border-red-200"
          }`}
        >
          <span>{feedbackBanner.message}</span>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-xs font-bold underline ml-4 hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header & Mode Switcher */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5C381E]/10 text-[#5C381E] flex items-center justify-center">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Notification Broadcast & Greetings</h1>
              <p className="text-sm text-neutral-500 mt-1">
                Send push notifications & in-app alerts identified by user phone numbers.
              </p>
            </div>
          </div>

          {/* Navigation Tabs (VIST Brand Theme) */}
          <div className="inline-flex rounded-2xl bg-[#FAF5ED] p-1.5 border border-[#5C381E]/20 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("OCCASION")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "OCCASION"
                  ? "bg-[#5C381E] text-white shadow-sm"
                  : "text-[#5C381E] hover:bg-[#5C381E]/10"
              }`}
            >
              <Cake className="w-4 h-4" />
              Birthday & Anniversary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("STANDARD")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "STANDARD"
                  ? "bg-[#5C381E] text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Send className="w-4 h-4" />
              General Broadcast
            </button>
          </div>
        </div>

        {/* TAB 1: OCCASION BROADCAST (BIRTHDAY & ANNIVERSARY) */}
        {activeTab === "OCCASION" && (
          <div className="space-y-6">
            {/* Occasion Controls Bar */}
            <div className="bg-[#FAF5ED] border border-[#5C381E]/20 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Occasion Type Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C381E]">Occasion:</span>
                  <div className="inline-flex rounded-xl bg-white border border-[#5C381E]/30 p-1">
                    <button
                      type="button"
                      onClick={() => handleOccasionTypeChange("BIRTHDAY")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        occasionType === "BIRTHDAY"
                          ? "bg-[#5C381E] text-white shadow-sm"
                          : "text-[#5C381E] hover:bg-[#FAF5ED]"
                      }`}
                    >
                      <Cake className="w-3.5 h-3.5" />
                      🎂 Birthday
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOccasionTypeChange("ANNIVERSARY")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        occasionType === "ANNIVERSARY"
                          ? "bg-[#5C381E] text-white shadow-sm"
                          : "text-[#5C381E] hover:bg-[#FAF5ED]"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" />
                      💍 Anniversary
                    </button>
                  </div>
                </div>

                {/* Target Date Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C381E]">Date:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={occasionDate}
                      onChange={(e) => setOccasionDate(e.target.value)}
                      className="rounded-xl border border-[#5C381E]/30 bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-[#5C381E]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setOccasionDate(getTodayString())}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        occasionDate === getTodayString()
                          ? "bg-[#5C381E] text-white border-[#5C381E]"
                          : "bg-white text-[#5C381E] border-[#5C381E]/30 hover:bg-[#FAF5ED]"
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setOccasionDate(getTomorrowString())}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        occasionDate === getTomorrowString()
                          ? "bg-[#5C381E] text-white border-[#5C381E]"
                          : "bg-white text-[#5C381E] border-[#5C381E]/30 hover:bg-[#FAF5ED]"
                      }`}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={loadOccasionRecipients}
                      title="Refresh recipient list"
                      className="p-1.5 rounded-xl border border-[#5C381E]/30 bg-white text-[#5C381E] hover:bg-[#FAF5ED]"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${occasionLoading ? "animate-spin text-[#5C381E]" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#5C381E]/15">
                <div className="bg-white rounded-xl p-3 border border-[#5C381E]/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-500 font-medium">Matching Phone Numbers</div>
                    <div className="text-lg font-bold text-neutral-900">{totalOccasionCount} users</div>
                  </div>
                  <Gift className="w-5 h-5 text-[#5C381E]" />
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-emerald-700 font-medium">Mobile Push Ready</div>
                    <div className="text-lg font-bold text-emerald-600">{fcmActiveCount} devices</div>
                  </div>
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#5C381E]/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-500 font-medium">Selected to Send</div>
                    <div className="text-lg font-bold text-[#5C381E]">
                      {selectedOccasionUserIds.length} users ({selectedFcmCount} push)
                    </div>
                  </div>
                  <CheckCheck className="w-5 h-5 text-[#5C381E]" />
                </div>
              </div>
            </div>

            {/* Recipient Selection Section - Primary Identifier: Phone Number */}
            <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <span>Recipients Identified by Mobile Number</span>
                    <span className="text-xs font-normal text-neutral-500">
                      ({selectedOccasionUserIds.length} of {totalOccasionCount} selected)
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Green badge users will get instant mobile popup. In-App users will receive notification in-app.
                  </p>
                </div>

                {/* Selection Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSelectAllOccasion}
                    disabled={totalOccasionCount === 0}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectOnlyFcmOccasion}
                    disabled={fcmActiveCount === 0}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    Select Push Ready Only ({fcmActiveCount})
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllOccasion}
                    disabled={selectedOccasionUserIds.length === 0}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-neutral-300 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Search bar inside recipient selector - Search by Phone Number */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by phone number (e.g. 8766556836) or name..."
                  value={occasionSearch}
                  onChange={(e) => setOccasionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white outline-none focus:border-[#5C381E] focus:ring-1 focus:ring-[#5C381E]"
                />
              </div>

              {/* Recipient User Checklist with Phone Number as Primary Identifier */}
              <div className="max-h-72 overflow-y-auto rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
                {occasionLoading ? (
                  <div className="p-8 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#5C381E]" />
                    Finding celebrants for {occasionDate}...
                  </div>
                ) : filteredOccasionUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <Cake className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-neutral-600">
                      No users match the search or have their {occasionType === "BIRTHDAY" ? "birthday" : "anniversary"} on {occasionDate}.
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Click "Today" or choose a date to see celebrants.
                    </p>
                  </div>
                ) : (
                  filteredOccasionUsers.map((user) => {
                    const isChecked = selectedOccasionUserIds.includes(user._id);
                    return (
                      <label
                        key={user._id}
                        className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          isChecked ? "bg-[#FAF5ED]/60 hover:bg-[#FAF5ED]" : "hover:bg-neutral-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleOccasionUser(user._id)}
                            className="h-4 w-4 rounded border-neutral-300 text-[#5C381E] focus:ring-[#5C381E]"
                          />
                          <div className="min-w-0">
                            {/* Primary Identifier: Phone Number */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-neutral-900 tracking-wide font-mono flex items-center gap-1.5">
                                <Smartphone className="w-3.5 h-3.5 text-[#5C381E]" />
                                {user.phone ? user.phone : "No Phone"}
                              </span>
                              {user.date && (
                                <span className="text-[11px] font-semibold text-[#5C381E] bg-[#FAF5ED] border border-[#5C381E]/30 px-2 py-0.5 rounded-md">
                                  {user.date}
                                </span>
                              )}
                            </div>

                            {/* Secondary Identifier: Name & Email */}
                            <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                              <User className="w-3 h-3 text-neutral-400" />
                              <span>{user.name ? user.name : "Customer"}</span>
                              {user.email && (
                                <span className="text-neutral-400 truncate">• {user.email}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* FCM Status Badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {user.hasFcm ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                              Push Ready ({user.fcmCount})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500 border border-neutral-200" title="User has not installed app or granted notification permission">
                              In-App Only (No Push)
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Template Selection - VIST Theme */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5C381E]">
                  Quick {occasionType === "BIRTHDAY" ? "Birthday" : "Anniversary"} Templates
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(occasionType === "BIRTHDAY" ? BIRTHDAY_TEMPLATES : ANNIVERSARY_TEMPLATES).map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="text-xs px-3.5 py-2 rounded-xl border border-[#5C381E]/30 bg-[#FAF5ED] hover:bg-[#5C381E] hover:text-white text-[#5C381E] font-bold transition-all shadow-xs"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion Message Form - VIST Brand Theme */}
            <form onSubmit={handleOccasionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Greeting Title</label>
                <input
                  type="text"
                  value={occasionForm.title}
                  onChange={(e) => setOccasionForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter greeting title (e.g. Happy Birthday from VIST!)"
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[#5C381E] focus:ring-2 focus:ring-[#5C381E]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Greeting Message / Offer</label>
                <textarea
                  value={occasionForm.message}
                  onChange={(e) => setOccasionForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter celebration message, coupon code, or warm wishes..."
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-[#5C381E] focus:ring-2 focus:ring-[#5C381E]/20 resize-y"
                />
              </div>

              {/* Informational Summary Before Send */}
              {selectedNoFcmCount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                  ⚠️ Note: {selectedNoFcmCount} selected user(s) currently have no registered device token and will only receive an in-app alert. {selectedFcmCount} user(s) with active tokens will receive an instant mobile push notification popup.
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-neutral-600">
                  Targeting <strong className="text-neutral-900">{selectedOccasionUserIds.length}</strong> recipient(s) by mobile number{" "}
                  {selectedFcmCount > 0 && (
                    <span className="text-emerald-700 font-semibold">({selectedFcmCount} will receive mobile push popup)</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || selectedOccasionUserIds.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5C381E] hover:bg-[#482A14] px-6 py-3 text-sm font-bold text-white disabled:opacity-50 transition-all shadow-md cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-[#C5A059]" />
                  )}
                  Send {occasionType === "BIRTHDAY" ? "Birthday" : "Anniversary"} Wishes ({selectedOccasionUserIds.length})
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: STANDARD GENERAL BROADCAST */}
        {activeTab === "STANDARD" && (
          <form onSubmit={handleStandardSubmit} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm font-semibold text-neutral-700">Title</span>
                <input
                  value={standardForm.title}
                  onChange={(event) =>
                    setStandardForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Enter notification title"
                  className="mt-2 w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#5C381E] focus:ring-2 focus:ring-[#5C381E]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-neutral-700">Target Type</span>
                <select
                  value={standardForm.targetType}
                  onChange={(event) =>
                    setStandardForm((prev) => ({ ...prev, targetType: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#5C381E] focus:ring-2 focus:ring-[#5C381E]/20"
                >
                  {TARGET_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-neutral-700">Message</span>
              <textarea
                value={standardForm.message}
                onChange={(event) =>
                  setStandardForm((prev) => ({ ...prev, message: event.target.value }))
                }
                placeholder="Enter notification message"
                rows={5}
                className="mt-2 w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#5C381E] focus:ring-2 focus:ring-[#5C381E]/20 resize-y"
              />
            </label>

            {standardForm.targetType === "CUSTOM" && (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-300 bg-white px-4 py-3">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <input
                    value={standardSearch}
                    onChange={(event) => setStandardSearch(event.target.value)}
                    placeholder="Search users by phone number or name..."
                    className="w-full text-sm bg-transparent outline-none"
                  />
                </div>

                <div className="text-xs font-semibold text-neutral-600">
                  Selected recipients: {selectedStandardRecipients.length}
                </div>

                <div className="max-h-72 overflow-y-auto rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100">
                  {standardRecipientLoading ? (
                    <div className="p-6 text-sm text-neutral-500 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#5C381E]" />
                      Loading recipients...
                    </div>
                  ) : filteredStandardRecipients.length === 0 ? (
                    <div className="p-6 text-sm text-neutral-500">No recipients found.</div>
                  ) : (
                    filteredStandardRecipients.map((recipient) => {
                      const key = `${recipient.ownerType}:${recipient.ownerId}`;
                      const checked = selectedStandardKeys.has(key);
                      return (
                        <label
                          key={key}
                          className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStandardRecipient(recipient)}
                            className="mt-1 h-4 w-4 rounded border-neutral-300 text-[#5C381E] focus:ring-[#5C381E]"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-neutral-900 font-mono">
                              {recipient.phone ? recipient.phone : recipient.label}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {recipient.name ? `Name: ${recipient.name}` : ""}
                              {recipient.subLabel ? ` • ${recipient.subLabel}` : ""}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#5C381E] hover:bg-[#482A14] px-6 py-3 text-sm font-bold text-white disabled:opacity-60 transition-colors shadow-sm"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-[#C5A059]" />
                )}
                Send Broadcast
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Broadcast & Greetings History</h2>
            <p className="text-sm text-neutral-500">Latest sent broadcasts, occasion greetings, and recipient metrics.</p>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${historyLoading ? "animate-spin text-[#5C381E]" : ""}`} />
          </button>
        </div>

        {historyLoading ? (
          <div className="py-10 text-sm text-neutral-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#5C381E]" />
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-500">No broadcast notifications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200">
                  <th className="py-3 pr-4 font-semibold">Title</th>
                  <th className="py-3 pr-4 font-semibold">Message</th>
                  <th className="py-3 pr-4 font-semibold">Category / Target</th>
                  <th className="py-3 pr-4 font-semibold">Recipients</th>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const isBday = item?.targetType === "BIRTHDAY";
                  const isAnniv = item?.targetType === "ANNIVERSARY";
                  return (
                    <tr key={item?._id} className="border-b border-neutral-100 align-top hover:bg-neutral-50/60">
                      <td className="py-4 pr-4 font-semibold text-neutral-900 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          {isBday && <Cake className="w-4 h-4 text-[#C5A059] shrink-0" />}
                          {isAnniv && <Heart className="w-4 h-4 text-rose-500 shrink-0" />}
                          <span className="truncate">{item?.title || "Notification"}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-neutral-600 max-w-sm">
                        <p className="line-clamp-2">{item?.message || "-"}</p>
                      </td>
                      <td className="py-4 pr-4 text-neutral-700 whitespace-nowrap">
                        {isBday ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF5ED] text-[#5C381E] border border-[#5C381E]/30">
                            🎂 Birthday Greeting
                          </span>
                        ) : isAnniv ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            💍 Anniversary Greeting
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {item?.targetLabel || item?.targetType}
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-neutral-700 font-bold whitespace-nowrap">
                        {item?.targetCount || item?.targets?.length || 0} users
                      </td>
                      <td className="py-4 pr-4 text-neutral-500 whitespace-nowrap text-xs">
                        {toDateLabel(item?.createdAt)}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item?._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
