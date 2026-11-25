# Banglar-Alo-News-Backend (বাংলার আলো নিউজ) - Frontend API Integration Guide

Welcome to the **Banglar-Alo-News-Backend Frontend Implementation Guide**. This document is specially crafted for Frontend Developers (Next.js 14/15/16, React, Vue, React Native) to integrate every feature of Banglar-Alo-News-Backend smoothly with concrete code examples, service wrappers, and UI component snippets.

---

## 1. Architecture, Base URLs & Client Setup

### Base URLs
- **Local Dev Base URL:** `http://localhost:5000/api/v1` (or configured `PORT` in `.env`)
- **Production Base URL:** `https://api.banglaralonews.com/api/v1`
- **Default Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`

### Recommended Axios Client (`services/api.ts`)
Copy and paste this unified Axios client into your frontend project:

```typescript
// services/api.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach JWT Token from localStorage / Cookies
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("banglaralo_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Unified error response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);
```

---

## 2. Next.js App Router Page Mapping

| Page Route | File Path | Primary API Endpoint | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | `GET /news/home` | Full Homepage aggregated layout |
| `/category/[slug]` | `app/category/[slug]/page.tsx` | `GET /news/category/:slug` | Category-wise paginated news (latest first) |
| `/search` | `app/search/page.tsx` | `GET /news/search?q=...` | Dedicated full-text news search |
| `/latest` | `app/latest/page.tsx` | `GET /news/latest` | Global chronological news feed |
| `/news/[slug]` | `app/news/[slug]/page.tsx` | `GET /news/:slug`<br>`GET /news/slug/:slug/audio` | Single article view, Audio TTS player, reactions & comments |
| `/our-family` | `app/our-family/page.tsx` | `GET /teams?status=active` | Editorial & journalists team members |
| `/login` | `app/login/page.tsx` | `POST /auth/login` | User/Staff authentication |
| `/admin/*` | `app/admin/layout.tsx` | `GET /auth/me` | Route Guard for Publisher & Admin panel |
| `/admin/news/create` | `app/admin/news/create/page.tsx` | `POST /news`<br>`GET /news/fetch-external?url=...` | Article Editor with ⚡ Instant Auto Fetch from any news link |
| `/admin/auto-news` | `app/admin/auto-news/page.tsx` | `GET /auto-news/stats`<br>`GET /auto-news/settings`<br>`POST /auto-news/toggle` | News Agent v4 (24/7 Background Autopilot Dashboard) |

---

## 3. Authentication & Admin Route Guard

### 3.1 User Roles & Permissions
Canonical `UserRole` values:
- `Super_Admin` - Full system access, staff management, deletion authority.
- `Admin` - Full operational management.
- `Editor` - Editorial management, publishing drafts, categories.
- `Publisher` - News creation, publish/unpublish, **editing only own articles**.
- `Reporter` - Drafting news, **editing only own drafts**.
- `Reader` - Public reader (reading, like/dislike, commenting).

### 3.2 Login Implementation (`POST /auth/login`)
When a user logs in, the API returns the `accessToken` along with the full `user` profile for immediate client-side state hydration:

```typescript
// services/authService.ts
import { api } from "./api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "Super_Admin" | "Admin" | "Editor" | "Publisher" | "Reporter" | "Reader" | "Customer";
  avatar?: string;
  designation?: string;
  permissions: string[];
}

export const loginUser = async (credentials: { email: string; password: string }) => {
  const { data } = await api.post("/auth/login", credentials);
  const { accessToken, user } = data.data;

  // Persist token and user profile
  localStorage.setItem("banglaralo_token", accessToken);
  localStorage.setItem("banglaralo_user", JSON.stringify(user));

  return { accessToken, user };
};

export const logoutUser = () => {
  localStorage.removeItem("banglaralo_token");
  localStorage.removeItem("banglaralo_user");
  window.location.href = "/login";
};
```

### 3.3 Admin Route Guard (`GET /auth/me`)
In your admin dashboard layout (`app/admin/layout.tsx`), verify the session and check permissions:

```tsx
// app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function verifyAuth() {
      try {
        const { data } = await api.get("/auth/me");
        const user = data.data;

        // Check if user has staff/admin privileges
        const staffRoles = ["Super_Admin", "Admin", "Editor", "Publisher", "Reporter"];
        if (!staffRoles.includes(user.role)) {
          router.replace("/");
          return;
        }

        setCurrentUser(user);
        setLoading(false);
      } catch (err) {
        // Invalid or expired session
        localStorage.removeItem("banglaralo_token");
        router.replace("/login");
      }
    }

    verifyAuth();
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">লোডিং হচ্ছে...</div>;
  }

  return <div className="admin-container">{children}</div>;
}
```

---

## 4. Homepage Aggregated Layout (`GET /news/home`)

Fetch the entire homepage in one single network request for maximum performance:

- **Endpoint:** `GET /news/home`
- **Next.js Implementation (`app/page.tsx`):**

```tsx
// app/page.tsx
import { api } from "@/services/api";

async function getHomepageData() {
  const { data } = await api.get("/news/home", {
    // Revalidate every 60 seconds (ISR)
    headers: { "Cache-Control": "max-age=60" },
  });
  return data.data;
}

export default async function HomePage() {
  const homeData = await getHomepageData();

  const {
    breakingNews,   // Array of breaking news tickers [{ id, title, slug, publishedDate }]
    leadNews,       // Top headline story
    subLeadNews,    // Secondary top stories (Array)
    sliderNews,     // Carousel / hero slider articles
    recentNews,     // Recent articles list
    trendingNews,   // Ranked popular articles with rank: 1..6
    videoNews,      // Video articles with youtubeLink
    categorySections // Grouped news by categories [{ category: { id, name, slug }, news: [...] }]
  } = homeData;

  return (
    <main className="container mx-auto px-4 py-6">
      {/* 1. Breaking News Ticker */}
      {breakingNews?.length > 0 && (
        <section className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-3">
          <span className="font-bold whitespace-nowrap">ব্রেকিং নিউজ:</span>
          <div className="overflow-hidden">
            {breakingNews.map((n: any) => (
              <a key={n.id} href={`/news/${n.slug}`} className="hover:underline mr-8">
                {n.title}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 2. Top Lead Story */}
      {leadNews && (
        <section className="mt-6">
          <a href={`/news/${leadNews.slug}`} className="group">
            <img src={leadNews.featuredImage} alt={leadNews.title} className="w-full h-96 object-cover rounded" />
            <h1 className="text-3xl font-bold mt-3 group-hover:text-blue-600 font-bangla">{leadNews.title}</h1>
            <p className="text-gray-600 mt-2 line-clamp-3">{leadNews.summary}</p>
          </a>
        </section>
      )}

      {/* 3. Category News Sections */}
      {categorySections?.map((section: any) => (
        <section key={section.category.id} className="mt-10">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{section.category.name}</h2>
            <a href={`/category/${section.category.slug}`} className="text-blue-600 hover:underline text-sm font-semibold">
              আরও দেখুন →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {section.news?.map((item: any) => (
              <a key={item.id} href={`/news/${item.slug}`} className="group">
                <img src={item.featuredImage} alt={item.title} className="w-full h-48 object-cover rounded" />
                <h3 className="font-semibold mt-2 group-hover:text-blue-600 line-clamp-2">{item.title}</h3>
              </a>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
```

---

## 5. Category-wise Dedicated News Pages

The backend supports all 16 canonical categories with **latest news first**:

### The 16 Official Categories & Slugs
| # | Bengali Name | Canonical Slug |
|---|--------------|----------------|
| 1 | জাতীয় | `national` |
| 2 | রাজনীতি | `politics` |
| 3 | গ্রামগঞ্জ | `gram-gonjo` |
| 4 | অপরাধ ও দুর্নীতি | `crime-corruption` |
| 5 | শিক্ষা | `education` |
| 6 | ইসলাম | `islam` |
| 7 | কৃষি | `agriculture` |
| 8 | স্বাস্থ্য | `health` |
| 9 | বিনোদন | `entertainment` |
| 10 | খেলাধুলা | `sports` |
| 11 | আইন ও আদালত | `law-and-court` |
| 12 | চাকরি | `jobs` |
| 13 | বাণিজ্য | `business` |
| 14 | নারী ও শিশু | `women-and-children` |
| 15 | মতামত | `opinion` |
| 16 | শুভেচ্ছা বার্তা | `greetings` |

### Category Endpoints:
- `GET /api/v1/news/category/:slug?page=1&limit=12` *(or `GET /api/v1/news?category=:slug&page=1&limit=12`)*
- Both the slug (e.g. `politics`) and the Bengali name (e.g. `রাজনীতি`) are supported.

### Next.js Implementation (`app/category/[slug]/page.tsx`):
```tsx
// app/category/[slug]/page.tsx
import { api } from "@/services/api";

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const { data } = await api.get(`/news/category/${params.slug}`, {
    params: { page, limit: 12 },
  });

  const newsList = data.data;
  const meta = data.meta; // { page, limit, total, totalPage }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize border-b-2 border-red-600 pb-2 inline-block">
        {newsList[0]?.category?.name || params.slug}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {newsList.map((news: any) => (
          <a key={news.id} href={`/news/${news.slug}`} className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
            <img src={news.featuredImage} alt={news.title} className="w-full h-44 object-cover" />
            <div className="p-4">
              <h2 className="font-bold text-lg group-hover:text-red-600 line-clamp-2">{news.title}</h2>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">{news.summary}</p>
              <div className="flex justify-between items-center text-xs text-gray-400 mt-4">
                <span>{new Date(news.publishedDate).toLocaleDateString("bn-BD")}</span>
                <span>👍 {news.likesCount}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-2 mt-8">
        {page > 1 && (
          <a href={`/category/${params.slug}?page=${page - 1}`} className="px-4 py-2 border rounded hover:bg-gray-100">
            ← আগের পাতা
          </a>
        )}
        <span className="px-4 py-2">পাতা {page} / {meta?.totalPage || 1}</span>
        {page < (meta?.totalPage || 1) && (
          <a href={`/category/${params.slug}?page=${page + 1}`} className="px-4 py-2 border rounded hover:bg-gray-100">
            পরের পাতা →
          </a>
        )}
      </div>
    </div>
  );
}
```

---

## 6. Smart News Search (`GET /news/search`)

### Smart Category Search Feature:
If the user types any category name (e.g. `q=রাজনীতি`, `q=কৃষি`, `q=জাতীয়`, `q=politics`), the API automatically returns **all news under that category**, ordered **latest first**.

- **Endpoint:** `GET /news/search?q=...&category=...&page=1&limit=10`
- **Response Format:**
```json
{
  "statusCode": 200,
  "success": true,
  "meta": {
    "query": "রাজনীতি",
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3
  },
  "data": [ ...newsCards... ]
}
```

---

## 7. Single Article, WYSIWYG & Bilingual Support

### 7.1 Single News Endpoint (`GET /news/:slug`)
- Send `Authorization: <token>` in header if user is logged in.
- The response returns `userReaction: "LIKE" | "DISLIKE" | null` personalized to the user.
- Contains bilingual fields: `title`, `titleEn`, `content`, `contentEn`, `summary`, `summaryEn`.

### 7.2 WYSIWYG Content Rendering Component
Never render un-sanitized HTML directly. Use `isomorphic-dompurify`:

```bash
npm install isomorphic-dompurify
```

```tsx
// components/news/WYSIWYGArticleContent.tsx
import DOMPurify from "isomorphic-dompurify";

interface Props {
  contentHtml: string;
}

export default function WYSIWYGArticleContent({ contentHtml }: Props) {
  const sanitized = DOMPurify.sanitize(contentHtml);

  return (
    <article
      className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-bangla my-6"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
```

### 7.3 Bengali Voice News Reader / Text-To-Speech (TTS) Player

Readers can listen to any news article read out loud in natural Bengali speech. The backend synthesizes Title, Subtitle, and the full sanitized article content into a continuous MP3 audio stream.

#### Endpoints:
- **By News ID:** `GET /news/:id/audio`
- **By News Slug:** `GET /news/slug/:slug/audio`
- **Content-Type:** `audio/mpeg` (Direct streamable MP3)

> **💡 Frontend Tip:** You do NOT need to fetch binary buffers or decode base64. Simply point the HTML `<audio>` tag's `src` attribute directly to the endpoint URL.

#### Ready-to-use Audio Player Component:

```tsx
// components/news/NewsAudioPlayer.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";

interface Props {
  slug: string;
  title: string;
}

export default function NewsAudioPlayer({ slug, title }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1"}/news/slug/${slug}/audio`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 my-6 shadow-sm">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="none"
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Playback Controls & Info */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md flex-shrink-0"
            title={isPlaying ? "বিরতি দিন" : "সংবাদ শুনুন"}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <div>
            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>🎙️ সংবাদটি শুনুন</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                বাংলা ভয়েস
              </span>
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[240px]">
              {formatTime(currentTime)} / {duration ? formatTime(duration) : "--:--"}
            </div>
          </div>
        </div>

        {/* Speed & Volume Controls */}
        <div className="flex items-center gap-2">
          {/* Playback Speed selector */}
          <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 text-xs font-semibold">
            {[1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => changeSpeed(rate)}
                className={`px-2 py-1 rounded ${
                  playbackRate === rate ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition"
            title={isMuted ? "শব্দ চালু করুন" : "মিউট করুন"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Article Like / Dislike Reactions Component

### API Rules:
- **Endpoint:** `POST /news/:id/react`
- **Headers:** `Authorization: <JWT_TOKEN>`
- **Body:** `{ "reactionType": "LIKE" }` or `{ "reactionType": "DISLIKE" }`
- **Toggle Mechanism:**
  - First click: Vote added (+1).
  - Same click again: Vote undone (-1), reaction becomes `null`.
  - Opposite click: Vote switched (-1 to old, +1 to new).

### Copy-Paste Reaction Component:
```tsx
// components/news/ReactionButtons.tsx
"use client";

import { useState } from "react";
import { api } from "@/services/api";

interface Props {
  newsId: string;
  initialLikes: number;
  initialDislikes: number;
  initialUserReaction: "LIKE" | "DISLIKE" | null;
}

export default function ReactionButtons({
  newsId,
  initialLikes,
  initialDislikes,
  initialUserReaction,
}: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState<"LIKE" | "DISLIKE" | null>(initialUserReaction);
  const [loading, setLoading] = useState(false);

  const handleReact = async (type: "LIKE" | "DISLIKE") => {
    const token = localStorage.getItem("banglaralo_token");
    if (!token) {
      alert("রিঅ্যাকশন দিতে দয়া করে প্রথমে লগইন করুন।");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/news/${newsId}/react`, { reactionType: type });
      const res = data.data; // { userReaction, likesCount, dislikesCount }
      setUserReaction(res.userReaction);
      setLikes(res.likesCount);
      setDislikes(res.dislikesCount);
    } catch (err: any) {
      alert(err.message || "রিঅ্যাকশন আপডেট করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-y my-6">
      <span className="text-sm font-semibold text-gray-600">আপনার প্রতিক্রিয়া:</span>
      <button
        disabled={loading}
        onClick={() => handleReact("LIKE")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition font-medium ${
          userReaction === "LIKE" ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
        }`}
      >
        👍 ভালো লেগেছে ({likes})
      </button>

      <button
        disabled={loading}
        onClick={() => handleReact("DISLIKE")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition font-medium ${
          userReaction === "DISLIKE" ? "bg-red-600 text-white border-red-600" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
        }`}
      >
        👎 ভালো লাগেনি ({dislikes})
      </button>
    </div>
  );
}
```

---

## 9. Reader Comments & Discussion Component

### Endpoints:
1. **Fetch Comments:** `GET /comments/news/:newsId` *(Accepts news ObjectId or slug)*
2. **Post Comment:** `POST /comments/news/:newsId`
   - Headers: `Authorization: <TOKEN>`
   - Body: `{ "content": "আপনার মন্তব্যের লেখা..." }`
3. **Reply to Comment:** `POST /comments/reply`
   - Body: `{ "parentCommentId": "...", "content": "..." }`
4. **React to Comment:** `POST /comments/:commentId/react`
   - Body: `{ "reactionType": "LIKE" }`

---

## 10. "Our Family" Editorial Team (`/our-family`)

For the dedicated `/our-family` page:

- **Endpoint:** `GET /teams?status=active` *(or `GET /teams/members`)*
- **Response Format:** Flat list of active team members
```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "id": "671cb0a1b89efc440",
      "name": "এইচ এম তারেক",
      "designation": "সম্পাদক ও প্রকাশক",
      "department": "ব্যবস্থাপনা ও সম্পাদকীয়",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "প্রতিষ্ঠাতা ও প্রধান সম্পাদক",
      "order": 1
    }
  ]
}
```

---

## 11. Header, Footer, Tagline & Hijri Date

Fetch site-wide configuration in your global layout:

- **Endpoint:** `GET /settings`
- **Response:**
  - `tagline`: `"সত্যের পথে মুক্তি"`
  - `hijriDateAdjustment`: Integer offset (-2 to +2 days) to synchronize with local moon sighting.
  - `customHijriDate`: Optional override string.

---

## 12. Publisher News Creation & Super Admin Restrictions

### Article Creation Payload (`POST /news`):
```json
{
  "title": "বরিশালে আধুনিক কৃষির নতুন দিগন্ত",
  "titleEn": "New Horizons in Modern Agriculture in Barishal",
  "subtitle": "কৃষকদের জীবনমান উন্নয়নে উদ্যোগ",
  "summary": "সংক্ষিপ্ত সারসংক্ষেপ...",
  "content": "<h2>বিস্তারিত বিবরণী</h2><p>...</p>",
  "category": "agriculture",
  "featuredImage": "https://...",
  "status": "PUBLISHED",
  "tags": ["বরিশাল", "কৃষি"]
}
```

### Ownership Enforcement:
- Publishers and Reporters can only edit articles created by themselves (`PATCH /news/:id`).
- Attempting to edit another author's article returns `403 Forbidden`.

### Super Admin Only Actions:
- Creating Staff or Publisher accounts: `POST /admin/users` (Restricted strictly to `Super_Admin`).
- Deleting anything (`DELETE *`): Restricted strictly to `Super_Admin`.

---

## 13. Instant Auto News Fetcher from Any URL (`GET /news/fetch-external`)

This feature powers the **Auto News Fetcher Bar** shown in the editor screen. Journalists or editors can simply paste a URL from any news portal (e.g. Prothom Alo, Daily Star, Jugantor, Ittefaq, Amar Desh, Naya Diganta, etc.) and click **"Fetch News"**. The API scrapes, cleans, sanitizes, and returns the complete article data in 2-3 seconds to auto-fill the article creation form.

### Endpoint:
- **URL:** `GET /news/fetch-external?url=<NEWS_ARTICLE_URL>`
- **Headers:** `Authorization: <JWT_TOKEN>` *(optional for public testing, recommended for admin)*
- **Query Parameter:**
  - `url` (Required): Full web URL of the news article (e.g., `https://www.prothomalo.com/bangladesh/district/rnya9uq97k`)

### Response Structure (`data`):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "External news data fetched and parsed successfully",
  "data": {
    "title": "‘বাবার দুই হাত চেপে ধরেন দুজন, আরেকজন বুকে গুলি করেন’",
    "subtitle": "লক্ষ্মীপুরে ব্যবসায়ীকে হত্যা",
    "content": "<h2>লক্ষ্মীপুরে ব্যবসায়ীকে হত্যা</h2>\n<p>‘বাবা ডাব খাচ্ছিলেন। এ সময় তিনজন এসে লাথি মেরে তাঁর হাত থেকে ডাব ফেলে দেন...</p>",
    "summary": "লক্ষ্মীপুর সদর উপজেলায় এক ব্যবসায়ীকে প্রকাশ্যে গুলি করে হত্যা করার অভিযোগ উঠেছে...",
    "featuredImage": "https://media.prothomalo.com/prothomalo-bangla/2026-10-29/piohuvll/Laxmipur-1.jpg?w=1200&h=675&auto=format%2Ccompress&fit=max",
    "imageCaption": "লক্ষ্মীপুরে মাটির ব্যবসাকে কেন্দ্র করে প্রতিপক্ষের গুলিতে খুন হওয়া খোরশেদ আলমের স্ত্রীর আহাজারি",
    "photoCredit": "",
    "tags": ["লক্ষ্মীপুর", "ব্যবসায়ী", "হত্যা", "গুলি", "সারাদেশ"],
    "writer": "এ বি এম রিপন",
    "publishedDate": "2026-10-29T03:12:00.000Z",
    "formattedPublishDate": "10/29/2026 09:12 AM",
    "readingTime": "২ মিনিট",
    "categoryId": "671cb0a1b89efc4400000002",
    "categoryName": "সারাদেশ",
    "categorySlug": "countrywide",
    "publisher": "Prothom Alo"
  }
}
```

### ✨ Smart Extraction Features:
1. **Reporter & Author Avatars Excluded**: The scraper actively filters out reporter profile pictures, byline headshots, and author avatars (e.g. `alt: "নিজস্ব প্রতিবেদক"`, `alt: "জ্যেষ্ঠ প্রতিবেদক"`, `class="desktopDetailAuthorDiv"`). Only the genuine news photo is returned.
2. **Branding & Watermarks Cleaned**:
   - Newspaper branding names (প্রথম আলো, আমার দেশ, যুগান্তর, ইত্তেফাক ইত্যাদি) are removed from the title and content.
   - Prothom Alo's bottom banner overlay (`&overlay=...`) is stripped automatically, returning the clean, unbranded original high-resolution image.
3. **Database Category Auto-Matching**: The endpoint checks the article's breadcrumbs and keywords against your database categories and returns the exact matching `categoryId` and `categoryName` so the Category select dropdown can be set automatically!

### Ready-to-use Auto News Fetcher Component:

```tsx
// components/admin/AutoNewsFetchBar.tsx
"use client";

import { useState } from "react";
import { api } from "@/services/api";
import { Download, Loader2, Sparkles } from "lucide-react";

interface AutoNewsData {
  title: string;
  subtitle: string;
  content: string;
  summary: string;
  featuredImage: string;
  imageCaption: string;
  photoCredit: string;
  tags: string[];
  writer: string;
  publishedDate: string;
  formattedPublishDate: string;
  readingTime: string;
  categoryId: string | null;
  categoryName: string;
}

interface Props {
  onDataFetched: (data: AutoNewsData) => void;
}

export default function AutoNewsFetchBar({ onDataFetched }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    if (!url.trim()) return;
    setError("");
    setLoading(true);

    try {
      const { data } = await api.get(`/news/fetch-external?url=${encodeURIComponent(url.trim())}`);
      if (data.success && data.data) {
        onDataFetched(data.data);
      }
    } catch (err: any) {
      setError(err.message || "নিউজ ফেচ করা সম্ভব হয়নি। লিংকটি যাচাই করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
        <h3 className="text-base font-bold text-gray-900 font-bangla">
          Auto News — যেকোনো নিউজ সাইটের লিংক দিন
        </h3>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        প্রথম আলো, যুগান্তর, ইত্তেফাক, আমার দেশ, বা যেকোনো বাংলা/ইংরেজি নিউজ পোর্টালের লিংক পেস্ট করুন — ৫ সেকেন্ডে সম্পূর্ণ কন্টেন্ট, ছবি, ক্যাটাগরি ও ট্যাগ চলে আসবে।
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.prothomalo.com/bangladesh/district/..."
          className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
        />

        <button
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50 shadow-sm flex-shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>ফেচ হচ্ছে...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Fetch News</span>
            </>
          )}
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>}
    </div>
  );
}
```

---

## 14. News Agent v4 (24/7 Autopilot Dashboard Control Center)

The **News Agent v4** is an autonomous 24/7 background autopilot engine that crawls listing pages from 19+ top media sources, rewrites them using **Google Gemini AI** into journalistic Bengali, strips out original newspaper watermarks/logos, and automatically publishes them into their matched categories.

### 14.1 Top Statistics Banner (`GET /auto-news/stats`)

- **Endpoint:** `GET /auto-news/stats`
- **Response Structure:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "status": "ON",
    "interval": 5,
    "sourcesCount": "19/19",
    "cursor": 10,
    "totalPosted": 10650,
    "postedToday": 122,
    "totalSkipped": 0,
    "totalErrors": 0,
    "lastRunAt": "2026-11-09T12:30:48.000Z",
    "nextRunAt": "2026-11-09T12:35:48.000Z"
  }
}
```

#### Top Banner UI Mapping:
- **Total Posted:** `data.totalPosted` (e.g. `10,650`)
- **Posted Today:** `data.postedToday` (e.g. `122`)
- **Skipping (Duplicate):** `data.totalSkipped` (e.g. `0`)
- **Errors:** `data.totalErrors` (e.g. `0`)
- **Status Indicator:** Green dot if `status === "ON"`, Gray/Red if `"OFF"`
- **Sub-info Pill:** `Status: • ON | Interval: 5 min | Sources: 19/19 | Cursor: 10 | Last: 12:30:48 | Next: 12:35:48`

---

### 14.2 Operational Controls (Turn ON / Turn OFF & Run Now)

#### 1. Turn ON / Turn OFF Autopilot:
- **Endpoint:** `POST /auto-news/toggle`
- **Body:** `{ "status": "ON" }` or `{ "status": "OFF" }`
- **Response:** `{ "status": "ON", "isEnabled": true }`

#### 2. Run Now (Instant Manual Cycle):
- **Endpoint:** `POST /auto-news/run-now`
- **Action:** Immediately executes 1 cycle (picks current source, scrapes latest article, rewrites via Gemini, publishes, and advances cursor) without waiting for the timer.
- **Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Cycle executed successfully.",
  "data": {
    "status": "success",
    "newsId": "6af1689307ae30bdf136acc0",
    "title": "মার্কিন ভিজিটর ভিসা নিয়ে ঢাকাস্থ যুক্তরাষ্ট্রের নতুন কড়া বার্তা",
    "sourceUrl": "https://www.ittefaq.com.bd/819897/...",
    "modelUsed": "gemini-flash-lite-latest"
  }
}
```

---

### 14.3 Agent Settings (`GET / PATCH /auto-news/settings`)

- **Get Settings:** `GET /auto-news/settings`
- **Update Settings:** `PATCH /auto-news/settings`

#### Settings Form Payload:
```json
{
  "interval": 5,
  "postsPerRun": 1,
  "scanPerSource": 100,
  "defaultPostStatus": "PUBLISHED",
  "defaultAdminId": "",
  "publishAsWriterId": "",
  "geminiApiKey": "AQ.Ab8RN6I6...",
  "preferredModel": "auto",
  "extraInstruction": "সংবাদটি আকর্ষণীয় ও সাবলীল প্রমিত বাংলায় পরিবেশন করুন।",
  "aiRewrite": true,
  "tickerOn": false,
  "cropResizeEnabled": true,
  "cropWidth": 1200,
  "cropHeight": 675,
  "watermarkEnabled": false,
  "watermarkPosition": "Full Width Bottom",
  "watermarkOpacity": 100,
  "watermarkSize": 100,
  "watermarkMargin": 0
}
```

#### Settings Field Descriptions:
| Field | Type | Description |
| :--- | :--- | :--- |
| `interval` | `number` | Cycle interval in minutes (1 to 60) |
| `postsPerRun` | `number` | Max articles published per cycle (default 1) |
| `scanPerSource` | `number` | Listing articles scanned for duplicate checks (default 100) |
| `defaultPostStatus` | `string` | `"PUBLISHED"` or `"DRAFT"` |
| `defaultAdminId` | `string` | Author user ID (optional, defaults to Super Admin) |
| `publishAsWriterId`| `string` | Custom writer ID or empty for "News Agent" |
| `geminiApiKey` | `string` | Google Gemini API Key |
| `preferredModel` | `string` | `"auto"`, `"gemini-flash-lite-latest"`, `"gemini-3.1-flash-lite"`, `"gemini-3.5-flash-lite"` |
| `aiRewrite` | `boolean` | Full AI Rewrite toggle (ON / OFF) |
| `extraInstruction`| `string` | Additional custom instructions for AI journalist tone |
| `cropResizeEnabled`| `boolean`| Auto image crop & resize toggle (1200x675) |

---

### 14.4 News Sources Table (`/auto-news/sources`)

The system comes pre-configured with 19 media sources matching Screenshots 1 & 2.

#### Endpoints:
- **Get Sources:** `GET /auto-news/sources`
- **Add Source:** `POST /auto-news/sources`
- **Update Source:** `PATCH /auto-news/sources/:id`
- **Delete Source:** `DELETE /auto-news/sources/:id`

#### Source Object Format:
```json
{
  "id": "671cb0a1b89efc4400000010",
  "name": "অর্থনীতি",
  "url": "https://dailynayadiganta.com/economy",
  "categoryHint": "অর্থনীতি",
  "articleSelector": "foli.a",
  "status": "ACTIVE",
  "preferMetaImage": true,
  "okCount": 1048,
  "failCount": 2,
  "order": 1
}
```

#### Sources Table Columns (as per UI Screenshot):
1. `#` (Order number)
2. `Name` (e.g. অর্থনীতি, চাকরির খবর, খেলাধুলা, জাতীয়)
3. `URL` (Listing link, e.g. `https://www.ittefaq.com.bd/country`)
4. `Cat Hint` (e.g. সারা বাংলা, আন্তর্জাতিক, রাজনীতি)
5. `Selector` (`_embedded_url__`, `article.a`, `foli.a`)
6. `Status` (Badge: `Published`, `No New Article Found`, `ACTIVE`)
7. `Meta Img` (Checkmark `✓`)
8. `OK / Fail` (Green badge, e.g. `1048/2`)

---

### 14.5 Live Terminal Log Feed (`GET /auto-news/logs`)

- **Endpoint:** `GET /auto-news/logs?limit=50`
- **Response:** Array of live execution logs (last 300 kept in memory/DB)
```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "id": "6af1689307ae30bdf136acc1",
      "level": "success",
      "message": "Publish: মার্কিন ভিজিটর ভিসা নিয়ে ঢাকাস্থ যুক্তরাষ্ট্রের নতুন কড়া বার্তা (https://www.ittefaq.com.bd/...)",
      "createdAt": "2026-11-09T12:30:48.000Z"
    },
    {
      "id": "6af1689307ae30bdf136acc2",
      "level": "success",
      "message": "Gemini rewrite: model=gemini-flash-lite-latest HTTP 200",
      "createdAt": "2026-11-09T12:30:46.000Z"
    },
    {
      "id": "6af1689307ae30bdf136acc3",
      "level": "info",
      "message": "Fetching article: https://www.ittefaq.com.bd/819897/...",
      "createdAt": "2026-11-09T12:30:44.000Z"
    },
    {
      "id": "6af1689307ae30bdf136acc4",
      "level": "info",
      "message": "[10/19] Scanning source: জাতীয় (https://www.ittefaq.com.bd/national)",
      "createdAt": "2026-11-09T12:30:42.000Z"
    }
  ]
}
```

#### Terminal Styling Helper:
```tsx
const getLogColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "success": return "text-emerald-400";
    case "warning": return "text-amber-400";
    case "error": return "text-red-400";
    default: return "text-blue-300";
  }
};
```

---

### 14.6 Recent Auto-Posted Articles (`GET /auto-news/recent-posts`)

- **Endpoint:** `GET /auto-news/recent-posts?limit=20`
- **Response:** Array of recently published articles by the agent
```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "id": "6af1689307ae30bdf136acc0",
      "articleTitle": "মার্কিন ভিজিটর ভিসা নিয়ে ঢাকাস্থ যুক্তরাষ্ট্রের নতুন কড়া বার্তা",
      "sourceSite": "Daily Ittefaq",
      "sourceUrl": "https://www.ittefaq.com.bd/819897/...",
      "status": "posted",
      "createdAt": "2026-11-09T12:30:48.000Z"
    }
  ]
}
```

---

### 14.7 Test Gemini AI Rewrite (`POST /auto-news/test-ai`)

Test the configured Gemini AI prompt and model directly from the admin panel:

- **Endpoint:** `POST /auto-news/test-ai`
- **Body:**
```json
{
  "title": "বরিশাল নগরীর সামগ্রিক উন্নয়ন প্রকল্প পরিদর্শন করলেন প্রধান প্রকৌশলী",
  "content": "<p>বরিশাল নগরীর ড্রেনেজ ব্যবস্থা ও রাস্তাঘাট সংস্কারে নতুন অর্থ বরাদ্দ দেওয়া হয়েছে।</p>"
}
```
- **Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "title": "বরিশাল নগর উন্নয়ন: ড্রেনেজ ও রাস্তাঘাট সংস্কারে নতুন অর্থ বরাদ্দ",
    "subtitle": "নাগরিক দুর্ভোগ লাঘবে দ্রুত কাজ সম্পন্নের নির্দেশ",
    "summary": "বরিশাল নগরীর রাস্তাঘাট ও জলাবদ্ধতা নিরসনে ড্রেনেজ ব্যবস্থা আধুনিকায়নে নতুন প্রকল্প গ্রহণ করা হয়েছে...",
    "content": "<h2>নাগরিক সুবিধা নিশ্চিতের তাগিদ</h2>\n<p>বরিশাল নগরীর ড্রেনেজ ব্যবস্থা ও রাস্তাঘাট সংস্কারে নতুন অর্থ বরাদ্দ দেওয়া হয়েছে। নগরীর চলমান উন্নয়ন কাজের অগ্রগতি পরিদর্শন শেষে সংশ্লিষ্ট কর্মকর্তাদের দ্রুত মানসম্মত কাজ শেষ করার নির্দেশ দেওয়া হয়েছে।</p>",
    "modelUsed": "gemini-flash-lite-latest"
  }
}
```



---

## 15. Analytics, News View Tracking & Daily Website Visitors

Banglar-Alo-News-Backend provides an automatic, IP-based deduplicating analytics engine:
1. **Per-Article Unique Views (`news.viewsCount`)**:
   - Automatically tracked when reading an article via `GET /news/:slug` or `GET /news/:id`.
   - **Strict IP Deduplication**: A single visitor IP can only increment a news article's view count **once**. Subsequent refreshes or repeat visits from that same IP will NOT inflate the count.
   - The returned `data.viewsCount` is always the live, deduplicated total.
2. **Daily Website Unique Visitors (`DailyVisitor`)**:
   - Tracked whenever the frontend calls `POST /analytics/visit` (or automatically when an article is viewed).
   - **1 Unique Visit per IP per Day**: If the user visits 50 pages today, it counts as 1 unique visit for today. If they return tomorrow, it counts as 1 unique visit for tomorrow. Multiple visits on the same day are skipped.
3. **Flexible Timeframe Filtering**:
   - Both News Views and Website Visitors APIs support flexible timeframe query params:
     - `7d`: Last 7 Days
     - `15d`: Last 15 Days
     - `30d`: Last 30 Days *(Default)*
     - `3m`: Last 3 Months (90 days)
     - `6m`: Last 6 Months (180 days)
     - `1y`: Last 1 Year (365 days)
   - All chart data returns a **continuous day-by-day sequence with automatic zero-fill**, so charts in Recharts, Chart.js, or ApexCharts never have missing dates or broken curves!

---

### 15.1 TypeScript Interfaces (`types/analytics.ts`)

```typescript
// types/analytics.ts

export type AnalyticsTimeframe = "7d" | "15d" | "30d" | "3m" | "6m" | "1y";

export interface AnalyticsChartPoint {
  date: string; // "YYYY-MM-DD" e.g. "2026-11-09"
  count: number;
}

export interface WebsiteVisitorsResponse {
  todayVisitors: number;     // Unique visitors today
  totalVisitors: number;     // All-time unique visitor entries
  timeframe: AnalyticsTimeframe;
  totalInPeriod: number;     // Total unique visits within selected timeframe
  chartData: AnalyticsChartPoint[]; // Complete date sequence (zero-filled)
}

export interface TopArticleView {
  id: string;
  title: string;
  slug: string;
  viewsCount: number;
  featuredImage: string;
}

export interface NewsViewsAnalyticsResponse {
  todayNewsViews: number;    // News views recorded today across all articles
  totalNewsViews: number;    // All-time total news views
  timeframe: AnalyticsTimeframe;
  totalInPeriod: number;     // Total views in selected timeframe
  chartData: AnalyticsChartPoint[]; // Complete date sequence (zero-filled)
  topArticles: TopArticleView[];    // Most viewed articles
}

export interface DashboardSummaryResponse {
  todayNewsViews: number;
  todayWebsiteVisitors: number;
  totalNewsViews: number;
  totalWebsiteVisitors: number;
  timeframe: AnalyticsTimeframe;
  newsViews: {
    totalInPeriod: number;
    chartData: AnalyticsChartPoint[];
    topArticles: TopArticleView[];
  };
  websiteVisitors: {
    totalInPeriod: number;
    chartData: AnalyticsChartPoint[];
  };
}
```

---

### 15.2 Record Daily Website Visit (`POST /analytics/visit`)

Call this endpoint in your Next.js root layout or homepage to register the daily visitor for the user's IP.

- **Method:** `POST`
- **URL:** `/api/v1/analytics/visit`
- **Auth:** Public (No token required)
- **Body (Optional):**
```json
{
  "path": "/home"
}
```
- **Response (First visit today from this IP):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Daily website visit recorded successfully.",
  "data": {
    "recorded": true,
    "message": "Daily website visit recorded successfully.",
    "todayVisitors": 128
  }
}
```
- **Response (Repeat visit from same IP on the same day - Deduplicated):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Visit already recorded for today from this IP.",
  "data": {
    "recorded": false,
    "message": "Visit already recorded for today from this IP.",
    "todayVisitors": 128
  }
}
```

> **Frontend Auto-Track Hook (Next.js App Router / Pages Router):**
```typescript
// hooks/useTrackVisit.ts
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/services/api";

export function useTrackVisit() {
  const pathname = usePathname();

  useEffect(() => {
    // Only fire once per session/day on frontend or route change
    api.post("/analytics/visit", { path: pathname }).catch(() => {
      // Non-blocking, fails gracefully
    });
  }, [pathname]);
}
```

---

### 15.3 Get Daily Website Visitor Analytics (`GET /analytics/visitors`)

Used to render daily website visitor count charts and cards in the Admin/Analytics Dashboard.

- **Method:** `GET`
- **URL:** `/api/v1/analytics/visitors?timeframe=30d`
- **Query Parameters:**
  - `timeframe`: `7d` | `15d` | `30d` (default) | `3m` | `6m` | `1y`
- **Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Website visitor analytics retrieved successfully.",
  "data": {
    "todayVisitors": 145,
    "totalVisitors": 4820,
    "timeframe": "30d",
    "totalInPeriod": 3890,
    "chartData": [
      { "date": "2026-10-11", "count": 110 },
      { "date": "2026-10-12", "count": 135 },
      { "date": "2026-10-13", "count": 0 },
      { "date": "2026-11-09", "count": 145 }
    ]
  }
}
```

---

### 15.4 Get News Views Analytics (`GET /analytics/news-views`)

Used to show **Today's News Views** across all articles, all-time views, time-series chart data, and the most viewed articles list.

- **Method:** `GET`
- **URL:** `/api/v1/analytics/news-views?timeframe=30d`
- **Query Parameters:**
  - `timeframe`: `7d` | `15d` | `30d` (default) | `3m` | `6m` | `1y`
- **Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "News views analytics retrieved successfully.",
  "data": {
    "todayNewsViews": 530,
    "totalNewsViews": 14250,
    "timeframe": "30d",
    "totalInPeriod": 11840,
    "chartData": [
      { "date": "2026-10-11", "count": 390 },
      { "date": "2026-10-12", "count": 420 },
      { "date": "2026-10-13", "count": 0 },
      { "date": "2026-11-09", "count": 530 }
    ],
    "topArticles": [
      {
        "id": "673f8a9e8b7c6d5e4f3a2b1c",
        "title": "বরিশালে নতুন উন্নয়ন প্রকল্পের সূচনা",
        "slug": "বরিশালে-নতুন-উন্নয়ন-প্রকল্পের-সূচনা",
        "viewsCount": 1820,
        "featuredImage": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167"
      }
    ]
  }
}
```

---

### 15.5 Unified Dashboard Summary (`GET /analytics/dashboard`)

For an all-in-one Admin Overview page, call this single endpoint to get both website visitor stats and news views stats with 1 request:

- **Method:** `GET`
- **URL:** `/api/v1/analytics/dashboard?timeframe=30d`
- **Query Parameters:**
  - `timeframe`: `7d` | `15d` | `30d` (default) | `3m` | `6m` | `1y`
- **Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Dashboard analytics summary retrieved successfully.",
  "data": {
    "todayNewsViews": 530,
    "todayWebsiteVisitors": 145,
    "totalNewsViews": 14250,
    "totalWebsiteVisitors": 4820,
    "timeframe": "30d",
    "newsViews": {
      "totalInPeriod": 11840,
      "chartData": [
        { "date": "2026-10-11", "count": 390 }
      ],
      "topArticles": []
    },
    "websiteVisitors": {
      "totalInPeriod": 3890,
      "chartData": [
        { "date": "2026-10-11", "count": 110 }
      ]
    }
  }
}
```

---

### 15.6 Frontend Chart Component Example (Recharts + Tailwind CSS)

```tsx
// components/admin/AnalyticsChart.tsx
"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/services/api";
import { AnalyticsTimeframe, AnalyticsChartPoint } from "@/types/analytics";

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("30d");
  const [newsViewsData, setNewsViewsData] = useState<AnalyticsChartPoint[]>([]);
  const [visitorsData, setVisitorsData] = useState<AnalyticsChartPoint[]>([]);
  const [todayViews, setTodayViews] = useState(0);
  const [todayVisitors, setTodayVisitors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/dashboard?timeframe=${timeframe}`);
        const data = res.data.data;
        setTodayViews(data.todayNewsViews);
        setTodayVisitors(data.todayWebsiteVisitors);
        setNewsViewsData(data.newsViews.chartData);
        setVisitorsData(data.websiteVisitors.chartData);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [timeframe]);

  const filterOptions: { label: string; value: AnalyticsTimeframe }[] = [
    { label: "৭ দিন", value: "7d" },
    { label: "১৫ দিন", value: "15d" },
    { label: "৩০ দিন", value: "30d" },
    { label: "৩ মাস", value: "3m" },
    { label: "৬ মাস", value: "6m" },
    { label: "১ বছর", value: "1y" },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header & Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">অ্যানালিটিক্স ড্যাশবোর্ড</h1>
          <p className="text-sm text-gray-500">ভিজিটর ও নিউজ ভিউজ ট্র্যাক করুন</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeframe(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                timeframe === opt.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">আজকের মোট নিউজ ভিউজ</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{todayViews.toLocaleString()}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">আজকের মোট ওয়েবসাইট ভিজিটর</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{todayVisitors.toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">দৈনিক ভিউজ ও ভিজিটর ট্রেন্ড</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={newsViewsData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```
