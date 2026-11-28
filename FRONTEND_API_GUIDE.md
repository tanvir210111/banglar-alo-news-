# 📰 দৈনিক বাংলার আলো নিউজ (Banglar Alo News)
## ফ্রন্টএন্ড ডেভেলপারদের জন্য পূর্ণাঙ্গ API ইন্টিগ্রেশন ও ডেভেলপমেন্ট গাইড

> **ডকুমেন্ট স্ট্যাটাস:** আপডেট ও চূড়ান্ত (Backend Fully Modified & Ready)  
> **টার্গেট ফ্রন্টএন্ড ফ্রেমওয়ার্ক:** Next.js 16 (App Router), TypeScript, Tailwind CSS  
> **থিম কালার:** **সবুজ (Green: `#0B7A43`, Dark Accent: `#065F34`)**

---

## ১. সার্ভার সংযোগ ও এনভায়রনমেন্ট ভ্যারিয়েবল (.env)

ফ্রন্টএন্ড প্রোজেক্টের রুট ডিরেক্টরিতে `.env` বা `.env.local` ফাইলে নিচের কনফিগারেশন সেট করুন:

```env
PORT=3010
NEXT_PUBLIC_API_URL=http://localhost:5009/api/v1
BACKEND_API_URL=http://localhost:5009/api/v1
```

> 💡 **নোট:** প্রোডাকশনে `http://localhost:5009/api/v1`-এর পরিবর্তে আপনার লাইভ ব্যাকএন্ড ডোমেইন বসবে (যেমন: `https://api.banglaralonews.com/api/v1`)।

---

## ২. ইউনিফাইড রেসপন্স ইনভেলপ (Unified Response Envelope)

ব্যাকএন্ডের প্রতিটি এন্ডপয়েন্ট একই স্ট্যান্ডার্ড স্ট্রাকচারে রেসপন্স প্রদান করে:

### ২.১ সাধারণ ডেটা রেসপন্স
```typescript
interface ApiResponse<T> {
  statusCode: number;      // 200, 201, 400, 401, 404, 500
  success: boolean;        // true | false
  message: string;         // ব্যবহারকারী-বান্ধব বার্তা
  data: T;                 // রেসপন্স অবজেক্ট বা অ্যারে
}
```

### ২.২ পেজিনেটেড ডেটা রেসপন্স (Lists)
```typescript
interface PaginatedResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;          // বর্তমান পেজ নম্বর
    limit: number;         // প্রতি পেজে আইটেম সংখ্যা
    total: number;         // মোট আইটেম সংখ্যা
    totalPages: number;    // মোট পেজ সংখ্যা
  };
}
```

---

## ৩. অথেনটিকেশন ও হেডার্স

* **প্রটোকল:** JWT (JSON Web Token)
* **প্রটেক্টেড রিকোয়েস্ট হেডার:**
  ```http
  Authorization: Bearer <YOUR_ACCESS_TOKEN>
  Content-Type: application/json
  ```
* **ডিফল্ট সুপার অ্যাডমিন ক্রেডেনশিয়াল:**
  - **Email:** `admin@banglaralonews.com`
  - **Password:** `Admin@12345`
* **লগইন এন্ডপয়েন্ট:** `POST /api/v1/auth/login`
* **কারেন্ট ইউজার চেক:** `GET /api/v1/auth/me`

---

## ৪. ক্যাটাগরি ও মেনুবার বিন্যাস (২৯টি অফিসিয়াল ক্যাটাগরি)

ডাটাবেসে ২৯টি ক্যাটাগরি ক্রমানুসারে সিড করা রয়েছে। এগুলো সম্পূর্ণ ডায়নামিক এবং হেডারের নেভিগেশন বারে প্রদর্শিত হবে:

### ৪.১ প্রধান মেনুবার ক্যাটাগরি (Primary Navbar: Order 1 to 11)
| Order | বাংলা নাম | nameEn | স্লাগ (slug) | নেক্সটজেএস রুট / লিংক |
|:---:|:---|:---|:---|:---|
| **১** | **সর্বশেষ** | Latest | `latest` | `/latest` (বা হোমপেজের সর্বশেষ সেকশন) |
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

