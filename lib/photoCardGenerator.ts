import QRCode from "qrcode";
import { BRAND_LOGO_BASE64, LOGO_ICON_BASE64 } from "./brandAssets";

export type PhotoCardTemplate = "anand_tv" | "banglar_alo" | "classic";

export interface PhotoCardConfig {
  template: PhotoCardTemplate;
  aspectRatio: "4:5" | "1:1";

  // Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;

  // Image controls
  imageRadius: "straight" | "rounded" | "padded";
  imageHeightRatio: number; // 0.45 to 0.70 (default 0.58)
  imageScale: number; // 1.0 to 1.5
  imagePadding?: number; // 0 to 60px padding around image

  // Logo controls
  logoWidth: number; // 140 to 380 (default 240)
  logoXOffset: number; // -300 to 300 (0 is center)
  logoYOffset: number; // -200 to 200 (0 is seam)
  logoBadgeBg: boolean; // white pill background

  // Title controls
  titleText: string;
  titleFontSize: number; // 24 to 86
  titleYOffset: number; // -150 to 150 (up/down)
  titleColor: string; // default "#FFFFFF"
  titleAlign: "center" | "left";
  titleHasBg: boolean;
  titleBgColor: string;

  // Date controls
  dateText: string;
  dateColor: string;
  dateFontSize: number;

  // Comment / Footer controls
  commentText: string;
  commentColor: string;
  commentFontSize: number;
  commentHasPill: boolean;
  commentPillBg: string;
  commentYOffset?: number; // -100 to 100 (up/down)

  // Verification / QR Code
  showQrCode: boolean;
  qrCodeSize: number;
  qrXOffset: number; // -350 to 350 (left/right)
  qrYOffset: number; // -300 to 300 (up/down)

  // News Source
  imageUrl: string;
  articleUrl: string;
  slug?: string;
}

export const DEFAULT_PHOTOCARD_CONFIG: PhotoCardConfig = {
  template: "anand_tv",
  aspectRatio: "4:5",
  primaryColor: "#8A0B14",
  secondaryColor: "#580006",
  backgroundColor: "#F7F7F8",
  imageRadius: "straight",
  imageHeightRatio: 0.65,
  imageScale: 1.0,
  imagePadding: 0,
  logoWidth: 485,
  logoXOffset: 0,
  logoYOffset: 0,
  logoBadgeBg: true,
  titleText: "দ্রুতই শ্রমিকদের নতুন মজুরি নির্ধারণ করা হবে: স্বরাষ্ট্রমন্ত্রী",
  titleFontSize: 69,
  titleYOffset: -12,
  titleColor: "#FFFFFF",
  titleAlign: "center",
  titleHasBg: false,
  titleBgColor: "#000000",
  dateText: "০৪ নভেম্বর ২০২৬",
  dateColor: "#F1F5F9",
  dateFontSize: 26,
  commentText: "বিস্তারিত কমেন্টে",
  commentColor: "#F1F5F9",
  commentFontSize: 26,
  commentHasPill: false,
  commentPillBg: "rgba(0, 0, 0, 0.3)",
  commentYOffset: -18,
  showQrCode: false,
  qrCodeSize: 110,
  qrXOffset: 0,
  qrYOffset: 0,
  imageUrl: "/images/news-placeholder.svg",
  articleUrl: "https://www.banglaralonews.com",
};

export interface PhotoCardData {
  title: string;
  imageUrl: string;
  dateBengali?: string;
  articleUrl: string;
  subtitle?: string;
  commentText?: string;
  theme?: "red" | "green" | "navy";
}

