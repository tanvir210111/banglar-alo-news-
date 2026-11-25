export interface FamilyMember {
  id: string;
  name: string;
  role: string; // e.g. "প্রকাশক ও সম্পাদক", "বার্তা সম্পাদক", "প্রধান প্রতিবেদক"
  category: "editorial" | "desk" | "correspondent" | "management";
  categoryTitle?: string;
  email?: string;
  phone?: string;
  photo?: string;
  bio?: string;
  order: number;
  subMembers?: string; // e.g. "সহযোগী: রিপন মিয়া, আরিফুল ইসলাম"
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  // Editorial Board
  {
    id: "fam-1",
    name: "মোঃ গোলাম মাওলা শাওন",
    role: "প্রকাশক ও সম্পাদক",
    category: "editorial",
    categoryTitle: "সম্পাদকীয় ও পরিচালনা পর্ষদ",
    email: "banglaralonewsbd@gmail.com",
    phone: "০১৭১১-০০৬২১৪",
    photo: "",
    bio: "প্রতিষ্ঠাতা, প্রকাশক ও সম্পাদক, দৈনিক বাংলার আলো নিউজ।",
    order: 1,
    isActive: true,
  },
  {
    id: "fam-2",
    name: "মাহমুদুর রহমান",
    role: "বার্তা সম্পাদক",
    category: "editorial",
    categoryTitle: "সম্পাদকীয় ও পরিচালনা পর্ষদ",
    email: "banglaralonewsbd@gmail.com",
    phone: "০১৯৯৯-৯৫৩৯৭০",
    photo: "",
    order: 2,
    isActive: true,
  },
  {
    id: "fam-3",
    name: "সৈয়দ রফিকুল হাসান",
    role: "সহকারী বার্তা সম্পাদক",
    category: "editorial",
    categoryTitle: "সম্পাদকীয় ও পরিচালনা পর্ষদ",
    email: "banglaralonewsbd@gmail.com",
    photo: "",
    order: 3,
    isActive: true,
  },

  // Desks
  {
    id: "fam-4",
    name: "মো. কামরুল হাসান",
    role: "ডেস্ক প্রধান",
    category: "desk",
    categoryTitle: "জাতীয় ও রাজনীতি ডেস্ক",
    subMembers: "রিপন মিয়া, আরিফুল ইসলাম",
    email: "politics@banglaralonews.com",
    order: 4,
    isActive: true,
  },
  {
    id: "fam-5",
    name: "তানজিলা আক্তার",
    role: "ডেস্ক প্রধান",
    category: "desk",
    categoryTitle: "অর্থনীতি ও বাণিজ্য ডেস্ক",
    subMembers: "তাহমিদ জামান, সাদিয়া সুলতানা",
    email: "economy@banglaralonews.com",
    order: 5,
    isActive: true,
  },
  {
    id: "fam-6",
    name: "ফারহান সাজিদ",
    role: "ডেস্ক প্রধান",
    category: "desk",
    categoryTitle: "আন্তর্জাতিক ডেস্ক",
    subMembers: "নুসরাত জাহান, ফাহিম মোর্শেদ",
    email: "world@banglaralonews.com",
    order: 6,
    isActive: true,
  },
  {
    id: "fam-7",
    name: "রফিকুল আলম",
    role: "ডেস্ক প্রধান",
    category: "desk",
    categoryTitle: "সারাদেশ ও অনুসন্ধান ডেস্ক",
    subMembers: "সবুজ সরকার, জহিরুল ইসলাম",
    email: "country@banglaralonews.com",
    order: 7,
    isActive: true,
  },
  {
    id: "fam-8",
    name: "ইমরান খান",
    role: "ডেস্ক প্রধান",
    category: "desk",
    categoryTitle: "খেলাধুলা ও বিনোদন ডেস্ক",
    subMembers: "সুমন রহমান, ফারিয়া মেহজাবিন",
    email: "sports@banglaralonews.com",
    order: 8,
    isActive: true,
  },
  {
    id: "fam-9",
    name: "শাকিল আহমেদ",
    role: "ডেস্ক প্রধান",
    category: "desk",
    categoryTitle: "অনলাইন ও সোশ্যাল মিডিয়া",
    subMembers: "তাহসিন করিম, নওরিন আক্তার",
    email: "digital@banglaralonews.com",
    order: 9,
    isActive: true,
  },
];
