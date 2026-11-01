import fs from "node:fs";
import path from "node:path";
import { Review, ReviewSummary, CreateReviewInput } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");

interface ReviewsStorage {
  reviews: Record<string, Review[]>;
  summaries: Record<string, ReviewSummary>;
}

const FORBIDDEN_BRAND_REGEX = /\b(ugaoo|trustbasket|trust\s*basket|nurserylive|nursery\s*live|amazon|flipkart|kraft\s*seeds|bombay\s*greens|iffco|myntra|tata\s*cliq)\b/gi;

function sanitizeText(text: string): string {
  if (!text) return "";
  return text.replace(FORBIDDEN_BRAND_REGEX, "GLOROV");
}

export class ReviewService {
  private static cachedData: ReviewsStorage | null = null;

  private static loadData(): ReviewsStorage {
    if (this.cachedData) return this.cachedData;

    try {
      if (fs.existsSync(REVIEWS_FILE)) {
        const raw = fs.readFileSync(REVIEWS_FILE, "utf-8");
        this.cachedData = JSON.parse(raw);
        return this.cachedData!;
      }
    } catch (e) {
      console.error("Failed to read reviews.json:", e);
    }

    this.cachedData = { reviews: {}, summaries: {} };
    return this.cachedData;
  }

  private static saveData(): void {
    if (!this.cachedData) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(this.cachedData, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save reviews.json:", e);
    }
  }

  public static listReviews(
    productId: string,
    sortBy: string = "Most Recent",
    ratingFilter?: number
  ): Review[] {
    const data = this.loadData();
    let list = [...(data.reviews[productId] || [])];

    if (ratingFilter && ratingFilter >= 1 && ratingFilter <= 5) {
      list = list.filter((r) => r.rating === ratingFilter);
    }

    if (sortBy === "Highest Rating") {
      list.sort((a, b) => b.rating - a.rating || b.helpfulCount - a.helpfulCount);
    } else if (sortBy === "Lowest Rating") {
      list.sort((a, b) => a.rating - b.rating || b.helpfulCount - a.helpfulCount);
    } else if (sortBy === "With Photos") {
      list.sort((a, b) => (b.images.length > 0 ? 1 : 0) - (a.images.length > 0 ? 1 : 0));
    } else {
      // Most Recent (default)
      list.sort((a, b) => b.helpfulCount - a.helpfulCount);
    }

    return list;
  }

  public static getSummary(productId: string): ReviewSummary | null {
    const data = this.loadData();
    return data.summaries[productId] || null;
  }

  public static createReview(input: CreateReviewInput): Review {
    const data = this.loadData();
    const pid = input.productId;

    if (!data.reviews[pid]) {
      data.reviews[pid] = [];
    }

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
      today.getMonth() + 1
    ).padStart(2, "0")}/${today.getFullYear()}`;

    const newReview: Review = {
      id: `rev_${pid.replace(/-/g, "_")}_${Date.now()}`,
      productId: pid,
      author: sanitizeText(input.author.trim() || "Verified Buyer"),
      avatarUrl: input.avatarUrl,
      date: formattedDate,
      rating: Math.max(1, Math.min(5, Math.round(input.rating))),
      title: sanitizeText(input.title.trim()),
      content: sanitizeText(input.content.trim()),
      isVerified: true,
      helpfulCount: 0,
      images: input.images || [],
      sellerReply: "GLOROV Care Team: Thank you for sharing your experience!",
    };

    data.reviews[pid].unshift(newReview);

    // Update summary
    const summary = data.summaries[pid] || {
      productId: pid,
      averageRating: newReview.rating,
      totalReviews: 0,
      starCounts: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
      aiSummaryTitle: "Why customers love this",
      aiSummaryText: "Consistently rated highly by gardeners for botanical vigor and quality.",
    };

    summary.totalReviews += 1;
    const rKey = String(newReview.rating);
    summary.starCounts[rKey] = (summary.starCounts[rKey] || 0) + 1;

    // Recalculate average
    const allProdReviews = data.reviews[pid];
    const sumRatings = allProdReviews.reduce((sum, r) => sum + r.rating, 0);
    summary.averageRating = Math.round((sumRatings / allProdReviews.length) * 10) / 10;
    data.summaries[pid] = summary;

    this.saveData();
    return newReview;
  }

  public static markHelpful(reviewId: string): boolean {
    const data = this.loadData();
    for (const pid of Object.keys(data.reviews)) {
      const review = data.reviews[pid].find((r) => r.id === reviewId);
      if (review) {
        review.helpfulCount += 1;
        this.saveData();
        return true;
      }
    }
    return false;
  }
}