export const THEME_CONFIG = {
  red: {
    name: "ডিফল্ট লাল",
    primary: "#8A0B14",
    secondary: "#580006",
    bgTop: "#FFFFFF",
    bgBottom: "#8A0B14",
    bgBottomGradient: "#580006",
    accentLine: "#E02424",
    dateColor: "#8A0B14",
    pillBg: "rgba(0, 0, 0, 0.32)",
    pillBorder: "rgba(255, 255, 255, 0.35)",
    textColor: "#FFFFFF",
  },
  green: {
    name: "ওয়েবসাইট সবুজ",
    primary: "#005E38",
    secondary: "#003D24",
    bgTop: "#FFFFFF",
    bgBottom: "#005E38",
    bgBottomGradient: "#003D24",
    accentLine: "#059669",
    dateColor: "#005E38",
    pillBg: "rgba(0, 0, 0, 0.32)",
    pillBorder: "rgba(255, 255, 255, 0.35)",
    textColor: "#FFFFFF",
  },
  navy: {
    name: "রয়্যাল নেভি",
    primary: "#0D223B",
    secondary: "#05111F",
    bgTop: "#FFFFFF",
    bgBottom: "#0D223B",
    bgBottomGradient: "#05111F",
    accentLine: "#2563EB",
    dateColor: "#0D223B",
    pillBg: "rgba(255, 255, 255, 0.12)",
    pillBorder: "rgba(255, 255, 255, 0.3)",
    textColor: "#FFFFFF",
  },
};

// Helper to load an image into an HTMLImageElement
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

// Draw rounded rectangle helper
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, Math.max(0, radius));
    return;
  }
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

// Draw image covering the box (object-fit: cover) with optional scale
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number = 1.0
) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  const targetRatio = w / h;
  const imgRatio = imgW / imgH;

  let sW = imgW;
  let sH = imgH;
  let sX = 0;
  let sY = 0;

  if (imgRatio > targetRatio) {
    sW = imgH * targetRatio;
    sX = (imgW - sW) / 2;
  } else {
    sH = imgW / targetRatio;
    sY = (imgH - sH) / 2;
  }

  if (scale > 1.0) {
    const zoomW = sW / scale;
    const zoomH = sH / scale;
    sX += (sW - zoomW) / 2;
    sY += (sH - zoomH) / 2;
    sW = zoomW;
    sH = zoomH;
  }

  ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h);
}

