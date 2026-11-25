// types/autoNews.ts

export interface AutoNewsStats {
  status: "ON" | "OFF";
  isEnabled: boolean;
  interval: number;
  totalPosted: number;
  postedToday: number;
  skipping: number;
  errors: number;
  sourcesCount: string;
  cursor: number;
  lastRun?: string;
  nextRun?: string;
}

export interface AutoNewsSettings {
  id?: string;
  isEnabled: boolean;
  interval: number;
  postsPerRun: number;
  scanPerSource: number;
  defaultPostStatus: "PUBLISHED" | "DRAFT";
  defaultAdminId?: string;
  publishAsWriterId?: string;
  geminiApiKey: string;
  preferredModel: string;
  extraInstruction: string;
  aiRewrite: boolean;
  tickerOn: boolean;
  imageCropResize: boolean;
  imageWidth: number;
  imageHeight: number;
  watermarkEnabled: boolean;
  watermarkImage?: string;
  watermarkPosition?: string;
  watermarkOpacity?: number;
  watermarkSize?: number;
  watermarkMargin?: number;
}

export interface AutoNewsSource {
  id: string;
  name: string;
  url: string;
  categoryId: string;
  categoryHint?: string;
  articleSelector?: string;
  isActive: boolean;
  preferMetaImage: boolean;
  status: string;
  okCount: number;
  failCount: number;
  lastScannedAt?: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AutoNewsLog {
  id: string;
  level: "info" | "success" | "warn" | "error";
  message: string;
  meta?: string;
  createdAt: string;
}

export interface AutoNewsRecentPost {
  id: string;
  sourceUrl: string;
  sourceSite: string;
  sourceName: string;
  articleTitle: string;
  newsId: string;
  status: string;
  errorMessage?: string;
  categoryId?: string;
  modelUsed?: string;
  createdAt: string;
}