### ৪.২ 'আরও' ড্রপডাউনের ক্যাটাগরিসমূহ (More Dropdown: Order 12 to 29)
| Order | বাংলা নাম | nameEn | স্লাগ (slug) | নেক্সটজেএস রুট / লিংক |
|:---:|:---|:---|:---|:---|
| **১২** | অর্থনীতি | Economy | `economy` | `/category/economy` |
| **১৩** | আমাদের পরিবার | Our Family | `our-family` | `/our-family` |
| **১৪** | দুর্ঘটনা | Accidents | `accident` | `/category/accident` |
| **১৫** | চাকুরী | Jobs | `jobs` | `/category/jobs` |
| **১৬** | কৃষি | Agriculture | `agriculture` | `/category/agriculture` |
| **১৭** | ফিচার | Features | `features` | `/category/features` |
| **১৮** | লাইফস্টাইল | Lifestyle | `lifestyle` | `/category/lifestyle` |
| **১৯** | ভ্রমণ | Travel | `travel` | `/category/travel` |
| **২০** | সম্পাদকীয় | Editorial | `editorial` | `/category/editorial` |
| **২১** | স্বাস্থ্য | Health | `health` | `/category/health` |
| **২২** | আইন আদালত | Law & Court | `law-and-court` | `/category/law-and-court` |
| **২৩** | মতামত | Opinion | `opinion` | `/category/opinion` |
| **২৪** | সাহিত্য ও সংস্কৃতি | Literature & Culture | `literature-culture` | `/category/literature-culture` |
| **২৫** | শেয়ার বাজার | Share Market | `share-market` | `/category/share-market` |
| **২৬** | প্রবাসে বাংলাদেশ | Expatriate Bangladesh | `expatriate` | `/category/expatriate` |
| **২৭** | রাজধানী | Capital | `capital` | `/category/capital` |
| **২৮** | নারী ও শিশু | Women & Children | `women-and-children` | `/category/women-and-children` |
| **২৯** | প্রযুক্তি | Technology | `technology` | `/category/technology` |

> 📌 **ক্যাটাগরি ফেচিং API:** `GET /api/v1/categories`  
> এটি `order: 1` অনুযায়ী সাজানো সক্রিয় ক্যাটাগরির তালিকা ফেরত দেয়।

---

## ৫. হোমপেজ অল-ইন-ওয়ান অ্যাগ্রিগেটর (0ms TTFB Payload)

হোমপেজে একাধিক আলাদা API কল করার কোনো প্রয়োজন নেই। মাত্র **১টি রিকোয়েস্টে** পুরো হোমপেজের সব সেকশনের খবর পাওয়া যাবে:

* **Endpoint:** `GET /api/v1/news/home`
* **Response `data` Structure:**

```json
{
  "leadArticle": {
    "id": "...",
    "title": "প্রধান শীর্ষ সংবাদ...",
    "slug": "lead-news-slug",
    "summary": "সংক্ষিপ্ত সারসংক্ষেপ...",
    "featuredImage": "https://...",
    "publishedDate": "2026-11-25T10:00:00.000Z",
    "viewsCount": 1200,
    "category": { "id": "...", "name": "জাতীয়", "slug": "national" },
    "isLead": true
  },
  "featuredArticles": [ /* শীর্ষ ৪টি ফিচারড কার্ড */ ],
  "latestArticles": [ /* সর্বশেষ ৬টি তাজা খবর */ ],
  "popularArticles": [ /* সর্বাধিক পঠিত ৬টি সংবাদ (rank সহ) */ ],
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
  "videoItems": [ /* ভিডিও সংবাদসমূহ (Facebook / YouTube) */ ],
  "breakingNews": [ /* ব্রেকিং নিউজ আইটেমস */ ],
  "ads": {
    "home_top": [ /* টপ বিজ্ঞাপন */ ],
    "home_middle": [ /* মিডল বিজ্ঞাপন */ ]
  },
  "siteSettings": {
    "siteName": "বাংলার আলো নিউজ",
    "siteSlogan": "স্বাধীনতা ও মানবতার কথা বলে",
    "editorName": "মোঃ গোলাম মাওলা শাওন",
    "phone": "০১৯৯৯-৯৫৩৯৭০",
    "email": "banglaralonewsbd@gmail.com"
  }
}
```

---

## ৬. সংবাদ ফিল্টারিং, অনুসন্ধান ও ৬৪ জেলা মানচিত্র নেভিগেশন

* **Endpoint:** `GET /api/v1/news`
* **Query Parameters:**

| Parameter | Type | বিবরণ ও উদাহরণ |
|---|---|---|
| `page` | number | পেজ নম্বর (default: `1`) |
| `limit` | number | আইটেম সংখ্যা (default: `12`) |
| `category` | string | ক্যাটাগরি স্লাগ (যেমন: `national`, `countrywide`, `literature-culture`, `business`) |
| `search` / `q` | string | শিরোনাম ও খবরে বাংলা বা ইংরেজি কিওয়ার্ড সার্চ |
| `district` | string | **জেলা ফিল্টার (বাংলা বা ইংরেজি উভয় গ্রহণযোগ্য)**: `dhaka`, `ঢাকা`, `barishal`, `বরিশাল`, `rangpur`, `রংপুর` |
| `upazila` | string | উপজেলা ফিল্টার: `mirpur`, `মিরপুর`, `bakerganj`, `বাকেরগঞ্জ` |
| `division` | string | বিভাগ: `Dhaka`, `Barishal`, `ঢাকা` |
| `tag` | string | ট্যাগ ফিল্টার |
| `isFeatured` | boolean | ফিচারড খবর ফিল্টার |
| `isLead` | boolean | লিড খবর ফিল্টার |
| `isBreaking` | boolean | ব্রেকিং খবর ফিল্টার |
| `sort` | string | সর্টিং (default: `-publishedAt`) |

