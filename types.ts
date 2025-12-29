
export enum EventType {
  VIEW = 'view',
  CART = 'cart',
  PURCHASE = 'purchase',
  REMOVE_FROM_CART = 'remove from cart'
}

export enum AlgorithmType {
  EPSILON_GREEDY = 'epsilon_greedy',
  THOMPSON_SAMPLING = 'thompson_sampling',
  UCB = 'ucb'
}

export interface ProductData {
  product_id: number;
  product_name: string;
  brand_name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  created_at: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  structured_output: boolean;
}

export interface SystemStatusResponse {
  status: string;
  message: string;
  tools: ToolDefinition[];
}

export interface RecommendationRequest {
  user_id: number;
  n_recommendations?: number;
  algorithm_type?: string;
  algorithm_params?: {
    epsilon?: number;
    [key: string]: any;
  };
}

export interface RecommendationResponse {
  status: string;
  user_id: number;
  recommendations: number[];
  products: ProductData[];
  algorithm_type: string;
  algorithm_class: string;
  confidence_scores: number[];
  total_recommendations: number;
  message: string;
}

export interface FeedbackData {
  user_id: number;
  item_id: number;
  event_type: EventType;
  timestamp?: string;
}

export interface FeedbackResponse {
  status: string;
  item_id: number;
  user_id: number;
  reward: number;
  n: number;
  q: number;
  message: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'request' | 'response' | 'error';
  endpoint: string;
  payload: any;
}