// Auto-wrap Bengali text into lines that fit maxWidth
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// Draw subtle dot grid pattern for high quality broadcast look
function drawDotPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string = "rgba(255, 255, 255, 0.06)",
  step: number = 24,
  radius: number = 1.8
) {
  ctx.save();
  ctx.fillStyle = color;
  for (let px = x + step; px < x + w; px += step) {
    for (let py = y + step; py < y + h; py += step) {
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Render complete customizable photocard on the provided canvas.
 */
export async function renderPhotoCardToCanvas(
  canvas: HTMLCanvasElement,
  config: PhotoCardConfig
): Promise<void> {
  const isSquare = config.aspectRatio === "1:1";
  const width = 1080;
  const height = isSquare ? 1080 : 1350;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  // Ensure Bengali fonts are loaded
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch { }
  }

  // Choose template renderer
  if (config.template === "banglar_alo") {
    await renderBanglarAloTemplate(ctx, width, height, config);
  } else if (config.template === "classic") {
    await renderClassicTemplate(ctx, width, height, config);
  } else {
    // Default: Anand TV style (Reference 1)
    await renderAnandTvTemplate(ctx, width, height, config);
  }
}

/**
 * Anand TV Template (Reference 1):
 * - Upper portion: Full photo with clean edge or soft radius
 * - Center seam: White pill badge with round logo and brand text
 * - Lower portion: Deep red background, large bold title
 * - Bottom row: Left side Date, Right side "বিস্তারিত কমেন্টে" ("ar kisu na")
 */
async function renderAnandTvTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: PhotoCardConfig
) {
  // 1. Photo area height - lowered down as requested
  const heightRatio = config.imageHeightRatio || 0.65;
  const seamY = Math.round(height * heightRatio);

  // 2. Background of entire canvas
  ctx.fillStyle = config.backgroundColor || "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // 3. Lower Card Background with Gradient & Dot Texture
  const bgGrad = ctx.createLinearGradient(0, seamY, 0, height);
  bgGrad.addColorStop(0, config.primaryColor || "#8A0B14");
  bgGrad.addColorStop(1, config.secondaryColor || "#580006");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, seamY, width, height - seamY);

  // Decorative subtle dot grid pattern for TV broadcast look
  drawDotPattern(
    ctx,
    0,
    seamY,
    width,
    height - seamY,
    "rgba(255, 255, 255, 0.05)",
    28,
    2
  );

  // Subtle radial glow in the center of lower card
  const radialGlow = ctx.createRadialGradient(
    width / 2,
    seamY + (height - seamY) / 2,
    50,
    width / 2,
    seamY + (height - seamY) / 2,
    width / 1.5
  );
  radialGlow.addColorStop(0, "rgba(255, 255, 255, 0.08)");
  radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, seamY, width, height - seamY);

  // 4. Draw News Photo in Upper Half
  let pad = config.imagePadding ?? 0;
  if (config.imageRadius === "padded") {
    pad = Math.max(pad, 32);
  } else if (config.imageRadius === "rounded" && pad === 0) {
    pad = 24;
  }

  const imgX = pad;
  const imgY = pad;
  const imgW = width - pad * 2;
  const imgH = seamY - pad;
  const imgRadius = config.imageRadius === "straight" && pad === 0 ? 0 : 24;

  try {
    let safeImgUrl = config.imageUrl || "/images/news-placeholder.svg";
    if (safeImgUrl.startsWith("http://") || safeImgUrl.startsWith("https://")) {
      safeImgUrl = `/api/proxy-image?url=${encodeURIComponent(safeImgUrl)}`;
    }
    const newsImg = await loadImage(safeImgUrl);

    ctx.save();
    if (imgRadius > 0) {
      drawRoundedRect(ctx, imgX, imgY, imgW, imgH, imgRadius);
      ctx.clip();
    }
    drawImageCover(ctx, newsImg, imgX, imgY, imgW, imgH, config.imageScale || 1.0);
    ctx.restore();

    if (imgRadius > 0 || pad > 0) {
      ctx.save();
      if (imgRadius > 0) {
        drawRoundedRect(ctx, imgX, imgY, imgW, imgH, imgRadius);
      } else {
        ctx.rect(imgX, imgY, imgW, imgH);
      }
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    // Subtle dark gradient overlay at the bottom of the photo for smooth seam transition
    const seamShadow = ctx.createLinearGradient(0, seamY - 80, 0, seamY);
    seamShadow.addColorStop(0, "rgba(0, 0, 0, 0)");
    seamShadow.addColorStop(1, "rgba(0, 0, 0, 0.45)");
    ctx.fillStyle = seamShadow;
    ctx.fillRect(imgX, seamY - 80, imgW, 80);
  } catch (err) {
    console.warn("Failed to load news image, using placeholder background:", err);
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(imgX, imgY, imgW, imgH);
    ctx.font = "bold 32px 'Noto Sans Bengali', sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.textAlign = "center";
    ctx.fillText("বাংলার আলো নিউজ", imgX + imgW / 2, imgY + imgH / 2);
  }

  // 5. Draw Center Brand Logo Badge (Marked area in Reference 1)
  // Positioned directly over the horizontal seam line - Round icon removed, text logo expanded across badge
  const badgeW = Math.max(180, Math.min(540, config.logoWidth || 360));
  const badgeH = Math.round(badgeW * 0.28);
  const badgeX = Math.round((width - badgeW) / 2) + (config.logoXOffset || 0);
  const badgeY = Math.round(seamY - badgeH / 2) + (config.logoYOffset || 0);

  if (config.logoBadgeBg !== false) {
    ctx.save();
    // Drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Subtle accent rim border
    ctx.lineWidth = 2;
    ctx.strokeStyle = config.primaryColor || "#8A0B14";
    ctx.stroke();
    ctx.restore();
  }

  // Load Brand Logo Assets - Text logo fills badge left-to-right nicely (no round icon)
  try {
    const brandTextImg = await loadImage(BRAND_LOGO_BASE64);

    const padX = 22;
    const maxTextW = badgeW - padX * 2;
    const maxTextH = badgeH - 16;
    const naturalRatio = 348 / 83; // approx 4.19

    let textW = maxTextW;
    let textH = Math.round(textW / naturalRatio);
    if (textH > maxTextH) {
      textH = maxTextH;
      textW = Math.round(textH * naturalRatio);
    }

    const textX = badgeX + Math.round((badgeW - textW) / 2);
    const textY = badgeY + Math.round((badgeH - textH) / 2);

    ctx.drawImage(brandTextImg, textX, textY, textW, textH);
  } catch (err) {
    console.warn("Failed to draw brand logo in badge:", err);
    ctx.font = "bold 28px 'Noto Sans Bengali', sans-serif";
    ctx.fillStyle = config.primaryColor || "#8A0B14";
    ctx.textAlign = "center";
    ctx.fillText("বাংলার আলো নিউজ", badgeX + badgeW / 2, badgeY + badgeH / 2 + 10);
  }

  // 6. Draw Title Headline - BIGGER and filling space to minimize gaps
  const titleText = (config.titleText || "").trim();
  const titleFontSize = Math.max(34, Math.min(88, config.titleFontSize || 68));
  const maxTitleW = width - 90;

  ctx.font = `bold ${titleFontSize}px 'Noto Sans Bengali', 'SolaimanLipi', sans-serif`;
  let titleLines = wrapText(ctx, titleText, maxTitleW);
  if (titleLines.length > 4) {
    titleLines = titleLines.slice(0, 4);
    titleLines[3] = titleLines[3].replace(/[.,\s]+$/, "") + "...";
  }

  const lineHeight = titleFontSize + 22;
  const totalTitleH = titleLines.length * lineHeight;

  // Title vertical positioning: balanced nicely below the logo badge and above footer row
  const titleAreaTop = badgeY + badgeH + 16;
  const titleAreaBottom = height - 80;
  const availableSpace = titleAreaBottom - titleAreaTop;
  const titleY = Math.round(
    titleAreaTop + Math.max(0, (availableSpace - totalTitleH) / 2) + titleFontSize
  ) + (config.titleYOffset || 0);

  // Background box behind title if enabled
  if (config.titleHasBg) {
    const boxPaddingX = 30;
    const boxPaddingY = 16;
    const boxW = Math.min(width - 80, maxTitleW + boxPaddingX * 2);
    const boxH = totalTitleH + boxPaddingY * 2;
    const boxX = (width - boxW) / 2;
    const boxY = titleY - titleFontSize - boxPaddingY + 8;

    ctx.save();
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 16);
    ctx.fillStyle = config.titleBgColor || "rgba(0, 0, 0, 0.4)";
    ctx.fill();
    ctx.restore();
  }

  // Render Title text
  ctx.save();
  ctx.font = `bold ${titleFontSize}px 'Noto Sans Bengali', 'SolaimanLipi', sans-serif`;
  ctx.fillStyle = config.titleColor || "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  if (config.titleAlign === "left") {
    ctx.textAlign = "left";
    titleLines.forEach((line, idx) => {
      ctx.fillText(line, 60, titleY + idx * lineHeight);
    });
  } else {
    ctx.textAlign = "center";
    titleLines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, titleY + idx * lineHeight);
    });
  }
  ctx.restore();

  // 7. Bottom Row: Date on Left, "বিস্তারিত কমেন্টে" on Right (User: "ar kisu na")
  const bottomY = height - 42 + (config.commentYOffset || 0);

  // Date on Left
  const dateStr = (config.dateText || "").trim();
  const dateSize = Math.max(16, Math.min(36, config.dateFontSize || 24));
  if (dateStr) {
    ctx.save();
    ctx.font = `bold ${dateSize}px 'Noto Sans Bengali', 'SolaimanLipi', sans-serif`;
    ctx.fillStyle = config.dateColor || "#F1F5F9";
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillText(dateStr, 55, bottomY);
    ctx.restore();
  }

  // Comment / Website on Right
  const commentStr = (config.commentText || "বিস্তারিত কমেন্টে").trim();
  const commentSize = Math.max(16, Math.min(36, config.commentFontSize || 24));
  if (commentStr) {
    ctx.save();
    ctx.font = `bold ${commentSize}px 'Noto Sans Bengali', 'SolaimanLipi', sans-serif`;
    ctx.fillStyle = config.commentColor || "#F1F5F9";
    ctx.textAlign = "right";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;

    if (config.commentHasPill) {
      const metrics = ctx.measureText(commentStr);
      const pillPadX = 18;
      const pillPadY = 8;
      const pillW = metrics.width + pillPadX * 2;
      const pillH = commentSize + pillPadY * 2;
      const pillX = width - 55 - pillW;
      const pillY = bottomY - commentSize;

      drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
      ctx.fillStyle = config.commentPillBg || "rgba(0, 0, 0, 0.35)";
      ctx.fill();

      ctx.fillStyle = config.commentColor || "#F1F5F9";
      ctx.fillText(commentStr, width - 55 - pillPadX, bottomY + 2);
    } else {
      ctx.fillText(commentStr, width - 55, bottomY);
    }
    ctx.restore();
  }

  // 8. Optional QR Code (if enabled by user in settings - respects qrCodeSize, qrXOffset, qrYOffset)
  if (config.showQrCode && config.articleUrl) {
    const qrSize = config.qrCodeSize || 120;
    const baseQrX = width - qrSize - 55;
    const baseQrY = height - qrSize - 40;
    const qrX = baseQrX + (config.qrXOffset || 0);
    const qrY = baseQrY + (config.qrYOffset || 0);
    await drawQrCodeCorner(ctx, config.articleUrl, qrX, qrY, qrSize);
  }
}

