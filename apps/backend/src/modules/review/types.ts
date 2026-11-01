export interface Review {
  id: string;
  productId: string;
  author: string;
  avatarUrl?: string;
  date: string;
  rating: number;
  title: string;
  content: string;
  isVerified: boolean;
  helpfulCount: number;
  images: string[];
  sellerReply?: string;
}

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  starCounts: Record<string, number>;
  aiSummaryTitle: string;
  aiSummaryText: string;
}

export interface CreateReviewInput {
  productId: string;
  author: string;
  avatarUrl?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
}
