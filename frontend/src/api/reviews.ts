import { apiClient } from './client';
import type { Review, ReviewAiSummary, ReviewInsight } from '../types/reviews';

type ReviewApiResponse = {
  id: number;
  order: number;
  rating: number;
  comment?: string | null;
  created_at: string;
};

type ReviewAiApiResponse = {
  status?: string;
  provider?: string;
  detail?: string;
  results?: {
    sentiment_score?: number;
    main_complaint?: string | null;
    top_dish?: string | null;
    advice?: string | null;
    error?: string;
  };
};

function mapReview(review: ReviewApiResponse): Review {
  return {
    id: review.id,
    orderId: review.order,
    rating: review.rating,
    comment: review.comment ?? '',
    createdAt: review.created_at,
  };
}

function normalizeNullableValue(value?: string | null) {
  if (!value || value === 'null') {
    return null;
  }

  return value;
}

function mapReviewInsight(
  input?: ReviewAiApiResponse['results'],
): ReviewInsight | null {
  if (!input) {
    return null;
  }

  if (input.error) {
    return {
      sentimentScore: null,
      mainComplaint: null,
      topDish: null,
      advice: null,
      error: input.error,
    };
  }

  return {
    sentimentScore: input.sentiment_score ?? null,
    mainComplaint: normalizeNullableValue(input.main_complaint),
    topDish: normalizeNullableValue(input.top_dish),
    advice: normalizeNullableValue(input.advice),
    error: null,
  };
}

export async function fetchReviews() {
  const response = await apiClient.get<ReviewApiResponse[]>('reviews/');
  return response.data.map(mapReview);
}

export async function createReview(input: { orderId: number; rating: number; comment: string }) {
  const response = await apiClient.post<ReviewApiResponse>('reviews/', {
    order: input.orderId,
    rating: input.rating,
    comment: input.comment,
  });

  return mapReview(response.data);
}

export async function fetchReviewAiSummary(): Promise<ReviewAiSummary> {
  const response = await apiClient.get<ReviewAiApiResponse>('reviews/ai-summary/');

  return {
    status: response.data.status ?? null,
    provider: response.data.provider ?? null,
    detail: response.data.detail ?? null,
    results: mapReviewInsight(response.data.results),
  };
}