/**
 * Banglar Alo Template (Reference 2):
 * - Square 1:1 format (1080x1080)
 * - Top header with brand logo on left and date on right
 * - Center rounded photo with border
 * - Bottom title with red card
 * - Pill "নিউজ লিংক কমেন্টে" and QR code on bottom right
 */
async function renderBanglarAloTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: PhotoCardConfig
) {
  // 1. Background
  ctx.fillStyle = config.backgroundColor || "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // 2. Red lower card
  const lowerH = Math.round(height * 0.46);
  const lowerY = height - lowerH;
  const bgGrad = ctx.createLinearGradient(0, lowerY, 0, height);
  bgGrad.addColorStop(0, config.primaryColor || "#8A0B14");
  bgGrad.addColorStop(1, config.secondaryColor || "#580006");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, lowerY, width, lowerH);

  // Decorative corner accents (triangles like Reference 2)
  ctx.fillStyle = config.primaryColor || "#8A0B14";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(90, 0);
  ctx.lineTo(0, 90);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(width - 90, 0);
  ctx.lineTo(width, 90);
  ctx.closePath();
  ctx.fill();

  // 3. Top Header: Logo on left, Date on right (Respects logoWidth, logoXOffset, logoYOffset)
  try {
    const logoIconImg = await loadImage(LOGO_ICON_BASE64);
    const brandTextImg = await loadImage(BRAND_LOGO_BASE64);

    const scale = Math.max(0.7, Math.min(1.5, (config.logoWidth || 340) / 340));
    const iconSize = Math.round(48 * scale);
    const iconX = Math.round(60 + (config.logoXOffset || 0));
    const iconY = Math.round(40 + (config.logoYOffset || 0));
    ctx.drawImage(logoIconImg, iconX, iconY, iconSize, iconSize);

    const brandH = Math.round(42 * scale);
    const brandW = Math.round(brandH * (348 / 83));
    ctx.drawImage(brandTextImg, iconX + iconSize + 12, iconY + 3, brandW, brandH);
  } catch {
    ctx.font = "bold 28px 'Noto Sans Bengali', sans-serif";
    ctx.fillStyle = config.primaryColor || "#8A0B14";
    ctx.textAlign = "left";
    ctx.fillText("বাংলার আলো নিউজ", 60, 72);
  }

  // Date on top right
  const dateStr = (config.dateText || "").trim();
  if (dateStr) {
    ctx.font = "bold 22px 'Noto Sans Bengali', sans-serif";
    ctx.fillStyle = config.primaryColor || "#8A0B14";
    ctx.textAlign = "right";
    ctx.fillText(dateStr, width - 60, 72);
  }

  // 4. Center Photo with rounded corners and border - respects imagePadding & imageRadius
  const pad = config.imagePadding || 0;
  const imgX = 50 + pad;
  const imgY = 105 + pad;
  const imgW = width - 100 - pad * 2;
  const imgH = 540 - pad * 2;
  const imgRadius = config.imageRadius === "straight" ? 0 : 24;

  try {
    let safeImgUrl = config.imageUrl || "/images/news-placeholder.svg";
    if (safeImgUrl.startsWith("http://") || safeImgUrl.startsWith("https://")) {
      safeImgUrl = `/api/proxy-image?url=${encodeURIComponent(safeImgUrl)}`;
    }
    const newsImg = await loadImage(safeImgUrl);

    ctx.save();
    // Drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    drawRoundedRect(ctx, imgX, imgY, imgW, imgH, imgRadius);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();

    ctx.save();
    drawRoundedRect(ctx, imgX, imgY, imgW, imgH, imgRadius);
    ctx.clip();
    drawImageCover(ctx, newsImg, imgX, imgY, imgW, imgH, config.imageScale || 1.0);
    ctx.restore();

    // White border
    if (imgRadius > 0) {
      ctx.save();
      drawRoundedRect(ctx, imgX, imgY, imgW, imgH, imgRadius);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
    }
  } catch (err) {
    console.warn("Could not load image:", err);
  }

  // 5. Title in Lower Section - fully respects titleFontSize, titleColor, titleAlign, titleHasBg, titleBgColor
  const titleText = (config.titleText || "").trim();
  const titleFontSize = Math.max(28, Math.min(84, config.titleFontSize || 50));
  ctx.font = `bold ${titleFontSize}px 'Noto Sans Bengali', sans-serif`;
  let titleLines = wrapText(ctx, titleText, width - 110);
  if (titleLines.length > 3) {
    titleLines = titleLines.slice(0, 3);
    titleLines[2] = titleLines[2].replace(/[.,\s]+$/, "") + "...";
  }

  const lineHeight = titleFontSize + 18;
  const totalTitleH = titleLines.length * lineHeight;
  const titleStartY = 710 + (config.titleYOffset || 0);

  // Title background box if enabled
  if (config.titleHasBg) {
    const boxPadX = 26;
    const boxPadY = 14;
    const boxW = Math.min(width - 80, width - 110 + boxPadX * 2);
    const boxH = totalTitleH + boxPadY * 2;
    const boxX = (width - boxW) / 2;
    const boxY = titleStartY - titleFontSize - boxPadY + 8;

    ctx.save();
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 14);
    ctx.fillStyle = config.titleBgColor || "rgba(0, 0, 0, 0.4)";
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.font = `bold ${titleFontSize}px 'Noto Sans Bengali', sans-serif`;
  ctx.fillStyle = config.titleColor || "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  if (config.titleAlign === "left") {
    ctx.textAlign = "left";
    titleLines.forEach((line, idx) => {
      ctx.fillText(line, 65, titleStartY + idx * lineHeight);
    });
  } else {
    ctx.textAlign = "center";
    titleLines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, titleStartY + idx * lineHeight);
    });
  }
  ctx.restore();

  // 6. Pill Button "বিস্তারিত কমেন্টে" - moved further down
  const commentStr = config.commentText || "বিস্তারিত কমেন্টে";
  const pillY = 910 + (config.commentYOffset || 0);
  const pillFontSize = 30;

  ctx.save();
  ctx.font = `bold ${pillFontSize}px 'Noto Sans Bengali', sans-serif`;
  const textMet = ctx.measureText(commentStr);
  const pW = textMet.width + 70;
  const pH = pillFontSize + 28;
  const pX = (width - pW) / 2;

  drawRoundedRect(ctx, pX, pillY, pW, pH, 16);
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText(commentStr, width / 2, pillY + pillFontSize + 6);
  ctx.restore();

  // 7. QR Code on Bottom Right (respects qrCodeSize, qrXOffset, qrYOffset)
  if (config.showQrCode !== false && config.articleUrl) {
    const qrSize = config.qrCodeSize || 110;
    const baseQrX = width - qrSize - 45;
    const baseQrY = height - qrSize - 35;
    const qrX = baseQrX + (config.qrXOffset || 0);
    const qrY = baseQrY + (config.qrYOffset || 0);
    await drawQrCodeCorner(ctx, config.articleUrl, qrX, qrY, qrSize);
  }
}