### ৬৪ জেলা ইন্টারঅ্যাক্টিভ মানচিত্র ও ড্রপডাউন উদাহরণ:
```javascript
// ঢাকা জেলার সংবাদ আনতে:
fetch('/api/v1/news?district=dhaka&limit=20&page=1')
// অথবা বাংলায়:
fetch('/api/v1/news?district=ঢাকা&limit=20&page=1')
```

---

## ৭. একক সংবাদের বিস্তারিত (Single Article Page)

* **Endpoint:** `GET /api/v1/news/slug/:slug`
* **Response `data`:**
  - সংবাদের পূর্ণাঙ্গ HTML কনটেন্ট (`content`), সারসংক্ষেপ (`summary`), ফিচারড ইমেজ, ফটোগ্রাফার, ট্যাগ, লেখক ইত্যাদি।
  - `relatedArticles`: একই ক্যাটাগরির ৪টি সম্পর্কিত খবরের তালিকা।
  - `navigation`: পূর্ববর্তী (`prevNews`) ও পরবর্তী (`nextNews`) খবরের লিংক।
  - `sidebar`: সর্বশেষ ও সর্বাধিক পঠিত খবর।
* **ভিউ ট্র্যাকিং:** এই এন্ডপয়েন্টে ভিজিট করলে ব্যাকএন্ডে স্বয়ংক্রিয়ভাবে খবরের `viewsCount` ১ বৃদ্ধি পায়।

---

## ৮. সংবাদ আর্কাইভ অনুসন্ধান (News Archive Page)

মেনুবারের **"আর্কাইভ"** পেজে সকল সংরক্ষিত/আর্কাইভ খবর দেখতে এবং নির্দিষ্ট তারিখ ও ক্যাটাগরি অনুযায়ী খবর ফিল্টার করতে:

* **Endpoint:** `GET /api/v1/news/archive`
* **Query Parameters (সকল প্যারামিটারই ঐচ্ছিক / Optional):**
  - `page`: পেজ নম্বর (default: `1`)
  - `limit`: প্রতি পেজে নিউজ সংখ্যা (default: `16`, সর্বোচ্চ: `100`)
  - `date`: `YYYY-MM-DD` ফরম্যাটে নির্দিষ্ট তারিখ (ঐচ্ছিক, যেমন: `2026-11-24`)
  - `startDate`: রেঞ্জ অনুসন্ধানের শুরুর তারিখ (ঐচ্ছিক)
  - `endDate`: রেঞ্জ অনুসন্ধানের শেষ তারিখ (ঐচ্ছিক)
  - `category`: ক্যাটাগরি স্লাগ বা আইডি (ঐচ্ছিক, যেমন: `crime-corruption`, `national`, `sports`)
  - `search`: শিরোনাম বা কনটেন্টে কীওয়ার্ড সার্চ (ঐচ্ছিক, যেমন: `মাদক`)
  - `district`: জেলা অনুযায়ী ফিল্টার (ঐচ্ছিক, যেমন: `ঢাকা` বা `dhaka`)
  - `upazila`: উপজেলা অনুযায়ী ফিল্টার (ঐচ্ছিক)
  - `sortBy`: সর্ট ফিল্ড (default: `publishedDate`)
  - `sortOrder`: `desc` (নতুনগুলো আগে) অথবা `asc` (পুরাতনগুলো আগে)

> **নোট:** এই এন্ডপয়েন্টটি শুধুমাত্র যেসকল সংবাদের স্ট্যাটাস `ARCHIVED` কেবল সেগুলিই রিটার্ন করে (মোট সংখ্যা `total`-এও শুধু আর্কাইভ সংবাদই গণনা করা হয়)। কোনো প্যারামিটার না পাঠালে স্বয়ংক্ৰিয়ভাবে সকল আর্কাইভ সংবাদ পেজিনেশন (`meta: { page, limit, total, totalPages }`) আকারে আসে। আর কোনো ফিল্টার (যেমন `date`, `category`, `search`) দিলে সেই ফিল্টার অনুযায়ী আর্কাইভ ডেটা আসবে।

