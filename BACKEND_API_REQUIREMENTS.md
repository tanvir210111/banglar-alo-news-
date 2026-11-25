# 📰 বাংলার আলো নিউজ (Banglar Alo News)
## সম্পূর্ণ ওয়েবসাইট ডায়নামিক করার পূর্ণাঙ্গ ব্যাকএন্ড স্পেসিফিকেশন ও API নির্দেশিকা

> **ডকুমেন্ট উদ্দেশ্য:** এই নির্দেশিকাটি ব্যাকএন্ড ডেভেলপারের জন্য একটি একক এবং চূড়ান্ত রেফারেন্স (Single Source of Truth)। ফ্রন্টএন্ড (`Next.js 16 App Router`, `TypeScript`, `Tailwind CSS`) সম্পূর্ণ প্রস্তুত রয়েছে। এই ডকুমেন্টের নির্দেশনা ও এন্ডপয়েন্টগুলো বাস্তবায়ন করলে সম্পূর্ণ ওয়েবসাইটটি (হোমপেজ, ক্যাটাগরি, খবর বিস্তারিত, আর্কাইভ, সার্চ, মানচিত্র, ফটো/ভিডিও, বিজ্ঞাপন এবং অ্যাডমিন প্যানেল) **১০০% ডায়নামিক** হিসেবে কাজ করবে।

---