/**
 * Classic Clean Template
 */
async function renderClassicTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: PhotoCardConfig
) {
  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, config.primaryColor || "#8A0B14");
  bgGrad.addColorStop(1, config.secondaryColor || "#4A0005");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Top header bar
  const headH = 110;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, headH);

  try {
    const logoIconImg = await loadImage(LOGO_ICON_BASE64);
    const brandTextImg = await loadImage(BRAND_LOGO_BASE64);

    ctx.drawImage(logoIconImg, 45, 25, 60, 60);
    const brandH = 46;
    const brandW = Math.round(brandH * (348 / 83));
    ctx.drawImage(brandTextImg, 120, 32, brandW, brandH);
  } catch { }

  const dateStr = (config.dateText || "").trim();
  if (dateStr) {
    ctx.font = "bold 22px 'Noto Sans Bengali', sans-serif";
    ctx.fillStyle = config.primaryColor || "#8A0B14";
    ctx.textAlign = "right";
    ctx.fillText(dateStr, width - 45, 65);
  }

  // Image
  const imgY = headH + 25;
  const imgH = 580;
  try {
    let safeImgUrl = config.imageUrl || "/images/news-placeholder.svg";
    if (safeImgUrl.startsWith("http://") || safeImgUrl.startsWith("https://")) {
      safeImgUrl = `/api/proxy-image?url=${encodeURIComponent(safeImgUrl)}`;
    }
    const newsImg = await loadImage(safeImgUrl);
    drawRoundedRect(ctx, 40, imgY, width - 80, imgH, 20);
    ctx.save();
    ctx.clip();
    drawImageCover(ctx, newsImg, 40, imgY, width - 80, imgH, config.imageScale || 1.0);
    ctx.restore();
  } catch { }

  // Title
  const titleText = (config.titleText || "").trim();
  const titleFontSize = Math.max(26, Math.min(64, config.titleFontSize || 42));
  ctx.font = `bold ${titleFontSize}px 'Noto Sans Bengali', sans-serif`;
  let titleLines = wrapText(ctx, titleText, width - 120);
  if (titleLines.length > 3) {
    titleLines = titleLines.slice(0, 3);
    titleLines[2] = titleLines[2].replace(/[.,\s]+$/, "") + "...";
  }

  const startY = imgY + imgH + 60;
  const lineH = titleFontSize + 16;
  ctx.fillStyle = config.titleColor || "#FFFFFF";
  ctx.textAlign = "center";
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, startY + idx * lineH);
  });

  // Footer comment
  const commentStr = config.commentText || "বিস্তারিত কমেন্টে";
  ctx.font = "bold 26px 'Noto Sans Bengali', sans-serif";
  ctx.fillStyle = config.commentColor || "#F1F5F9";
  ctx.textAlign = "center";
  ctx.fillText(commentStr, width / 2, height - 45);
}