---

## ৯. ভিডিও সংবাদ ব্যবস্থাপনা API (Section 11)

ফেসবুক পেজের ভিডিও, রিলস (Reels) কিংবা ইউটিউব ভিডিও প্রদর্শনের জন্য সম্পূর্ণ স্বয়ংক্রিয় এআই চালিত ভিডিও ম্যানেজমেন্ট:

* **ভিডিও তালিকা ফেচ (Public):**
  - `GET /api/v1/videos` (বা `GET /api/v1/news/videos`)
  - Query Params:
    - `limit`: ডিফল্ট ১০ (সর্বোচ্চ ৫০)
    - `category`: ঐচ্ছিক ফিল্টার (`"ভিডিও সংবাদ"`, `"টকশো"`, `"বিশেষ প্রতিবেদন"`, `"লাইভ"`)
    - `platform`: `"facebook"` | `"youtube"`
    - `isFeatured`: `true` | `false`

* **ভিডিও মেটাডেটা লাইভ প্রিভিউ (AI & Scraper Auto-Detection):**
  - `GET /api/v1/videos/fetch-meta?url=<VIDEO_URL>` অথবা `POST /api/v1/videos/fetch-meta`
  - Body: `{ "url": "https://www.youtube.com/watch?v=..." }` অথবা `{ "url": "https://www.facebook.com/reel/..." }`
  - রেসপন্স: স্বয়ংক্রিয়ভাবে অরিজিনাল হাই-রেজুলেশন থাম্বনেইল, ভিডিওর সঠিক দৈর্ঘ্য/ডিউরেশন (বাংলা ফরম্যাট যেমন `"০৩:৩১"` ও `"03:31"`), আসল ভিউ কাউন্ট (`viewsCount`, e.g. `1000000` বা `7600`), প্ল্যাটফর্ম ও টাইটেল রিটার্ন করে।

* **নতুন ভিডিও যুক্ত করা (Staff Protected):**
  - `POST /api/v1/videos` (বা `POST /api/v1/news/videos`)
  - 💡 **অটোমেশন নোট:** আপনি শুধুমাত্র `videoUrl` পাঠালেই ব্যাকএন্ডের এআই ও মেটাডেটা ইঞ্জিন স্বয়ংক্রিয়ভাবে ভিডিওর অরিজিনাল থাম্বনেইল (`thumbnail`), প্ল্যাটফর্ম (`platform`), ভিডিওর সঠিক সময়কাল (`duration`) এবং সোশ্যাল মিডিয়ার প্রাথমিক ভিউ সংখ্যা (`viewsCount`, যেমন 1M বা 7.6K থাকলে সরাসরি সংখ্যায় কনভার্ট হয়ে `1000000` বা `7600`) ডাটাবেসে সেভ করে নেবে। যদি ম্যানুয়ালি দেন, তবে আপনার দেওয়া মান প্রাধান্য পাবে।
  - Body (ন্যূনতম রিকোয়েস্ট):
    ```json
    {
      "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
    ```
  - Body (পূর্ণাঙ্গ ঐচ্ছিক কাস্টম রিকোয়েস্ট):
    ```json
    {
      "title": "আজকের দিনের আলোচিত সর্বশেষ সংবাদ ও বিশেষ বুলেটিন",
      "videoUrl": "https://www.facebook.com/reel/4275776555980402",
      "thumbnail": "",  // ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে অরিজিনাল থাম্বনেইল বসবে
      "duration": "",   // ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে ভিডিওর আসল সময়কাল যেমন "০৩:৩১" বসবে
      "viewsCount": 0,  // ০ বা ফাঁকা রাখলে ফেসবুক/ইউটিউবের আসল ভিউ কাউন্ট (যেমন 7600 বা 1000000) বসবে
      "category": "ভিডিও সংবাদ",
      "summary": "ভিডিও বুলেটিন সারসংক্ষেপ...",
      "isFeatured": true
    }
    ```
* **ভিডিও আপডেট:** `PATCH /api/v1/videos/:id` (বা `PUT /api/v1/videos/:id`) - নতুন ভিডিও লিংক দিলে থাম্বনেইল ও সময়কাল স্বয়ংক্রিয়ভাবে রি-ফেচ হবে।
* **ভিডিও ডিলিট:** `DELETE /api/v1/videos/:id`

---

## ১০. আমাদের পরিবার ব্যবস্থাপনা API (Section 12)

পত্রিকার সম্পাদকীয় পর্ষদ, বার্তা বিভাগ, বিভিন্ন ডেস্ক প্রধান, জেলা ও উপজেলা প্রতিনিধিদের তালিকা প্রদর্শনের জন্য:

