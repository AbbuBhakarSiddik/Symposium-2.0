"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { AppUser, Announcement, Resource, SiteSettings, GalleryItem } from "@/lib/db";
import { EventConfig } from "@/lib/eventsConfig";
import SignOutButton from "./SignOutButton";
import Link from "next/link";
import {
  createUserAction,
  deleteUserAction,
  createAnnouncementAction,
  deleteAnnouncementAction,
  createResourceAction,
  deleteResourceAction,
  createEventAction,
  updateEventAction,
  deleteEventAction,
  assignCoordinatorAction,
  reorderEventCoordinatorsAction,
  removeCoordinatorFromEventAction,
  updateSiteSettingsAction,
  updateRunningAnnouncementAction,
  createGalleryItemAction,
  deleteGalleryItemAction,
} from "@/lib/actions";

type AdminDashboardClientProps = {
  counts: Record<string, number>;
  isLive: boolean;
  users: AppUser[];
  announcements: Announcement[];
  resources: Resource[];
  events: EventConfig[];
  settings: SiteSettings;
  galleryItems?: GalleryItem[];
  currentUser: { name: string; username: string; role: string };
};

export default function AdminDashboardClient({
  counts,
  isLive,
  users,
  announcements,
  resources,
  events,
  settings,
  galleryItems = [],
  currentUser,
}: AdminDashboardClientProps) {
  // ── Fixed Light Theme ──
  const isDark = false;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("admin-dashboard-theme");
    } catch {}
  }, []);

  // ── Left Sidebar Navigation State (Home, Add event, coordinator, announcements, gallery) ──
  const [activeNavTab, setActiveNavTab] = useState<string>("home");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleNavTabClick = (tabId: string) => {
    setActiveNavTab(tabId);
    setIsMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navTabs = [
    {
      id: "home",
      label: "Home",
      colorBadge: isDark
        ? "bg-sky-500/15 text-sky-300 border-sky-400/30 group-hover:bg-sky-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-sky-500/25"
        : "bg-sky-100 text-sky-950 border-sky-300 group-hover:bg-sky-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-sky-500/25",
      activeIconBadge: "bg-gradient-to-tr from-sky-500 to-blue-600 text-white border-sky-400 shadow-md shadow-sky-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-sky-500/20 to-blue-500/15 text-sky-300 border border-sky-400/40 shadow-xs shadow-sky-500/20 font-bold"
        : "bg-gradient-to-r from-sky-100 to-blue-50 text-sky-900 border border-sky-300/80 shadow-xs font-bold",
      activeDot: "bg-sky-500 shadow-sm shadow-sky-500/50",
      hoverClass: isDark ? "hover:bg-sky-500/10 hover:text-sky-300" : "hover:bg-sky-50/80 hover:text-sky-900",
      icon: (isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill={isActive ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={isActive ? 0 : 2}
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      id: "add-event",
      label: "Add event",
      colorBadge: isDark
        ? "bg-amber-500/15 text-amber-300 border-amber-400/30 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-amber-500/25"
        : "bg-amber-100 text-amber-950 border-amber-300 group-hover:bg-amber-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-amber-500/25",
      activeIconBadge: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white border-amber-400 shadow-md shadow-amber-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/15 text-amber-300 border border-amber-400/40 shadow-xs shadow-amber-500/20 font-bold"
        : "bg-gradient-to-r from-amber-100 to-orange-50 text-amber-900 border border-amber-300/80 shadow-xs font-bold",
      activeDot: "bg-amber-500 shadow-sm shadow-amber-500/50",
      hoverClass: isDark ? "hover:bg-amber-500/10 hover:text-amber-300" : "hover:bg-amber-50/80 hover:text-amber-900",
      icon: (isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v6m-3-3h6" />
        </svg>
      ),
    },
    {
      id: "coordinator",
      label: "Coordinator",
      colorBadge: isDark
        ? "bg-indigo-500/15 text-indigo-300 border-indigo-400/30 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-500/25"
        : "bg-indigo-100 text-indigo-950 border-indigo-300 group-hover:bg-indigo-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-indigo-500/25",
      activeIconBadge: "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/15 text-indigo-300 border border-indigo-400/40 shadow-xs shadow-indigo-500/20 font-bold"
        : "bg-gradient-to-r from-indigo-100 to-purple-50 text-indigo-900 border border-indigo-300/80 shadow-xs font-bold",
      activeDot: "bg-indigo-500 shadow-sm shadow-indigo-500/50",
      hoverClass: isDark ? "hover:bg-indigo-500/10 hover:text-indigo-300" : "hover:bg-indigo-50/80 hover:text-indigo-900",
      icon: (isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "announcements",
      label: "Announcements",
      colorBadge: isDark
        ? "bg-rose-500/15 text-rose-300 border-rose-400/30 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-rose-500/25"
        : "bg-rose-100 text-rose-950 border-rose-300 group-hover:bg-rose-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-rose-500/25",
      activeIconBadge: "bg-gradient-to-tr from-rose-500 to-pink-600 text-white border-rose-400 shadow-md shadow-rose-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-rose-500/20 to-pink-500/15 text-rose-300 border border-rose-400/40 shadow-xs shadow-rose-500/20 font-bold"
        : "bg-gradient-to-r from-rose-100 to-pink-50 text-rose-900 border border-rose-300/80 shadow-xs font-bold",
      activeDot: "bg-rose-500 shadow-sm shadow-rose-500/50",
      hoverClass: isDark ? "hover:bg-rose-500/10 hover:text-rose-300" : "hover:bg-rose-50/80 hover:text-rose-900",
      icon: (isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      id: "gallery",
      label: "Gallery",
      colorBadge: isDark
        ? "bg-purple-500/15 text-purple-300 border-purple-400/30 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-purple-500/25"
        : "bg-purple-100 text-purple-950 border-purple-300 group-hover:bg-purple-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-purple-500/25",
      activeIconBadge: "bg-gradient-to-tr from-purple-500 to-fuchsia-600 text-white border-purple-400 shadow-md shadow-purple-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-purple-500/20 to-fuchsia-500/15 text-purple-300 border border-purple-400/40 shadow-xs shadow-purple-500/20 font-bold"
        : "bg-gradient-to-r from-purple-100 to-fuchsia-50 text-purple-900 border border-purple-300/80 shadow-xs font-bold",
      activeDot: "bg-purple-500 shadow-sm shadow-purple-500/50",
      hoverClass: isDark ? "hover:bg-purple-500/10 hover:text-purple-300" : "hover:bg-purple-50/80 hover:text-purple-900",
      icon: (isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  // ── Live counts state (auto-polled from /api/sheets every 30s) ──
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>(counts);
  const [liveIsLive, setLiveIsLive] = useState(isLive);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCounts = useCallback(async (forceRefresh = false) => {
    try {
      const url = forceRefresh ? "/api/sheets/refresh" : "/api/sheets";
      const method = forceRefresh ? "POST" : "GET";
      const res = await fetch(url, { method });
      if (!res.ok) return;
      const json = await res.json();
      const newCounts: Record<string, number> = {};
      for (const item of json.data ?? []) {
        newCounts[item.id] = item.registered;
      }
      setLiveCounts(newCounts);
      setLiveIsLive(json.isLive ?? false);
      setLastRefreshed(new Date());
    } catch {
      // silently ignore — show stale data
    }
  }, []);

  // Start polling on mount, clear on unmount
  useEffect(() => {
    pollingRef.current = setInterval(() => fetchCounts(false), 30_000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchCounts]);

  const handleRefreshCounts = useCallback(async () => {
    setIsRefreshing(true);
    await fetchCounts(true);
    setIsRefreshing(false);
  }, [fetchCounts]);

  // Live seats table state: search, sort, filter
  const [eventSearch, setEventSearch] = useState("");
  const [eventSortField, setEventSortField] = useState<
    "name" | "capacity" | "registered" | "available" | "venue" | "date"
  >("name");
  const [eventSortAsc, setEventSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "filling" | "full">("all");

  // User search & filter state
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "coordinator">("all");

  // Announcements & Resources search
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");

  // Announcements tab sub-navigation state (bulletins, ticker, resources, settings)
  const [announcementsSubTab, setAnnouncementsSubTab] = useState<
    "bulletins" | "ticker" | "resources" | "settings"
  >("bulletins");

  // Official Broadcast Announcements state
  const [localAnnouncements, setLocalAnnouncements] = useState<Announcement[]>(announcements);
  const [newAnnouncementMessage, setNewAnnouncementMessage] = useState("");
  const [isBroadcastingAnnouncement, setIsBroadcastingAnnouncement] = useState(false);
  const [announcementBroadcastSuccess, setAnnouncementBroadcastSuccess] = useState(false);
  const [announcementBroadcastError, setAnnouncementBroadcastError] = useState<string | null>(null);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);

  useEffect(() => {
    setLocalAnnouncements(announcements);
  }, [announcements]);

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = newAnnouncementMessage.trim();
    if (!msg) return;

    setIsBroadcastingAnnouncement(true);
    setAnnouncementBroadcastError(null);
    setAnnouncementBroadcastSuccess(false);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to broadcast announcement");
      }

      if (Array.isArray(data.announcements)) {
        setLocalAnnouncements(data.announcements);
      } else {
        const newNotice: Announcement = {
          id: `local-${Date.now()}`,
          message: msg,
          created_at: new Date().toISOString(),
          created_by: currentUser.username || "admin",
        };
        setLocalAnnouncements((prev) => [newNotice, ...prev]);
      }

      setNewAnnouncementMessage("");
      setAnnouncementBroadcastSuccess(true);
      setTimeout(() => setAnnouncementBroadcastSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setAnnouncementBroadcastError(err.message || "Failed to broadcast notice");
    } finally {
      setIsBroadcastingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this broadcasted notice?")) return;
    setDeletingAnnouncementId(id);
    try {
      const res = await fetch(`/api/announcements?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete notice");
      }

      if (Array.isArray(data.announcements)) {
        setLocalAnnouncements(data.announcements);
      } else {
        setLocalAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete notice");
    } finally {
      setDeletingAnnouncementId(null);
    }
  };

  // Running Announcement local state & templates
  const [runningAnnouncementText, setRunningAnnouncementText] = useState(
    settings?.runningAnnouncement ||
    "📢 Registrations are now open for Innovation Ignite Symposium 2.0! Join exciting technical & non-technical events • Cash prizes, certificates & lunch provided • Register now!"
  );
  const [isRunningAnnouncementActive, setIsRunningAnnouncementActive] = useState(
    settings?.runningAnnouncementActive !== "false"
  );
  const [isSavingRunningAnnouncement, setIsSavingRunningAnnouncement] = useState(false);
  const [runningAnnouncementSaveSuccess, setRunningAnnouncementSaveSuccess] = useState(false);

  const handleSaveRunningAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingRunningAnnouncement(true);
    setRunningAnnouncementSaveSuccess(false);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("runningAnnouncement", runningAnnouncementText);
      formData.set("runningAnnouncementActive", isRunningAnnouncementActive ? "true" : "false");
      await updateRunningAnnouncementAction(formData);
      setRunningAnnouncementSaveSuccess(true);
      setTimeout(() => setRunningAnnouncementSaveSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to save running announcement. Please try again.");
    } finally {
      setIsSavingRunningAnnouncement(false);
    }
  };

  // Gallery Management state
  const [localGalleryItems, setLocalGalleryItems] = useState<GalleryItem[]>(galleryItems);
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryTypeFilter, setGalleryTypeFilter] = useState<"all" | "photo" | "video">("all");

  useEffect(() => {
    setLocalGalleryItems(galleryItems);
  }, [galleryItems]);

  // Gallery Upload state (Drag & Drop + Choose File)
  const [galleryUploadMode, setGalleryUploadMode] = useState<"file" | "url">("file");
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryPreviewUrl, setGalleryPreviewUrl] = useState<string | null>(null);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryMediaType, setGalleryMediaType] = useState<"photo" | "video">("photo");
  const [galleryExternalUrl, setGalleryExternalUrl] = useState("");
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadSuccess, setGalleryUploadSuccess] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryFileSelect = (file: File) => {
    setGalleryUploadError(null);
    setGalleryFile(file);

    // Auto-detect type
    const isVid = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg|mkv)$/i.test(file.name);
    const detectedType: "photo" | "video" = isVid ? "video" : "photo";
    setGalleryMediaType(detectedType);

    // Auto-populate title if empty
    if (!galleryTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      setGalleryTitle(formattedTitle);
    }

    // Generate local preview URL
    if (galleryPreviewUrl) {
      URL.revokeObjectURL(galleryPreviewUrl);
    }
    const preview = URL.createObjectURL(file);
    setGalleryPreviewUrl(preview);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleGalleryFileSelect(file);
    }
  };

  const handleClearSelectedFile = () => {
    if (galleryPreviewUrl) {
      URL.revokeObjectURL(galleryPreviewUrl);
    }
    setGalleryFile(null);
    setGalleryPreviewUrl(null);
    if (galleryFileInputRef.current) {
      galleryFileInputRef.current.value = "";
    }
  };

  const handleUploadGalleryMedia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGalleryUploadError(null);
    setGalleryUploadSuccess(false);

    if (galleryUploadMode === "file") {
      if (!galleryFile) {
        setGalleryUploadError("Please choose or drag & drop a photo or video file.");
        return;
      }

      setIsUploadingGallery(true);
      try {
        const formData = new FormData();
        formData.append("file", galleryFile);
        formData.append("title", galleryTitle.trim());
        formData.append("caption", galleryCaption.trim());
        formData.append("type", galleryMediaType);

        const res = await fetch("/api/gallery/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to upload file");
        }

        if (data.item) {
          setLocalGalleryItems((prev) => [data.item, ...prev]);
        }

        setGalleryUploadSuccess(true);
        handleClearSelectedFile();
        setGalleryTitle("");
        setGalleryCaption("");

        setTimeout(() => setGalleryUploadSuccess(false), 5000);
      } catch (err: any) {
        console.error("Gallery upload error:", err);
        setGalleryUploadError(err.message || "Failed to upload media. Please try again.");
      } finally {
        setIsUploadingGallery(false);
      }
    } else {
      // URL Mode
      if (!galleryExternalUrl.trim()) {
        setGalleryUploadError("Please enter a valid media link or YouTube URL.");
        return;
      }

      setIsUploadingGallery(true);
      try {
        const formData = new FormData();
        formData.append("type", galleryMediaType);
        formData.append("url", galleryExternalUrl.trim());
        formData.append("title", galleryTitle.trim() || "Gallery Media");
        formData.append("caption", galleryCaption.trim());

        await createGalleryItemAction(formData);

        setLocalGalleryItems((prev) => [
          {
            id: `g-temp-${Date.now()}`,
            type: galleryMediaType,
            url: galleryExternalUrl.trim(),
            title: galleryTitle.trim() || "Gallery Media",
            caption: galleryCaption.trim(),
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);

        setGalleryUploadSuccess(true);
        setGalleryExternalUrl("");
        setGalleryTitle("");
        setGalleryCaption("");

        setTimeout(() => setGalleryUploadSuccess(false), 5000);
      } catch (err: any) {
        console.error("Gallery create error:", err);
        setGalleryUploadError(err.message || "Failed to save media URL. Please try again.");
      } finally {
        setIsUploadingGallery(false);
      }
    }
  };

  const filteredGalleryItems = useMemo(() => {
    return localGalleryItems.filter((item) => {
      if (galleryTypeFilter !== "all" && item.type !== galleryTypeFilter) return false;
      if (!gallerySearch.trim()) return true;
      const q = gallerySearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.caption && item.caption.toLowerCase().includes(q)) ||
        item.url.toLowerCase().includes(q)
      );
    });
  }, [localGalleryItems, gallerySearch, galleryTypeFilter]);

  // Coordinator Management & Ordering state
  const [localEvents, setLocalEvents] = useState<EventConfig[]>(events);
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  const [selectedOrderEventId, setSelectedOrderEventId] = useState<string>(
    events.find((e) => e.coordinators && e.coordinators.length > 0)?.id || (events[0]?.id ?? "")
  );

  const [orderStatusMessage, setOrderStatusMessage] = useState<string | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Coordinator Profile Photo Upload state (Drag & Drop + Choose File)
  const [coordPhotoFile, setCoordPhotoFile] = useState<File | null>(null);
  const [coordPhotoPreview, setCoordPhotoPreview] = useState<string | null>(null);
  const [coordPhotoUrl, setCoordPhotoUrl] = useState<string>("");
  const [isDraggingCoordPhoto, setIsDraggingCoordPhoto] = useState(false);
  const [isUploadingCoordPhoto, setIsUploadingCoordPhoto] = useState(false);
  const [coordPhotoUploadError, setCoordPhotoUploadError] = useState<string | null>(null);
  const [coordPhotoUploadSuccess, setCoordPhotoUploadSuccess] = useState(false);
  const [coordPhotoManualUrlMode, setCoordPhotoManualUrlMode] = useState(false);
  const coordFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoordPhotoSelect = async (file: File) => {
    setCoordPhotoUploadError(null);
    setCoordPhotoUploadSuccess(false);

    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file.name);
    if (!isImage) {
      setCoordPhotoUploadError("Please choose an image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    setCoordPhotoFile(file);

    if (coordPhotoPreview) {
      URL.revokeObjectURL(coordPhotoPreview);
    }
    const preview = URL.createObjectURL(file);
    setCoordPhotoPreview(preview);

    setIsUploadingCoordPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/coordinators/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setCoordPhotoUrl(data.url);
      setCoordPhotoUploadSuccess(true);
    } catch (err: any) {
      console.error("Coord photo upload error:", err);
      setCoordPhotoUploadError(err.message || "Upload failed, but you can still use the local preview or enter URL.");
    } finally {
      setIsUploadingCoordPhoto(false);
    }
  };

  const handleClearCoordPhoto = () => {
    if (coordPhotoPreview) {
      URL.revokeObjectURL(coordPhotoPreview);
    }
    setCoordPhotoFile(null);
    setCoordPhotoPreview(null);
    setCoordPhotoUrl("");
    setCoordPhotoUploadSuccess(false);
    setCoordPhotoUploadError(null);
    if (coordFileInputRef.current) {
      coordFileInputRef.current.value = "";
    }
  };

  const handleMoveCoordinator = async (eventId: string, index: number, direction: "up" | "down") => {
    const targetEvent = localEvents.find((e) => e.id === eventId);
    if (!targetEvent || !targetEvent.coordinators) return;

    const list = [...targetEvent.coordinators];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setLocalEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, coordinators: list } : e))
    );

    setIsUpdatingOrder(true);
    setOrderStatusMessage("Saving new order…");
    try {
      const fd = new FormData();
      fd.append("eventId", eventId);
      fd.append("coordinatorsJson", JSON.stringify(list));
      await reorderEventCoordinatorsAction(fd);
      setOrderStatusMessage(`✓ Order updated! ${temp.name} is now #${targetIndex + 1} Lead`);
      setTimeout(() => setOrderStatusMessage(null), 3500);
    } catch (err: any) {
      setOrderStatusMessage("❌ Failed to save order: " + err.message);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleSetCoordinatorRank = async (eventId: string, currentIndex: number, newRankIndex: number) => {
    if (currentIndex === newRankIndex) return;
    const targetEvent = localEvents.find((e) => e.id === eventId);
    if (!targetEvent || !targetEvent.coordinators) return;

    const list = [...targetEvent.coordinators];
    const [moved] = list.splice(currentIndex, 1);
    list.splice(newRankIndex, 0, moved);

    setLocalEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, coordinators: list } : e))
    );

    setIsUpdatingOrder(true);
    setOrderStatusMessage("Saving new order…");
    try {
      const fd = new FormData();
      fd.append("eventId", eventId);
      fd.append("coordinatorsJson", JSON.stringify(list));
      await reorderEventCoordinatorsAction(fd);
      setOrderStatusMessage(`✓ ${moved.name} is now #${newRankIndex + 1} Lead!`);
      setTimeout(() => setOrderStatusMessage(null), 3500);
    } catch (err: any) {
      setOrderStatusMessage("❌ Failed to save order: " + err.message);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleRemoveCoordinatorFromEvent = async (eventId: string, coordinatorName: string) => {
    if (!confirm(`Are you sure you want to remove "${coordinatorName}" from this event?`)) {
      return;
    }

    const targetEvent = localEvents.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const updated = (targetEvent.coordinators || []).filter((c) => c.name !== coordinatorName);

    setLocalEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, coordinators: updated } : e))
    );

    setIsUpdatingOrder(true);
    try {
      const fd = new FormData();
      fd.append("eventId", eventId);
      fd.append("coordinatorName", coordinatorName);
      await removeCoordinatorFromEventAction(fd);
      setOrderStatusMessage(`✓ Removed ${coordinatorName} from event.`);
      setTimeout(() => setOrderStatusMessage(null), 3000);
    } catch (err: any) {
      alert("Failed to remove coordinator: " + err.message);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Edit Event Modal state
  const [editingEvent, setEditingEvent] = useState<EventConfig | null>(null);

  // Computed & Filtered Events Table Data (uses live-polled counts)
  const processedEvents = useMemo(() => {
    return events
      .map((e) => {
        const registered = liveCounts[e.id] ?? 0;
        const available = Math.max(e.capacity - registered, 0);
        let status: "available" | "filling" | "full" = "available";
        if (available === 0 || registered >= e.capacity) status = "full";
        else if (available <= e.capacity * 0.2) status = "filling";

        return {
          ...e,
          registered,
          available,
          status,
        };
      })
      .filter((e) => {
        if (statusFilter !== "all" && e.status !== statusFilter) return false;
        if (!eventSearch.trim()) return true;
        const q = eventSearch.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.date.toLowerCase().includes(q) ||
          e.sheetEventLabel.toLowerCase().includes(q) ||
          (e.tagline && e.tagline.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        let valA: any = a[eventSortField];
        let valB: any = b[eventSortField];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return eventSortAsc ? -1 : 1;
        if (valA > valB) return eventSortAsc ? 1 : -1;
        return 0;
      });
  }, [events, liveCounts, eventSearch, statusFilter, eventSortField, eventSortAsc]);

  // Filtered Users
  const processedUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    });
  }, [users, userSearch, roleFilter]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    if (!announcementSearch.trim()) return localAnnouncements;
    const q = announcementSearch.toLowerCase();
    return localAnnouncements.filter(
      (a) => a.message.toLowerCase().includes(q) || a.created_by.toLowerCase().includes(q)
    );
  }, [localAnnouncements, announcementSearch]);

  // Filtered Resources
  const filteredResources = useMemo(() => {
    if (!resourceSearch.trim()) return resources;
    const q = resourceSearch.toLowerCase();
    return resources.filter(
      (r) => r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
    );
  }, [resources, resourceSearch]);

  // Executive KPI summary calculations
  const totalCapacity = useMemo(() => events.reduce((sum, e) => sum + (e.capacity || 0), 0), [events]);
  const totalRegistered = useMemo(
    () => events.reduce((sum, e) => sum + (liveCounts[e.id] ?? 0), 0),
    [events, liveCounts]
  );
  const totalAvailable = Math.max(totalCapacity - totalRegistered, 0);
  const overallOccupancy = totalCapacity > 0 ? Math.min(Math.round((totalRegistered / totalCapacity) * 100), 100) : 0;

  const statusStats = useMemo(() => {
    let openCount = 0;
    let fillingCount = 0;
    let fullCount = 0;
    for (const e of events) {
      const reg = liveCounts[e.id] ?? 0;
      const avail = Math.max(e.capacity - reg, 0);
      if (avail === 0 || reg >= e.capacity) fullCount++;
      else if (avail <= e.capacity * 0.2) fillingCount++;
      else openCount++;
    }
    return { openCount, fillingCount, fullCount };
  }, [events, liveCounts]);

  const adminsCount = useMemo(() => users.filter((u) => u.role === "admin").length, [users]);
  const coordsCount = useMemo(() => users.filter((u) => u.role === "coordinator").length, [users]);

  // Export Events to CSV
  function handleExportEventsCSV() {
    const headers = [
      "ID",
      "Event Name",
      "Tagline",
      "Date",
      "Time",
      "Venue",
      "Capacity",
      "Registered",
      "Available Spots",
      "Google Sheet Label",
    ];
    const rows = processedEvents.map((e) => [
      `"${e.id}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${(e.tagline || "").replace(/"/g, '""')}"`,
      `"${e.date}"`,
      `"${e.time}"`,
      `"${e.venue.replace(/"/g, '""')}"`,
      e.capacity,
      e.registered,
      e.available,
      `"${e.sheetEventLabel.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `symposium_events_registration_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleSort(field: "name" | "capacity" | "registered" | "available" | "venue" | "date") {
    if (eventSortField === field) {
      setEventSortAsc(!eventSortAsc);
    } else {
      setEventSortField(field);
      setEventSortAsc(true);
    }
  }

  // Dynamic Theme Helpers
  const bgMain = isDark ? "bg-[#0d121f] text-slate-100" : "bg-[#f4f7fb] text-slate-900";
  const cardBg = isDark
    ? "border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-xl"
    : "border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-md shadow-slate-200/40";
  const headerText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-slate-400" : "text-slate-500";
  const inputBg = isDark
    ? "border-white/10 bg-white/[0.05] text-white placeholder:text-slate-500 focus:border-sky-400 focus:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white shadow-xs";
  const selectBg = isDark
    ? "border-white/10 bg-slate-900 text-slate-200 focus:border-sky-400"
    : "border-slate-200 bg-white text-slate-800 focus:border-sky-500 shadow-xs";
  const tableHeadBg = isDark
    ? "bg-white/[0.05] text-slate-400 border-white/10"
    : "bg-slate-100/90 text-slate-600 border-slate-200";
  const tableRowHover = isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50/90";
  const tableDivide = isDark ? "divide-white/5" : "divide-slate-100";
  const searchBoxBg = isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-100/60";
  const borderCol = isDark ? "border-white/10" : "border-slate-200/80";

  const activeNavTabClass = isDark
    ? "bg-sky-500/15 text-sky-400 font-semibold border border-sky-400/30 shadow-xs"
    : "bg-[#e8f0fe] text-[#1a73e8] font-semibold";

  const inactiveNavTabClass = isDark
    ? "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] font-medium"
    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 font-medium";

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Brand / Logo Header - Structured & Clean */}
      <div className={`p-4 border-b ${isDark ? "border-white/10" : "border-slate-200/80"} shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white font-display font-black text-lg shadow-md shadow-blue-500/25 shrink-0 ring-2 ring-blue-500/20">
              S
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className={`font-display font-black text-sm tracking-tight truncate ${headerText} leading-none`}>
                  Admin Panel
                </h2>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border shrink-0 ${isDark
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-emerald-100 text-emerald-950 border-emerald-300"
                  }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p
                className={`text-[11px] font-mono font-medium truncate ${subText} pt-1`}
                title={settings.symposiumName}
              >
                {settings.symposiumName}
              </p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className={`p-1.5 rounded-lg border ${isDark
                  ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                  : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items: Home, Add event, Coordinator, Announcements, Gallery */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${subText}`}>
          Navigation
        </div>

        {navTabs.map((tab) => {
          const isActive = activeNavTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleNavTabClick(tab.id)}
              className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${isActive
                  ? tab.activePill
                  : `${isDark ? "text-slate-300" : "text-slate-700"} ${tab.hoverClass}`
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200 shrink-0 ${isActive
                      ? `${tab.activeIconBadge} scale-105`
                      : `${tab.colorBadge} opacity-90 group-hover:opacity-100 group-hover:scale-105`
                    }`}
                >
                  {tab.icon(isActive)}
                </div>
                <span className="tracking-tight truncate">{tab.label}</span>
              </div>
              {isActive && (
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tab.activeDot}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${tab.activeDot}`} />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info card & quick actions at bottom of sidebar */}
      <div className={`p-4 border-t ${isDark ? "border-white/10" : "border-slate-100"} space-y-3 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-semibold truncate ${headerText}`}>{currentUser.name}</p>
            <p className={`text-[10px] font-mono truncate ${subText}`}>@{currentUser.username}</p>
          </div>
          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${isDark
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              : "bg-emerald-100 text-emerald-950 border-emerald-300"
            }`}>
            Admin
          </span>
        </div>

        <div className="pt-1">
          <SignOutButton />
        </div>
      </div>
    </div>
  );

  return (
    <main className={`min-h-screen ${bgMain} relative overflow-x-hidden font-body transition-colors duration-300 selection:bg-sky-500/30 selection:text-sky-200`}>
      {/* Subtle Background Glows (adapts to theme) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className={`absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full blur-[140px] transition-opacity duration-500 ${isDark ? "bg-sky-500/10 opacity-70" : "bg-sky-400/15 opacity-50"
            }`}
        />
        <div
          className={`absolute top-[35%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[140px] transition-opacity duration-500 ${isDark ? "bg-indigo-500/10 opacity-60" : "bg-indigo-400/15 opacity-40"
            }`}
        />
        <div
          className={`absolute bottom-[-10%] left-[25%] w-[600px] h-[600px] rounded-full blur-[150px] transition-opacity duration-500 ${isDark ? "bg-purple-500/10 opacity-50" : "bg-purple-300/15 opacity-40"
            }`}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? "#ffffff" : "#0f172a"} 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Mobile Top Bar Navigation */}
      <div
        className={`lg:hidden sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between backdrop-blur-xl ${isDark
            ? "bg-[#0b101b]/90 border-white/10 text-white"
            : "bg-white/95 border-slate-200 text-slate-900"
          }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className={`p-2 rounded-xl border ${isDark
                ? "border-white/10 text-slate-300 hover:bg-white/5"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            aria-label="Open navigation sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="font-display font-bold text-sm tracking-tight">Admin Dashboard</span>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Off-Canvas Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside
            className={`fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] border-r ${isDark ? "bg-[#0b101b] border-white/10" : "bg-white border-slate-200"
              } z-50 flex flex-col shadow-2xl transition-transform`}
          >
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Admin Layout (Left Static Fixed Sidebar + Right Dashboard Content) */}
      <div className="relative z-10 min-h-screen">
        {/* Desktop Static Fixed Left Sidebar (Immune to page scroll) */}
        <aside
          className={`w-64 border-r transition-colors duration-300 ${isDark
              ? "bg-[#0b101b]/95 border-white/10"
              : "bg-white/95 border-slate-200/80 shadow-xs"
            } backdrop-blur-xl hidden lg:flex lg:flex-col fixed top-0 bottom-0 left-0 h-screen z-30`}
        >
          {renderSidebarContent(false)}
        </aside>

        {/* Right Dashboard Content with left margin for fixed sidebar */}
        <div className="flex-1 min-w-0 lg:ml-64 px-4 py-8 sm:px-6 lg:px-8 space-y-8 max-w-7xl">
          {/* ========================================================================= */}
          {/* TAB 1: HOME (Master Admin Panel to Event Seats & Live Registration)       */}
          {/* ========================================================================= */}
          {activeNavTab === "home" && (
            <>
              {/* ========================================================================= */}
              {/* TOP EXECUTIVE COMMAND HEADER WITH THEME TOGGLE                            */}
              {/* ========================================================================= */}
              <header id="section-home" className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 transition-all`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border shadow-xs ${isDark
                          ? "bg-sky-500/15 text-sky-300 border-sky-400/30"
                          : "bg-sky-100 text-sky-950 border-sky-300"
                        }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping" />
                        ADMIN CONTROL CENTER
                      </span>
                      <span className={`${subText} text-xs`}>•</span>
                      <span className={`font-mono text-xs font-medium ${subText} tracking-wide`}>
                        {settings.symposiumName}
                      </span>
                    </div>

                    <h1 className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${headerText} flex items-center gap-3`}>
                      Master Admin Panel
                    </h1>

                    <div className={`flex items-center gap-2 font-mono text-xs ${subText} pt-0.5`}>
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      <span>
                        Logged in as <strong className={`${isDark ? "text-slate-200" : "text-slate-800"} font-semibold`}>{currentUser.name}</strong>
                      </span>
                      <span className={`rounded-md ${isDark ? "bg-white/10 text-sky-300" : "bg-sky-50 text-sky-700 border-sky-200"} px-2 py-0.5 text-[11px] font-medium border border-white/5`}>
                        @{currentUser.username}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions: Portal & Sign Out */}
                  <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                    <Link
                      href="/coordinators"
                      className={`group inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-mono text-xs font-semibold shadow-sm transition-all duration-200 ${isDark
                          ? "border-white/10 bg-white/[0.06] text-slate-200 hover:border-sky-400/50 hover:bg-sky-500/15 hover:text-white hover:shadow-glow-cyan"
                          : "border-slate-200 bg-white text-slate-700 hover:border-sky-500 hover:text-sky-600 hover:shadow-md"
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-sky-500 transition-transform group-hover:scale-110"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Coordinator Portal
                    </Link>

                    <SignOutButton />
                  </div>
                </div>
              </header>

              {/* ========================================================================= */}
              {/* EXECUTIVE KPI SUMMARY CARDS                                               */}
              {/* ========================================================================= */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Card 1: Total Live Registrations */}
                <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-5 transition hover:scale-[1.01]`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${subText}`}>
                      Registrations
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-display text-3xl font-extrabold ${headerText} tracking-tight`}>
                        {totalRegistered}
                      </span>
                      <span className={`font-mono text-xs ${subText}`}>
                        / {totalCapacity} spots
                      </span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
                          style={{ width: `${overallOccupancy}%` }}
                        />
                      </div>
                      <div className={`flex justify-between text-[10px] font-mono ${subText}`}>
                        <span>Occupancy</span>
                        <span className="font-bold text-sky-500">{overallOccupancy}% Filled</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Active Events & Status */}
                <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-5 transition hover:scale-[1.01]`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${subText}`}>
                      Active Events
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-display text-3xl font-extrabold ${headerText} tracking-tight`}>
                        {events.length}
                      </span>
                      <span className={`font-mono text-xs ${subText}`}>Configured</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px]">
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-bold ${isDark
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                          : "bg-emerald-100 border-emerald-300 text-emerald-950"
                        }`}>
                        ● {statusStats.openCount} Open
                      </span>
                      {statusStats.fillingCount > 0 && (
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-bold ${isDark
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                            : "bg-amber-100 border-amber-300 text-amber-950"
                          }`}>
                          ● {statusStats.fillingCount}
                        </span>
                      )}
                      {statusStats.fullCount > 0 && (
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-bold ${isDark
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                            : "bg-rose-100 border-rose-300 text-rose-950"
                          }`}>
                          ● {statusStats.fullCount} Full
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 3: Committee Accounts */}
                <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-5 transition hover:scale-[1.01]`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${subText}`}>
                      Committee Team
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-display text-3xl font-extrabold ${headerText} tracking-tight`}>
                        {users.length}
                      </span>
                      <span className={`font-mono text-xs ${subText}`}>Accounts</span>
                    </div>
                    <div className={`mt-3 flex items-center gap-2 font-mono text-[11px] ${subText}`}>
                      <span className={isDark ? "text-indigo-400 font-semibold" : "text-indigo-900 font-bold"}>{adminsCount} Admins</span>
                      <span>•</span>
                      <span className={isDark ? "text-sky-400 font-semibold" : "text-sky-900 font-bold"}>{coordsCount} Coordinators</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Google Sheets Live Sync Status */}
                <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-5 transition hover:scale-[1.01]`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${subText}`}>
                      Google Sheets Sync
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border ${liveIsLive
                          ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-500"
                          : "bg-amber-500/15 border-amber-400/30 text-amber-500"
                        }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${liveIsLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                          }`}
                      />
                      <span className={`font-display text-lg font-bold ${headerText} tracking-tight`}>
                        {liveIsLive ? "Live Connected" : "Preview Mode"}
                      </span>
                    </div>
                    <p className={`mt-2 font-mono text-[11px] ${subText} flex items-center justify-between`}>
                      <span suppressHydrationWarning>Updated: {mounted ? lastRefreshed.toLocaleTimeString() : "--:--"}</span>
                      <button
                        onClick={handleRefreshCounts}
                        disabled={isRefreshing}
                        className="text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 font-bold hover:underline"
                      >
                        {isRefreshing ? "Syncing…" : "Sync Now"}
                      </button>
                    </p>
                  </div>
                </div>

              </section>

              {/* ========================================================================= */}
              {/* SECTION: VISUAL ANALYTICS & CHARTS (GRAPHICAL FAST COMPREHENSION)         */}
              {/* ========================================================================= */}
              <section
                id="section-analytics"
                className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-6`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <h2 className={`font-display text-xl sm:text-2xl font-bold ${headerText} tracking-tight`}>
                        Visual Registration &amp; Capacity Analytics
                      </h2>
                    </div>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Instant graphical representation of event capacity fill-rate and seat allocation.
                    </p>
                  </div>

                  {/* Overall Stat Chips */}
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className={`px-3 py-1.5 rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                      Available: <strong className="text-emerald-500">{totalAvailable}</strong>
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                      Booked: <strong className="text-sky-500">{totalRegistered}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Donut Gauge Chart (Left 4 cols) */}
                  <div className={`lg:col-span-4 rounded-2xl border ${isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50/80"} p-5 flex flex-col items-center justify-center text-center`}>
                    <p className={`font-mono text-xs uppercase tracking-wider font-bold ${subText} mb-3`}>
                      Overall Seat Occupancy
                    </p>

                    {/* SVG Radial Gauge */}
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Track Circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          strokeWidth="10"
                          fill="transparent"
                          className={isDark ? "stroke-white/10" : "stroke-slate-200"}
                        />
                        {/* Progress Arc */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          strokeWidth="10"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * overallOccupancy) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                          className="stroke-sky-500 transition-all duration-1000 ease-out"
                        />
                      </svg>
                      {/* Center Value */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`font-display text-3xl font-extrabold ${headerText}`}>
                          {overallOccupancy}%
                        </span>
                        <span className={`font-mono text-[10px] uppercase tracking-wider ${subText}`}>
                          Capacity Filled
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 w-full font-mono text-[11px] pt-3 border-t border-slate-200/50 dark:border-white/10">
                      <div>
                        <span className="block text-emerald-500 font-bold">{statusStats.openCount}</span>
                        <span className={subText}>Open</span>
                      </div>
                      <div>
                        <span className="block text-amber-500 font-bold">{statusStats.fillingCount}</span>
                        <span className={subText}>Filling</span>
                      </div>
                      <div>
                        <span className="block text-rose-500 font-bold">{statusStats.fullCount}</span>
                        <span className={subText}>Full</span>
                      </div>
                    </div>
                  </div>

                  {/* Event-by-Event Interactive Fill Bar Chart (Right 8 cols) */}
                  <div className={`lg:col-span-8 rounded-2xl border ${isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50/80"} p-5 space-y-3.5`}>
                    <div className="flex justify-between items-center font-mono text-xs pb-1 border-b border-slate-200/50 dark:border-white/10">
                      <span className={`uppercase font-bold tracking-wider ${subText}`}>
                        Event Capacity Fill Breakdown ({events.length})
                      </span>
                      <span className={`text-[11px] ${subText}`}>Registered vs Total Seats</span>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {events.map((e) => {
                        const reg = liveCounts[e.id] ?? 0;
                        const cap = e.capacity || 1;
                        const pct = Math.min(Math.round((reg / cap) * 100), 100);
                        const isFull = reg >= cap;
                        const isFilling = !isFull && cap - reg <= cap * 0.2;

                        return (
                          <div key={e.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className={`font-bold ${headerText} truncate max-w-[200px] sm:max-w-xs`}>
                                {e.name}
                                <span className={`ml-2 text-[10px] font-normal ${subText}`}>
                                  ({e.venue})
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${isFull ? "text-rose-500" : isFilling ? "text-amber-500" : "text-sky-500"}`}>
                                  {reg} / {cap}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isFull
                                    ? "bg-rose-500/15 text-rose-500"
                                    : isFilling
                                      ? "bg-amber-500/15 text-amber-500"
                                      : "bg-sky-500/15 text-sky-500"
                                  }`}>
                                  {pct}%
                                </span>
                              </div>
                            </div>

                            {/* Bar Track */}
                            <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200/80"}`}>
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${isFull
                                    ? "bg-gradient-to-r from-rose-500 to-red-600 shadow-xs shadow-rose-500/50"
                                    : isFilling
                                      ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-xs shadow-amber-400/50"
                                      : "bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-500 shadow-xs shadow-sky-400/50"
                                  }`}
                                style={{ width: `${Math.max(pct, 3)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {events.length === 0 && (
                        <p className={`font-mono text-xs ${subText} py-6 text-center`}>No events configured yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* ========================================================================= */}
              {/* SECTION 1: LIVE EVENT SEATS & REGISTRATION STATUS TABLE                   */}
              {/* ========================================================================= */}
              <section
                id="section-seats"
                className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-6`}
              >
                {/* Google Sheets Setup Banner (shown when not connected) */}
                {!liveIsLive && (
                  <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 font-mono text-xs backdrop-blur-md">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
                      <div className="space-y-2 flex-1">
                        <p className={`font-bold uppercase tracking-wider text-[11px] ${isDark ? "text-amber-300" : "text-amber-950"}`}>
                          Google Sheets Not Connected — Showing Preview / Mock Data
                        </p>
                        <p className={`text-[11px] leading-relaxed ${isDark ? "text-amber-200/90" : "text-amber-900"}`}>
                          Your Google Sheet is configured in backend settings, but the sheet cannot be read yet.
                        </p>
                        <div className={`rounded-xl p-3.5 text-[11px] leading-relaxed border border-amber-500/20 space-y-2 ${isDark ? "bg-black/40 text-amber-200" : "bg-white text-amber-950"}`}>
                          <p className="font-bold text-amber-400 uppercase tracking-wide">
                            👉 Step 1: Open Google Sheet Sharing Permissions
                          </p>
                          <p>
                            Open your sheet:{" "}
                            <a
                              href={settings.googleSheetUrl || "https://docs.google.com/spreadsheets/d/1YynwBobcAJvQ1tN0YF92TA-6uhp_kukPOEAc3diatis/edit?usp=sharing"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-400 underline font-semibold hover:text-sky-300"
                            >
                              Open Google Sheet ↗
                            </a>
                          </p>
                          <p>
                            Click the blue <strong>Share</strong> button (top right) → under <strong>General access</strong>, change from <strong>Restricted</strong> to <strong>&ldquo;Anyone with the link&rdquo;</strong> → make sure role is set to <strong>Viewer</strong> → click <strong>Done</strong>.
                          </p>
                          <p className="font-bold text-amber-400 uppercase tracking-wide pt-1">
                            👉 Step 2: Instant Sync
                          </p>
                          <p>
                            Once shared, click <strong>Refresh Sheet Data</strong> on this page to fetch real-time registrations immediately without needing private RSA keys!
                          </p>
                        </div>
                        <p className={`text-[11px] ${isDark ? "text-amber-300/80" : "text-amber-900"}`}>
                          The <strong>Sheet Label</strong> on each event must match the event dropdown value in your Google Form responses.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section Heading & Refresh / Export Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className={`font-display text-xl sm:text-2xl font-bold ${headerText} tracking-tight`}>
                        Event Seats &amp; Live Registration Status
                      </h2>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${liveIsLive ? "bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/60" : "bg-amber-500"
                          }`}
                      />
                      <span className={`font-mono text-xs font-semibold ${subText}`}>
                        {liveIsLive ? "Connected to Google Sheet" : "Preview Mode (Sheet Not Connected)"}
                      </span>
                    </div>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Auto-refreshes every 30s · Last updated:{" "}
                      <span suppressHydrationWarning className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {mounted ? lastRefreshed.toLocaleTimeString() : "--:--"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleRefreshCounts}
                      disabled={isRefreshing}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${isRefreshing
                          ? isDark
                            ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
                            : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                          : isDark
                            ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400"
                            : "bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100 hover:border-emerald-400"
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {isRefreshing ? "Refreshing…" : "↻ Refresh Counts"}
                    </button>

                    <button
                      onClick={handleExportEventsCSV}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${isDark
                          ? "bg-sky-500/15 border-sky-400/40 text-sky-300 hover:bg-sky-500/25 hover:border-sky-400"
                          : "bg-sky-50 border-sky-300 text-sky-950 hover:bg-sky-100 hover:border-sky-400"
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Search Bar & Filter Controls */}
                <div className={`grid gap-3 sm:grid-cols-12 rounded-2xl border ${searchBoxBg} p-4`}>
                  <div className="sm:col-span-8 relative">
                    <span className={`absolute left-3.5 top-3 ${subText} font-mono text-xs`}>🔍</span>
                    <input
                      type="text"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      placeholder="Search events by name, venue, date, or sheet label…"
                      className={`w-full rounded-xl border pl-9 pr-8 py-2.5 font-mono text-xs outline-none transition ${inputBg}`}
                    />
                    {eventSearch && (
                      <button
                        onClick={() => setEventSearch("")}
                        className={`absolute right-3 top-2.5 font-mono text-xs ${subText} hover:${headerText}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="sm:col-span-4">
                    <select
                      value={statusFilter}
                      onChange={(e: any) => setStatusFilter(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 font-mono text-xs outline-none transition ${selectBg}`}
                    >
                      <option value="all">All Availability Statuses</option>
                      <option value="available">Open / Available Spots</option>
                      <option value="filling">Filling Fast (≤20% left)</option>
                      <option value="full">Full / Sold Out</option>
                    </select>
                  </div>
                </div>

                {/* Event Seats Table */}
                <div className={`overflow-x-auto rounded-2xl border ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white"} shadow-xs`}>
                  <table className="w-full text-left font-mono text-xs">
                    <thead className={`${tableHeadBg} text-[11px] uppercase tracking-wider border-b font-bold`}>
                      <tr>
                        <th
                          className="px-4 py-3.5 cursor-pointer hover:text-sky-500 transition select-none"
                          onClick={() => handleSort("name")}
                        >
                          Event Name {eventSortField === "name" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3.5 cursor-pointer hover:text-sky-500 transition select-none"
                          onClick={() => handleSort("venue")}
                        >
                          Venue {eventSortField === "venue" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3.5 cursor-pointer hover:text-sky-500 transition select-none"
                          onClick={() => handleSort("capacity")}
                        >
                          Capacity {eventSortField === "capacity" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3.5 cursor-pointer hover:text-sky-500 transition select-none"
                          onClick={() => handleSort("registered")}
                        >
                          Registered {eventSortField === "registered" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3.5 cursor-pointer hover:text-sky-500 transition select-none"
                          onClick={() => handleSort("available")}
                        >
                          Available {eventSortField === "available" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableDivide}`}>
                      {processedEvents.map((e) => {
                        const fillPercent = e.capacity > 0 ? Math.min(Math.round((e.registered / e.capacity) * 100), 100) : 0;
                        return (
                          <tr key={e.id} className={`transition-colors ${tableRowHover}`}>
                            <td className={`px-4 py-4 font-bold ${headerText}`}>
                              <span className="text-sm tracking-tight">{e.name}</span>
                              <div className={`text-[10px] ${subText} font-normal mt-1 flex items-center gap-1.5`}>
                                <span>Sheet Label:</span>
                                <code className={`font-semibold px-1.5 py-0.5 rounded border ${isDark
                                    ? "text-sky-300 bg-sky-500/15 border-sky-400/30"
                                    : "text-sky-950 bg-sky-100 border-sky-300"
                                  }`}>
                                  {e.sheetEventLabel}
                                </code>
                              </div>
                            </td>
                            <td className={`px-4 py-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{e.venue}</td>
                            <td className={`px-4 py-4 ${isDark ? "text-slate-300" : "text-slate-700"} font-medium`}>{e.capacity}</td>
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <span className="font-bold text-sky-500 text-sm">{e.registered}</span>
                                <div className={`w-16 h-1 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                                  <div
                                    className={`h-full rounded-full ${fillPercent >= 100
                                        ? "bg-rose-500"
                                        : fillPercent >= 80
                                          ? "bg-amber-500"
                                          : "bg-sky-500"
                                      }`}
                                    style={{ width: `${fillPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className={`px-4 py-4 font-bold text-sm ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>{e.available}</td>
                            <td className="px-4 py-4 text-right space-x-3 whitespace-nowrap">
                              <button
                                onClick={() => setEditingEvent(e)}
                                className={`${isDark ? "text-sky-400 hover:text-sky-300" : "text-sky-800 hover:text-sky-950"} hover:underline font-bold text-[11px] transition`}
                              >
                                Edit
                              </button>
                              <form action={deleteEventAction} className="inline">
                                <input type="hidden" name="id" value={e.id} />
                                <button
                                  type="submit"
                                  onClick={(evt) => {
                                    if (!confirm(`Are you sure you want to delete event "${e.name}"?`)) {
                                      evt.preventDefault();
                                    }
                                  }}
                                  className={`${isDark ? "text-rose-400 hover:text-rose-300" : "text-rose-800 hover:text-rose-950"} hover:underline font-bold text-[11px] transition`}
                                >
                                  Delete
                                </button>
                              </form>
                            </td>
                          </tr>
                        );
                      })}

                      {processedEvents.length === 0 && (
                        <tr>
                          <td colSpan={8} className={`px-4 py-12 text-center ${subText} font-medium`}>
                            No matching events found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ADD EVENT                                                          */}
          {/* ========================================================================= */}
          {activeNavTab === "add-event" && (
            <section id="section-events" className="max-w-3xl">
              {/* Add New Event Form */}
              <div className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-5`}>
                <div>
                  <h3 className={`font-display text-xl font-bold ${headerText} flex items-center gap-2.5`}>
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/60" />
                    Add New Event
                  </h3>
                  <p className={`font-mono text-xs ${subText} mt-1`}>
                    Set up new event, date, venue, and Google Form response dropdown label.
                  </p>
                </div>

                <form action={createEventAction} className="space-y-4 font-mono text-xs">
                  <div>
                    <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                      Event Name *
                    </label>
                    <input
                      name="name"
                      required
                      placeholder="e.g. AI Hackathon 2026"
                      className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                        Event Date *
                      </label>
                      <input
                        name="date"
                        required
                        placeholder="e.g. 15 Oct 2026"
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                        Start Time *
                      </label>
                      <input
                        name="time"
                        required
                        placeholder="e.g. 09:30 AM"
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                        Venue *
                      </label>
                      <input
                        name="venue"
                        required
                        placeholder="e.g. Auditorium B"
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                        Capacity (Seats) *
                      </label>
                      <input
                        name="capacity"
                        type="number"
                        defaultValue={60}
                        required
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                      Google Form / Sheet Label *
                    </label>
                    <input
                      name="sheetEventLabel"
                      required
                      placeholder="e.g. Hackathon (Must match Google Form dropdown)"
                      className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                      Tagline
                    </label>
                    <input
                      name="tagline"
                      placeholder="e.g. Build. Code. Win."
                      className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      placeholder="Event guidelines and details…"
                      className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 hover:from-sky-400 hover:via-indigo-400 hover:to-sky-400 shadow-md shadow-sky-500/25 transition-all active:scale-[0.99]"
                  >
                    Create Event
                  </button>
                </form>
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: COORDINATORS (Assign Coordinator + Admins & Coordinators Management)*/}
          {/* ========================================================================= */}
          {activeNavTab === "coordinator" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* 1. Assign Coordinator to Event */}
                <div className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-5`}>
                  <div>
                    <h3 className={`font-display text-xl font-bold ${headerText} flex items-center gap-2.5`}>
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/60" />
                      Assign Coordinator to Event
                    </h3>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Select an event, choose committee member, upload profile photo, and set priority.
                    </p>
                  </div>

                  <form
                    action={assignCoordinatorAction}
                    onSubmit={() => {
                      // Reset photo states after a small delay
                      setTimeout(() => {
                        handleClearCoordPhoto();
                      }, 1000);
                    }}
                    className="space-y-4 font-mono text-xs"
                  >
                    <div>
                      <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                        Select Event *
                      </label>
                      <select
                        name="eventId"
                        required
                        value={selectedOrderEventId}
                        onChange={(e) => setSelectedOrderEventId(e.target.value)}
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${selectBg}`}
                      >
                        <option value="">-- Choose an Event --</option>
                        {localEvents.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name} ({(e.coordinators || []).length} assigned)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                        Select Coordinator *
                      </label>
                      <select
                        name="name"
                        required
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${selectBg}`}
                      >
                        <option value="">-- Choose Coordinator / Admin --</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name} ({u.role}) — {u.phone || u.username}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                          Role Title
                        </label>
                        <input
                          name="role"
                          defaultValue="Event Lead"
                          className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                        />
                      </div>
                      <div>
                        <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                          Display Position / Priority
                        </label>
                        <select
                          name="position"
                          defaultValue="end"
                          className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${selectBg}`}
                        >
                          <option value="end">Add at end (Default order)</option>
                          <option value="start">1st Lead (At the top / Primary)</option>
                          <option value="1">2nd Lead (Second position)</option>
                          <option value="2">3rd Lead (Third position)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                          Contact Phone
                        </label>
                        <input
                          name="phone"
                          placeholder="+91 90000 00000"
                          className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                        />
                      </div>
                      <div>
                        <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                          Email
                        </label>
                        <input
                          name="email"
                          placeholder="coord@symposium.com"
                          className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                        />
                      </div>
                    </div>

                    {/* Coordinator Profile Photo (Choose File or Drag & Drop) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} uppercase tracking-wider text-[10px] font-bold`}>
                          Coordinator Profile Photo (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={() => setCoordPhotoManualUrlMode(!coordPhotoManualUrlMode)}
                          className="text-[10px] font-mono text-indigo-500 hover:text-indigo-400 hover:underline"
                        >
                          {coordPhotoManualUrlMode ? "📁 Switch to File Upload / Drag & Drop" : "🔗 Or enter direct URL link"}
                        </button>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={coordFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleCoordPhotoSelect(e.target.files[0]);
                          }
                        }}
                      />

                      {/* MODE 1: FILE DRAG & DROP / CHOOSER */}
                      {!coordPhotoManualUrlMode ? (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDraggingCoordPhoto(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDraggingCoordPhoto(false);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDraggingCoordPhoto(false);
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              handleCoordPhotoSelect(e.dataTransfer.files[0]);
                            }
                          }}
                          onClick={() => {
                            if (!coordPhotoPreview && !coordPhotoUrl && coordFileInputRef.current) {
                              coordFileInputRef.current.click();
                            }
                          }}
                          className={`relative rounded-2xl border-2 border-dashed p-4 transition-all text-center cursor-pointer ${isDraggingCoordPhoto
                              ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
                              : isDark
                                ? "border-white/15 bg-white/[0.02] hover:border-indigo-400/50 hover:bg-white/[0.04]"
                                : "border-slate-300 bg-slate-50/80 hover:border-indigo-400 hover:bg-indigo-50/30"
                            }`}
                        >
                          {coordPhotoPreview || coordPhotoUrl ? (
                            <div className="flex items-center gap-4 text-left">
                              {/* Thumbnail */}
                              <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md bg-slate-900 flex items-center justify-center">
                                <img
                                  src={coordPhotoPreview || coordPhotoUrl}
                                  alt="Profile Preview"
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`font-bold text-xs ${headerText} truncate`}>
                                  {coordPhotoFile?.name || "Profile Photo Uploaded"}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {coordPhotoFile ? `${(coordPhotoFile.size / 1024).toFixed(1)} KB` : "Image link attached"}
                                </p>
                                {isUploadingCoordPhoto ? (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 mt-1.5">
                                    <span className="animate-spin">🌀</span> Uploading photo…
                                  </span>
                                ) : coordPhotoUploadSuccess || coordPhotoUrl ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
                                    <span>✓</span> Photo ready &amp; saved!
                                  </span>
                                ) : null}
                              </div>

                              <div className="flex flex-col gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => coordFileInputRef.current?.click()}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition"
                                >
                                  Change
                                </button>
                                <button
                                  type="button"
                                  onClick={handleClearCoordPhoto}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="py-3 flex flex-col items-center justify-center gap-2">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 text-xl">
                                📸
                              </div>
                              <div>
                                <p className={`font-bold text-xs ${headerText}`}>
                                  Choose a photo, or drag &amp; drop it here
                                </p>
                                <p className={`text-[10px] ${subText} mt-0.5`}>
                                  Supports PNG, JPG, WEBP, GIF (up to 10MB)
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  coordFileInputRef.current?.click();
                                }}
                                className="mt-1 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition"
                              >
                                Browse Photo
                              </button>
                            </div>
                          )}

                          {coordPhotoUploadError && (
                            <p className="mt-2 text-[10px] font-semibold text-rose-500">
                              ⚠️ {coordPhotoUploadError}
                            </p>
                          )}
                        </div>
                      ) : (
                        /* MODE 2: DIRECT URL */
                        <input
                          name="imageUrlManual"
                          value={coordPhotoUrl}
                          onChange={(e) => setCoordPhotoUrl(e.target.value)}
                          placeholder="https://... (Direct image link or photo URL)"
                          className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                        />
                      )}

                      {/* Hidden field that is submitted with the form */}
                      <input type="hidden" name="image" value={coordPhotoUrl} />
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingCoordPhoto}
                      className="w-full rounded-xl py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 hover:from-indigo-400 hover:via-purple-400 hover:to-indigo-400 shadow-md shadow-indigo-500/25 transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                      {isUploadingCoordPhoto ? "Uploading Photo..." : "Assign Coordinator"}
                    </button>
                  </form>
                </div>

                {/* 2. Customize Coordinators Display Order (1st, 2nd, 3rd...) */}
                <div className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-5`}>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-display text-xl font-bold ${headerText} flex items-center gap-2.5`}>
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/60" />
                        Coordinators Display Order
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        1st, 2nd, 3rd Leads
                      </span>
                    </div>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Orderwise customization: control which person shows 1st, 2nd, or 3rd on the website.
                    </p>
                  </div>

                  {/* Select Event for Ordering */}
                  <div>
                    <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                      Select Event to Order Coordinators:
                    </label>
                    <select
                      value={selectedOrderEventId}
                      onChange={(e) => setSelectedOrderEventId(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 font-mono text-xs outline-none transition ${selectBg}`}
                    >
                      {localEvents.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({(e.coordinators || []).length} assigned)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order Status Feedback */}
                  {orderStatusMessage && (
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold flex items-center gap-2 transition-all">
                      <span>⚡</span>
                      <span>{orderStatusMessage}</span>
                    </div>
                  )}

                  {/* Coordinators List for Selected Event */}
                  {(() => {
                    const currentEvent = localEvents.find((e) => e.id === selectedOrderEventId) || localEvents[0];
                    const coords = currentEvent?.coordinators || [];

                    if (coords.length === 0) {
                      return (
                        <div className={`p-6 text-center rounded-2xl border border-dashed ${isDark ? "border-white/10" : "border-slate-200"} space-y-2`}>
                          <p className="text-2xl">👥</p>
                          <p className={`font-mono text-xs font-bold ${headerText}`}>
                            No Coordinators Assigned to {currentEvent?.name || "this event"}
                          </p>
                          <p className={`font-mono text-[11px] ${subText}`}>
                            Use the form on the left to assign coordinators to this event.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold px-1">
                          <span>{coords.length} Assigned Leads (Ranked Order)</span>
                          <span className="text-[10px]">Top (#1) displays first on front page</span>
                        </div>

                        <div className="space-y-2.5 max-h-[460px] overflow-y-auto overscroll-contain pr-1">
                          {coords.map((c, idx) => (
                            <div
                              key={`${c.name}-${idx}`}
                              className={`relative flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${idx === 0
                                  ? isDark
                                    ? "bg-indigo-950/20 border-indigo-500/40 shadow-xs"
                                    : "bg-indigo-50/60 border-indigo-200 shadow-xs"
                                  : isDark
                                    ? "bg-white/[0.02] border-white/10 hover:border-white/20"
                                    : "bg-white border-slate-200 hover:border-slate-300"
                                }`}
                            >
                              {/* Left: Rank Badge + Avatar + Info */}
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Position Rank Badge */}
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${idx === 0
                                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-xs"
                                      : idx === 1
                                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs"
                                        : isDark
                                          ? "bg-white/10 text-slate-300"
                                          : "bg-slate-100 text-slate-700 border border-slate-200"
                                    }`}
                                  title={`Position #${idx + 1}`}
                                >
                                  #{idx + 1}
                                </div>

                                {/* Avatar */}
                                <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-slate-300 dark:border-white/15 bg-slate-900 flex items-center justify-center">
                                  {c.image ? (
                                    <img
                                      src={c.image}
                                      alt={c.name}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                  ) : null}
                                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-bold text-white uppercase">
                                    {c.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </div>
                                </div>

                                {/* Coordinator Details */}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className={`font-display text-sm font-bold ${headerText} truncate`}>
                                      {c.name}
                                    </p>
                                    {idx === 0 && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40">
                                        1st Lead
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                                    {c.role || "Event Lead"}
                                  </p>
                                  {(c.phone || c.email) && (
                                    <p className="font-mono text-[10px] text-slate-500 truncate">
                                      {c.phone ? `📞 ${c.phone}` : ""} {c.email ? `✉️ ${c.email}` : ""}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right: Reorder Controls (Move Up, Move Down, Rank Selector, Remove) */}
                              <div className="flex items-center gap-1 shrink-0">
                                {/* Direct Rank Dropdown */}
                                <select
                                  value={idx}
                                  onChange={(e) =>
                                    handleSetCoordinatorRank(
                                      selectedOrderEventId,
                                      idx,
                                      Number(e.target.value)
                                    )
                                  }
                                  disabled={isUpdatingOrder}
                                  title="Change rank directly"
                                  className={`rounded-lg border px-1.5 py-1 font-mono text-[11px] font-bold outline-none ${selectBg}`}
                                >
                                  {coords.map((_, i) => (
                                    <option key={i} value={i}>
                                      Rank #{i + 1}
                                    </option>
                                  ))}
                                </select>

                                {/* Move Up Button */}
                                <button
                                  type="button"
                                  onClick={() => handleMoveCoordinator(selectedOrderEventId, idx, "up")}
                                  disabled={idx === 0 || isUpdatingOrder}
                                  title="Move Up"
                                  className={`p-1.5 rounded-lg border font-bold text-xs transition ${idx === 0 || isUpdatingOrder
                                      ? "opacity-30 cursor-not-allowed border-transparent"
                                      : isDark
                                        ? "border-white/10 hover:bg-white/10 text-slate-200"
                                        : "border-slate-200 hover:bg-slate-100 text-slate-700"
                                    }`}
                                >
                                  ▲
                                </button>

                                {/* Move Down Button */}
                                <button
                                  type="button"
                                  onClick={() => handleMoveCoordinator(selectedOrderEventId, idx, "down")}
                                  disabled={idx === coords.length - 1 || isUpdatingOrder}
                                  title="Move Down"
                                  className={`p-1.5 rounded-lg border font-bold text-xs transition ${idx === coords.length - 1 || isUpdatingOrder
                                      ? "opacity-30 cursor-not-allowed border-transparent"
                                      : isDark
                                        ? "border-white/10 hover:bg-white/10 text-slate-200"
                                        : "border-slate-200 hover:bg-slate-100 text-slate-700"
                                    }`}
                                >
                                  ▼
                                </button>

                                {/* Remove from event button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveCoordinatorFromEvent(selectedOrderEventId, c.name)
                                  }
                                  disabled={isUpdatingOrder}
                                  title={`Remove ${c.name} from this event`}
                                  className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-200 dark:border-white/10">
                          <span>💡 Saved instantly to database</span>
                          <span>Reorder updates front page live</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION 3: ADMINS & COORDINATORS MANAGEMENT                               */}
              {/* ========================================================================= */}
              <section
                id="section-users"
                className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-6`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className={`font-display text-xl sm:text-2xl font-bold ${headerText} tracking-tight`}>
                      Admins &amp; Coordinators Management ({users.length})
                    </h2>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Add, remove, and filter role permissions for committee accounts.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="🔍 Search users…"
                      className={`rounded-xl border px-3.5 py-2 font-mono text-xs outline-none transition ${inputBg}`}
                    />
                    <select
                      value={roleFilter}
                      onChange={(e: any) => setRoleFilter(e.target.value)}
                      className={`rounded-xl border px-3.5 py-2 font-mono text-xs outline-none transition ${selectBg}`}
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admins</option>
                      <option value="coordinator">Coordinators</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className={`overflow-x-auto rounded-2xl border ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                  <table className="w-full text-left font-mono text-xs">
                    <thead className={`${tableHeadBg} text-[11px] uppercase tracking-wider border-b font-bold`}>
                      <tr>
                        <th className="px-4 py-3.5">Full Name</th>
                        <th className="px-4 py-3.5">Username</th>
                        <th className="px-4 py-3.5">Role</th>
                        <th className="px-4 py-3.5">Phone</th>
                        <th className="px-4 py-3.5">Email</th>
                        <th className="px-4 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableDivide}`}>
                      {processedUsers.map((u) => (
                        <tr key={u.id} className={`transition-colors ${tableRowHover}`}>
                          <td className={`px-4 py-3.5 font-bold ${headerText}`}>{u.name}</td>
                          <td className={`px-4 py-3.5 ${subText}`}>@{u.username}</td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${u.role === "admin"
                                  ? isDark
                                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                                    : "bg-indigo-100 text-indigo-950 border-indigo-300"
                                  : isDark
                                    ? "bg-sky-500/20 text-sky-300 border-sky-400/40"
                                    : "bg-sky-100 text-sky-950 border-sky-300"
                                }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className={`px-4 py-3.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{u.phone || "—"}</td>
                          <td className={`px-4 py-3.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{u.email || "—"}</td>
                          <td className="px-4 py-3.5 text-right">
                            <form action={deleteUserAction} className="inline">
                              <input type="hidden" name="id" value={u.id} />
                              <button
                                type="submit"
                                onClick={(evt) => {
                                  if (!confirm(`Are you sure you want to remove ${u.name}?`)) {
                                    evt.preventDefault();
                                  }
                                }}
                                className={`${isDark ? "text-rose-400 hover:text-rose-300" : "text-rose-700 hover:text-rose-900"} hover:underline font-bold text-[11px] transition`}
                              >
                                Remove
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}

                      {processedUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className={`px-4 py-8 text-center ${subText} font-medium`}>
                            No matching users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Add User Form */}
                <form
                  action={createUserAction}
                  className={`grid gap-3.5 rounded-2xl border ${searchBoxBg} p-5 font-mono text-xs sm:grid-cols-2 lg:grid-cols-3`}
                >
                  <p className={`col-span-full font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? "text-sky-400" : "text-sky-900"}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    Add New User Account (Admin or Coordinator)
                  </p>
                  <input
                    name="name"
                    required
                    placeholder="Full Name"
                    className={`rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                  />
                  <input
                    name="username"
                    required
                    placeholder="Username"
                    className={`rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                  />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Password"
                    className={`rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                  />
                  <select
                    name="role"
                    required
                    className={`rounded-xl border px-3.5 py-2.5 outline-none transition ${selectBg}`}
                  >
                    <option value="coordinator">Coordinator</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input
                    name="phone"
                    placeholder="Phone (optional)"
                    className={`rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                  />
                  <input
                    name="email"
                    placeholder="Email (optional)"
                    className={`rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                  />
                  <button
                    type="submit"
                    className="col-span-full rounded-xl py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 hover:from-sky-400 hover:via-indigo-400 hover:to-sky-400 shadow-md shadow-sky-500/20 transition-all active:scale-[0.99]"
                  >
                    Create Account
                  </button>
                </form>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ANNOUNCEMENTS (Announcements, Resources & Site Information)         */}
          {/* ========================================================================= */}
          {activeNavTab === "announcements" && (
            <div className="space-y-6">
              {/* SUB-NAV TABS FOR ANNOUNCEMENTS */}
              <div className={`flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border ${isDark ? "border-white/10 bg-slate-900/60" : "border-slate-200 bg-slate-100/80"} backdrop-blur-md`}>
                <button
                  type="button"
                  onClick={() => setAnnouncementsSubTab("bulletins")}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${announcementsSubTab === "bulletins"
                      ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25 scale-[1.01]"
                      : isDark
                        ? "text-slate-400 hover:text-white hover:bg-white/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                >
                  <span className="text-sm">📢</span>
                  <span>Broadcast Notices</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${announcementsSubTab === "bulletins" ? "bg-white/20 text-white" : isDark ? "bg-white/10 text-slate-300" : "bg-slate-200 text-slate-700"}`}>
                    {localAnnouncements.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnnouncementsSubTab("ticker")}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${announcementsSubTab === "ticker"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.01]"
                      : isDark
                        ? "text-slate-400 hover:text-white hover:bg-white/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                >
                  <span className="text-sm">⚡</span>
                  <span>Running Announcement (Ticker)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/20 text-white font-extrabold uppercase">
                    Front Page
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnnouncementsSubTab("resources")}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${announcementsSubTab === "resources"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 scale-[1.01]"
                      : isDark
                        ? "text-slate-400 hover:text-white hover:bg-white/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                >
                  <span className="text-sm">📄</span>
                  <span>Resources &amp; Links</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${announcementsSubTab === "resources" ? "bg-white/20 text-white" : isDark ? "bg-white/10 text-slate-300" : "bg-slate-200 text-slate-700"}`}>
                    {filteredResources.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnnouncementsSubTab("settings")}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${announcementsSubTab === "settings"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 scale-[1.01]"
                      : isDark
                        ? "text-slate-400 hover:text-white hover:bg-white/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                >
                  <span className="text-sm">⚙️</span>
                  <span>Site Settings</span>
                </button>
              </div>

              {/* ========================================================================= */}
              {/* SUB-TAB 0: BROADCAST NOTICES (/announcements)                            */}
              {/* ========================================================================= */}
              {announcementsSubTab === "bulletins" && (
                <div className="space-y-6">
                  {/* MAIN CONTROL CARD: COMPOSE & BROADCAST */}
                  <div className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-6`}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                          </span>
                          <h3 className={`font-display text-xl sm:text-2xl font-bold ${headerText}`}>
                            Live Broadcast Announcement Control
                          </h3>
                        </div>
                        <p className={`font-mono text-xs ${subText} mt-1`}>
                          Publish official real-time announcements. Broadcasts appear instantly on the public{" "}
                          <span className="text-rose-600 font-bold">/announcements</span> page &amp; mobile stream.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href="/announcements"
                          target="_blank"
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition shadow-xs"
                        >
                          <span>🌐</span>
                          <span>Open Public Stream ↗</span>
                        </Link>
                      </div>
                    </div>

                    {/* Compose Box */}
                    <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
                      <div>
                        <label className={`block font-mono text-xs font-bold uppercase tracking-wider ${subText} mb-2`}>
                          Announcement Message
                        </label>
                        <textarea
                          value={newAnnouncementMessage}
                          onChange={(e) => setNewAnnouncementMessage(e.target.value)}
                          placeholder="Type your official announcement or notice here... (e.g. 'symposium soon', 'Round 1 results are out', 'Lunch tokens distributed at counter 3')"
                          rows={3}
                          maxLength={500}
                          className={`w-full rounded-2xl border p-4 font-mono text-xs sm:text-sm outline-none transition focus:ring-2 focus:ring-rose-400 resize-y ${inputBg}`}
                        />
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
                          <span>
                            Broadcast as: <strong className="text-slate-900">@{currentUser.username}</strong>
                          </span>
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified Admin
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-[11px]">{newAnnouncementMessage.length}/500 chars</span>
                        </div>

                        <button
                          type="submit"
                          disabled={isBroadcastingAnnouncement || !newAnnouncementMessage.trim()}
                          className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all ${
                            isBroadcastingAnnouncement || !newAnnouncementMessage.trim()
                              ? "bg-slate-400 cursor-not-allowed opacity-60"
                              : "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 hover:scale-[1.02] shadow-rose-500/25 active:scale-95 cursor-pointer"
                          }`}
                        >
                          {isBroadcastingAnnouncement ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              <span>Broadcasting...</span>
                            </>
                          ) : (
                            <>
                              <span>📡</span>
                              <span>Broadcast Live Notice</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Success / Error Alerts */}
                      {announcementBroadcastSuccess && (
                        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-mono text-xs flex items-center justify-between animate-fadeIn">
                          <span className="flex items-center gap-2 font-bold">
                            <span>🎉</span> Announcement successfully broadcasted! Live on /announcements.
                          </span>
                          <span className="text-[10px] text-emerald-600">Auto-synced</span>
                        </div>
                      )}

                      {announcementBroadcastError && (
                        <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 font-mono text-xs flex items-center gap-2 animate-fadeIn font-bold">
                          <span>⚠️</span> {announcementBroadcastError}
                        </div>
                      )}
                    </form>

                    {/* LIVE SIMULATION PREVIEW (How users see it) */}
                    <div className="pt-4 border-t border-slate-200/80 space-y-2">
                      <span className={`font-mono text-xs font-bold uppercase tracking-wider ${subText} flex items-center gap-2`}>
                        <span>👁️</span> Live Participant View (Simulated Mobile/Desktop Card)
                      </span>
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 max-w-lg">
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                            Notice
                          </span>
                          <span className="font-mono text-[11px] text-blue-600 font-bold">Just now</span>
                        </div>
                        <p className="font-sans text-sm sm:text-base text-slate-900 font-semibold leading-relaxed">
                          {newAnnouncementMessage.trim() || "symposium soon"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE BROADCASTED NOTICES LIST */}
                  <div className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-5`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div>
                        <h4 className={`font-display text-lg sm:text-xl font-bold ${headerText} flex items-center gap-2`}>
                          <span>📋</span>
                          <span>Active Broadcasted Notices</span>
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                            {filteredAnnouncements.length}
                          </span>
                        </h4>
                        <p className={`font-mono text-xs ${subText} mt-0.5`}>
                          All notices currently live on the public announcements stream.
                        </p>
                      </div>

                      {/* Search Filter */}
                      <div className="w-full sm:w-64">
                        <input
                          type="text"
                          value={announcementSearch}
                          onChange={(e) => setAnnouncementSearch(e.target.value)}
                          placeholder="🔍 Filter notices..."
                          className={`w-full rounded-xl border px-3 py-2 font-mono text-xs outline-none ${inputBg}`}
                        />
                      </div>
                    </div>

                    {/* Notice Cards */}
                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                      {filteredAnnouncements.map((a) => {
                        const dateFormatted = new Date(a.created_at).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div
                            key={a.id}
                            className={`rounded-2xl border p-4 sm:p-5 transition space-y-3 ${
                              isDark
                                ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                                : "border-slate-200 bg-white hover:border-rose-300 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                  Live Notice
                                </span>
                                <span className="font-mono text-[11px] text-slate-500">
                                  {dateFormatted}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteAnnouncement(a.id)}
                                disabled={deletingAnnouncementId === a.id}
                                className="inline-flex items-center gap-1 font-mono text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-transparent hover:border-rose-200 transition"
                              >
                                {deletingAnnouncementId === a.id ? (
                                  <span>Deleting...</span>
                                ) : (
                                  <>
                                    <span>🗑️</span>
                                    <span>Delete</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="font-sans text-sm sm:text-base text-slate-900 font-semibold leading-relaxed whitespace-pre-wrap">
                              {a.message}
                            </p>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-mono text-xs text-slate-500">
                              <span>
                                Broadcasted by <strong className="text-slate-900">@{a.created_by}</strong>
                              </span>
                              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                ✓ Verified Admin Notice
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {filteredAnnouncements.length === 0 && (
                        <div className="text-center py-10 rounded-2xl border border-dashed border-slate-300 p-6 space-y-2">
                          <p className="text-2xl">📢</p>
                          <p className="font-mono text-xs text-slate-500 font-bold">
                            {announcementSearch
                              ? `No announcements match "${announcementSearch}".`
                              : "No broadcasted notices yet. Send your first broadcast above!"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SUB-TAB 1: RUNNING ANNOUNCEMENT (HEADER TICKER)                           */}
              {/* ========================================================================= */}
              {announcementsSubTab === "ticker" && (
                <div className="space-y-6">
                  {/* MAIN CONTROL CARD */}
                  <div className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-6`}>
                    {/* Header with Title & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-3 w-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                          <h3 className={`font-display text-xl sm:text-2xl font-bold ${headerText}`}>
                            Front Page Running Announcement
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold border transition-colors ${isRunningAnnouncementActive
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                            }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${isRunningAnnouncementActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
                              }`}
                          />
                          {isRunningAnnouncementActive ? "Active on Front Page" : "Hidden / Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* LIVE INTERACTIVE PREVIEW MOCKUP */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-xs font-bold uppercase tracking-wider ${subText} flex items-center gap-2`}>
                          <span>🖥️</span> Live Header Preview (Real-time Simulation)
                        </span>
                      </div>

                      {/* Mock Header Shell */}
                      <div className="rounded-2xl border border-slate-300/80 bg-slate-100/90 p-3 sm:p-4 shadow-inner space-y-2 select-none">
                        {/* Mock Navbar Pill */}
                        <div className="rounded-xl border border-slate-200 bg-white/95 px-4 py-2 flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-slate-950 flex items-center justify-center text-[10px] text-white font-bold">
                              II
                            </div>
                            <span className="font-display text-xs font-bold text-slate-900">
                              Innovation Ignite Symposium 2.0
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="hidden md:inline font-mono text-[10px] text-slate-400">
                              Home · Events · Achievements · Gallery
                            </span>
                            <span className="rounded-full bg-blue-600 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                              Admin
                            </span>
                          </div>
                        </div>

                        {/* Actual Ticker Simulation */}
                        {isRunningAnnouncementActive && !!runningAnnouncementText.trim() ? (
                          <div className="relative overflow-hidden rounded-xl border border-amber-300/90 bg-white shadow-xs flex items-center">
                            {/* Live Badge */}
                            <div className="relative z-10 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-mono text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 shrink-0 shadow-xs">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                              </span>
                              <span>Live Notice</span>
                            </div>

                            {/* Marquee Track */}
                            <div className="relative flex-1 overflow-hidden py-1.5 group">
                              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-1" />
                              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-1" />

                              <div className="flex w-max animate-marquee hover:[animation-play-state:paused] font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">
                                <div className="flex items-center gap-6 px-4">
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="text-amber-500 font-bold">⚡</span>
                                    <span>{runningAnnouncementText}</span>
                                  </span>
                                  <span className="text-amber-400 font-bold">•</span>
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="text-blue-500 font-bold">📢</span>
                                    <span>{runningAnnouncementText}</span>
                                  </span>
                                  <span className="text-amber-400 font-bold">•</span>
                                </div>
                                <div className="flex items-center gap-6 px-4" aria-hidden="true">
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="text-amber-500 font-bold">⚡</span>
                                    <span>{runningAnnouncementText}</span>
                                  </span>
                                  <span className="text-amber-400 font-bold">•</span>
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="text-blue-500 font-bold">📢</span>
                                    <span>{runningAnnouncementText}</span>
                                  </span>
                                  <span className="text-amber-400 font-bold">•</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-300 py-3 text-center font-mono text-xs text-slate-400">
                            {isRunningAnnouncementActive ? "⚠️ Ticker text is empty. Enter text below to activate." : "🔒 Ticker is currently disabled. Toggle active below to enable."}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* EDIT & PUBLISH FORM */}
                    <form onSubmit={handleSaveRunningAnnouncement} className="space-y-5">
                      {/* Active Status Toggle */}
                      <div className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/70"}`}>
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${isRunningAnnouncementActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                          <span className={`font-mono text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {isRunningAnnouncementActive ? "Announcement: ON" : "Announcement: OFF"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsRunningAnnouncementActive(!isRunningAnnouncementActive)}
                          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isRunningAnnouncementActive ? "bg-amber-500" : isDark ? "bg-slate-700" : "bg-slate-300"
                            }`}
                          role="switch"
                          aria-checked={isRunningAnnouncementActive}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isRunningAnnouncementActive ? "translate-x-6" : "translate-x-0"
                              }`}
                          />
                        </button>
                      </div>

                      {/* Announcement Text Input */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className={`font-mono text-xs font-bold uppercase tracking-wider ${subText}`}>
                            Running Announcement Text
                          </label>
                          <div className="flex items-center gap-3">
                            <span className={`font-mono text-[11px] ${subText}`}>
                              {runningAnnouncementText.length} characters
                            </span>
                            {runningAnnouncementText && (
                              <button
                                type="button"
                                onClick={() => setRunningAnnouncementText("")}
                                className="font-mono text-[11px] text-rose-400 hover:text-rose-300 hover:underline"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        <textarea
                          name="runningAnnouncement"
                          rows={3}
                          value={runningAnnouncementText}
                          onChange={(e) => setRunningAnnouncementText(e.target.value)}
                          placeholder="e.g. 📢 Registrations are now open for Innovation Ignite Symposium 2.0! Join exciting technical events • Spot entries available • Register now!"
                          className={`w-full rounded-2xl border p-4 font-mono text-xs sm:text-sm leading-relaxed outline-none transition focus:ring-2 focus:ring-amber-500/40 ${inputBg}`}
                          required={isRunningAnnouncementActive}
                        />
                      </div>

                      {/* Success Feedback Notification */}
                      {runningAnnouncementSaveSuccess && (
                        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-400 flex items-center justify-between gap-3 animate-fade-up">
                          <div className="flex items-center gap-2">
                            <span>✓</span>
                            <span className="font-bold">
                              Announcement successfully saved and published to the front page header!
                            </span>
                          </div>
                          <Link
                            href="/"
                            target="_blank"
                            className="underline font-bold hover:text-emerald-300 shrink-0"
                          >
                            Check Front Page ↗
                          </Link>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSavingRunningAnnouncement}
                          className="w-full sm:w-auto flex-1 rounded-2xl py-3.5 px-6 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 shadow-md shadow-amber-500/25 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isSavingRunningAnnouncement ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              <span>Saving &amp; Publishing Announcement…</span>
                            </>
                          ) : (
                            <>
                              <span>💾</span>
                              <span>Save &amp; Publish Announcement</span>
                            </>
                          )}
                        </button>

                        <Link
                          href="/"
                          target="_blank"
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border py-3.5 px-6 font-mono text-xs font-bold uppercase tracking-wider transition ${isDark
                              ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                            }`}
                        >
                          <span>Open Front Page</span>
                          <span>↗</span>
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SUB-TAB 3: RESOURCES & LINKS                                             */}
              {/* ========================================================================= */}
              {announcementsSubTab === "resources" && (
                <div className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-display text-xl font-bold ${headerText} flex items-center gap-2`}>
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                        Resources &amp; Document Links
                      </h3>
                      <p className={`font-mono text-xs ${subText} mt-1`}>
                        Upload official Google Drive schedules, rulebooks, and templates for coordinators.
                      </p>
                    </div>
                    <input
                      type="text"
                      value={resourceSearch}
                      onChange={(e) => setResourceSearch(e.target.value)}
                      placeholder="🔍 Search…"
                      className={`w-36 rounded-xl border px-3 py-1.5 font-mono text-[11px] outline-none ${inputBg}`}
                    />
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {filteredResources.map((r) => (
                      <div
                        key={r.id}
                        className={`flex items-center justify-between gap-3 rounded-2xl border ${isDark ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]" : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/70"} p-4 transition`}
                      >
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`font-mono text-xs hover:underline font-bold flex items-center gap-2 truncate ${isDark ? "text-sky-400 hover:text-sky-300" : "text-sky-800 hover:text-sky-950"}`}
                        >
                          <span>📄</span>
                          <span className="truncate">{r.title}</span>
                        </a>
                        <form action={deleteResourceAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className={`font-mono text-[11px] font-bold ${isDark ? "text-rose-400 hover:text-rose-300" : "text-rose-700 hover:text-rose-900"} hover:underline`}>
                            Remove
                          </button>
                        </form>
                      </div>
                    ))}

                    {filteredResources.length === 0 && (
                      <p className={`font-mono text-xs ${subText} py-4 text-center`}>No resources found.</p>
                    )}
                  </div>

                  <form action={createResourceAction} className="space-y-2 font-mono text-xs pt-2">
                    <input
                      name="title"
                      required
                      placeholder="Resource Title (e.g. Symposium Event Schedule PDF)"
                      className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                    />
                    <div className="flex gap-2">
                      <input
                        name="url"
                        required
                        placeholder="https://drive.google.com/…"
                        className={`flex-1 rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                      />
                      <button
                        type="submit"
                        className="rounded-xl px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold uppercase tracking-wider shadow-sm transition"
                      >
                        Add Link
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SUB-TAB 4: GENERAL SITE INFORMATION & SETTINGS                           */}
              {/* ========================================================================= */}
              {announcementsSubTab === "settings" && (
                <section
                  id="section-settings"
                  className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-5`}
                >
                  <div>
                    <h3 className={`font-display text-xl font-bold ${headerText} flex items-center gap-2.5`}>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      General Site Information &amp; Links
                    </h3>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Configure symposium title, hosting club, college name, and registration form URL.
                    </p>
                  </div>

                  <form action={updateSiteSettingsAction} className="grid gap-4 sm:grid-cols-2 font-mono text-xs">
                    <div>
                      <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                        Symposium Title
                      </label>
                      <input
                        name="symposiumName"
                        defaultValue={settings.symposiumName}
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                        Hosting Club Name
                      </label>
                      <input
                        name="clubName"
                        defaultValue={settings.clubName}
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                        College Name
                      </label>
                      <input
                        name="collegeName"
                        defaultValue={settings.collegeName}
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                        Google Form Registration URL
                      </label>
                      <input
                        name="registerFormUrl"
                        defaultValue={settings.registerFormUrl}
                        placeholder="https://forms.gle/..."
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div className="col-span-full">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} uppercase tracking-wider text-[10px] font-bold`}>
                          Google Sheets Live Response URL / ID
                        </label>
                        <a
                          href={settings.googleSheetUrl || "https://docs.google.com/spreadsheets/d/1YynwBobcAJvQ1tN0YF92TA-6uhp_kukPOEAc3diatis/edit?usp=sharing"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 font-mono"
                        >
                          Open Sheet ↗
                        </a>
                      </div>
                      <input
                        name="googleSheetUrl"
                        defaultValue={settings.googleSheetUrl || "https://docs.google.com/spreadsheets/d/1YynwBobcAJvQ1tN0YF92TA-6uhp_kukPOEAc3diatis/edit?usp=sharing"}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className={`w-full rounded-xl border px-3.5 py-2.5 outline-none transition ${inputBg}`}
                      />
                      <p className={`mt-1.5 font-mono text-[11px] ${subText}`}>
                        💡 Responses are fetched live. In Google Sheets, make sure to click <strong className="text-amber-400">Share → Anyone with the link → Viewer</strong> so the website can read real-time registration counts.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="col-span-full rounded-xl py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-400 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.99]"
                    >
                      Save Site Settings
                    </button>
                  </form>
                </section>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: GALLERY (Gallery Management: Photos & Videos)                       */}
          {/* ========================================================================= */}
          {activeNavTab === "gallery" && (
            <section
              id="section-gallery"
              className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-6`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className={`font-display text-xl sm:text-2xl font-bold ${headerText} tracking-tight`}>
                      Gallery Management (Photos &amp; Videos)
                    </h2>
                    <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-bold border ${isDark
                        ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
                        : "bg-purple-100 text-purple-950 border-purple-300"
                      }`}>
                      {galleryItems.length} Total Items
                    </span>
                  </div>
                  <p className={`font-mono text-xs ${subText} mt-1`}>
                    Add, manage, and remove photos and recap videos shown in the website gallery.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <input
                    type="text"
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    placeholder="🔍 Search photos &amp; videos…"
                    className={`rounded-xl border px-3.5 py-2 font-mono text-xs outline-none ${inputBg}`}
                  />
                  <select
                    value={galleryTypeFilter}
                    onChange={(e: any) => setGalleryTypeFilter(e.target.value)}
                    className={`rounded-xl border px-3.5 py-2 font-mono text-xs outline-none font-bold ${selectBg}`}
                  >
                    <option value="all">All Media</option>
                    <option value="photo">📷 Photos Only</option>
                    <option value="video">🎬 Videos Only</option>
                  </select>
                </div>
              </div>

              {/* Form to Add New Gallery Media with Drag & Drop / File Picker */}
              <form
                onSubmit={handleUploadGalleryMedia}
                className={`space-y-4 rounded-3xl border ${searchBoxBg} p-5 sm:p-6 font-mono text-xs`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <p className={`font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? "text-purple-400" : "text-purple-900"
                    }`}>
                    <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                    Upload New Photo or Video to Gallery
                  </p>

                  {/* Mode Switcher: Choose File (Drag & Drop) vs Web URL */}
                  <div className={`inline-flex rounded-xl p-1 border ${isDark ? "border-white/10 bg-slate-900/60" : "border-slate-200 bg-slate-100"}`}>
                    <button
                      type="button"
                      onClick={() => setGalleryUploadMode("file")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${galleryUploadMode === "file"
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                          : isDark
                            ? "text-slate-400 hover:text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      <span>📁 Choose / Drag &amp; Drop File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryUploadMode("url")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${galleryUploadMode === "url"
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                          : isDark
                            ? "text-slate-400 hover:text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      <span>🔗 Web Link / YouTube</span>
                    </button>
                  </div>
                </div>

                {/* ERROR NOTIFICATION */}
                {galleryUploadError && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-400 text-xs flex items-center justify-between">
                    <span>⚠️ {galleryUploadError}</span>
                    <button
                      type="button"
                      onClick={() => setGalleryUploadError(null)}
                      className="font-bold hover:underline"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* SUCCESS NOTIFICATION */}
                {galleryUploadSuccess && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-400 text-xs flex items-center gap-2 animate-fade-up">
                    <span>✓</span>
                    <span className="font-bold">Media successfully uploaded and added to the gallery!</span>
                  </div>
                )}

                {/* MODE 1: FILE DRAG & DROP / CHOOSER */}
                {galleryUploadMode === "file" && (
                  <div className="space-y-4">
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleGalleryFileSelect(e.target.files[0]);
                        }
                      }}
                      accept="image/*,video/*"
                      className="hidden"
                    />

                    {/* Dropzone Container */}
                    {!galleryFile ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => galleryFileInputRef.current?.click()}
                        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${isDraggingGallery
                            ? "border-purple-500 bg-purple-500/15 scale-[1.01] shadow-lg shadow-purple-500/20"
                            : isDark
                              ? "border-white/15 bg-white/[0.02] hover:border-purple-400/50 hover:bg-white/[0.04]"
                              : "border-purple-200 bg-purple-50/40 hover:border-purple-400 hover:bg-purple-50/80"
                          }`}
                      >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 mb-3 group-hover:scale-105 transition-transform">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>

                        <h4 className={`font-display text-base sm:text-lg font-bold ${headerText}`}>
                          Choose a photo or video, or drag &amp; drop it here
                        </h4>
                        <p className={`font-mono text-xs ${subText} mt-1 max-w-md mx-auto`}>
                          Supports JPG, PNG, WEBP, GIF for photos and MP4, WEBM, MOV for videos (up to 50MB).
                        </p>

                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition">
                          <span>📂</span>
                          <span>Browse from Computer</span>
                        </div>
                      </div>
                    ) : (
                      /* File Selected with Live Media Preview */
                      <div className={`rounded-2xl border p-4 sm:p-5 ${isDark ? "border-purple-500/30 bg-purple-500/5" : "border-purple-200 bg-purple-50/50"} space-y-4`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                            <span>✨</span> Selected Media File Preview
                          </span>
                          <button
                            type="button"
                            onClick={handleClearSelectedFile}
                            className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            ✕ Remove / Change File
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-5">
                          {/* Media Thumbnail / Player */}
                          <div className="relative w-full sm:w-60 h-40 rounded-xl overflow-hidden bg-black/90 flex items-center justify-center border border-white/10 shrink-0">
                            {galleryMediaType === "photo" && galleryPreviewUrl ? (
                              <img
                                src={galleryPreviewUrl}
                                alt="Upload preview"
                                className="w-full h-full object-contain"
                              />
                            ) : galleryMediaType === "video" && galleryPreviewUrl ? (
                              <video
                                src={galleryPreviewUrl}
                                controls
                                className="w-full h-full object-contain"
                              />
                            ) : null}

                            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-black/80 text-white border border-white/20">
                              {galleryMediaType === "photo" ? "📸 Photo" : "🎬 Video"}
                            </span>
                          </div>

                          {/* File Metadata */}
                          <div className="flex-1 space-y-2 text-left w-full">
                            <div>
                              <p className={`font-mono text-xs font-bold ${isDark ? "text-white" : "text-slate-900"} truncate`}>
                                {galleryFile.name}
                              </p>
                              <p className={`font-mono text-[11px] ${subText} mt-0.5`}>
                                {(galleryFile.size / (1024 * 1024)).toFixed(2)} MB · {galleryFile.type || "Media File"}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => galleryFileInputRef.current?.click()}
                                className={`px-3 py-1.5 rounded-lg border font-mono text-[11px] font-bold transition cursor-pointer ${isDark
                                    ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                  }`}
                              >
                                Replace File…
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE 2: WEB URL */}
                {galleryUploadMode === "url" && (
                  <div className="space-y-2">
                    <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} uppercase tracking-wider text-[10px] font-bold`}>
                      Media URL / Image Link / YouTube Link *
                    </label>
                    <input
                      type="url"
                      value={galleryExternalUrl}
                      onChange={(e) => setGalleryExternalUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or https://www.youtube.com/watch?v=..."
                      className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                    />
                  </div>
                )}

                {/* Common Metadata Fields: Title, Media Type, Caption */}
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                  <div>
                    <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                      Media Title *
                    </label>
                    <input
                      value={galleryTitle}
                      onChange={(e) => setGalleryTitle(e.target.value)}
                      required
                      placeholder="e.g. Hackathon Final Presentation"
                      className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                      Media Type *
                    </label>
                    <select
                      value={galleryMediaType}
                      onChange={(e: any) => setGalleryMediaType(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 outline-none font-bold ${selectBg}`}
                    >
                      <option value="photo">📸 Photo</option>
                      <option value="video">🎬 Video (MP4 / YouTube)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5 uppercase tracking-wider text-[10px] font-bold`}>
                      Caption / Description
                    </label>
                    <input
                      value={galleryCaption}
                      onChange={(e) => setGalleryCaption(e.target.value)}
                      placeholder="Brief tagline or description…"
                      className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploadingGallery || (galleryUploadMode === "file" && !galleryFile)}
                  className="w-full rounded-xl py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 shadow-md shadow-purple-600/25 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isUploadingGallery ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Uploading to Gallery… Please wait</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Upload &amp; Save to Gallery</span>
                    </>
                  )}
                </button>
              </form>

              {/* List / Grid of Existing Gallery Items */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGalleryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative rounded-2xl border ${isDark ? "border-white/10 bg-white/[0.02] hover:border-purple-500/40 hover:bg-white/[0.05]" : "border-slate-200 bg-white hover:border-purple-400 hover:shadow-md"} overflow-hidden shadow-xs transition flex flex-col justify-between`}
                  >
                    <div>
                      {/* Thumbnail / Media Preview */}
                      <div className="relative aspect-video bg-black/70 overflow-hidden flex items-center justify-center">
                        {item.type === "photo" && item.url ? (
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : item.type === "video" && item.url ? (
                          item.url.includes("youtube.com") || item.url.includes("youtu.be") ? (
                            <img
                              src={`https://img.youtube.com/vi/${(item.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) || [])[1] || ""}/hqdefault.jpg`}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <video
                              src={item.url}
                              preload="metadata"
                              muted
                              playsInline
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />

                        <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                          {item.type === "photo" ? "📸 Photo" : "🎬 Video"}
                        </span>

                        {item.type === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Text Details */}
                      <div className="p-4 space-y-1 font-mono text-xs">
                        <h4 className={`font-bold ${headerText} text-sm line-clamp-1`}>{item.title || "Untitled"}</h4>
                        {item.caption && <p className={`${subText} text-[11px] line-clamp-2`}>{item.caption}</p>}
                        <p className={`text-[10px] ${subText} truncate pt-1`}>{item.url}</p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className={`p-4 pt-0 border-t ${isDark ? "border-white/5" : "border-slate-100"} mt-2 flex items-center justify-between`}>
                      <span className={`font-mono text-[10px] ${subText}`}>
                        ID: {item.id.slice(0, 8)}
                      </span>
                      <form action={async (formData) => {
                        setLocalGalleryItems((prev) => prev.filter((i) => i.id !== item.id));
                        await deleteGalleryItemAction(formData);
                      }}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          onClick={(evt) => {
                            if (!confirm(`Are you sure you want to remove "${item.title || "this item"}" from gallery?`)) {
                              evt.preventDefault();
                            }
                          }}
                          className={`font-mono text-xs font-bold ${isDark ? "text-rose-400 hover:text-rose-300" : "text-rose-800 hover:text-rose-950"} hover:underline inline-flex items-center gap-1 transition cursor-pointer`}
                        >
                          🗑️ Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}

                {filteredGalleryItems.length === 0 && (
                  <div className={`col-span-full py-12 text-center font-mono text-xs ${subText} ${isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200"} rounded-2xl border`}>
                    No matching gallery items found.
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT EVENT MODAL (ADAPTS TO DARK/LIGHT THEME)                             */}
      {/* ========================================================================= */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-4 font-mono text-xs border shadow-2xl ${isDark ? "bg-[#111827] text-white border-white/20" : "bg-white text-slate-900 border-slate-200"
            }`}>
            <div className={`flex items-center justify-between border-b ${isDark ? "border-white/10" : "border-slate-100"} pb-3.5`}>
              <h3 className={`font-display text-lg font-bold ${headerText}`}>
                Edit Event: {editingEvent.name}
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className={`${subText} hover:${headerText} font-mono text-sm font-bold`}
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateEventAction(formData);
                setEditingEvent(null);
              }}
              className="space-y-3.5"
            >
              <input type="hidden" name="id" value={editingEvent.id} />

              <div>
                <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1 uppercase tracking-wider text-[10px] font-bold`}>
                  Event Name
                </label>
                <input
                  name="name"
                  defaultValue={editingEvent.name}
                  required
                  className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1 uppercase tracking-wider text-[10px] font-bold`}>
                    Date
                  </label>
                  <input
                    name="date"
                    defaultValue={editingEvent.date}
                    required
                    className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1 uppercase tracking-wider text-[10px] font-bold`}>
                    Time
                  </label>
                  <input
                    name="time"
                    defaultValue={editingEvent.time}
                    required
                    className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1 uppercase tracking-wider text-[10px] font-bold`}>
                    Venue
                  </label>
                  <input
                    name="venue"
                    defaultValue={editingEvent.venue}
                    required
                    className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1 uppercase tracking-wider text-[10px] font-bold`}>
                    Capacity
                  </label>
                  <input
                    name="capacity"
                    type="number"
                    defaultValue={editingEvent.capacity}
                    required
                    className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1 uppercase tracking-wider text-[10px] font-bold`}>
                  Google Sheet Event Label
                </label>
                <input
                  name="sheetEventLabel"
                  defaultValue={editingEvent.sheetEventLabel}
                  required
                  className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1 uppercase tracking-wider text-[10px] font-bold`}>
                  Tagline
                </label>
                <input
                  name="tagline"
                  defaultValue={editingEvent.tagline}
                  className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block ${isDark ? "text-slate-300" : "text-slate-700"} mb-1 uppercase tracking-wider text-[10px] font-bold`}>
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingEvent.description}
                  rows={2}
                  className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${inputBg}`}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className={`w-1/2 rounded-xl border py-2.5 text-center font-bold transition ${isDark ? "border-white/15 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl py-2.5 text-center font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