// Helper to draw QR code with white backing
async function drawQrCodeCorner(
  ctx: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  size: number
) {
  try {
    let cleanUrl = url;
    if (cleanUrl.includes("localhost") || cleanUrl.includes("127.0.0.1") || cleanUrl.startsWith("/")) {
      const match = cleanUrl.match(/\/news\/(.+)$/);
      cleanUrl = match ? `https://www.banglaralonews.com/news/${match[1]}` : "https://www.banglaralonews.com";
    }
    cleanUrl = decodeURI(cleanUrl);

    const qrDataUrl = await QRCode.toDataURL(cleanUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    const qrImg = await loadImage(qrDataUrl);

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    drawRoundedRect(ctx, x, y, size, size, 12);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();

    ctx.drawImage(qrImg, x + 6, y + 6, size - 12, size - 12);
  } catch (err) {
    console.warn("Could not draw QR code:", err);
  }
}

/**
 * High-level function returning base64 data URL
 */
export async function generateCustomPhotoCard(
  config: PhotoCardConfig
): Promise<string> {
  const canvas = document.createElement("canvas");
  await renderPhotoCardToCanvas(canvas, config);
  return canvas.toDataURL("image/png", 1.0);
}

/**
 * Backward compatible generatePhotoCard
 */
export async function generatePhotoCard(
  data: PhotoCardData
): Promise<string> {
  const themeKey = data.theme || "red";
  const theme = THEME_CONFIG[themeKey] || THEME_CONFIG.red;

  const config: PhotoCardConfig = {
    ...DEFAULT_PHOTOCARD_CONFIG,
    template: "anand_tv",
    titleText: data.title,
    imageUrl: data.imageUrl,
    dateText: data.dateBengali || "আজ",
    articleUrl: data.articleUrl,
    commentText: data.commentText || "বিস্তারিত কমেন্টে",
    primaryColor: theme.primary,
    secondaryColor: theme.secondary,
  };

  return generateCustomPhotoCard(config);
}

// Download image helper
export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