* **পাবলিক তালিকা ফেচ:**
  - `GET /api/v1/our-family`
  - Query Params:
    - `category`: ঐচ্ছিক (`"editorial"` | `"desk"` | `"correspondent"` | `"management"`)
    - `isActive`: boolean (default `true`)
* **নতুন সদস্য যোগ করা (Staff Protected):**
  - `POST /api/v1/our-family`
  - Body:
    ```json
    {
      "name": "মোঃ গোলাম মাওলা শাওন",
      "role": "প্রকাশক ও সম্পাদক",
      "category": "editorial",
      "categoryTitle": "সম্পাদকীয় ও পরিচালনা পর্ষদ",
      "email": "banglaralonewsbd@gmail.com",
      "phone": "০১৭১১-০০৬২১৪",
      "photo": "https://...",
      "bio": "প্রতিষ্ঠাতা, প্রকাশক ও সম্পাদক, দৈনিক বাংলার আলো নিউজ।",
      "order": 1,
      "isActive": true
    }
    ```
* **বাল্ক সিঙ্ক (ঐচ্ছিক):** `POST /api/v1/our-family/sync`
* **সদস্য আপডেট:** `PUT /api/v1/our-family/:id`
* **সদস্য অপসারণ:** `DELETE /api/v1/our-family/:id`

---

## ১১. ব্যানার বিজ্ঞাপন ও স্লট API (Section 13 & 6.8)

* **সক্রিয় ব্যানার স্লটস ফেচ:** `GET /api/v1/ads/slots`
* **নির্দিষ্ট স্লট ব্যানার আপডেট (Admin):**
  - `PUT /api/v1/ads/slots/:slotId` (যেমন `slotId` = `home_top` বা `home_middle`)
  - Body:
    ```json
    {
      "imageUrl": "https://banglaraloit.com/banner.png",
      "targetUrl": "https://banglaraloit.com",
      "title": "Banglar Alo IT Leaderboard",
      "isActive": true
    }
    ```
* **সক্রিয় বিজ্ঞাপনসমূহ ফেচ:** `GET /api/v1/ads/active`
* **ইমপ্রেশন ট্র্যাকিং:** `POST /api/v1/ads/track-impression` (Body: `{ "adId": "..." }`)
* **ক্লিক ট্র্যাকিং:** `POST /api/v1/ads/track-click` (Body: `{ "adId": "..." }`)

---

## ১২. ব্রেকিং নিউজ ম্যানেজমেন্ট (Section 6.6 & 7.4)

* **সক্রিয় ব্রেকিং নিউজ ফেচ (Public):** `GET /api/v1/breaking`
* **অ্যাডমিন সকল ব্রেকিং নিউজ তালিকা:** `GET /api/v1/breaking/admin`
* **নতুন ব্রেকিং নিউজ তৈরি:** `POST /api/v1/breaking`
  ```json
  {
    "headline": "সারাদেশে মৃদু শৈত্যপ্রবাহের পূর্বাভাস দিয়েছে আবহাওয়া অধিদপ্তর",
    "headlineEn": "Cold wave warning nationwide",
    "link": "/category/national",
    "categoryName": "জাতীয়",
    "priority": 1,
    "isActive": true
  }
  ```
* **ব্রেকিং নিউজ আপডেট:** `PUT /api/v1/breaking/:id`
* **ব্রেকিং নিউজ ডিলিট:** `DELETE /api/v1/breaking/:id`

---

## ১৩. স্বয়ংক্রিয় সংবাদ ও স্ক্র্যাপার ইঞ্জিন (Auto News - Section 8)

* **ইনস্ট্যান্ট ইউআরএল স্ক্র্যাপার:**
  - `POST /api/v1/scraper/scrape`
  - Body: `{ "url": "https://www.prothomalo.com/bangladesh/district/..." }`
  - Response: `{ title, summary, content, leadImage, tags, category }`
* **অটো-নিউজ অন/অফ টগল:**
  - `POST /api/v1/auto-news/toggle`
  - Body: `{ "status": "ON" }` অথবা `{ "status": "OFF" }`
* **তাৎক্ষণিক ক্রলিং রান:** `POST /api/v1/auto-news/run-now`
* **অটো-নিউজ স্ট্যাটাস:** `GET /api/v1/auto-news/stats`
* **সোর্স তালিকা:** `GET /api/v1/auto-news/sources`

---

## ১৪. সাইট সেটিংস (Header & Footer Content)

