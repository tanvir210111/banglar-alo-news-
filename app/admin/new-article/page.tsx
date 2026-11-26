"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Settings,
  LayoutGrid,
  Upload,
  Image as ImageIcon,
  Calendar,
  Save,
  CheckCircle2,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading2,
  Palette,
  FileText,
  Video,
  Link2,
  Table,
  RotateCcw,
  Code,
  X,
  FileCheck,
  ExternalLink,
  Zap,
  Flame,
  Star,
  Camera,
  Type,
} from "lucide-react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ScrollToTop from "@/components/common/ScrollToTop";
import PhotoCardModal from "@/components/news/PhotoCardModal";
import {
  DIVISIONS,
  DISTRICTS,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  getDivisionByDistrictId,
} from "@/data/bangladeshLocations";
import { api } from "@/services/apiClient";
import { getCategories, getAuthors, broadcastNewsUpdate } from "@/services/newsService";
import { Category, Author } from "@/types/news";

function getCurrentLocalDateTimeString(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function resolveImageUrlString(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "object") {
    const candidate =
      val.url ||
      val.secure_url ||
      val.path ||
      val.fileUrl ||
      val.location ||
      val.image ||
      val.src ||
      val.href ||
      val.data?.url ||
      val.data?.secure_url ||
      val.data?.path ||
      (typeof val.data === "string" ? val.data : "");
    if (typeof candidate === "string") return candidate.trim();
  }
  return "";
}

const SUB_CATEGORIES: string[] = [];

function NewArticleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Auto News Scraper Link Importer
  const [autoNewsUrl, setAutoNewsUrl] = useState("");
  const [isFetchingAutoNews, setIsFetchingAutoNews] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");

  // Location Cascade States
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");

  // Writers State
  const [guestWriterName, setGuestWriterName] = useState("");
  const [guestWriterDesignation, setGuestWriterDesignation] = useState("");
  const [selectedWriter, setSelectedWriter] = useState("");

  // Right Column Fields
  const [category, setCategory] = useState("");
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [tagTopic, setTagTopic] = useState("");

  // Toggles
  const [isNewsTicker, setIsNewsTicker] = useState(false);
  const [isLeadNews, setIsLeadNews] = useState(false);
  const [isSpotlight, setIsSpotlight] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSliderNews, setIsSliderNews] = useState(false);

  // Image & Meta
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedAttachedFile, setSelectedAttachedFile] = useState<File | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [createdArticle, setCreatedArticle] = useState<{ id: string; slug: string; title: string; imageUrl?: string } | null>(null);
  const [isPhotoCardOpen, setIsPhotoCardOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState("");
  const [publishDate, setPublishDate] = useState(() => getCurrentLocalDateTimeString());
  const [isManualDate, setIsManualDate] = useState(false);
  const [publishStatus, setPublishStatus] = useState("Published");

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  // Rich Text Editor State & Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const editorColorInputRef = useRef<HTMLInputElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const isInternalChangeRef = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);

  // Active modal state for inline insert popovers
  const [activeModal, setActiveModal] = useState<"link" | "image" | "video" | "file" | "color" | null>(null);
  const [modalLinkUrl, setModalLinkUrl] = useState("");
  const [modalLinkText, setModalLinkText] = useState("");
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageCaption, setModalImageCaption] = useState("");
  const [modalVideoUrl, setModalVideoUrl] = useState("");
  const [modalFileUrl, setModalFileUrl] = useState("");
  const [modalFileText, setModalFileText] = useState("");
  const [isUploadingEditorImage, setIsUploadingEditorImage] = useState(false);

  // Active format state for toolbar button highlights
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertOrderedList: false,
    insertUnorderedList: false,
  });

  const saveSelection = () => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (typeof window === "undefined" || !savedRangeRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const updateActiveFormats = () => {
    if (typeof document === "undefined" || isHtmlMode) return;
    saveSelection();
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      });
    } catch { }
  };

  // Sync external content changes into editorRef (AI generator, initial load, etc.)
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || "";
      }
    }
  }, [content, isHtmlMode]);

  // Execute formatting command without losing focus or selection
  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    if (isHtmlMode || !editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand(cmd, false, val);
    saveSelection();
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      setContent(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const [currentFontSize, setCurrentFontSize] = useState("16");

  // Word-style font size application to selected text
  const applyFontSize = (sizeVal: number | string) => {
    if (isHtmlMode || !editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const pxValue = typeof sizeVal === "number" ? `${sizeVal}px` : (sizeVal.endsWith("px") ? sizeVal : `${sizeVal}px`);

    document.execCommand("styleWithCSS", false, "false");
    document.execCommand("fontSize", false, "7");

    if (editorRef.current) {
      // 1. Replace <font size="7"> with <span style="font-size: ...px">
      const fonts = editorRef.current.querySelectorAll("font[size='7']");
      fonts.forEach((font) => {
        const span = document.createElement("span");
        span.style.fontSize = pxValue;
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });

      // 2. Browser fallback for styleWithCSS spans
      const largeSpans = editorRef.current.querySelectorAll("span[style*='-webkit-xxx-large'], span[style*='xxx-large']");
      largeSpans.forEach((span) => {
        (span as HTMLElement).style.fontSize = pxValue;
      });

      isInternalChangeRef.current = true;
      setContent(editorRef.current.innerHTML);
      saveSelection();
    }
  };

  const stepFontSize = (delta: number) => {
    if (isHtmlMode || !editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    let currentSize = 16;
    let node: Node | null = sel.anchorNode;
    if (node && node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }
    if (node && node instanceof HTMLElement) {
      const computed = window.getComputedStyle(node).fontSize;
      const parsed = parseInt(computed, 10);
      if (!isNaN(parsed) && parsed > 0) {
        currentSize = parsed;
      }
    }

    const nextSize = Math.max(8, Math.min(72, currentSize + delta));
    setCurrentFontSize(String(nextSize));
    applyFontSize(nextSize);
  };

  // Safe HTML insertion at current caret/selection
  const insertHtml = (html: string) => {
    if (isHtmlMode) {
      setContent((prev) => (prev ? prev + "\n" + html : html));
      return;
    }
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node: Node | null;
      let lastNode: Node | null = null;
      while ((node = tempDiv.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        const newRange = range.cloneRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
      }
    } else {
      editorRef.current.innerHTML += html;
    }
    isInternalChangeRef.current = true;
    setContent(editorRef.current.innerHTML);
  };

  // Modals Open/Close/Apply Handlers
  const handleOpenLinkModal = () => {
    saveSelection();
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    const selectedText = sel ? sel.toString().trim() : "";
    setModalLinkText(selectedText);
    setModalLinkUrl("");
    setActiveModal("link");
  };

  const handleApplyLink = () => {
    if (!modalLinkUrl.trim()) {
      setActiveModal(null);
      return;
    }
    const href = modalLinkUrl.trim().startsWith("http")
      ? modalLinkUrl.trim()
      : `https://${modalLinkUrl.trim()}`;
    const displayText = modalLinkText.trim() || modalLinkUrl.trim();
    insertHtml(`<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #1677FF; text-decoration: underline; font-weight: 500;">${displayText}</a> `);
    setActiveModal(null);
  };

  const handleOpenImageModal = () => {
    saveSelection();
    setModalImageUrl("");
    setModalImageCaption("");
    setActiveModal("image");
  };

  const handleApplyImageUrl = () => {
    if (!modalImageUrl.trim()) {
      setActiveModal(null);
      return;
    }
    const caption = modalImageCaption.trim() || "ছবি: সংগৃহীত";
    insertHtml(`<figure style="margin: 16px 0; text-align: center;"><img src="${modalImageUrl.trim()}" alt="${caption}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 0 auto; display: block;" /><figcaption style="font-size: 12px; color: #64748b; margin-top: 6px;">${caption}</figcaption></figure><p><br></p>`);
    setActiveModal(null);
  };

  const handleEditorImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEditorImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.upload<any>("/files/upload-single", formData);
      const resolvedUrl = res?.success && res.data ? resolveImageUrlString(res.data) : "";
      const url = resolvedUrl || URL.createObjectURL(file);
      const caption = modalImageCaption.trim() || file.name.replace(/\.[^/.]+$/, "") || "ছবি: সংগৃহীত";
      insertHtml(`<figure style="margin: 16px 0; text-align: center;"><img src="${url}" alt="${caption}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 0 auto; display: block;" /><figcaption style="font-size: 12px; color: #64748b; margin-top: 6px;">${caption}</figcaption></figure><p><br></p>`);
      setActiveModal(null);
    } catch {
      const localUrl = URL.createObjectURL(file);
      insertHtml(`<img src="${localUrl}" alt="" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0;" /><p><br></p>`);
      setActiveModal(null);
    } finally {
      setIsUploadingEditorImage(false);
    }
  };

  const handleOpenVideoModal = () => {
    saveSelection();
    setModalVideoUrl("");
    setActiveModal("video");
  };

  const handleApplyVideo = () => {
    if (!modalVideoUrl.trim()) {
      setActiveModal(null);
      return;
    }
    const url = modalVideoUrl.trim();
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    if (videoId) {
      insertHtml(`<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 16px 0; border-radius: 8px; background: #000;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div><p><br></p>`);
    } else {
      insertHtml(`<p><a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #dc2626; font-weight: bold; text-decoration: underline;">▶ ভিডিও লিংক: ${url}</a></p><p><br></p>`);
    }
    setActiveModal(null);
  };

  const handleOpenFileModal = () => {
    saveSelection();
    setModalFileUrl("");
    setModalFileText("");
    setActiveModal("file");
  };

  const handleApplyFile = () => {
    if (!modalFileUrl.trim()) {
      setActiveModal(null);
      return;
    }
    const label = modalFileText.trim() || "ডকুমেন্ট ফাইল ডাউনলোড (PDF/DOC)";
    insertHtml(`<p><a href="${modalFileUrl.trim()}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: #EEF2FF; color: #1677FF; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; border: 1px solid #C7D2FE;">📄 ${label}</a></p><p><br></p>`);
    setActiveModal(null);
  };

  const handleInsertTable = () => {
    saveSelection();
    const tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #CBD5E1; font-size: 13.5px;"><thead><tr style="background: #F8FAFC;"><th style="border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; font-weight: bold;">শিরোনাম ১</th><th style="border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; font-weight: bold;">শিরোনাম ২</th><th style="border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; font-weight: bold;">শিরোনাম ৩</th></tr></thead><tbody><tr><td style="border: 1px solid #CBD5E1; padding: 8px 12px;">তথ্য ১</td><td style="border: 1px solid #CBD5E1; padding: 8px 12px;">তথ্য ২</td><td style="border: 1px solid #CBD5E1; padding: 8px 12px;">তথ্য ৩</td></tr><tr><td style="border: 1px solid #CBD5E1; padding: 8px 12px;">তথ্য ৪</td><td style="border: 1px solid #CBD5E1; padding: 8px 12px;">তথ্য ৫</td><td style="border: 1px solid #CBD5E1; padding: 8px 12px;">তথ্য ৬</td></tr></tbody></table><p><br></p>`;
    insertHtml(tableHtml);
  };

  // Dynamic DB Categories and Writers
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbWriters, setDbWriters] = useState<Author[]>([]);

  // Set default formatted date on mount
  useEffect(() => {
    // Load categories from live database
    getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setDbCategories(cats);
        setCategory((prev) => prev || cats[0].id);
      }
    });

    // Load writers from live database
    getAuthors().then((w) => {
      if (w && w.length > 0) {
        setDbWriters(w);
        setSelectedWriter((prev) => prev || w[0].id);
      }
    });
  }, []);

  // Auto-updating live date & time timer:
  // Automatically detects and advances real-time every 5 seconds while typing, unless manually edited
  useEffect(() => {
    if (editId || isManualDate) return;
    const interval = setInterval(() => {
      setPublishDate(getCurrentLocalDateTimeString());
      setIsManualDate(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [editId, isManualDate]);

  // Load existing article when editId is provided
  useEffect(() => {
    if (!editId) return;
    setIsLoadingEdit(true);
    api
      .get(`/news/${editId}`)
      .then((res) => {
        if (res?.success && res.data) {
          const item = res.data;
          setTitle(item.title || "");
          setSubtitle(item.subtitle || "");
          setContent(item.content || "");
          if (editorRef.current) {
            editorRef.current.innerHTML = item.content || "";
          }
          if (item.categoryId) {
            setCategory(item.categoryId);
          } else if (item.category?.id) {
            setCategory(item.category.id);
          }
          if (item.writerId) {
            setSelectedWriter(item.writerId);
          }
          if (item.guestWriterName) {
            setGuestWriterName(item.guestWriterName);
          }
          if (item.guestWriterDesignation) {
            setGuestWriterDesignation(item.guestWriterDesignation);
          }
          if (item.division) setSelectedDivision(item.division);
          if (item.district) setSelectedDistrict(item.district);
          if (item.upazila) setSelectedUpazila(item.upazila);
          if (item.tags && Array.isArray(item.tags)) {
            setTagTopic(
              item.tags
                .map((t: any) => (typeof t === "string" ? t : t.name))
                .join(", ")
            );
          }
          const img =
            typeof item.featuredImage === "string"
              ? item.featuredImage
              : item.featuredImage?.url;
          if (img && !img.includes("unsplash.com")) {
            setPreviewImage(img);
          }
          if (item.imageCaption) setImageCaption(item.imageCaption);
          if (item.youtubeLink) setYoutubeLink(item.youtubeLink);
          setIsNewsTicker(Boolean(item.isBreaking));
          setIsLeadNews(Boolean(item.isLead));
          setIsSpotlight(Boolean(item.isFeatured));
          setIsSliderNews(Boolean(item.isSlider));
          setPublishStatus(
            item.publishStatus === "DRAFT" ? "Draft" : "Published"
          );
          if (item.publishedAt || item.publishedDate || item.createdAt) {
            try {
              const d = new Date(item.publishedAt || item.publishedDate || item.createdAt);
              if (!isNaN(d.getTime())) {
                setPublishDate(getCurrentLocalDateTimeString(d));
                setIsManualDate(true);
              }
            } catch { }
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching article for edit:", err);
      })
      .finally(() => {
        setIsLoadingEdit(false);
      });
  }, [editId]);

  // Check for auto-news prefill from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("auto_news_prefill");
      if (stored) {
        sessionStorage.removeItem("auto_news_prefill");
        const item = JSON.parse(stored);
        if (item.title) setTitle(item.title);
        if (item.subtitle || item.summary)
          setSubtitle(item.subtitle || item.summary || "");
        if (item.content) {
          setContent(item.content);
          if (editorRef.current) {
            editorRef.current.innerHTML = item.content;
          }
        }
        if (item.category?.id || item.categoryId) {
          setCategory(item.category?.id || item.categoryId);
        }
        if (item.writer) {
          setGuestWriterName(item.writer);
        }
        if (Array.isArray(item.tags)) {
          setTagTopic(item.tags.join(", "));
        } else if (typeof item.tagsString === "string") {
          setTagTopic(item.tagsString);
        }
        const img =
          typeof item.featuredImage === "string"
            ? item.featuredImage
            : item.featuredImage?.url;
        if (img) {
          setPreviewImage(img);
        }
        if (item.imageCaption) {
          setImageCaption(item.imageCaption);
        }
        if (typeof item.isBreaking === "boolean") {
          setIsNewsTicker(item.isBreaking);
        }
        if (typeof item.isFeatured === "boolean") {
          setIsSpotlight(item.isFeatured);
        }
        showToast("✨ অটো নিউজ থেকে সংবাদের তথ্য সফলভাবে ইম্পোর্ট হয়েছে!");
      }
    } catch { }
  }, []);

  const handleFetchAutoNews = async () => {
    if (!autoNewsUrl.trim()) return;
    setIsFetchingAutoNews(true);
    try {
      const endpoint = `/news/fetch-external?url=${encodeURIComponent(autoNewsUrl.trim())}`;
      let data: any = await api.get<any>(endpoint);

      if (!data?.success) {
        try {
          const directUrl = `http://localhost:5001/api/v1/news/fetch-external?url=${encodeURIComponent(autoNewsUrl.trim())}`;
          const res = await fetch(directUrl);
          if (res.ok) {
            data = await res.json();
          }
        } catch { }
      }

      if (data?.success && data?.data) {
        const item = data.data;
        if (item.title) setTitle(item.title);
        if (item.subtitle || item.summary)
          setSubtitle(item.subtitle || item.summary || "");
        if (item.content) {
          setContent(item.content);
          if (editorRef.current) {
            editorRef.current.innerHTML = item.content;
          }
        }
        if (item.category?.id || item.categoryId) {
          setCategory(item.category?.id || item.categoryId);
        }
        if (item.writer) {
          setGuestWriterName(item.writer);
        }
        if (Array.isArray(item.tags)) {
          setTagTopic(item.tags.join(", "));
        } else if (typeof item.tagsString === "string") {
          setTagTopic(item.tagsString);
        }
        let img =
          typeof item.featuredImage === "string"
            ? item.featuredImage
            : item.featuredImage?.url;

        // Auto fallback if image is missing or has /null
        if (!img || img.includes("/null") || img.includes("undefined")) {
          try {
            const imgRes = await fetch(
              `/api/extract-image?url=${encodeURIComponent(autoNewsUrl.trim())}`
            );
            const imgData = await imgRes.json();
            if (imgData.success && imgData.imageUrl) {
              img = imgData.imageUrl;
            }
          } catch { }
        }

        if (img && !img.includes("/null")) {
          setPreviewImage(img);
        }
        if (item.imageCaption) {
          setImageCaption(item.imageCaption);
        }
        showToast("✨ সংবাদের তথ্য ও ছবি সফলভাবে ইম্পোর্ট করা হয়েছে!");
        setAutoNewsUrl("");
      } else {
        showToast(
          data?.message || "সংবাদ সংগ্রহ করা যায়নি। লিংকটি সঠিক কিনা দেখুন।"
        );
      }
    } catch (e) {
      showToast("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।");
    } finally {
      setIsFetchingAutoNews(false);
    }
  };

  // Filtered districts based on selected division
  const availableDistricts = selectedDivision
    ? getDistrictsByDivision(selectedDivision)
    : DISTRICTS;

  // Filtered upazilas based on selected district
  const availableUpazilas = selectedDistrict
    ? getUpazilasByDistrict(selectedDistrict)
    : [];

  // Handle Division Change
  const handleDivisionChange = (divisionId: string) => {
    setSelectedDivision(divisionId);
    // If current district doesn't belong to this division, reset district and upazila
    if (selectedDistrict) {
      const parentDiv = getDivisionByDistrictId(selectedDistrict);
      if (parentDiv !== divisionId) {
        setSelectedDistrict("");
        setSelectedUpazila("");
      }
    }
  };

  // Handle District Change
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedUpazila(""); // Reset upazila on district change

    // If division wasn't selected, auto-select corresponding division
    if (districtId) {
      const parentDiv = getDivisionByDistrictId(districtId);
      if (parentDiv && parentDiv !== selectedDivision) {
        setSelectedDivision(parentDiv);
      }
    }
  };

  // Sub Category Toggle
  const toggleSubCategory = (subCat: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCat)
        ? prev.filter((item) => item !== subCat)
        : [...prev, subCat]
    );
  };

  // AI News Generator Simulation
  const handleGenerateAiNews = () => {
    if (!aiPrompt.trim()) {
      alert("অনুগ্রহ করে একটি নিউজের বিষয় বা প্রম্পট লিখুন");
      return;
    }

    setIsGeneratingAi(true);

    setTimeout(() => {
      const promptLower = aiPrompt.toLowerCase();
      let genTitle = "";
      let genSubtitle = "";
      let genContent = "";
      let genCategory = "জাতীয়";

      if (promptLower.includes("মেট্রোরেল") || promptLower.includes("metro")) {
        genTitle = "ঢাকায় নতুন মেট্রোরেল রুটের উদ্বোধন: স্বস্তির নিঃশ্বাস নগরবাসীর";
        genSubtitle = "যানজট নিরসনে নতুন মাইলফলক, প্রতিদিন অতিরিক্ত দুই লাখ যাত্রী যাতায়াত করতে পারবেন";
        genContent = `রাজধানী ঢাকার যোগাযোগ ব্যবস্থায় আরেকটি নতুন মাইলফলক রচিত হলো। আজ সকালে আনুষ্ঠানিকভাবে নতুন মেট্রোরেল সম্প্রসারিত রুটের শুভ উদ্বোধন ঘোষণা করা হয়।\n\nউদ্বোধনী অনুষ্ঠানে সংশ্লিষ্ট কর্তৃপক্ষ জানান, নতুন এই রুটে অত্যাধুনিক বিদ্যুৎ সাশ্রয়ী ট্রেন চলাচল করবে। এর ফলে ফার্মগেট, মতিঝিল ও মিরপুরের মধ্যকার যানজট সহনীয় মাত্রায় নেমে আসবে এবং কর্মজীবী মানুষের মূল্যবান কর্মঘণ্টা সাশ্রয় হবে।\n\nপ্রথম দিনেই স্টেশনগুলোতে উপচে পড়া ভিড় লক্ষ্য করা গেছে। যাত্রীরা দ্রুতগতির ও স্বস্তিদায়ক এই যাতায়াত ব্যবস্থায় দারুণ উচ্ছ্বাস প্রকাশ করেছেন।`;
        genCategory = "রাজধানী";
      } else if (promptLower.includes("বাংলাদেশ") || promptLower.includes("ম্যাচ") || promptLower.includes("খেলা")) {
        genTitle = "শ্বাসরুদ্ধকর লড়াইয়ে শেষ ওভারে বাংলাদেশের রোমাঞ্চকর জয়";
        genSubtitle = "ব্যাটারদের দৃঢ়তা ও শেষ ওভারে দুর্দান্ত বোলিংয়ে জয় ছিনিয়ে নিল টাইগাররা";
        genContent = `শেষ ওভারের নাটকীয়তায় শ্বাসরুদ্ধকর জয় পেল বাংলাদেশ দল। টানটান উত্তেজনার ম্যাচে প্রতিপক্ষকে হারিয়ে মাঠ ছাড়ল টাইগাররা।\n\nম্যাচের শুরুতে টসে জিতে ব্যাট করতে নেমে নির্ধারিত ২০ ওভারে লড়াই করার মতো পুঁজি গড়ে দল। মিডল অর্ডারের দায়িত্বশীল ইনিংস ম্যাচের ভিত্তি গড়ে দেয়।\n\nশেষ ওভারে প্রতিপক্ষের প্রয়োজন ছিল ১২ রান। দুর্দান্ত ইয়র্কার ও নিখুঁত লাইন-লেন্থে মাত্র ৪ রান দিয়ে জয় নিশ্চিত করেন বোলাররা। এই অবিস্মরণীয় জয়ে সারা দেশে ক্রীড়াপ্রেমীদের মধ্যে আনন্দ উল্লাস ছড়িয়ে পড়েছে।`;
        genCategory = "খেলাধুla";
      } else {
        genTitle = `${aiPrompt}: বিস্তারিত সংবাদ ও পটভূমি`;
        genSubtitle = "ঘটনাস্থল থেকে প্রাপ্ত সর্বশেষ তথ্য ও সার্বিক পরিস্থিতির বিশ্লেষণ";
        genContent = `${aiPrompt} সংক্রান্ত বিষয়ে সংশ্লিষ্ট মহলে ব্যাপক আলোচনা চলছে। আজ সকালে প্রাপ্ত সর্বশেষ তথ্যানুযায়ী, বিষয়টির সুষ্ঠু সমাধানে উচ্চপর্যায়ের একটি টিম কাজ করছে।\n\nস্থানীয় প্রতিনিধিরা জানান, সাধারণ মানুষের মাঝে এটি নিয়ে ইতিবাচক সাড়া দেখা গেছে। প্রশাসন সার্বক্ষণিক পরিস্থিতি পর্যবেক্ষণ করছে এবং যেকোনো বিভ্রান্তিকর তথ্য রোধে সতর্ক থাকার পরামর্শ দেওয়া হয়েছে।\n\nঅনলাইন ও মাঠ পর্যায়ে আমাদের নিজস্ব প্রতিনিধি দল সার্বিক ঘটনার ওপর নিবিড় নজর রাখছে। পরবর্তী বুলেটিনে আরো বিস্তারিত তুলে ধরা হবে।`;
      }

      setTitle(genTitle);
      setSubtitle(genSubtitle);
      setContent(genContent);
      setCategory(genCategory);
      setTagTopic(aiPrompt.slice(0, 30));
      setSelectedWriter("writer-1"); // Default to Editor & Publisher
      setIsGeneratingAi(false);

      showToast("✨ এআই সফলভাবে নিউজ তৈরি করেছে!");
    }, 900);
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Content formatting helper
  const formatContentToHtml = (text: string) => {
    if (!text.trim()) return "<p>কোনো বিস্তারিত নেই।</p>";
    // Strip background colors that users copy-paste from other portals
    const cleanText = text
      .replace(/background-color\s*:\s*[^;"]+;?/gi, "")
      .replace(/background\s*:\s*[^;"]+;?/gi, "");
    if (cleanText.includes("<p>") || cleanText.includes("<div>") || cleanText.includes("<h")) {
      return cleanText;
    }
    return cleanText
      .split(/\n\s*\n/)
      .map((para) => `<p>${para.replace(/\n/g, "<br/>").trim()}</p>`)
      .join("");
  };

  // Form Submit
  const resetAllFields = () => {
    setTitle("");
    setSubtitle("");
    setContent("");
    setAiPrompt("");
    setYoutubeLink("");
    setAttachedFileName("");
    setSelectedAttachedFile(null);
    setSelectedImageFile(null);
    setPreviewImage(null);
    setImageCaption("");
    setTagTopic("");
    setSelectedSubCategories([]);
    setSelectedDivision("");
    setSelectedDistrict("");
    setSelectedUpazila("");
    setGuestWriterName("");
    setGuestWriterDesignation("");
    setSelectedWriter("newsroom");
    setIsLeadNews(false);
    setIsNewsTicker(false);
    setIsSpotlight(false);
    setIsSliderNews(false);
    setPublishStatus("Published");
    setPublishDate(getCurrentLocalDateTimeString());
    setIsManualDate(false);

    // Clear rich text editor contentEditable DOM
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    // Clear raw file input elements
    if (imageUploadRef.current) {
      imageUploadRef.current.value = "";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Reset category to primary
    if (dbCategories.length > 0) {
      setCategory(dbCategories[0].id);
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("অনুগ্রহ করে আর্টিকেলের শিরোনাম (Article Title) দিন।");
      return;
    }

    setIsSubmitting(true);
    setCreatedArticle(null);

    try {
      // 1. Upload Featured Image to Cloudinary if a local file was selected
      let finalImageUrl: string = "";
      if (selectedImageFile) {
        setIsUploadingMedia(true);
        const formData = new FormData();
        formData.append("image", selectedImageFile);
        const uploadRes = await api.upload<any>("/files/upload-single", formData);
        if (uploadRes?.success && uploadRes.data) {
          finalImageUrl = resolveImageUrlString(uploadRes.data);
        }
      } else if (previewImage && !previewImage.startsWith("blob:")) {
        finalImageUrl = resolveImageUrlString(previewImage);
      }

      // If no separate image uploaded, auto-extract real uploaded image from editor content
      if (!finalImageUrl && content) {
        const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          finalImageUrl = resolveImageUrlString(imgMatch[1]);
        }
      }

      // Ensure featuredImage is guaranteed to be a string URL (never object or null)
      const DEFAULT_FEATURED_IMAGE = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167";
      const guaranteedFeaturedImage: string =
        resolveImageUrlString(finalImageUrl) ||
        (previewImage && !previewImage.startsWith("blob:") ? resolveImageUrlString(previewImage) : "") ||
        DEFAULT_FEATURED_IMAGE;

      // 2. Upload Attached File to Cloudinary if attached
      let finalAttachUrl: string | undefined = undefined;
      if (selectedAttachedFile) {
        const attachFormData = new FormData();
        attachFormData.append("image", selectedAttachedFile);
        const attachRes = await api.upload<any>("/files/upload-single", attachFormData);
        if (attachRes?.success && attachRes.data) {
          const resolved = resolveImageUrlString(attachRes.data);
          if (resolved) finalAttachUrl = resolved;
        }
      }

      // 3. Resolve Category to valid 24-char hex MongoDB ID
      const isMongoId = (val?: string) => Boolean(val && /^[0-9a-fA-F]{24}$/.test(val));
      let categoryId = "";

      if (category) {
        const found = dbCategories.find(
          (c) => c.id === category || c.slug === category || c.name === category
        );
        if (found && isMongoId(found.id)) {
          categoryId = found.id;
        } else if (isMongoId(category)) {
          categoryId = category;
        }
      }

      if (!categoryId) {
        const defaultCat = dbCategories.find((c) => isMongoId(c.id));
        if (defaultCat) {
          categoryId = defaultCat.id;
        } else {
          categoryId = "6adf06b6edbce197278ace6b"; // Default "জাতীয়" category
        }
      }

      // 4. Resolve Writer
      let validWriterId: string | undefined = undefined;
      if (selectedWriter && isMongoId(selectedWriter)) {
        validWriterId = selectedWriter;
      } else if (!guestWriterName.trim() && dbWriters.length > 0) {
        const defaultWriter = dbWriters.find((w) => isMongoId(w.id));
        if (defaultWriter) {
          validWriterId = defaultWriter.id;
        }
      }

      // 5. Locations
      const divObj = DIVISIONS.find((d) => d.id === selectedDivision);
      const distObj = DISTRICTS.find((d) => d.id === selectedDistrict);
      const upzObj = availableUpazilas.find((u) => u.id === selectedUpazila);

      const divisionName = divObj?.name || divObj?.bnName || selectedDivision || undefined;
      const districtName = distObj?.name || distObj?.bnName || selectedDistrict || undefined;
      const upazilaName = upzObj?.name || upzObj?.bnName || selectedUpazila || undefined;

      // 6. Tags
      const tagsList = [
        ...(tagTopic ? tagTopic.split(",").map((t) => t.trim()).filter(Boolean) : []),
        ...selectedSubCategories,
      ];

      const formattedContent = formatContentToHtml(content || title);
      const finalSummary = subtitle.trim() ? subtitle.trim() : undefined;

      const selectedCatObj = dbCategories.find(
        (c) => c.id === category || c.slug === category || c.name === category
      );
      let catSlugOrName = selectedCatObj?.slug || selectedCatObj?.name || category || "national";
      if (
        catSlugOrName === "gram-gonjo" ||
        catSlugOrName === "gramgonj" ||
        catSlugOrName === "গ্রামগঞ্জ" ||
        catSlugOrName === "durghotona" ||
        categoryId === "6ae1d5cf586845309f505418"
      ) {
        catSlugOrName = "accident";
        categoryId = "6ae1d5cf586845309f505418";
      }

      let customDateIso: string | undefined = undefined;
      if (isManualDate && publishDate.trim()) {
        try {
          const parsed = new Date(publishDate.trim());
          if (!isNaN(parsed.getTime())) {
            customDateIso = parsed.toISOString();
          }
        } catch { }
      } else {
        // Real-time automatic detection: takes the exact second of publication
        customDateIso = new Date().toISOString();
      }

      const payload = {
        title: title.trim(),
        titleEn: title.trim(),
        subtitle: subtitle.trim() || undefined,
        subtitleEn: subtitle.trim() || undefined,
        content: formattedContent,
        contentEn: formattedContent,
        summary: finalSummary,
        summaryEn: finalSummary,
        category: catSlugOrName,
        categoryId: categoryId || undefined,
        writerId: validWriterId || undefined,
        guestWriterName: guestWriterName.trim() || "Newsroom",
        guestWriterDesignation: guestWriterDesignation.trim() || "নিজস্ব প্রতিবেদক",
        featuredImage: guaranteedFeaturedImage,
        imageCaption: imageCaption.trim() || undefined,
        photoCredit: "সংগৃহীত",
        youtubeLink: youtubeLink.trim() || undefined,
        attachFile: finalAttachUrl,
        division: divisionName,
        district: districtName,
        upazila: upazilaName,
        tags: tagsList,
        status: publishStatus === "Draft" ? "DRAFT" : "PUBLISHED",
        publishStatus: publishStatus === "Draft" ? "DRAFT" : "PUBLISHED",
        isLead: isLeadNews,
        isBreaking: isNewsTicker,
        isFeatured: isSpotlight,
        isSlider: isSliderNews,
        publishedDate: customDateIso,
        publishedAt: customDateIso,
        createdAt: customDateIso,
      };

      if (editId) {
        const res = await api.patch(`/news/${editId}`, payload);
        if (res?.success) {
          broadcastNewsUpdate();
          showToast("🎉 আর্টিকেল সফলভাবে আপডেট করা হয়েছে!");
          setTimeout(() => {
            router.push("/admin/articles");
          }, 1200);
          return;
        } else {
          const errorMsg = res?.message || "আপডেট করতে সমস্যা হয়েছে";
          showToast(`❌ ${errorMsg}`);
          return;
        }
      }

      const res = await api.post("/news", payload);

      if (res?.success && res.data) {
        broadcastNewsUpdate();
        showToast("🎉 নতুন নিউজ সফলভাবে ব্যাকএন্ডে প্রকাশিত হয়েছে এবং ওয়েবসাইটে লাইভ আপলোড হয়েছে!");
        const savedImg = guaranteedFeaturedImage || previewImage || "/images/news-placeholder.svg";
        setCreatedArticle({
          id: res.data.id || res.data._id,
          slug: res.data.slug || String(res.data.id),
          title: res.data.title || title.trim(),
          imageUrl: savedImg,
        });

        // Completely reset all fields and rich text editor for the next article
        resetAllFields();
      } else {
        const errorMsg = res?.message || "পোস্ট করতে সমস্যা হয়েছে, অনুগ্রহ করে পুনরায় চেষ্টা করুন";
        showToast(`❌ ${errorMsg}`);
      }
    } catch (err: any) {
      console.error("Error creating news post:", err);
      showToast("❌ পোস্ট আপলোড করতে ত্রুটি হয়েছে");
    } finally {
      setIsSubmitting(false);
      setIsUploadingMedia(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] text-[#1E293B] flex flex-col font-sans">
      {/* Top Navbar */}
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Container: Sidebar + Editor */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} activePath="/admin/new-article" />

        {/* Content Area */}
        <main className="flex-1 w-full p-3 sm:px-5 sm:py-4 lg:px-6 lg:py-4 min-w-0 flex flex-col justify-between">
          <div>
            {/* Top Header Row: New Article + All Article button */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-[21px] sm:text-[23px] font-bold text-[#0A2540] tracking-tight">
                {editId ? "Edit Article" : "New Article"}
              </h1>

              <Link
                href="/admin/articles"
                className="bg-[#1677FF] hover:bg-blue-600 text-white text-[13px] font-medium px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LayoutGrid className="w-4 h-4 stroke-[2]" />
                <span>All Articles</span>
              </Link>
            </div>

            {/* Auto News Scraper Link Importer Box */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A2540] text-white rounded-xl border border-[#334155] shadow-xs p-4 sm:p-5 mb-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <h2 className="text-[14.5px] font-bold text-white">
                    অটো নিউজ ইম্পোর্ট (Auto Fetch from Link)
                  </h2>
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    ১-ক্লিক স্ক্র্যাপার
                  </span>
                </div>
              </div>

              <p className="text-[12px] text-gray-300 mb-3">
                প্রথম আলো, ডেইলি স্টার, যুগান্তর বা যেকোনো সাইটের সংবাদের লিংক পেস্ট করে "তথ্য আনুন"-এ চাপ দিলে সম্পূর্ণ ফর্ম ও ছবি স্বয়ংক্রিয়ভাবে পূরণ হয়ে যাবে।
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="url"
                  value={autoNewsUrl}
                  onChange={(e) => setAutoNewsUrl(e.target.value)}
                  placeholder="সংবাদের লিংক পেস্ট করুন (যেমন: https://www.prothomalo.com/...)"
                  className="flex-1 w-full text-[13px] px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={handleFetchAutoNews}
                  disabled={isFetchingAutoNews || !autoNewsUrl.trim()}
                  className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white text-[12.5px] font-bold px-5 py-2.5 rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isFetchingAutoNews ? "সংগ্রহ হচ্ছে..." : "তথ্য আনুন"}</span>
                </button>
              </div>
            </div>

            {/* AI News Writer Box */}
            <div className="bg-white rounded-xl border border-[#D5E1F5] shadow-xs p-4 sm:p-5 mb-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#6941C6]/10 flex items-center justify-center text-[#6941C6]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-[14.5px] font-bold text-[#1E293B]">
                    AI News Writer
                  </h2>
                  <span className="bg-[#7C3AED] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Gemini
                  </span>
                </div>

                <button
                  type="button"
                  title="AI Writer Settings"
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                <label className="block text-[12.5px] font-medium text-[#475569]">
                  News Topic / Prompt
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={2}
                  placeholder="যেমন: বাংলাদেশ বনাম ভারত ম্যাচে বাংলাদেশের জয় / ঢাকায় নতুন মেট্রোরেল উদ্বোধন"
                  className="w-full text-[13px] px-3.5 py-2.5 border border-[#CBD5E1] rounded-md outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] text-[#1E293B] placeholder:text-[#94A3B8] resize-y transition-colors"
                />

                <div>
                  <button
                    type="button"
                    onClick={handleGenerateAiNews}
                    disabled={isGeneratingAi}
                    className="bg-[#1677FF] hover:bg-blue-600 disabled:bg-blue-300 text-white text-[12.5px] font-semibold px-4 py-2 rounded-md flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {isGeneratingAi ? "নিউজ তৈরি হচ্ছে..." : "Generate News"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Success Card with Live Link */}
            {createdArticle && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">
                      নিউজটি সফলভাবে লাইভ প্রকাশিত হয়েছে!
                    </h3>
                    <p className="text-xs text-emerald-700 font-medium">
                      {createdArticle.title}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedArticle(null);
                      resetAllFields();
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#1677FF] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>নতুন আর্টিকেল লিখুন</span>
                  </button>

                  <Link
                    href={`/news/${createdArticle.slug}`}
                    target="_blank"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    <span>ওয়েবসাইটে দেখুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsPhotoCardOpen(true)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>ফটোকার্ড ডাউনলোড</span>
                  </button>

                  <Link
                    href="/admin/articles"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg transition-colors border border-emerald-300"
                  >
                    <span>আর্টিকেল তালিকা</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setCreatedArticle(null)}
                    className="p-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Main Article Form */}
            <form onSubmit={handleAddPost}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* LEFT COLUMN (8 cols): Title, Content, Rich Editor, Location, Writer */}
                <div className="lg:col-span-8 flex flex-col gap-4.5 bg-white p-4.5 sm:p-5.5 rounded-xl border border-[#D5E1F5] shadow-xs">
                  {/* Article Title */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                      Article Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Article Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-[13.5px] px-3.5 py-2 border border-[#CBD5E1] rounded-md outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] text-[#1E293B] placeholder:text-[#94A3B8]"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      placeholder="Article Subtitle"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full text-[13.5px] px-3.5 py-2 border border-[#CBD5E1] rounded-md outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] text-[#1E293B] placeholder:text-[#94A3B8]"
                    />
                  </div>

                  {/* Article Content with Editor Toolbar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[13px] font-medium text-[#334155]">
                        Article Content <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        className="bg-[#4B5563] hover:bg-[#374151] text-white text-[11px] font-medium px-2.5 py-1 rounded transition-colors cursor-pointer"
                      >
                        Recent Article
                      </button>
                    </div>

                    {/* Editor Toolbar & Content Container */}
                    <div className="border border-[#CBD5E1] rounded-md overflow-hidden focus-within:border-[#1677FF] transition-colors bg-white shadow-2xs">
                      {/* Hidden Color Picker */}
                      <input
                        ref={editorColorInputRef}
                        type="color"
                        className="hidden"
                        onChange={(e) => {
                          execCmd("foreColor", e.target.value);
                          setActiveModal(null);
                        }}
                      />

                      {/* Toolbar Icons Row */}
                      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-2 flex flex-wrap items-center gap-1.5 text-[#475569] select-none">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("bold")}
                          title="Bold (Ctrl+B)"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeFormats.bold ? "bg-[#CBD5E1] text-[#0A2540] font-bold" : "hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                            }`}
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("italic")}
                          title="Italic (Ctrl+I)"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeFormats.italic ? "bg-[#CBD5E1] text-[#0A2540] font-bold" : "hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                            }`}
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("underline")}
                          title="Underline (Ctrl+U)"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeFormats.underline ? "bg-[#CBD5E1] text-[#0A2540] font-bold" : "hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                            }`}
                        >
                          <Underline className="w-4 h-4" />
                        </button>

                        <div className="w-[1px] h-4 bg-[#CBD5E1] mx-0.5" />

                        {/* Font Size Selector (Word-style 8-72px) */}
                        <div className="flex items-center gap-1 bg-white border border-[#CBD5E1] rounded px-1.5 py-0.5 shadow-2xs hover:border-[#94A3B8] transition-colors">
                          <Type className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <select
                            value={currentFontSize}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                setCurrentFontSize(val);
                                applyFontSize(val);
                              }
                            }}
                            onMouseDown={() => saveSelection()}
                            className="text-xs bg-transparent border-none text-[#1E293B] font-medium focus:outline-none cursor-pointer pr-0.5"
                            title="ফন্ট সাইজ (Font Size: 8-72px)"
                          >
                            <option value="" disabled>সাইজ</option>
                            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72].map((sz) => (
                              <option key={sz} value={sz}>
                                {sz}px
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Font Size Increase (A+) & Decrease (A-) */}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => stepFontSize(2)}
                          title="ফন্ট বড় করুন (A+ / Grow Font)"
                          className="px-1.5 py-1 hover:bg-[#E2E8F0] active:bg-[#CBD5E1] rounded cursor-pointer transition-colors font-bold text-xs flex items-center gap-0.5 text-[#1E293B]"
                        >
                          <span className="text-xs font-bold leading-none">A</span>
                          <span className="text-[10px] text-emerald-600 font-extrabold leading-none">+</span>
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => stepFontSize(-2)}
                          title="ফন্ট ছোট করুন (A- / Shrink Font)"
                          className="px-1.5 py-1 hover:bg-[#E2E8F0] active:bg-[#CBD5E1] rounded cursor-pointer transition-colors font-bold text-xs flex items-center gap-0.5 text-[#1E293B]"
                        >
                          <span className="text-xs font-bold leading-none">A</span>
                          <span className="text-[10px] text-red-600 font-extrabold leading-none">-</span>
                        </button>

                        <div className="w-[1px] h-4 bg-[#CBD5E1] mx-0.5" />

                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("justifyLeft")}
                          title="Align Left"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeFormats.justifyLeft ? "bg-[#CBD5E1] text-[#0A2540]" : "hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                            }`}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("justifyCenter")}
                          title="Align Center"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeFormats.justifyCenter ? "bg-[#CBD5E1] text-[#0A2540]" : "hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                            }`}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("justifyRight")}
                          title="Align Right"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeFormats.justifyRight ? "bg-[#CBD5E1] text-[#0A2540]" : "hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                            }`}
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("justifyFull")}
                          title="Align Justify"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeFormats.justifyFull ? "bg-[#CBD5E1] text-[#0A2540]" : "hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                            }`}
                        >
                          <AlignJustify className="w-4 h-4" />
                        </button>

                        <div className="w-[1px] h-4 bg-[#CBD5E1] mx-0.5" />

                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("insertOrderedList")}
                          title="Numbered List"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeFormats.insertOrderedList ? "bg-[#CBD5E1] text-[#0A2540]" : "hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                            }`}
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("insertUnorderedList")}
                          title="Bulleted List"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeFormats.insertUnorderedList ? "bg-[#CBD5E1] text-[#0A2540]" : "hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                            }`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("formatBlock", "<h2>")}
                          title="Heading (H2)"
                          className="p-1.5 hover:bg-[#E2E8F0] active:bg-[#CBD5E1] rounded cursor-pointer transition-colors font-bold text-xs"
                        >
                          <Heading2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setActiveModal(activeModal === "color" ? null : "color")}
                          title="Text Color (ফন্ট রং)"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeModal === "color" ? "bg-[#CBD5E1] text-[#1677FF]" : "hover:bg-[#E2E8F0]"
                            }`}
                        >
                          <Palette className="w-4 h-4" />
                        </button>

                        <div className="w-[1px] h-4 bg-[#CBD5E1] mx-0.5" />

                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleOpenImageModal}
                          title="Insert Image (ছবি যুক্ত করুন)"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeModal === "image" ? "bg-[#CBD5E1] text-[#1677FF]" : "hover:bg-[#E2E8F0]"
                            }`}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleOpenFileModal}
                          title="Insert File / Document (ফাইল যুক্ত করুন)"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeModal === "file" ? "bg-[#CBD5E1] text-[#1677FF]" : "hover:bg-[#E2E8F0]"
                            }`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleOpenVideoModal}
                          title="Insert Video (ভিডিও যোগ করুন)"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeModal === "video" ? "bg-[#CBD5E1] text-[#1677FF]" : "hover:bg-[#E2E8F0]"
                            }`}
                        >
                          <Video className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleOpenLinkModal}
                          title="Insert Link (লিংক যোগ করুন)"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${activeModal === "link" ? "bg-[#CBD5E1] text-[#1677FF]" : "hover:bg-[#E2E8F0]"
                            }`}
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleInsertTable}
                          title="Insert Table (টেবিল তৈরি করুন)"
                          className="p-1.5 hover:bg-[#E2E8F0] active:bg-[#CBD5E1] rounded cursor-pointer transition-colors"
                        >
                          <Table className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("undo")}
                          title="Undo (পূর্বাবস্থায় ফিরুন)"
                          className="p-1.5 hover:bg-[#E2E8F0] active:bg-[#CBD5E1] rounded cursor-pointer transition-colors"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("redo")}
                          title="Redo (পরের অবস্থায় যান)"
                          className="p-1.5 hover:bg-[#E2E8F0] active:bg-[#CBD5E1] rounded cursor-pointer transition-colors"
                        >
                          <Redo2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execCmd("removeFormat")}
                          title="Clear Formatting (ফরম্যাট মুছুন)"
                          className="p-1.5 hover:bg-[#E2E8F0] active:bg-[#CBD5E1] rounded cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            if (!isHtmlMode && editorRef.current) {
                              setContent(editorRef.current.innerHTML);
                            }
                            setIsHtmlMode((prev) => !prev);
                          }}
                          title="HTML Source Code (কোড ভিউ)"
                          className={`p-1.5 rounded cursor-pointer transition-colors ${isHtmlMode
                              ? "bg-[#EEF2FF] text-[#1677FF] font-bold border border-[#1677FF]/40"
                              : "hover:bg-[#E2E8F0]"
                            }`}
                        >
                          <Code className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Inline Modals/Popovers Container */}
                      {activeModal === "color" && (
                        <div className="bg-[#F1F5F9] border-b border-[#E2E8F0] p-2.5 flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#475569]">রং নির্বাচন করুন:</span>
                          <div className="flex items-center gap-1.5">
                            {[
                              { label: "কালো", color: "#1E293B" },
                              { label: "নীল", color: "#0756A4" },
                              { label: "লাল", color: "#DC2626" },
                              { label: "সবুজ", color: "#16A34A" },
                              { label: "বেগুনী", color: "#7C3AED" },
                              { label: "কমলা", color: "#D97706" },
                            ].map((c) => (
                              <button
                                key={c.color}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  execCmd("foreColor", c.color);
                                  setActiveModal(null);
                                }}
                                title={c.label}
                                className="w-5 h-5 rounded-full border border-gray-300 cursor-pointer shadow-2xs hover:scale-110 transition-transform"
                                style={{ backgroundColor: c.color }}
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => editorColorInputRef.current?.click()}
                            className="text-xs text-[#1677FF] hover:underline font-medium ml-1 cursor-pointer"
                          >
                            কাস্টম রং...
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="ml-auto text-xs text-gray-500 hover:text-gray-800"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {activeModal === "link" && (
                        <div className="bg-[#F1F5F9] border-b border-[#E2E8F0] p-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-[#334155]">লিংক যুক্ত করুন:</span>
                          <input
                            type="text"
                            placeholder="URL (যেমন: https://example.com)"
                            value={modalLinkUrl}
                            onChange={(e) => setModalLinkUrl(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded text-[#1E293B] outline-none flex-1 min-w-[180px]"
                            autoFocus
                          />
                          <input
                            type="text"
                            placeholder="লিংকের টেক্সট (ঐচ্ছিক)"
                            value={modalLinkText}
                            onChange={(e) => setModalLinkText(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded text-[#1E293B] outline-none w-36"
                          />
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleApplyLink}
                            className="px-3 py-1.5 bg-[#1677FF] hover:bg-[#0052CC] text-white font-medium rounded transition-colors"
                          >
                            যোগ করুন
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="px-2 py-1.5 text-gray-500 hover:text-gray-700"
                          >
                            বাতিল
                          </button>
                        </div>
                      )}

                      {activeModal === "image" && (
                        <div className="bg-[#F1F5F9] border-b border-[#E2E8F0] p-3 flex flex-col gap-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#334155]">নিউজ আর্টিকেলে ছবি যোগ করুন:</span>
                            <button
                              type="button"
                              onClick={() => setActiveModal(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                            <div className="border-r border-[#CBD5E1] pr-3">
                              <label className="block text-[11px] text-gray-600 mb-1 font-medium">কম্পিউটার থেকে ছবি আপলোড:</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditorImageFileUpload}
                                disabled={isUploadingEditorImage}
                                className="block w-full text-[11px] file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-[#1677FF] file:text-white file:font-medium hover:file:bg-[#0052CC] cursor-pointer"
                              />
                              {isUploadingEditorImage && (
                                <span className="text-[11px] text-[#1677FF] mt-1 inline-block">ছবি আপলোড হচ্ছে...</span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="block text-[11px] text-gray-600 font-medium">অথবা অনলাইন ইমেজ লিংক দিন:</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder="https://...jpg/png"
                                  value={modalImageUrl}
                                  onChange={(e) => setModalImageUrl(e.target.value)}
                                  className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded text-[#1E293B] outline-none flex-1"
                                />
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={handleApplyImageUrl}
                                  className="px-2.5 py-1.5 bg-[#1677FF] hover:bg-[#0052CC] text-white font-medium rounded transition-colors whitespace-nowrap"
                                >
                                  যুক্ত করুন
                                </button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="ছবির ক্যাপশন (যেমন: ছবি: সংগৃহীত)"
                              value={modalImageCaption}
                              onChange={(e) => setModalImageCaption(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded text-[#1E293B] outline-none text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {activeModal === "video" && (
                        <div className="bg-[#F1F5F9] border-b border-[#E2E8F0] p-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-[#334155]">ইউটিউব ভিডিও যোগ করুন:</span>
                          <input
                            type="text"
                            placeholder="যেমন: https://www.youtube.com/watch?v=..."
                            value={modalVideoUrl}
                            onChange={(e) => setModalVideoUrl(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded text-[#1E293B] outline-none flex-1 min-w-[220px]"
                            autoFocus
                          />
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleApplyVideo}
                            className="px-3 py-1.5 bg-[#1677FF] hover:bg-[#0052CC] text-white font-medium rounded transition-colors"
                          >
                            ভিডিও বসান
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="px-2 py-1.5 text-gray-500 hover:text-gray-700"
                          >
                            বাতিল
                          </button>
                        </div>
                      )}

                      {activeModal === "file" && (
                        <div className="bg-[#F1F5F9] border-b border-[#E2E8F0] p-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-[#334155]">ফাইল/ডকুমেন্ট লিংক:</span>
                          <input
                            type="text"
                            placeholder="ফাইলের URL লিংক"
                            value={modalFileUrl}
                            onChange={(e) => setModalFileUrl(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded text-[#1E293B] outline-none flex-1 min-w-[180px]"
                            autoFocus
                          />
                          <input
                            type="text"
                            placeholder="ফাইলের নাম (যেমন: গেজেট কপি PDF)"
                            value={modalFileText}
                            onChange={(e) => setModalFileText(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded text-[#1E293B] outline-none w-44"
                          />
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleApplyFile}
                            className="px-3 py-1.5 bg-[#1677FF] hover:bg-[#0052CC] text-white font-medium rounded transition-colors"
                          >
                            যুক্ত করুন
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="px-2 py-1.5 text-gray-500 hover:text-gray-700"
                          >
                            বাতিল
                          </button>
                        </div>
                      )}

                      {/* Content Editing Area */}
                      <div className="relative">
                        {isHtmlMode ? (
                          <textarea
                            rows={12}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="HTML সোর্স কোড লিখুন বা সম্পাদনা করুন..."
                            className="w-full p-4 font-mono text-[13px] leading-relaxed text-[#0F172A] bg-[#F8FAFC] outline-none resize-y min-h-[260px] border-none"
                          />
                        ) : (
                          <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={() => {
                              if (editorRef.current) {
                                isInternalChangeRef.current = true;
                                setContent(editorRef.current.innerHTML);
                                saveSelection();
                                updateActiveFormats();
                              }
                            }}
                            onKeyUp={updateActiveFormats}
                            onMouseUp={updateActiveFormats}
                            onSelect={updateActiveFormats}
                            onBlur={() => {
                              if (editorRef.current) {
                                isInternalChangeRef.current = true;
                                setContent(editorRef.current.innerHTML);
                              }
                            }}
                            data-placeholder="সংবাদের বিস্তারিত বিষয়বস্তু এখানে লিখুন..."
                            className="w-full p-4 text-[14px] leading-relaxed text-[#1E293B] outline-none min-h-[260px] max-h-[600px] overflow-y-auto focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-[#94A3B8]"
                          />
                        )}

                        {/* Editor Bottom Status Bar (Undo/Redo & Counts) */}
                        <div className="border-t border-[#E2E8F0] px-3 py-2 flex items-center justify-between text-[#94A3B8] text-xs bg-[#FAFAFA]">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => execCmd("undo")}
                              title="Undo (Ctrl+Z)"
                              className="hover:text-[#475569] p-1 rounded hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => execCmd("redo")}
                              title="Redo (Ctrl+Y)"
                              className="hover:text-[#475569] p-1 rounded hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                            >
                              <Redo2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                            {isHtmlMode ? (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium border border-amber-200">
                                HTML Source Mode
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                                Visual WYSIWYG Mode
                              </span>
                            )}
                            <span>
                              অক্ষর: {content ? content.replace(/<[^>]*>/g, "").length : 0}
                            </span>
                            <span>
                              শব্দ:{" "}
                              {content
                                ? content
                                  .replace(/<[^>]*>/g, "")
                                  .trim()
                                  .split(/\s+/)
                                  .filter(Boolean).length
                                : 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Youtube Link */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                      Youtube Link
                    </label>
                    <input
                      type="text"
                      placeholder="eg. https://www.youtube.com/watch?v=ABCDE"
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                      className="w-full text-[13.5px] px-3.5 py-2 border border-[#CBD5E1] rounded-md outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] text-[#1E293B] placeholder:text-[#94A3B8]"
                    />
                  </div>

                  {/* Attach File */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                      Attach File
                    </label>
                    <div className="flex items-center rounded-md border border-[#CBD5E1] overflow-hidden">
                      <input
                        type="file"
                        id="attach-file-input"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAttachedFileName(file.name);
                            setSelectedAttachedFile(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="attach-file-input"
                        className="flex-1 px-3.5 py-2 text-[13px] text-[#64748B] cursor-pointer truncate"
                      >
                        {attachedFileName || "Select file"}
                      </label>
                      <label
                        htmlFor="attach-file-input"
                        className="bg-[#00875A] hover:bg-[#00704A] text-white p-2.5 cursor-pointer transition-colors flex items-center justify-center shrink-0"
                      >
                        <Upload className="w-4 h-4" />
                      </label>
                    </div>
                  </div>

                  {/* LOCATION SECTION (Division -> District -> Upazila Cascading) */}
                  <div className="pt-2 border-t border-[#F1F5F9]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {/* 1. Article Location (Division) */}
                      <div>
                        <label className="block text-[12.5px] font-semibold text-[#334155] mb-1.5">
                          Article Location (Division)
                        </label>
                        <select
                          value={selectedDivision}
                          onChange={(e) => handleDivisionChange(e.target.value)}
                          className="w-full text-[13px] px-3 py-2 border border-[#CBD5E1] rounded-md bg-white text-[#1E293B] outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] cursor-pointer"
                        >
                          <option value="">Select Division</option>
                          {DIVISIONS.map((div) => (
                            <option key={div.id} value={div.id}>
                              {div.name} - {div.bnName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. District (Filters based on selected division) */}
                      <div>
                        <label className="block text-[12.5px] font-semibold text-[#334155] mb-1.5">
                          District
                        </label>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className="w-full text-[13px] px-3 py-2 border border-[#CBD5E1] rounded-md bg-white text-[#1E293B] outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] cursor-pointer"
                        >
                          <option value="">Select District</option>
                          {availableDistricts.map((dist) => (
                            <option key={dist.id} value={dist.id}>
                              {dist.name} - {dist.bnName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 3. Upazila (Populates after district is selected) */}
                      <div>
                        <label className="block text-[12.5px] font-semibold text-[#334155] mb-1.5">
                          Upazila
                        </label>
                        <select
                          value={selectedUpazila}
                          onChange={(e) => setSelectedUpazila(e.target.value)}
                          disabled={!selectedDistrict || availableUpazilas.length === 0}
                          className="w-full text-[13px] px-3 py-2 border border-[#CBD5E1] rounded-md bg-white disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] text-[#1E293B] outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] cursor-pointer"
                        >
                          <option value="">
                            {!selectedDistrict
                              ? "Select Upazila"
                              : availableUpazilas.length === 0
                                ? "No Upazila found"
                                : "Select Upazila"}
                          </option>
                          {availableUpazilas.map((upz) => (
                            <option key={upz.id} value={upz.id}>
                              {upz.name} - {upz.bnName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* WRITERS SECTION */}
                  <div className="pt-2 border-t border-[#F1F5F9]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Left: Guest Writer info */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[12.5px] font-semibold text-[#334155] mb-1.5">
                            Guest Writer Name
                          </label>
                          <input
                            type="text"
                            placeholder="Writer Name"
                            value={guestWriterName}
                            onChange={(e) => setGuestWriterName(e.target.value)}
                            className="w-full text-[13px] px-3 py-2 border border-[#CBD5E1] rounded-md outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] text-[#1E293B] placeholder:text-[#94A3B8]"
                          />
                        </div>

                        <div>
                          <label className="block text-[12.5px] font-semibold text-[#334155] mb-1.5">
                            Guest Writer Designation
                          </label>
                          <input
                            type="text"
                            placeholder="Writer Designation"
                            value={guestWriterDesignation}
                            onChange={(e) => setGuestWriterDesignation(e.target.value)}
                            className="w-full text-[13px] px-3 py-2 border border-[#CBD5E1] rounded-md outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] text-[#1E293B] placeholder:text-[#94A3B8]"
                          />
                        </div>
                      </div>

                      {/* Right: Article Writer (Newsroom) */}
                      <div>
                        <label className="block text-[12.5px] font-semibold text-[#334155] mb-1.5">
                          Article Writer
                        </label>
                        <select
                          value={selectedWriter || "newsroom"}
                          onChange={(e) => setSelectedWriter(e.target.value)}
                          className="w-full text-[13px] px-3 py-2 border border-[#CBD5E1] rounded-md bg-white text-[#1E293B] outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] cursor-pointer"
                        >
                          <option value="newsroom">Newsroom - নিজস্ব প্রতিবেদক</option>
                        </select>

                        <p className="text-[11.5px] text-[#64748B] mt-2">
                          নিউজ আর্টিকেল প্রকাশের জন্য নির্ধারিত একমাত্র রিপোর্টার/নিউজ রুম।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (4 cols): Category, Subcategories, Toggles, Image, Publish */}
                <div className="lg:col-span-4 flex flex-col gap-4.5 bg-white p-4.5 sm:p-5 rounded-xl border border-[#D5E1F5] shadow-xs">
                  {/* Article Category */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                      Article Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-[13px] px-3 py-2 border border-[#CBD5E1] rounded-md bg-white text-[#1E293B] outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {dbCategories.length > 0
                        ? dbCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                        : [
                          "জাতীয়",
                          "রাজনীতি",
                          "আন্তর্জাতিক",
                          "সারাদেশ",
                          "অপরাধ ও দুর্নীতি",
                          "শিক্ষা",
                          "দুর্ঘটনা",
                          "খেলাধুলা",
                          "বিনোদন",
                          "অর্থনীতি",
                          "প্রযুক্তি",
                          "স্বাস্থ্য",
                          "চাকরি",
                          "মতামত",
                        ].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Article Sub Category */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                      Article Sub Category
                    </label>
                    {SUB_CATEGORIES.length > 0 ? (
                      <div className="border border-[#CBD5E1] rounded-md p-2.5 max-h-[140px] overflow-y-auto space-y-2 bg-[#FAFCFF]">
                        {SUB_CATEGORIES.map((subCat) => (
                          <label
                            key={subCat}
                            className="flex items-center gap-2 text-[12.5px] text-[#334155] hover:text-[#1677FF] cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubCategories.includes(subCat)}
                              onChange={() => toggleSubCategory(subCat)}
                              className="rounded border-[#CBD5E1] text-[#1677FF] focus:ring-[#1677FF] w-3.5 h-3.5 cursor-pointer"
                            />
                            <span>{subCat}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-[#CBD5E1] rounded-md p-3 text-center bg-[#F8FAFC] text-[12px] text-[#94A3B8]">
                        কোনো সাব-ক্যাটাগরি নেই (খালি)
                      </div>
                    )}
                  </div>

                  {/* Tag / Topic */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                      Tag/Topic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. বাজেট ২০২৬, চ্যাম্পিয়ন্স ট্রফি"
                      value={tagTopic}
                      onChange={(e) => setTagTopic(e.target.value)}
                      className="w-full text-[13px] px-3 py-2 border border-[#CBD5E1] rounded-md outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] text-[#1E293B] placeholder:text-[#94A3B8]"
                    />
                  </div>

                  {/* Toggles (ব্রেকিং নিউজ, লিড নিউজ, বিশেষ সংবাদ, স্লাইডার) */}
                  <div className="space-y-3 pt-3 border-t border-[#F1F5F9]">
                    <div className="text-xs font-bold text-[#1E293B] mb-1 flex items-center justify-between">
                      <span>নিউজ হাইলাইট ও পজিশন সেটিংস:</span>
                      <span className="text-[10.5px] font-normal text-gray-500">(ক্লিক করে অন/অফ করুন)</span>
                    </div>

                    {/* ব্রেকিং নিউজ (Breaking News / News Ticker) */}
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-red-50/80 border border-red-200 shadow-2xs">
                      <div>
                        <span className="text-[13px] font-bold text-[#D62828] flex items-center gap-1.5">
                          <Zap className="w-4 h-4 fill-current text-[#D62828]" />
                          <span>ব্রেকিং নিউজ (Breaking News)</span>
                        </span>
                        <p className="text-[11px] text-red-600/80 mt-0.5">
                          অন করলে ওয়েবসাইটের টপ স্ক্রলিং টিকারে তাৎক্ষণিক দেখাবে
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNewsTicker(!isNewsTicker)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${isNewsTicker ? "bg-[#D62828]" : "bg-[#CBD5E1]"
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${isNewsTicker ? "translate-x-5" : ""
                            }`}
                        />
                      </button>
                    </div>

                    {/* প্রধান সংবাদ (Lead News) */}
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-blue-50/80 border border-blue-200 shadow-2xs">
                      <div>
                        <span className="text-[13px] font-bold text-[#0756A4] flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-[#0756A4]" />
                          <span>প্রধান সংবাদ (Lead News)</span>
                        </span>
                        <p className="text-[11px] text-blue-600/80 mt-0.5">
                          হোমপেজের প্রধান বড় লিড স্টোরি হিসেবে শীর্ষে স্থান পাবে
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLeadNews(!isLeadNews)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${isLeadNews ? "bg-[#0756A4]" : "bg-[#CBD5E1]"
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${isLeadNews ? "translate-x-5" : ""
                            }`}
                        />
                      </button>
                    </div>

                    {/* বাংলার আলো নিউজ স্পেশাল (Banglar Alo News Special) */}
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-emerald-50/80 border border-emerald-200 shadow-2xs">
                      <div>
                        <span className="text-[13px] font-bold text-emerald-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#0B7A43] fill-[#0B7A43]/20" />
                          <span>বাংলার আলো নিউজ স্পেশাল</span>
                        </span>
                        <p className="text-[11px] text-emerald-800/80 mt-0.5">
                          হোমপেজের &apos;বাংলার আলো নিউজ স্পেশাল&apos; তালিকায় স্থান পাবে
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSpotlight(!isSpotlight)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${isSpotlight ? "bg-[#087A43]" : "bg-[#CBD5E1]"
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${isSpotlight ? "translate-x-5" : ""
                            }`}
                        />
                      </button>
                    </div>

                    {/* স্লাইডার নিউজ (Slider News) */}
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-emerald-50/80 border border-emerald-200 shadow-2xs">
                      <div>
                        <span className="text-[13px] font-bold text-emerald-900 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-emerald-600" />
                          <span>হোমপেজ স্লাইডার (Slider News)</span>
                        </span>
                        <p className="text-[11px] text-emerald-700/80 mt-0.5">
                          হোমপেজের বড় স্লাইডারে ছবিসহ অটো-ঘূর্ণন করবে
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSliderNews(!isSliderNews)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${isSliderNews ? "bg-emerald-600" : "bg-[#CBD5E1]"
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${isSliderNews ? "translate-x-5" : ""
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Choice Image Box */}
                  <div className="pt-2 border-t border-[#F1F5F9]">
                    <input
                      ref={imageUploadRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    {previewImage ? (
                      <div className="relative rounded-md overflow-hidden border border-[#CBD5E1] group">
                        <img
                          src={previewImage}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-36 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewImage(null)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => imageUploadRef.current?.click()}
                        className="rounded-md border-2 border-dashed border-[#CBD5E1] hover:border-[#1677FF] bg-[#F8FAFC] hover:bg-blue-50/30 transition-all p-6 flex flex-col items-center justify-center cursor-pointer text-center"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-200/70 flex items-center justify-center text-gray-500 mb-2">
                          <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <span className="text-[13px] font-medium text-[#475569]">
                          Choice Image
                        </span>
                        <span className="text-[11px] text-[#94A3B8] mt-0.5">
                          ক্লিক করে ফিচার ছবি আপলোড করুন
                        </span>
                      </div>
                    )}

                    <div className="mt-2.5">
                      <input
                        type="text"
                        placeholder="Image Caption"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        className="w-full text-[12.5px] px-3 py-1.5 border border-[#CBD5E1] rounded-md outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] text-[#1E293B] placeholder:text-[#94A3B8]"
                      />
                    </div>

                    {previewImage && title && (
                      <button
                        type="button"
                        onClick={() => setIsPhotoCardOpen(true)}
                        className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-700" />
                        <span>📸 ফটোকার্ড প্রিভিউ ও ডাউনলোড</span>
                      </button>
                    )}
                  </div>

                  {/* Published Date & Time with Real-Time Auto-Detection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <label className="text-[13px] font-medium text-[#334155] flex items-center gap-1">
                        <span>Published Date & Time</span>
                        <span className="text-red-500">*</span>
                      </label>

                      {isManualDate ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualDate(false);
                            setPublishDate(getCurrentLocalDateTimeString());
                          }}
                          className="text-[11px] text-[#1677FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          title="স্বয়ংক্রিয় লাইভ সময়ে ফিরে যান"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>লাইভ সময়ে ফিরুন</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          অটো লাইভ সময়
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={publishDate}
                        onChange={(e) => {
                          setPublishDate(e.target.value);
                          setIsManualDate(true);
                        }}
                        className={`w-full text-[13px] px-3 py-2 border rounded-md outline-none transition-all font-sans cursor-pointer ${isManualDate
                            ? "border-amber-300 bg-amber-50/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1E293B]"
                            : "border-[#CBD5E1] bg-white focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] text-[#1E293B]"
                          }`}
                        required
                      />
                    </div>

                    <p className="text-[11px] mt-1 leading-tight">
                      {isManualDate ? (
                        <span className="text-amber-700">
                          ✏️ ম্যানুয়াল সময় সেট করা হয়েছে (লাইভ অটো-আপডেট বন্ধ)।
                        </span>
                      ) : (
                        <span className="text-emerald-700">
                          ⏱️ অটো-ডিটেক্ট চলছে; নিউজ লিখতে লিখতে সময় বাড়লে স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Publish Status */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                      Publish Status
                    </label>
                    <select
                      value={publishStatus}
                      onChange={(e) => setPublishStatus(e.target.value)}
                      className="w-full text-[13px] px-3 py-2 border border-[#CBD5E1] rounded-md bg-white text-[#1E293B] outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] cursor-pointer"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#00875A] hover:bg-[#00704A] disabled:opacity-60 text-white text-[13.5px] font-semibold py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>
                            {isUploadingMedia ? "ছবি আপলোড হচ্ছে..." : "পোস্ট আপলোড হচ্ছে..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4" />
                          <span>{editId ? "Update Article" : "Add New Post"}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resetAllFields}
                      className="w-full mt-2 bg-gray-50 hover:bg-gray-100 text-[#475569] text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#CBD5E1]"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                      <span>ফর্ম রিসেট করুন (Clear All)</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <footer className="mt-8 pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Design and Developed by{" "}
            <a
              href="https://banglaraloit.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1677FF] hover:underline"
            >
              Banglar Alo IT
            </a>
          </footer>
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#334155] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Photo Card Generator Modal */}
      <PhotoCardModal
        isOpen={isPhotoCardOpen}
        onClose={() => setIsPhotoCardOpen(false)}
        title={createdArticle ? createdArticle.title : title}
        imageUrl={
          (createdArticle && createdArticle.imageUrl) ||
          previewImage ||
          "/images/news-placeholder.svg"
        }
        dateBengali={(() => {
          try {
            return new Date(publishDate).toLocaleDateString("bn-BD", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          } catch {
            return "আজ";
          }
        })()}
        timeBengali={(() => {
          try {
            return new Date(publishDate).toLocaleTimeString("bn-BD", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          } catch {
            return "";
          }
        })()}
        slug={createdArticle ? createdArticle.slug : editId || ""}
        articleUrl={`https://www.banglaralonews.com/news/${createdArticle ? createdArticle.slug : editId || ""}`}
      />

      {/* Floating Scroll To Top */}
      <ScrollToTop />
    </div>
  );
}

export default function NewArticlePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center text-gray-500 font-sans text-sm">
          এডিটর লোড হচ্ছে...
        </div>
      }
    >
      <NewArticleContent />
    </Suspense>
  );
}
