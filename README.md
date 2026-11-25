# বাংলার আলো নিউজ (Banglar Alo News) - অনলাইন সংবাদপত্র

"সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর" — **বাংলার আলো নিউজ (Banglar Alo News)** একটি আধুনিক, বিদ্যুৎগতির ও নির্ভরযোগ্য জাতীয় অনলাইন সংবাদ পোর্টাল এবং পূর্ণাঙ্গ অ্যাডমিন কন্ট্রোল প্যানেল।

---

## 🎨 মূল বৈশিষ্ট্য ও কাস্টমাইজেশন (Core Features & Customization)

* **মেনু বার থিম:** **সবুজ (Green Theme: `#0B7A43`, Border: `#065F34`)**
* **অফিসিয়াল যোগাযোগ:**
  - **ফোন:** `01721539025`
  - **ইমেইল:** `support.shikkhasangbad@gmail.com`
* **পোর্ট:** `3010` ([http://localhost:3010](http://localhost:3010))
* **অ্যাডমিন ড্যাশবোর্ড:** [http://localhost:3010/admin](http://localhost:3010/admin)
* **লগইন ক্রেডেনশিয়াল:** `admin@banglaralonews.com`
* **ব্যাকএন্ড ডেভেলপার ডকুমেন্টেশন:** `BACKEND_API_REQUIREMENTS.md` এবং `frontend-api-guide.md`
* **পোস্টম্যান কালেকশন:** `banglar-alo-news-api.postman_collection.json`

---

## 🚀 প্রযুক্তি বিবরণী (Tech Stack)
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Typography:** SolaimanLipi, Noto Sans Bengali

---

## 💻 লোকাল ডেভেলপমেন্ট (Local Development)

```bash
# ডিপেন্ডেন্সি ইনস্টল (যদি প্রয়োজন হয়)
npm install

# ডেভেলপমেন্ট সার্ভার চালু করুন (Port 3010)
npm run dev

# প্রোডাকশন বিল্ড
npm run build
```

ব্রাউজারে ওপেন করুন:
- পাবলিক নিউজ পোর্টাল: [http://localhost:3010](http://localhost:3010)
- অ্যাডমিন প্যানেল: [http://localhost:3010/admin](http://localhost:3010/admin)

---

## 📌 প্রধান রুটসমূহ (Key Routes)
- **প্রচ্ছদ (হোমপেজ):** `/`
- **বিভাগভিত্তিক সংবাদ:** `/category/[slug]`
- **বিস্তারিত সংবাদ:** `/news/[slug]`
- **সর্বশেষ সংবাদ:** `/latest`
- **জনপ্রিয় সংবাদ:** `/popular`
- **পুরাতন নিউজ আর্কাইভ:** `/archive`
- **ফটো গ্যালারি:** `/gallery`
- **ভিডিও কর্নার:** `/videos`
- **ফটোকার্ড স্টুডিও:** `/photocard`
- **বিজ্ঞাপন তথ্য:** `/advertise`
- **আমাদের সম্পর্কে:** `/about`
- **যোগাযোগ:** `/contact`
- **অ্যাডমিন প্যানেল:** `/admin`