* **ফেচ:** `GET /api/v1/settings`
* **আপডেট (Admin):** `PATCH /api/v1/settings`
* **ডিফল্ট ডেটা:**
  - `siteName`: "বাংলার আলো নিউজ"
  - `siteSlogan`: "স্বাধীনতা ও মানবতার কথা বলে"
  - `editorName`: "মোঃ গোলাম মাওলা শাওন"
  - `editorPhone`: "০১৭১১-০০৬২১৪"
  - `publisherName`: "মোঃ গোলাম মাওলা শাওন"
  - `officeAddress`: "৩১/১ শরীফ কমপ্লেক্স (৬ষ্ঠ তলা), পুরানা পল্টন, ঢাকা-১০০০"
  - `phone`: "০১৯৯৯-৯৫৩৯৭০"
  - `email`: "banglaralonewsbd@gmail.com"
  - `techSupport`: "Banglar Alo IT"
  - `techSupportUrl`: "https://banglaraloit.com"
  - `facebookUrl`: "https://www.facebook.com/BanglarAloNewsBD/"
  - `youtubeUrl`: "https://youtube.com"

---

## ১৫. রিয়েল-টাইম ব্রডকাস্ট (Broadcast Channel)

অ্যাডমিন প্যানেল থেকে কোনো সংবাদ প্রকাশিত হলে ক্লায়েন্টের হোমপেজে রিফ্রেশ ছাড়া রিয়েল-টাইম লাইভ আপডেটের জন্য ব্রাউজারের স্ট্যান্ডার্ড Broadcast Channel API ব্যবহার করা যাবে:

```javascript
// Next.js client component-এ:
useEffect(() => {
  const channel = new BroadcastChannel("banglar_alo_news_channel");
  channel.onmessage = (event) => {
    if (event.data?.type === "ARTICLE_PUBLISHED") {
      console.log("New article published, updating feed...", event.data.payload);
      // রিফ্রেশ অথবা ডেটা রি-ফেচ করুন (e.g. queryClient.invalidateQueries(['home']))
    }
  };
  return () => channel.close();
}, []);
```

---

## ১৬. নেক্সটজেএস ডেটা ফেচিং কোড স্নিপেট (Next.js 16 Fetching Example)

### হোমপেজ ডেটা ফেচিং (Server Component):
```typescript
// app/page.tsx
async function getHomeData() {
  const res = await fetch(`${process.env.BACKEND_API_URL}/news/home`, {
    next: { revalidate: 60 }, // ISR: প্রতি ৬০ সেকেন্ডে রিভ্যালিডেট
  });
  if (!res.ok) throw new Error("হোমপেজ ডাটা ফেচ করতে সমস্যা হয়েছে");
  const json = await res.json();
  return json.data;
}

export default async function HomePage() {
  const data = await getHomeData();
  return (
    <main>
      {/* প্রধান লিড সংবাদ */}
      <LeadNewsSection article={data.leadArticle} />

      {/* শীর্ষ ফিচারড সংবাদসমূহ */}
      <FeaturedGrid articles={data.featuredArticles} />

      {/* সর্বশেষ ও সর্বাধিক পঠিত */}
      <LatestAndPopular latest={data.latestArticles} popular={data.popularArticles} />

      {/* সারাদেশে সংবাদ */}
      <CategorySection title="সারাদেশ" articles={data.saradeshArticles} viewAllLink="/category/countrywide" />

      {/* ভিডিও গ্যালারি */}
      <VideoGallery items={data.videoItems} />
    </main>
  );
}
```

---

## ১৭. পোস্টম্যান কালেকশন

প্রোজেক্টের রুটে প্রস্তুতকৃত পোস্টম্যান কালেকশন ফাইলটি রয়েছে:
* 📄 `Banglaralonews-backend.postman_collection.json`
* Postman ওপেন করে `Import` বাটনে ক্লিক করে ফাইলটি ড্রপ করুন। সকল এনভায়রনমেন্ট ভ্যারিয়েবল এবং প্রি-সেট রিকোয়েস্ট তৈরি করাই আছে।

---

## ১৮. নামাজের সময়সূচি API (Prayer Times API - Dhaka & Bangladesh)

ইসলামিক ফাউন্ডেশন বাংলাদেশের নির্ভুল হিসাব (Karachi 18° প্যারামিটার এবং হানাফী আসর স্ট্যান্ডার্ড) অনুযায়ী রিয়েলটাইম নামাজের সময়সূচি।

### ১৮.১ এন্ডপয়েন্টসমূহ:
* **GET** `/api/v1/prayer-times` (ডিফল্ট ঢাকা ও বর্তমান সময়)
* **GET** `/api/v1/prayer` (সংক্ষিপ্ত এলিয়াস)
* **GET** `/api/v1/prayer-times/today`
* **GET** `/api/v1/prayer-times/dhaka`

