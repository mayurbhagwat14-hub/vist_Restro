import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  Check,
  CheckCheck,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { adminAPI } from "@food/api";

const TARGET_OPTIONS = [
  { value: "ALL", label: "All Users & Partners" },
  { value: "USER", label: "All Customers" },
  { value: "CUSTOM", label: "Specific Customers (By Phone)" },
];

const BIRTHDAY_TEMPLATES = [
  {
    label: "20% Birthday Discount",
    title: "Happy Birthday from VIST Restaurant",
    message: "Wishing you a very Happy Birthday! Enjoy 20% off on your order today with coupon code BDAY20. Treat yourself to a memorable dining experience.",
  },
  {
    label: "Celebration Dining Offer",
    title: "A Special Birthday Treat For You",
    message: "Warm birthday greetings from team VIST! Celebrate your special day with exclusive savings on your favorite delicacies.",
  },
  {
    label: "Complimentary Dessert Offer",
    title: "Your Birthday Celebration Surprise",
    message: "Happy Birthday! Make your celebration extraordinary with a special complimentary dessert on your order today.",
  },
];

const ANNIVERSARY_TEMPLATES = [
  {
    label: "Anniversary Special Dining",
    title: "Happy Anniversary from VIST Restaurant",
    message: "Warmest anniversary wishes from all of us! Celebrate your milestone moment with a delightful dining experience today.",
  },
  {
    label: "Celebration Discount Offer",
    title: "Celebrating Your Special Milestone",
    message: "Happy Anniversary! Cheers to togetherness. Enjoy exclusive festive savings on your meal today.",
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
        label: String(item?.phone || item?.name || "Customer").trim(),
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

  const handleSelectTemplate = (template) => {
    setOccasionForm({
      title: template.title,
      message: template.message,
    });
  };

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
      setFeedbackBanner({ type: "error", message: "Please select at least one recipient." });
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
      setFeedbackBanner({
        type: "success",
        message: `Notification dispatched to ${selectedOccasionUserIds.length} recipient(s) (${pushCount} received mobile push popup).`,
      });

      window.dispatchEvent(new Event("adminBroadcastUpdated"));
      await loadHistory();
    } catch (err) {
      setFeedbackBanner({
        type: "error",
        message: err?.response?.data?.message || err.message || "Failed to send notification.",
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
        message: "Broadcast notification dispatched successfully.",
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
          className={`px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium ${
            feedbackBanner.type === "success"
              ? "bg-[#FAF5ED] text-[#5C381E] border border-[#5C381E]/30"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedbackBanner.message}</span>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-xs font-semibold underline ml-4 hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] text-[#5C381E] flex items-center justify-center border border-[#5C381E]/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Notification Broadcast</h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Send push notifications and greetings to customers by phone number.
              </p>
            </div>
          </div>

          {/* Clean Segmented Control Tabs */}
          <div className="inline-flex rounded-xl bg-neutral-100 p-1 border border-neutral-200/80 self-start sm:self-auto text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("OCCASION")}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === "OCCASION"
                  ? "bg-white text-[#5C381E] font-semibold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Birthday & Anniversary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("STANDARD")}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === "STANDARD"
                  ? "bg-white text-[#5C381E] font-semibold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              General Broadcast
            </button>
          </div>
        </div>

        {/* TAB 1: OCCASION BROADCAST (BIRTHDAY & ANNIVERSARY) */}
        {activeTab === "OCCASION" && (
          <div className="space-y-6">
            {/* Occasion Filter Toolbar */}
            <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Occasion Type Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-600">Occasion:</span>
                  <div className="inline-flex rounded-lg bg-white border border-neutral-200 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOccasionTypeChange("BIRTHDAY")}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        occasionType === "BIRTHDAY"
                          ? "bg-[#5C381E] text-white"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      Birthday
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOccasionTypeChange("ANNIVERSARY")}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        occasionType === "ANNIVERSARY"
                          ? "bg-[#5C381E] text-white"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      Anniversary
                    </button>
                  </div>
                </div>

                {/* Target Date Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-600">Date:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={occasionDate}
                      onChange={(e) => setOccasionDate(e.target.value)}
                      className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-800 outline-none focus:border-[#5C381E]"
                    />
                    <button
                      type="button"
                      onClick={() => setOccasionDate(getTodayString())}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        occasionDate === getTodayString()
                          ? "bg-[#5C381E] text-white border-[#5C381E]"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setOccasionDate(getTomorrowString())}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        occasionDate === getTomorrowString()
                          ? "bg-[#5C381E] text-white border-[#5C381E]"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={loadOccasionRecipients}
                      title="Refresh recipient list"
                      className="p-1 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${occasionLoading ? "animate-spin text-[#5C381E]" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-200/60 text-xs">
                <div className="bg-white rounded-lg p-2.5 border border-neutral-200 flex items-center justify-between">
                  <span className="text-neutral-500">Matching Customers</span>
                  <span className="font-bold text-neutral-900">{totalOccasionCount}</span>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-neutral-200 flex items-center justify-between">
                  <span className="text-emerald-700 font-medium">Push Ready</span>
                  <span className="font-bold text-emerald-700">{fcmActiveCount}</span>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-neutral-200 flex items-center justify-between">
                  <span className="text-[#5C381E] font-medium">Selected to Send</span>
                  <span className="font-bold text-[#5C381E]">{selectedOccasionUserIds.length}</span>
                </div>
              </div>
            </div>

            {/* Recipient Selection Section - Primary Identifier: Phone Number */}
            <div className="border border-neutral-200 rounded-xl p-4 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Recipients ({selectedOccasionUserIds.length} selected)
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Users are identified by mobile number. Push notifications arrive on devices marked "Push Ready".
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSelectAllOccasion}
                    disabled={totalOccasionCount === 0}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectOnlyFcmOccasion}
                    disabled={fcmActiveCount === 0}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    Push Ready ({fcmActiveCount})
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllOccasion}
                    disabled={selectedOccasionUserIds.length === 0}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 text-neutral-600 hover:bg-neutral-200 disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Search by Phone Number */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Filter by phone number or name..."
                  value={occasionSearch}
                  onChange={(e) => setOccasionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50/50 outline-none focus:border-[#5C381E] focus:bg-white"
                />
              </div>

              {/* Recipient User Checklist */}
              <div className="max-h-64 overflow-y-auto rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                {occasionLoading ? (
                  <div className="p-6 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#5C381E]" />
                    Searching recipients for {occasionDate}...
                  </div>
                ) : filteredOccasionUsers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    No customers found for {occasionDate}.
                  </div>
                ) : (
                  filteredOccasionUsers.map((user) => {
                    const isChecked = selectedOccasionUserIds.includes(user._id);
                    return (
                      <label
                        key={user._id}
                        className={`flex items-center justify-between gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${
                          isChecked ? "bg-[#FAF5ED]/50 hover:bg-[#FAF5ED]" : "hover:bg-neutral-50"
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
                              <span className="text-sm font-semibold text-neutral-900 tracking-wide font-mono">
                                {user.phone ? user.phone : "No Phone"}
                              </span>
                              {user.date && (
                                <span className="text-[11px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                  {user.date}
                                </span>
                              )}
                            </div>

                            {/* Secondary Identifier: Name */}
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {user.name ? user.name : "Customer"}
                              {user.email ? ` • ${user.email}` : ""}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {user.hasFcm ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Push Ready ({user.fcmCount})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                              In-App Only
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Clean Templates (No Emojis) */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
                Quick Preset Templates
              </span>
              <div className="flex flex-wrap gap-2">
                {(occasionType === "BIRTHDAY" ? BIRTHDAY_TEMPLATES : ANNIVERSARY_TEMPLATES).map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-[#5C381E] hover:text-white text-neutral-700 font-medium transition-colors"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Form */}
            <form onSubmit={handleOccasionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  value={occasionForm.title}
                  onChange={(e) => setOccasionForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter greeting title"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-[#5C381E] focus:ring-1 focus:ring-[#5C381E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Notification Message</label>
                <textarea
                  value={occasionForm.message}
                  onChange={(e) => setOccasionForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter message details or offer terms..."
                  rows={4}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-[#5C381E] focus:ring-1 focus:ring-[#5C381E] resize-y"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="text-xs text-neutral-500">
                  Targeting <strong>{selectedOccasionUserIds.length}</strong> recipient(s) by mobile number
                  {selectedFcmCount > 0 && (
                    <span className="text-emerald-700 font-medium ml-1">
                      ({selectedFcmCount} will receive device push popup)
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || selectedOccasionUserIds.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5C381E] hover:bg-[#482A14] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-colors shadow-xs"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send {occasionType === "BIRTHDAY" ? "Birthday" : "Anniversary"} Notification ({selectedOccasionUserIds.length})
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: STANDARD GENERAL BROADCAST */}
        {activeTab === "STANDARD" && (
          <form onSubmit={handleStandardSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-medium text-neutral-700">Title</span>
                <input
                  value={standardForm.title}
                  onChange={(event) =>
                    setStandardForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Enter broadcast title"
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-[#5C381E] focus:ring-1 focus:ring-[#5C381E]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-neutral-700">Target Audience</span>
                <select
                  value={standardForm.targetType}
                  onChange={(event) =>
                    setStandardForm((prev) => ({ ...prev, targetType: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-[#5C381E] focus:ring-1 focus:ring-[#5C381E]"
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
              <span className="text-xs font-medium text-neutral-700">Message</span>
              <textarea
                value={standardForm.message}
                onChange={(event) =>
                  setStandardForm((prev) => ({ ...prev, message: event.target.value }))
                }
                placeholder="Enter notification message..."
                rows={4}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-[#5C381E] focus:ring-1 focus:ring-[#5C381E] resize-y"
              />
            </label>

            {standardForm.targetType === "CUSTOM" && (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <input
                    value={standardSearch}
                    onChange={(event) => setStandardSearch(event.target.value)}
                    placeholder="Search by phone number or name..."
                    className="w-full text-xs bg-transparent outline-none"
                  />
                </div>

                <div className="text-xs font-medium text-neutral-600">
                  Selected recipients: {selectedStandardRecipients.length}
                </div>

                <div className="max-h-60 overflow-y-auto rounded-lg border border-neutral-200 bg-white divide-y divide-neutral-100">
                  {standardRecipientLoading ? (
                    <div className="p-4 text-xs text-neutral-500 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5C381E]" />
                      Loading recipients...
                    </div>
                  ) : filteredStandardRecipients.length === 0 ? (
                    <div className="p-4 text-xs text-neutral-500">No customers found.</div>
                  ) : (
                    filteredStandardRecipients.map((recipient) => {
                      const key = `${recipient.ownerType}:${recipient.ownerId}`;
                      const checked = selectedStandardKeys.has(key);
                      return (
                        <label
                          key={key}
                          className="flex items-start gap-2.5 px-3 py-2 cursor-pointer hover:bg-neutral-50 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStandardRecipient(recipient)}
                            className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-300 text-[#5C381E] focus:ring-[#5C381E]"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-neutral-900 font-mono">
                              {recipient.phone ? recipient.phone : recipient.label}
                            </div>
                            <div className="text-[11px] text-neutral-500">
                              {recipient.name ? recipient.name : ""}
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

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5C381E] hover:bg-[#482A14] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60 transition-colors shadow-xs"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Broadcast
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Broadcast History</h2>
            <p className="text-xs text-neutral-500">Previously sent broadcasts and recipient counts.</p>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors"
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin text-[#5C381E]" : ""}`} />
          </button>
        </div>

        {historyLoading ? (
          <div className="py-8 text-xs text-neutral-500 flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5C381E]" />
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">No broadcast notifications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200">
                  <th className="py-2.5 pr-4 font-semibold">Title</th>
                  <th className="py-2.5 pr-4 font-semibold">Message</th>
                  <th className="py-2.5 pr-4 font-semibold">Category</th>
                  <th className="py-2.5 pr-4 font-semibold">Recipients</th>
                  <th className="py-2.5 pr-4 font-semibold">Date</th>
                  <th className="py-2.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const isBday = item?.targetType === "BIRTHDAY";
                  const isAnniv = item?.targetType === "ANNIVERSARY";
                  return (
                    <tr key={item?._id} className="border-b border-neutral-100 align-top hover:bg-neutral-50/60">
                      <td className="py-3 pr-4 font-semibold text-neutral-900 max-w-xs">
                        <span className="truncate block">{item?.title || "Notification"}</span>
                      </td>
                      <td className="py-3 pr-4 text-neutral-600 max-w-sm">
                        <p className="line-clamp-2">{item?.message || "-"}</p>
                      </td>
                      <td className="py-3 pr-4 text-neutral-700 whitespace-nowrap">
                        {isBday ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FAF5ED] text-[#5C381E] border border-[#5C381E]/30">
                            Birthday
                          </span>
                        ) : isAnniv ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            Anniversary
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {item?.targetLabel || item?.targetType}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-neutral-800 font-medium whitespace-nowrap">
                        {item?.targetCount || item?.targets?.length || 0}
                      </td>
                      <td className="py-3 pr-4 text-neutral-500 whitespace-nowrap">
                        {toDateLabel(item?.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item?._id)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
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
