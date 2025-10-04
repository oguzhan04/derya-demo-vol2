// ChatGPT API Service
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

export class ChatGPTService {
  constructor() {
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file');
    }
  }

  async analyzeDocument(documentText, documentType = 'freight') {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildDocumentAnalysisPrompt(documentText, documentType);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a freight forwarding expert AI assistant. Analyze documents and extract relevant information in a structured format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('ChatGPT API Error:', error);
      throw error;
    }
  }

  async generateInsights(shipmentData) {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildInsightsPrompt(shipmentData);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a freight forwarding analytics expert. Analyze shipment data and provide actionable insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('ChatGPT API Error:', error);
      throw error;
    }
  }

  buildDocumentAnalysisPrompt(documentText, documentType) {
    return `Analyze this ${documentType} document and extract the following information in JSON format:

Document Text:
${documentText}

Please extract:
1. Document type (bill of lading, invoice, packing list, etc.)
2. Key parties (shipper, consignee, carrier, etc.)
3. Important dates (ship date, arrival date, etc.)
4. Cargo details (weight, dimensions, commodity, etc.)
5. Route information (origin, destination, ports)
6. Financial information (rates, charges, etc.)
7. Any special instructions or notes

Return the data in a clean JSON structure.`;
  }

  buildInsightsPrompt(shipmentData) {
    const dataSummary = shipmentData.slice(0, 10).map(shipment => ({
      id: shipment.id,
      origin: shipment.origin,
      destination: shipment.destination,
      status: shipment.status,
      cost: shipment.cost,
      weight: shipment.weight
    }));

    return `Analyze this freight forwarding shipment data and provide 3-5 key insights:

Shipment Data Sample:
${JSON.stringify(dataSummary, null, 2)}

Total Shipments: ${shipmentData.length}

Please provide:
1. Performance insights (on-time delivery rates, cost trends)
2. Route optimization opportunities
3. Risk factors or patterns
4. Recommendations for improvement
5. Market insights

Format as bullet points with clear, actionable recommendations.`;
  }
}

// Export singleton instance
export const chatGPTService = new ChatGPTService();