### ১৮.২ কুয়েরি প্যারামিটারসমূহ (Optional):
| প্যারামিটার | টাইপ | ডিফল্ট | বিবরণ | উদাহরণ |
|:---|:---|:---|:---|:---|
| `city` / `district` | string | `dhaka` | বাংলাদেশের যেকোনো জেলা/বিভাগীয় শহর | `chittagong`, `sylhet`, `rajshahi`, `khulna` ইত্যাদি |
| `date` | string | আজকের তারিখ | নির্দিষ্ট তারিখের নামাজের সময়সূচি (YYYY-MM-DD) | `2026-11-28` |
| `madhab` | string | `hanafi` | মাযহাব নির্ধারণ (`hanafi` অথবা `shafi`) | `hanafi` |

### ১৮.৩ রেসপন্স স্ট্রাকচার (রিয়েলটাইম বর্তমান ওয়াক্ত, বাকি সময় ও পরবর্তী ওয়াক্ত সহ):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "নামাজের সময়সূচি সফলভাবে পাওয়া গেছে",
  "data": {
    "location": {
      "city": "Dhaka",
      "cityBn": "ঢাকা",
      "country": "Bangladesh",
      "countryBn": "বাংলাদেশ",
      "timezone": "Asia/Dhaka",
      "coordinates": { "latitude": 23.8103, "longitude": 90.4125 }
    },
    "date": {
      "gregorian": "2026-11-28",
      "gregorianFormatted": "শনিবার, 28 November 2026",
      "gregorianBn": "শনিবার, ২৮ নভেম্বর ২০২৬",
      "currentTime": "04:15 PM",
      "currentTimeBn": "০৪:১৫ অপরাহ্ন"
    },
    "currentWaqt": {
      "key": "asr",
      "nameEn": "Asr",
      "nameBn": "আসর",
      "startTime": { "time24": "15:35", "time12": "03:35 PM", "timeBn": "০৩:৩৫ অপরাহ্ন" },
      "endTime": { "time24": "17:11", "time12": "05:11 PM", "timeBn": "০৫:১১ অপরাহ্ন" },
      "remaining": {
        "hours": 0,
        "minutes": 55,
        "seconds": 40,
        "totalSeconds": 3340,
        "formattedEn": "55m",
        "formattedBn": "৫৫ মিনিট"
      },
      "isProhibited": false,
      "prohibitedWarning": null
    },
    "nextWaqt": {
      "key": "maghrib",
      "nameEn": "Maghrib",
      "nameBn": "মাগরিব",
      "startTime": { "time24": "17:11", "time12": "05:11 PM", "timeBn": "০৫:১১ অপরাহ্ন" },
      "startsIn": {
        "hours": 0,
        "minutes": 55,
        "seconds": 40,
        "totalSeconds": 3340,
        "formattedEn": "55m",
        "formattedBn": "৫৫ মিনিট"
      }
    },
    "schedule": {
      "sehriEnds": { "nameEn": "Sehri Ends", "nameBn": "সেহরি শেষ সময়", "time": { "time12": "04:58 AM", "timeBn": "০৪:৫৮ পূর্বাহ্ন" } },
      "fajr": { "nameEn": "Fajr", "nameBn": "ফজর", "startTime": { "time12": "05:02 AM", "timeBn": "০৫:০২ পূর্বাহ্ন" }, "endTime": { "time12": "06:22 AM", "timeBn": "০৬:২২ পূর্বাহ্ন" } },
      "sunrise": { "nameEn": "Sunrise", "nameBn": "সূর্যোদয়", "time": { "time12": "06:22 AM", "timeBn": "০৬:২২ পূর্বাহ্ন" } },
      "ishraq": { "nameEn": "Ishraq", "nameBn": "ইশরাক", "startTime": { "time12": "06:37 AM", "timeBn": "০৬:৩৭ পূর্বাহ্ন" }, "endTime": { "time12": "11:32 AM", "timeBn": "১১:৩২ পূর্বাহ্ন" } },
      "chasht": { "nameEn": "Chasht / Duha", "nameBn": "চাশত / দুহা", "startTime": { "time12": "06:37 AM", "timeBn": "০৬:৩৭ পূর্বাহ্ন" }, "endTime": { "time12": "11:32 AM", "timeBn": "১১:৩২ পূর্বাহ্ন" } },
      "zawal": { "nameEn": "Zawal / Midday", "nameBn": "দ্বিপ্রহর / যাওয়াল", "time": { "time12": "11:37 AM", "timeBn": "১১:৩৭ পূর্বাহ্ন" } },
      "dhuhr": { "nameEn": "Dhuhr", "nameBn": "যোহর", "startTime": { "time12": "11:47 AM", "timeBn": "১১:৪৭ পূর্বাহ্ন" }, "endTime": { "time12": "03:35 PM", "timeBn": "০৩:৩৫ অপরাহ্ন" } },
      "asr": { "nameEn": "Asr (Hanafi)", "nameBn": "আসর (হানাফী)", "startTime": { "time12": "03:35 PM", "timeBn": "০৩:৩৫ অপরাহ্ন" }, "endTime": { "time12": "05:11 PM", "timeBn": "০৫:১১ অপরাহ্ন" } },
      "sunset": { "nameEn": "Sunset / Iftar", "nameBn": "সূর্যাস্ত / ইফতার", "time": { "time12": "05:11 PM", "timeBn": "০৫:১১ অপরাহ্ন" } },
      "iftar": { "nameEn": "Iftar Time", "nameBn": "ইফতারের সময়", "time": { "time12": "05:11 PM", "timeBn": "০৫:১১ অপরাহ্ন" } },
      "maghrib": { "nameEn": "Maghrib", "nameBn": "মাগরিব", "startTime": { "time12": "05:11 PM", "timeBn": "০৫:১১ অপরাহ্ন" }, "endTime": { "time12": "06:30 PM", "timeBn": "০৬:৩০ অপরাহ্ন" } },
      "isha": { "nameEn": "Isha", "nameBn": "এশা", "startTime": { "time12": "06:30 PM", "timeBn": "০৬:৩০ অপরাহ্ন" }, "endTime": { "time12": "05:03 AM", "timeBn": "০৫:০৩ পূর্বাহ্ন" } },
      "tahajjud": { "nameEn": "Tahajjud", "nameBn": "তাহাজ্জুদ", "startTime": { "time12": "08:30 PM", "timeBn": "০৮:৩০ অপরাহ্ন" }, "endTime": { "time12": "04:58 AM", "timeBn": "০৪:৫৮ পূর্বাহ্ন" } }
    },
    "prohibitedTimes": [
      {
        "key": "sunrise",
        "nameBn": "সূর্যোদয়কালীন নিষিদ্ধ সময়",
        "startTime": { "time12": "06:22 AM", "timeBn": "০৬:২২ পূর্বাহ্ন" },
        "endTime": { "time12": "06:37 AM", "timeBn": "০৬:৩৭ পূর্বাহ্ন" },
        "descriptionBn": "সূর্যোদয় শুরু থেকে পরবর্তী ১৫ মিনিট পর্যন্ত সব ধরণের নামাজ পড়া নিষিদ্ধ।"
      },
      {
        "key": "zawal",
        "nameBn": "দ্বিপ্রহর / খাড়া দুপুরের নিষিদ্ধ সময়",
        "startTime": { "time12": "11:37 AM", "timeBn": "১১:৩৭ পূর্বাহ্ন" },
        "endTime": { "time12": "11:47 AM", "timeBn": "১১:৪৭ পূর্বাহ্ন" },
        "descriptionBn": "ঠিক দ্বিপ্রহরে সূর্য মাথার ওপর থাকা অবস্থায় (যোহরের ওয়াক্ত শুরুর ১০ মিনিট পূর্ব পর্যন্ত) নামাজ পড়া নিষিদ্ধ।"
      },
      {
        "key": "sunset",
        "nameBn": "সূর্যাস্তকালীন নিষিদ্ধ সময়",
        "startTime": { "time12": "04:56 PM", "timeBn": "০৪:৫৬ অপরাহ্ন" },
        "endTime": { "time12": "05:11 PM", "timeBn": "০৫:১১ অপরাহ্ন" },
        "descriptionBn": "সূর্য হলুদ বর্ণ ধারণ করা থেকে সূর্যাস্ত পর্যন্ত (মাগরিবের পূর্বের ১৫ মিনিট) নামাজ পড়া মাকরূহ।"
      }
    ]
  }
}
```

### ১৮.৪ ফ্রন্টএন্ড উইজেট কম্পোনেন্ট উদাহরণ (Next.js Header Widget):
```tsx
import React, { useEffect, useState } from "react";

export default function PrayerTimesWidget() {
  const [prayerData, setPrayerData] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/prayer-times`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPrayerData(json.data);
      })
      .catch(console.error);
  }, []);

  if (!prayerData) return null;

  const { currentWaqt, nextWaqt } = prayerData;

  return (
    <div className="flex items-center gap-3 bg-green-50 text-green-900 px-3 py-1.5 rounded-full text-xs font-medium">
      <span className="flex h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
      <span>
        এখন <strong>{currentWaqt.nameBn}</strong> ওয়াক্ত (বাকি: {currentWaqt.remaining.formattedBn})
      </span>
      <span className="text-gray-300">|</span>
      <span>
        পরবর্তী: <strong>{nextWaqt.nameBn}</strong> ({nextWaqt.startTime.timeBn})
      </span>
    </div>
  );
}
```
