// ChatGPT API Service
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

// Get API key from localStorage as fallback
const getApiKey = () => {
  return OPENAI_API_KEY || localStorage.getItem('openai_api_key');
};

export class ChatGPTService {
  constructor() {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file or configure it in the app');
    }
  }

  getApiKey() {
    return getApiKey();
  }

  async analyzeDocument(documentText, documentType = 'freight') {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`ChatGPT analyzing ${documentType} document...`);
    console.log(`Document text length: ${documentText.length}`);
    console.log(`Document text preview: ${documentText.substring(0, 200)}...`);

    const prompt = this.buildDocumentAnalysisPrompt(documentText, documentType);
    console.log(`Generated prompt length: ${prompt.length}`);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildInsightsPrompt(shipmentData);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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

  async chat(message, conversationHistory = []) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant specializing in freight forwarding, logistics, and maritime operations. You can help with document analysis, shipping questions, logistics advice, and general freight forwarding topics. Provide clear, helpful responses.'
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
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
    const basePrompt = `You are a logistics document analysis expert. Analyze this REAL ${documentType} document and extract structured information.

DOCUMENT CONTENT:
${documentText}

INSTRUCTIONS:
1. Read the ACTUAL document content above
2. Extract relevant information based on the document type
3. Return ONLY valid JSON format
4. Use null for missing information
5. Be precise and accurate
6. Extract ALL visible fields from the document

EXTRACT THE FOLLOWING INFORMATION:`;

    const specificPrompts = {
      'billOfLading': `
BILL OF LADING ANALYSIS:
Extract these specific fields from the document:

1. Vessel and Voyage: Look for vessel name and voyage number
2. Parties: Find shipper, consignee, notify party names and addresses
3. Ports: Identify port of loading and port of discharge
4. Containers: Extract container numbers and seal numbers
5. Cargo: Get cargo description, weight, volume, packages
6. Financial: Extract freight charges and currency
7. References: Find marks and numbers, B/L number
8. Dates: Extract shipment date, sailing date
9. Weights: Extract gross weight, net weight, measurement
10. Additional: Number of originals, place of receipt

CRITICAL: Return ONLY this JSON structure:
{
  "blNumber": "extracted B/L number or null",
  "vessel": "extracted vessel name or null",
  "voyage": "extracted voyage number or null", 
  "shipper": "extracted shipper name or null",
  "consignee": "extracted consignee name or null",
  "notifyParty": "extracted notify party or null",
  "portOfLoading": "extracted loading port or null",
  "portOfDischarge": "extracted discharge port or null",
  "placeOfReceipt": "extracted place of receipt or null",
  "freightCharges": "extracted amount as number or 'Prepaid' string or null",
  "currency": "extracted currency code or null",
  "containerNumbers": ["extracted container numbers as array"],
  "sealNumbers": ["extracted seal numbers as array"],
  "cargoDescription": "extracted cargo description or null",
  "marksAndNumbers": "extracted marks and numbers or null",
  "shipmentDate": "extracted shipment date or null",
  "numberOfPackages": "extracted number of packages or null",
  "grossWeight": "extracted gross weight as number or null",
  "netWeight": "extracted net weight as number or null",
  "measurement": "extracted measurement as number or null",
  "numberOfOriginals": "extracted number of originals as number or null"
}

IMPORTANT: Return ONLY the JSON object, no other text.`,

      'commercialInvoice': `
1. Invoice number and date
2. Seller and buyer information
3. Total value and currency
4. HS codes and country of origin
5. Terms of sale and payment terms
6. Line items with descriptions and amounts

Return the data in a clean JSON structure with these exact field names:
{
  "invoiceNumber": "string",
  "invoiceDate": "string",
  "seller": "string",
  "buyer": "string",
  "totalValue": "number",
  "currency": "string",
  "hsCodes": ["string"],
  "countryOfOrigin": "string",
  "termsOfSale": "string",
  "paymentTerms": "string"
}`,

      'invoices': `
1. Invoice number and date
2. Vendor information
3. Total amount and currency
4. Line items with descriptions, amounts, and quantities
5. Due date and payment status

Return the data in a clean JSON structure with these exact field names:
{
  "invoiceNumber": "string",
  "invoiceDate": "string",
  "vendor": "string",
  "totalAmount": "number",
  "currency": "string",
  "lineItems": [{"description": "string", "amount": "number", "quantity": "number"}],
  "dueDate": "string",
  "paymentStatus": "string"
}`,

      'rateTable': `
1. Lane information (origin-destination)
2. Base rate and currency
3. Valid from and to dates
4. Surcharges with types, amounts, and descriptions
5. Container types and their rates

Return the data in a clean JSON structure with these exact field names:
{
  "lane": "string",
  "baseRate": "number",
  "currency": "string",
  "validFrom": "string",
  "validTo": "string",
  "surcharges": [{"type": "string", "amount": "number", "description": "string"}],
  "containerTypes": [{"type": "string", "rate": "number"}]
}`,

      'quotation': `
1. Quote number and date
2. Customer information
3. Total price and currency
4. Valid until date
5. Terms and conditions
6. Win/loss status and date

Return the data in a clean JSON structure with these exact field names:
{
  "quoteNumber": "string",
  "quoteDate": "string",
  "customer": "string",
  "totalPrice": "number",
  "currency": "string",
  "validUntil": "string",
  "terms": "string",
  "winLoss": "string",
  "winLossDate": "string"
}`,

      'booking': `
1. Booking number and carrier
2. Vessel and voyage information
3. Sailing and arrival dates
4. Container type and numbers
5. Rate and currency

Return the data in a clean JSON structure with these exact field names:
{
  "bookingNumber": "string",
  "carrier": "string",
  "vessel": "string",
  "voyage": "string",
  "sailingDate": "string",
  "arrivalDate": "string",
  "containerType": "string",
  "containerNumbers": ["string"],
  "rate": "number",
  "currency": "string"
}`,

      'tracking': `
TRACKING SHEET ANALYSIS:
Extract these specific fields from the document:

1. Shipment Reference: Find the main shipment reference number
2. Booking: Extract booking number
3. Vessel/Voyage: Get vessel name and voyage number
4. Origin/Destination: Extract origin and destination ports
5. Tracking Events: Extract all tracking events with dates, locations, status, and notes

CRITICAL: Return ONLY this JSON structure:
{
  "shipmentReference": "extracted shipment reference or null",
  "bookingNumber": "extracted booking number or null",
  "vessel": "extracted vessel name or null",
  "voyage": "extracted voyage number or null",
  "origin": "extracted origin port or null",
  "destination": "extracted destination port or null",
  "trackingEvents": [
    {
      "date": "extracted date",
      "location": "extracted location/event",
      "status": "extracted status",
      "notes": "extracted notes"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no other text.`
    };

    return basePrompt + (specificPrompts[documentType] || `
1. Document type and key information
2. Important dates and references
3. Financial details if applicable
4. Any special instructions or notes

Return the data in a clean JSON structure.`);
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
