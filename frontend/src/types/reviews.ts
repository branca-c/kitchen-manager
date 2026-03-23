export type Review = {
  id: number;
  orderId: number;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ReviewInsight = {
  sentimentScore: number | null;
  mainComplaint: string | null;
  topDish: string | null;
  advice: string | null;
  error: string | null;
};

export type ReviewAiSummary = {
  status: string | null;
  provider: string | null;
  detail: string | null;
  results: ReviewInsight | null;
};