## সূচিপত্র (Table of Contents)
1. [আর্কিটেকচার ও সার্ভার কনফিগারেশন](#১-আর্কিটেকচার-ও-সার্ভার-কনফিগারেশন)
2. [ইউনিফাইড API রেসপন্স ফরম্যাট](#২-ইউনিফাইড-api-রেসপন্স-ফরম্যাট)
3. [অথেনটিকেশন ও সিকিউরিটি](#৩-অথেনটিকেশন-ও-সিকিউরিটি)
4. [ক্যাটাগরি ও মেনুবার বিন্যাস (Seed Data সহ)](#৪-ক্যাটাগরি-ও-মেনুবার-বিন্যাস)
5. [ডাটাবেস স্কিমা ও মডেলসমূহ](#৫-ডাটাবেস-স্কিমা-ও-মডেলসমূহ)
6. [পাবলিক API এন্ডপয়েন্ট রেফারেন্স (ভিজিটর ও ক্লায়েন্ট)](#৬-পাবলিক-api-এন্ডপয়েন্ট-রেফারেন্স)
7. [অ্যাডমিন ও ম্যানেজমেন্ট API এন্ডপয়েন্ট](#৭-অ্যাডমিন-ও-ম্যানেজমেন্ট-api-এন্ডপয়েন্ট)
8. [স্বয়ংক্রিয় সংবাদ ও স্ক্র্যাপার ইঞ্জিন (Auto News)](#৮-স্বয়ংক্রিয়-সংবাদ-ও-স্ক্র্যাপার-ইঞ্জিন)
9. [রিয়েল-টাইম ব্রডকাস্ট ও লাইভ আপডেট](#৯-রিয়েল-টাইম-ব্রডকাস্ট-ও-লাইভ-আপডেট)
10. [দ্রুত রান ও টেস্টিং চেকলিস্ট](#১০-দ্রুত-রান-ও-টেস্টিং-চেকলিস্ট)

---

## ১. আর্কিটেকচার ও সার্ভার কনফিগারেশন

### ১.১ ফ্রন্টএন্ড পোর্ট ও টেকনোলজি
* **লোকাল পোর্ট:** `3010` ([http://localhost:3010](http://localhost:3010))
* **ফ্রন্টএন্ড স্ট্যাক:** Next.js 16 (App Router), TypeScript, Tailwind CSS
* **থিম কালার:** **সবুজ (Green: `#0B7A43`, Dark Accent: `#065F34`)**
* **অফিসিয়াল সম্পাদকীয় ও কার্যালয়:**
  - **প্রকাশক ও সম্পাদক:** মোঃ গোলাম মাওলা শাওন
  - **মোবাইল:** `০১৭১১-০০৬২১৪`
  - **প্রধান কার্যালয় (অফিস):** ৩১/১ শরীফ কমপ্লেক্স (৬ষ্ঠ তলা), পুরানা পল্টন, ঢাকা-১০০০
  - **কার্যালয় মোবাইল:** `০১৯৯৯-৯৫৩৯৭০`
  - **অফিসিয়াল ই-মেইল:** `banglaralonewsbd@gmail.com`
* **কারিগরি সহায়তা:** `Banglar Alo IT` ([https://banglaraloit.com](https://banglaraloit.com))

### ১.২ ব্যাকএন্ড টেকনোলজি ও পোর্ট স্বাধীনতা
* ব্যাকএন্ড ডেভেলপার তাদের পছন্দমতো যেকোনো টেকনোলজি স্ট্যাক ব্যবহার করতে পারবেন:
  - **রানটাইম / ফ্রেমওয়ার্ক:** Node.js (Express, NestJS, Fastify), Python (FastAPI, Django), PHP (Laravel), Go, বা Java (Spring Boot)।
  - **ডাটাবেস:** MongoDB (Mongoose), PostgreSQL (Prisma, Drizzle, TypeORM), MySQL।
* **পোর্ট:** যেকোনো পোর্টে চালানো যাবে (যেমন `5000`, `5001`, `8000`, `8080` ইত্যাদি)।
* **ফ্রন্টএন্ডের সাথে কানেকশন দেওয়ার নিয়ম:**
  ফ্রন্টএন্ড রুট ডিরেক্টরিতে থাকা `.env` ফাইলে শুধু URL-টি বসিয়ে দিলেই ফ্রন্টএন্ড ব্যাকএন্ডের সাথে যুক্ত হয়ে যাবে:
  ```env
  PORT=3010
  NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
  BACKEND_API_URL=http://localhost:5000/api/v1
  ```

### ১.৩ CORS কনফিগারেশন
ব্যাকএন্ড সার্ভারে নিচের Origin-গুলো CORS হিসেবে Allow থাকতে হবে:
```javascript
const allowedOrigins = [
  "http://localhost:3010",
  "http://127.0.0.1:3010",
  "https://www.banglaralonews.com",
  "https://banglaralonews.com"
];
```

---

## ২. ইউনিফাইড API রেসপন্স ফরম্যাট

ফ্রন্টএন্ডের সার্ভিস ও ক্লায়েন্ট নিচের ইউনিফাইড রেসপন্স ইনভেলপ প্রত্যাশা করে:

### ২.১ সফল রেসপন্স (Single Entity / Action)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "সংবাদটি সফলভাবে প্রকাশিত হয়েছে",
  "data": { ... }
}
```

### ২.২ পেজিনেশন রেসপন্স (Lists)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "সংবাদ তালিকা সফলভাবে পাওয়া গেছে",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 145,
    "totalPages": 13
  }
}
```

### ২.৩ এরর রেসপন্স (Error Format)
```json
{
  "statusCode": 400,
  "success": false,
  "message": "অনুরোধটি সঠিক নয় অথবা তথ্য অসম্পূর্ণ",
  "errorSources": [
    {
      "path": "title",
      "message": "সংবাদের শিরোনাম বাধ্যতামূলক"
    }
  ]
}
```

---

## ৩. অথেনটিকেশন ও সিকিউরিটি

* **প্রটোকল:** JWT (JSON Web Token)
* **হেডার ফরম্যাট:** `Authorization: Bearer <JWT_TOKEN>`
* **ব্যবহারকারী রোলসমূহ (Staff Roles):**
  1. `Super_Admin` — পূর্ণাঙ্গ নিয়ন্ত্রণ, ডাটাবেস ব্যাকআপ, কর্মী যুক্ত ও ডিলিট।
  2. `Admin` — সকল কনটেন্ট ও ক্যাটাগরি পরিচালনা।
  3. `Editor` — সংবাদ সম্পাদনা ও অনুমোদন।
  4. `Publisher` — সংবাদ প্রকাশ ও শিডিউল।
  5. `Reporter` — সংবাদ ড্রাফট তৈরি ও সাবমিট।

> 📌 **নোট:** সাধারণ পাঠকদের জন্য কমেন্ট ও লাইক অপশন সরিয়ে নেওয়া হয়েছে। ফলে সাধারণ ভিজিটরদের রিডার লগইন ব্যাকএন্ডে বাধ্যতামূলক নয়; শুধু অ্যাডমিন ও রিপোর্টারদের রোল-বেসড অথেনটিকেশন সক্রিয় থাকলেই চলবে।

---

## ৪. ক্যাটাগরি ও মেনুবার বিন্যাস (Seed Data সহ)

ফ্রন্টএন্ডের সবুজ মেনুবারে ক্যাটাগরিগুলোর একটি সুনির্দিষ্ট ক্রম রয়েছে। ব্যাকএন্ডে ক্যাটাগরি সিড করার সময় নিচের নাম, ক্রম (`order`) এবং স্লাগ (`slug`) কঠোরভাবে অনুসরণ করতে হবে:

### ৪.১ প্রধান মেনুবার ক্যাটাগরি (Primary Navbar: Order 1 to 11)
| ক্রম (Order) | বাংলা নাম | ইংরেজি নাম (nameEn) | ইউনিক স্লাগ (slug) | রুট / লিংক |
| :---: | :--- | :--- | :--- | :--- |
| **১** | **সর্বশেষ** | Latest | `latest` | `/latest` (সিস্টেম রুট) |
| **২** | **সারাদেশ** | Countrywide | `countrywide` | `/category/countrywide` |
| **৩** | **জাতীয়** | National | `national` | `/category/national` |
| **৪** | **রাজনীতি** | Politics | `politics` | `/category/politics` |
| **৫** | **আন্তর্জাতিক** | International | `international` | `/category/international` |
| **৬** | **ব্যবসা ও বাণিজ্য** | Business & Commerce | `business` | `/category/business` |
| **৭** | **অপরাধ ও দুর্নীতি** | Crime & Corruption | `crime-corruption` | `/category/crime-corruption` |
| **৮** | **শিক্ষা** | Education | `education` | `/category/education` |
| **৯** | **খেলাধুলা** | Sports | `sports` | `/category/sports` |
| **১০** | **বিনোদন** | Entertainment | `entertainment` | `/category/entertainment` |
| **১১** | **ধর্ম** | Religion | `religion` | `/category/religion` |

### ৪.২ 'আরও' ড্রপডাউনের ক্যাটাগরিসমূহ (More Categories: Order 12 to 29)
| ক্রম (Order) | বাংলা নাম | ইংরেজি নাম (nameEn) | ইউনিক স্লাগ (slug) |
| :---: | :--- | :--- | :--- |
| **১২** | অর্থনীতি | Economy | `economy` |
| **১৩** | আমাদের পরিবার | Our Family | `our-family` |
| **১৪** | দুর্ঘটনা | Accidents | `accident` |
| **১৫** | চাকুরী | Jobs | `jobs` |
| **১৬** | কৃষি | Agriculture | `agriculture` |
| **১৭** | ফিচার | Features | `features` |
| **১৮** | লাইফস্টাইল | Lifestyle | `lifestyle` |
| **১৯** | ভ্রমণ | Travel | `travel` |
| **২০** | সম্পাদকীয় | Editorial | `editorial` |
| **২১** | স্বাস্থ্য | Health | `health` |
| **২২** | আইন আদালত | Law & Court | `law-and-court` |
| **২৩** | মতামত | Opinion | `opinion` |
| **২৪** | **সাহিত্য ও সংস্কৃতি** | Literature & Culture | `literature-culture` |
| **২৫** | শেয়ার বাজার | Share Market | `share-market` |
| **২৬** | প্রবাসে বাংলাদেশ | Expatriate Bangladesh | `expatriate` |
| **২৭** | রাজধানী | Capital | `capital` |
| **২৮** | নারী ও শিশু | Women & Children | `women-and-children` |
| **২৯** | প্রযুক্তি | Technology | `technology` |

> ⚠️ **বিশেষ সতর্কতা:** পূর্বের `শিক্ষা ও সংস্কৃতি` নামটি সম্পূর্ণ বাতিল করে **"সাহিত্য ও সংস্কৃতি"** (`literature-culture`) করা হয়েছে। ডাটাবেসে পুরোনো কোনো ডেটা থাকলে তা মাইগ্রেট করে আপডেট করতে হবে।

---

## ৫. ডাটাবেস স্কিমা ও মডেলসমূহ

### ৫.১ User / Staff স্কিমা
```typescript
interface User {
  _id: string;
  name: string;             // নাম (বাংলা/ইংরেজি)
  email: string;            // ইউনিক লগইন ইমেইল
  password: string;         // Bcrypt হ্যাশ
  role: "Super_Admin" | "Admin" | "Editor" | "Publisher" | "Reporter";
  avatar?: string;          // প্রোফাইল ছবির URL
  designation?: string;     // পদবি (যেমন: জ্যেষ্ঠ প্রতিবেদক, বার্তা সম্পাদক)
  bio?: string;             // সংক্ষিপ্ত পরিচিতি
  phone?: string;           // মোবাইল নম্বর
  isActive: boolean;        // ডিফল্ট: true
  createdAt: Date;
  updatedAt: Date;
}
```

### ৫.২ Category (ক্যাটাগরি) স্কিমা
```typescript
interface Category {
  _id: string;
  name: string;             // বাংলা নাম (যেমন: জাতীয়, সাহিত্য ও সংস্কৃতি)
  nameEn?: string;          // ইংরেজি নাম (National, Literature & Culture)
  slug: string;             // ইউনিক URL স্লাগ (যেমন: national, literature-culture)
  order: number;            // হেডারে প্রদর্শনের ক্রম (১ থেকে ২৯)
  isActive: boolean;        // মেনুতে সক্রিয় কি না (ডিফল্ট: true)
  metaTitle?: string;       // এসইও টাইটেল
  metaDescription?: string; // এসইও বিবরণ
}
```

### ৫.৩ Article / News (সংবাদ) স্কিমা
```typescript
interface Article {
  _id: string;
  title: string;                    // সংবাদের মূল বাংলা শিরোনাম
  titleEn?: string;                 // ইংরেজি শিরোনাম (ঐচ্ছিক)
  slug: string;                     // ইউনিক URL ফ্রেন্ডলি স্লাগ
  summary: string;                  // সারসংক্ষেপ (Excerpt)
  content: string;                  // মূল বডি (HTML / WYSIWYG)
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  subCategory?: {
    _id: string;
    name: string;
    slug: string;
  };
  leadImage: string;                // মূল ফিচার ছবির URL
  leadImageCaption?: string;        // ছবির ক্যাপশন
  leadImagePhotographer?: string;   // ছবির আলোকচিত্রী / কৃতজ্ঞতা
  galleryImages?: string[];         // অতিরিক্ত ছবিসমূহ
  author: {
    _id: string;
    name: string;
    avatar?: string;
    designation?: string;
  };
  customAuthorName?: string;        // বিশেষ প্রতিবেদক বা অতিথি লেখকের নাম
  district?: string;                // জেলা (যেমন: ঢাকা, বরিশাল, চট্টগ্রাম) - মানচিত্র ফিল্টারের জন্য
  division?: string;                // বিভাগ (যেমন: ঢাকা, চট্টগ্রাম, রাজশাহী)
  tags: string[];                   // কীওয়ার্ড বা ট্যাগ তালিকা
  status: "published" | "draft" | "scheduled" | "archived";
  
  // হোমপেজ ও স্পেশাল ডিসপ্লে ফ্ল্যাগসমূহ:
  isLead: boolean;                  // হোমপেজের প্রধান লিড সংবাদ (সর্বোচ্চ ১টি সক্রিয়)
  isFeatured: boolean;              // হোমপেজের ফিচারড গ্রিডে প্রদর্শিত হবে (শীর্ষ ৪টি)
  isBreaking: boolean;              // ব্রেকিং নিউজ টিকারে স্ক্রল করবে
  isSpecialTop: boolean;            // বাংলার আলো স্পেশাল সেকশনের সংবাদ
  
  viewsCount: number;               // পঠিত সংখ্যা (ডিফল্ট: 0)
  publishedAt: Date;                // প্রকাশের সময়
  createdAt: Date;
  updatedAt: Date;
}
```

### ৫.৪ Breaking News (ব্রেকিং নিউজ) স্কিমা
```typescript
interface BreakingNews {
  _id: string;
  headline: string;                 // ব্রেকিং টেক্সট (বাংলা)
  headlineEn?: string;              // ইংরেজি টেক্সট
  link?: string;                    // ক্লিকের পর যাওয়ার লিংক (যেমন: /news/slug)
  categoryName?: string;            // বিভাগের নাম (যেমন: জাতীয়)
  priority: number;                 // প্রদর্শনের অগ্রাধিকার (1, 2, 3...)
  isActive: boolean;                // চালু / বন্ধ স্ট্যাটাস
  expiresAt?: Date;                 // স্বয়ংক্রিয় নিষ্ক্রিয় হওয়ার তারিখ
  createdAt: Date;
}
```

### ৫.৫ Site Settings (সাইট সেটিংস) স্কিমা
```typescript
interface SiteSettings {
  _id: string;
  siteName: string;                 // "বাংলার আলো নিউজ"
  siteSlogan: string;               // "স্বাধীনতা ও মানবতার কথা বলে"
  logo: string;                     // হেডারের লোগো URL
  footerLogo: string;               // ফুটারের ডার্কমোড লোগো URL
  favicon: string;                  // ফেভিকন URL
  
  // সম্পাদকীয় ও কার্যালয়:
  editorName: string;               // "মোঃ গোলাম মাওলা শাওন"
  editorPhone: string;              // "০১৭১১-০০৬২১৪"
  publisherName: string;            // "মোঃ গোলাম মাওলা শাওন"
  officeAddress: string;            // "৩১/১ শরীফ কমপ্লেক্স (৬ষ্ঠ তলা), পুরানা পল্টন, ঢাকা-১০০০"
  phone: string;                    // "০১৯৯৯-৯৫৩৯৭০"
  email: string;                    // "banglaralonewsbd@gmail.com"
  
  // পার্টনার ও সোশ্যাল মিডিয়া:
  techSupport: string;              // "Banglar Alo IT"
  techSupportUrl: string;           // "https://banglaraloit.com"
  facebookUrl: string;              // "https://www.facebook.com/BanglarAloNewsBD/"
  youtubeUrl: string;               // "https://youtube.com"
  twitterUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
}
```

### ৫.৬ Advertisement (বিজ্ঞাপন) স্কিমা
```typescript
interface Advertisement {
  _id: string;
  title: string;                    // বিজ্ঞাপনের নাম / ক্লায়েন্ট
  placement: 
    | "home_top"                    // হেডারের নিচে
    | "home_middle"                 // সেকশনের মাঝে
    | "sidebar"                     // সাইডবার বিজ্ঞাপন
    | "category_top"                // ক্যাটাগরি পাতার উপরে
    | "article_inside"              // খবরের বডির মাঝে
    | "popup";                      // পপআপ বিজ্ঞাপন
  imageUrl: string;                 // ব্যানারের ইমেজ লিংক
  targetUrl: string;                // ক্লিকের পর যাওয়ার গন্তব্য লিংক
  impressionsCount: number;         // মোট প্রদর্শিত সংখ্যা
  clicksCount: number;              // মোট ক্লিক সংখ্যা
  isActive: boolean;
  startDate: Date;
  endDate: Date;
}
```

---

## ৬. পাবলিক API এন্ডপয়েন্ট রেফারেন্স

### ৬.১ হোমপেজ অ্যাগ্রিগেটর (Fast 0ms TTFB All-in-One Payload)
হোমপেজের দ্রুত ফার্স্ট পেইন্ট এবং রেন্ডারিং নিশ্চিত করতে এই এন্ডপয়েন্টটি সবচেয়ে গুরুত্বপূর্ণ। এটি এক রিকোয়েস্টেই হোমপেজের সকল সেকশনের সংবাদ অ্যারে প্রদান করে:
* **Method:** `GET /api/v1/news/home`
* **Response `data` Structure:**
```json
{
  "leadArticle": { /* প্রধান শীর্ষ সংবাদ */ },
  "featuredArticles": [ /* শীর্ষ ৪টি ফিচারড কার্ড */ ],
  "latestArticles": [ /* সর্বশেষ ৬টি তাজা খবর */ ],
  "popularArticles": [ /* সর্বাধিক পঠিত সংবাদসমূহ */ ],
  "saradeshArticles": [ /* সারাদেশের ৬টি সংবাদ */ ],
  "nationalArticles": [ /* জাতীয় সংবাদসমূহ */ ],
  "politicsArticles": [ /* রাজনীতি সংবাদসমূহ */ ],
  "internationalArticles": [ /* আন্তর্জাতিক সংবাদসমূহ */ ],
  "businessArticles": [ /* ব্যবসা ও বাণিজ্য সংবাদসমূহ */ ],
  "economyArticles": [ /* অর্থনীতি সংবাদসমূহ */ ],
  "crimeArticles": [ /* অপরাধ ও দুর্নীতি সংবাদসমূহ */ ],
  "educationArticles": [ /* শিক্ষা সংবাদসমূহ */ ],
  "sportsArticles": [ /* খেলাধুলা সংবাদসমূহ */ ],
  "entertainmentArticles": [ /* বিনোদন সংবাদসমূহ */ ],
  "religionArticles": [ /* ধর্ম সংবাদসমূহ */ ],
  "accidentArticles": [ /* দুর্ঘটনা সংবাদসমূহ */ ],
  "womenArticles": [ /* নারী ও শিশু সংবাদসমূহ */ ],
  "literatureArticles": [ /* সাহিত্য ও সংস্কৃতি সংবাদসমূহ */ ],
  "videoItems": [ /* ভিডিও সংবাদসমূহ */ ]
}
```

### ৬.২ সংবাদ ফিল্টারিং, অনুসন্ধান ও পেজিনেশন
ক্যাটাগরি পেজ, সার্চ পেজ, ট্যাগ ও জেলাভিত্তিক ফিল্টারিংয়ের জন্য ব্যবহার হয়:
* **Method:** `GET /api/v1/news`
* **Query Parameters:**
  - `page` (number, default: `1`)
  - `limit` (number, default: `12`)
  - `category` (string slug, যেমন: `national`, `countrywide`, `literature-culture`, `business`)
  - `subCategory` (string slug)
  - `search` (string, শিরোনাম ও কনটেন্টে বাংলা/ইংরেজি সার্চ)
  - `district` (string, যেমন: `ঢাকা`, `চট্টগ্রাম`, `বগুড়া` - মানচিত্রের জন্য)
  - `division` (string, যেমন: `ঢাকা`, `বরিশাল`)
  - `tag` (string slug)
  - `isFeatured` (boolean)
  - `isLead` (boolean)
  - `isBreaking` (boolean)
  - `sort` (string, default: `-publishedAt`)

### ৬.৩ একক সংবাদের বিস্তারিত দেখা (Single Article View)
* **Method:** `GET /api/v1/news/slug/:slug`
* **বিবরণ:** সংবাদের পূর্ণাঙ্গ তথ্য ও একই ক্যাটাগরির ৪টি `relatedArticles` প্রদান করে এবং ব্যাকএন্ডে স্বয়ংক্রিয়ভাবে `viewsCount` ১ বৃদ্ধি করে।
* **Response `data`:**
```json
{
  "article": { ... },
  "relatedArticles": [ ... ]
}
```

### ৬.৪ সংবাদ আর্কাইভ অনুসন্ধান (News Archive Search)
মেনুবারে যুক্ত হওয়া **"আর্কাইভ"** পেজের জন্য:
* **Method:** `GET /api/v1/news/archive`
* **Query Parameters:**
  - `date` (`YYYY-MM-DD` ফরম্যাটে নির্দিষ্ট তারিখ, বাধ্যতামূলক)
  - `category` (ঐচ্ছিক ক্যাটাগরি স্লাগ)
  - `page` (default: `1`)
  - `limit` (default: `16`)

### ৬.৫ ক্যাটাগরি তালিকা (Dynamic Navigation Menu)
* **Method:** `GET /api/v1/categories`
* **বিবরণ:** `order: 1` অনুযায়ী সাজানো সক্রিয় ক্যাটাগরিসমূহ ফেরত দেয়, যা মেনুবার এবং "আরও" ড্রপডাউনকে ১০০% ডায়নামিক রাখে।

### ৬.৬ সক্রিয় ব্রেকিং নিউজ
* **Method:** `GET /api/v1/breaking`
* **বিবরণ:** বর্তমানে সক্রিয় ও অগ্রাধিকারপ্রাপ্ত ব্রেকিং নিউজের তালিকা প্রদান করে।

### ৬.৭ সাইট সেটিংস (Header & Footer Content)
* **Method:** `GET /api/v1/settings`
* **বিবরণ:** সাইটের নাম, স্লোগান, লোগো, সম্পাদক ও কার্যালয়ের ঠিকানা, ফোন এবং সোশ্যাল মিডিয়া লিংক প্রদান করে।

### ৬.৮ সক্রিয় বিজ্ঞাপন (Advertisements)
* **Method:** `GET /api/v1/ads/active`
* **Method:** `POST /api/v1/ads/track-impression` (Body: `{ adId: string }`)
* **Method:** `POST /api/v1/ads/track-click` (Body: `{ adId: string }`)

### ৬.৯ নিউজলেটার সাবস্ক্রিপশন
* **Method:** `POST /api/v1/newsletters/subscribe`
* **Request Body:** `{ "email": "reader@example.com" }`

### ৬.১০ ভিজিটর অ্যানালিটিক্স হিট
* **Method:** `POST /api/v1/analytics/visit`
* **Request Body:** `{ "path": "/category/national" }`

---

## ৭. অ্যাডমিন ও ম্যানেজমেন্ট API এন্ডপয়েন্ট

> 🔒 **নিরাপত্তা নোট:** নিচের প্রতিটি রিকোয়েস্টে `Authorization: Bearer <TOKEN>` হেডার আবশ্যক।

### ৭.১ অথেনটিকেশন
* `POST /api/v1/auth/login` — অ্যাডমিন/রিপোর্টার লগইন
  ```json
  { "email": "admin@banglaralonews.com", "password": "yourpassword" }
  ```
* `GET /api/v1/auth/me` — বর্তমান সেশন ও রোল ভেরিফিকেশন
* `POST /api/v1/auth/logout` — লগআউট

### ৭.২ সংবাদ পরিচালনা (News CRUD)
* `GET /api/v1/news/admin` — অ্যাডমিন ফিল্টার সহ সকল সংবাদ তালিকা (ড্রাফট, পাবলিশড, শিডিউল্ড)
* `POST /api/v1/news` — নতুন সংবাদ তৈরি
* `GET /api/v1/news/:id` — সম্পাদনার জন্য আইডি অনুযায়ী সংবাদ ফেচ
* `PUT /api/v1/news/:id` — সংবাদ আপডেট
* `DELETE /api/v1/news/:id` — সংবাদ ডিলিট
* `PATCH /api/v1/news/:id/special-toggle` — ১-ক্লিক ফ্ল্যাগ টগল (লিড, ফিচারড, ব্রেকিং, স্পেশাল)
  ```json
  { "flag": "isLead" } // অথবা "isFeatured", "isBreaking", "isSpecialTop"
  ```

### ৭.৩ ক্যাটাগরি পরিচালনা
* `POST /api/v1/categories` — নতুন ক্যাটাগরি তৈরি
* `PUT /api/v1/categories/:id` — ক্যাটাগরি আপডেট
* `DELETE /api/v1/categories/:id` — ক্যাটাগরি ডিলিট

### ৭.৪ ব্রেকিং নিউজ পরিচালনা
* `POST /api/v1/breaking` — ব্রেকিং নিউজ তৈরি
* `PUT /api/v1/breaking/:id` — আপডেট
* `DELETE /api/v1/breaking/:id` — ডিলিট

### ৭.৫ সাইট সেটিংস আপডেট
* `PATCH /api/v1/settings` — সাইটের তথ্য, সম্পাদকীয় নাম, ফোন, ঠিকানা ও সোশ্যাল লিংক আপডেট

### ৭.৬ ফাইল ও ইমেজ আপলোড
* `POST /api/v1/upload`
* **Content-Type:** `multipart/form-data` (Field: `image`)
* **Success Response:**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "ছবি সফলভাবে আপলোড হয়েছে",
    "data": {
      "url": "https://api.banglaralonews.com/uploads/news-1719284.webp"
    }
  }
  ```

### ৭.৭ ড্যাশবোর্ড ওভারভিউ অ্যানালিটিক্স
* `GET /api/v1/analytics/stats` — মোট সংবাদ, আজকের সংবাদ, মোট ভিউ, সক্রিয় রিপোর্টার সংখ্যা।
* `GET /api/v1/analytics/visitors` — বিগত ৭ দিনের ভিজিটর চার্ট ডাটা।

---

## ৮. স্বয়ংক্রিয় সংবাদ ও স্ক্র্যাপার ইঞ্জিন (Auto News)

অ্যাডমিন প্যানেলে এক্সটার্নাল লিংক থেকে সংবাদ অটোমেট ও স্ক্র্যাপ করার ফিচার সংযুক্ত রয়েছে:

1. **ইনস্ট্যান্ট ইউআরএল স্ক্র্যাপার:**
   * **Method:** `POST /api/v1/scraper/scrape`
   * **Request Body:** `{ "url": "https://some-news-source.com/article-123" }`
   * **Response:** স্ক্র্যাপ করা `{ title, summary, content, leadImage, tags }` অবজেক্ট।

2. **অটো-নিউজ কনফিগারেশন ও সোর্স:**
   * `GET /api/v1/auto-news/stats` — অটো নিউজের স্ট্যাটাস ও পোস্ট সংখ্যা
   * `POST /api/v1/auto-news/toggle` — অন/অফ টগল `{ "status": "ON" | "OFF" }`
   * `POST /api/v1/auto-news/run-now` — তাৎক্ষণিক ক্রলার রান
   * `GET /api/v1/auto-news/sources` — সোর্স তালিকা
   * `POST /api/v1/auto-news/sources` — নতুন সোর্স যোগ
   * `PATCH /api/v1/auto-news/sources/:id` — সোর্স আপডেট
   * `DELETE /api/v1/auto-news/sources/:id` — সোর্স ডিলিট
   * `GET /api/v1/auto-news/logs` — ক্রলিং লগস

---

## ৯. রিয়েল-টাইম ব্রডকাস্ট ও লাইভ আপডেট

হোমপেজে রিয়েল-টাইম আপডেট পাওয়ার জন্য ফ্রন্টএন্ডে **Broadcast Channel API** সংযুক্ত রয়েছে:
* **চ্যানেলের নাম:** `banglar_alo_news_channel`
* **ইভেন্ট টাইপ:** `ARTICLE_PUBLISHED`
* অ্যাডমিন প্যানেল থেকে কোনো সংবাদ প্রকাশিত হলে বা ব্যাকএন্ড থেকে সংবাদের আপডেট আসলে এই ইভেন্টের মাধ্যমে পেজ রিফ্রেশ ছাড়াই ভিজিটরের হোমপেজে নতুন সংবাদ সাথে সাথে যুক্ত হয়ে যায়।

---

## ১০. দ্রুত রান ও টেস্টিং চেকলিস্ট

1. ডাটাবেস তৈরি করুন (MongoDB/PostgreSQL/MySQL) এবং ক্যাটাগরি তালিকা সিড (Seed) করুন।
2. ব্যাকএন্ড সার্ভার চালু করুন (যেমন পোর্ট `5000` এ)।
3. ফ্রন্টএন্ড ফোল্ডারে `.env` চেক করুন:
   ```env
   PORT=3010
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   BACKEND_API_URL=http://localhost:5000/api/v1
   ```
4. ফ্রন্টএন্ড সার্ভার চালু করুন:
   ```bash
   npm run dev
   ```
5. ব্রাউজারে টেস্ট করুন:
   - প্রচ্ছদ: [http://localhost:3010](http://localhost:3010)
   - ক্যাটাগরি: [http://localhost:3010/category/national](http://localhost:3010/category/national)
   - আর্কাইভ: [http://localhost:3010/archive](http://localhost:3010/archive)
   - অ্যাডমিন প্যানেল: [http://localhost:3010/admin](http://localhost:3010/admin)
