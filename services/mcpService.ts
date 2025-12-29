
import { 
  SystemStatusResponse, 
  RecommendationRequest, 
  RecommendationResponse, 
  FeedbackData, 
  FeedbackResponse,
  ToolDefinition
} from '../types';

const BASE_URL = 'https://mcp-server.workzy.co';

export const mcpService = {
  async listTools(): Promise<ToolDefinition[]> {
    const response = await fetch(`${BASE_URL}/tools`);
    if (!response.ok) throw new Error('Failed to fetch tools');
    return response.json();
  },

  async getSystemStatus(): Promise<SystemStatusResponse> {
    const response = await fetch(`${BASE_URL}/tools/call_tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'get_system_status' }),
    });
    if (!response.ok) throw new Error('Failed to get system status');
    return response.json();
  },

  async getRecommendations(req: RecommendationRequest): Promise<RecommendationResponse> {
    const response = await fetch(`${BASE_URL}/tools/call_tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'get_recommendations',
        request: req 
      }),
    });
    if (!response.ok) throw new Error('Failed to get recommendations');
    return response.json();
  },

  async submitFeedback(feedback: FeedbackData): Promise<FeedbackResponse> {
    const response = await fetch(`${BASE_URL}/tools/call_tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'submit_feedback',
        feedback: {
          ...feedback,
          timestamp: feedback.timestamp || new Date().toISOString()
        }
      }),
    });
    if (!response.ok) throw new Error('Failed to submit feedback');
    return response.json();
  }
};
