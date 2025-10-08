import jsPDF from 'jspdf';
import { chatGPTService } from './chatgpt.js';
import { getAllLoads } from '../data/mockLoads.js';

export class PDFReportService {
  constructor() {
    this.doc = null;
    this.currentY = 20;
    this.pageHeight = 280;
    this.margin = 20;
  }

  async generateLaneComparisonReport(currentLoadId, laneData) {
    try {
      // Initialize PDF document
      this.doc = new jsPDF();
      this.currentY = 20;

      // Get current load and all loads for comparison
      const allLoads = getAllLoads();
      const currentLoad = allLoads.find(load => load.id === currentLoadId);
      
      if (!currentLoad) {
        throw new Error('Current load not found');
      }

      // Generate ChatGPT insights
      const insights = await this.generateInsights(currentLoad, allLoads, laneData);

      // Create report sections
      this.addHeader(currentLoad);
      this.addExecutiveSummary(currentLoad, insights);
      this.addLaneComparison(laneData, currentLoad);
      this.addLoadAnalysis(currentLoad, allLoads);
      this.addMarketInsights(insights);
      this.addRecommendations(insights);
      this.addFooter();

      // Save the PDF
      const fileName = `Lane_Comparison_Report_${currentLoad.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(fileName);

      return { success: true, fileName };
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  addHeader(load) {
    // Company logo area (placeholder)
    this.doc.setFillColor(59, 130, 246); // Blue color
    this.doc.rect(this.margin, 10, 170, 15, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Freight Forwarding Analytics', this.margin + 5, 20);
    
    // Report title
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.currentY = 35;
    this.doc.text('Lane Comparison & Market Analysis Report', this.margin, this.currentY);
    
    // Load information
    this.currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Load ID: ${load.id}`, this.margin, this.currentY);
    this.doc.text(`Route: ${load.route.origin} → ${load.route.destination}`, this.margin + 60, this.currentY);
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, this.margin + 120, this.currentY);
    
    this.currentY += 15;
  }

  addExecutiveSummary(load, insights) {
    this.addSectionHeader('Executive Summary');
    
    const summaryText = [
      `This report analyzes the performance and market positioning of Load ${load.id} on the ${load.route.origin}-${load.route.destination} lane.`,
      `The analysis compares this load against similar historical loads and current market conditions to provide actionable insights.`,
      `Key findings include margin analysis, risk assessment, and strategic recommendations for optimization.`
    ];

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    summaryText.forEach(line => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 10;
  }

  addLaneComparison(laneData, currentLoad) {
    this.addSectionHeader('Lane Performance Comparison');
    
    // Create comparison table
    const tableData = [
      ['Metric', 'Your Performance', 'Market Average', 'Gap'],
      ['Margin %', `${currentLoad.analysis?.predictedCost || 'N/A'}`, 'Market Avg', 'Gap'],
      ['On-Time %', '88%', '85%', '+3%'],
      ['Risk Score', `${(currentLoad.analysis?.riskScore * 100 || 0).toFixed(1)}%`, '25%', 'Risk Level']
    ];

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    
    // Table headers
    const colWidths = [40, 35, 35, 25];
    let x = this.margin;
    
    tableData[0].forEach((header, index) => {
      this.doc.text(header, x, this.currentY);
      x += colWidths[index];
    });
    
    this.currentY += 5;
    
    // Table rows
    this.doc.setFont('helvetica', 'normal');
    for (let i = 1; i < tableData.length; i++) {
      x = this.margin;
      tableData[i].forEach((cell, index) => {
        this.doc.text(cell, x, this.currentY);
        x += colWidths[index];
      });
      this.currentY += 5;
    }
    
    this.currentY += 10;
  }

  addLoadAnalysis(currentLoad, allLoads) {
    this.addSectionHeader('Load Analysis');
    
    // Load details
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Load Details:', this.margin, this.currentY);
    this.currentY += 5;
    
    this.doc.setFont('helvetica', 'normal');
    const loadDetails = [
      `Cargo Type: ${currentLoad.cargo.type}`,
      `Value: $${currentLoad.cargo.value.toLocaleString()}`,
      `Weight: ${currentLoad.cargo.weight.toLocaleString()} kg`,
      `Containers: ${currentLoad.cargo.containers} TEU`,
      `Status: ${currentLoad.status}`,
      `Completion: ${currentLoad.completion}%`
    ];
    
    loadDetails.forEach(detail => {
      this.doc.text(detail, this.margin + 10, this.currentY);
      this.currentY += 4;
    });
    
    this.currentY += 10;
    
    // Similar loads analysis
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Similar Loads Analysis:', this.margin, this.currentY);
    this.currentY += 5;
    
    this.doc.setFont('helvetica', 'normal');
    if (currentLoad.analysis?.similarLoads) {
      currentLoad.analysis.similarLoads.forEach((similar, index) => {
        this.doc.text(`${index + 1}. Load ${similar.id} - Similarity: ${(similar.similarity * 100).toFixed(1)}% - Outcome: ${similar.outcome}`, 
                     this.margin + 10, this.currentY);
        this.currentY += 4;
      });
    }
    
    this.currentY += 10;
  }

  addMarketInsights(insights) {
    this.addSectionHeader('Market Insights & AI Analysis');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Split insights into lines that fit the page width
    const maxWidth = 170;
    const lines = this.doc.splitTextToSize(insights, maxWidth);
    
    lines.forEach(line => {
      if (this.currentY > this.pageHeight) {
        this.doc.addPage();
        this.currentY = 20;
      }
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 10;
  }

  addRecommendations(insights) {
    this.addSectionHeader('Strategic Recommendations');
    
    const recommendations = [
      '• Monitor market conditions for optimal pricing opportunities',
      '• Consider alternative routing options to reduce risk',
      '• Implement proactive customer communication for high-value loads',
      '• Review and optimize document processing workflows',
      '• Leverage historical data for better load planning'
    ];
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    recommendations.forEach(rec => {
      if (this.currentY > this.pageHeight) {
        this.doc.addPage();
        this.currentY = 20;
      }
      this.doc.text(rec, this.margin, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 10;
  }

  addSectionHeader(title) {
    if (this.currentY > this.pageHeight - 20) {
      this.doc.addPage();
      this.currentY = 20;
    }
    
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY - 2, 170, 8, 'F');
    
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 2, this.currentY + 3);
    
    this.currentY += 10;
  }

  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setTextColor(128, 128, 128);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Page ${i} of ${pageCount}`, this.margin, 290);
      this.doc.text(`Generated on ${new Date().toLocaleString()}`, 120, 290);
    }
  }

  async generateInsights(currentLoad, allLoads, laneData) {
    try {
      // Check if ChatGPT service is available and has API key
      const apiKey = chatGPTService.getApiKey ? chatGPTService.getApiKey() : null;
      if (!apiKey) {
        console.warn('ChatGPT API key not available, using fallback insights');
        return this.generateFallbackInsights(currentLoad, allLoads, laneData);
      }

      // Prepare data for ChatGPT analysis
      const analysisData = {
        currentLoad: {
          id: currentLoad.id,
          route: currentLoad.route,
          cargo: currentLoad.cargo,
          status: currentLoad.status,
          analysis: currentLoad.analysis
        },
        similarLoads: currentLoad.analysis?.similarLoads || [],
        laneData: laneData,
        marketConditions: {
          totalLoads: allLoads.length,
          averageRisk: allLoads.reduce((sum, load) => sum + (load.analysis?.riskScore || 0), 0) / allLoads.length,
          highValueLoads: allLoads.filter(load => load.cargo.value > 100000).length
        }
      };

      // Generate insights using ChatGPT
      const prompt = `Analyze this freight forwarding load data and provide strategic insights:

Current Load: ${JSON.stringify(analysisData.currentLoad, null, 2)}
Similar Loads: ${JSON.stringify(analysisData.similarLoads, null, 2)}
Lane Data: ${JSON.stringify(analysisData.laneData, null, 2)}
Market Conditions: ${JSON.stringify(analysisData.marketConditions, null, 2)}

Please provide:
1. Key performance insights
2. Risk assessment and mitigation strategies
3. Market positioning analysis
4. Cost optimization opportunities
5. Customer relationship insights
6. Operational recommendations

Format as a comprehensive business analysis report.`;

      const insights = await chatGPTService.chat(prompt);
      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.generateFallbackInsights(currentLoad, allLoads, laneData);
    }
  }

  generateFallbackInsights(currentLoad, allLoads, laneData) {
    return `
AI-POWERED FREIGHT FORWARDING ANALYSIS

Load Analysis Summary:
• Load ID: ${currentLoad.id}
• Route: ${currentLoad.route.origin} → ${currentLoad.route.destination}
• Cargo Value: $${currentLoad.cargo.value.toLocaleString()}
• Status: ${currentLoad.status}

Key Performance Insights:
• This load represents a ${currentLoad.cargo.value > 100000 ? 'high-value' : 'standard'} shipment
• Route efficiency appears optimal based on historical data
• Risk level is ${currentLoad.analysis?.riskScore > 0.7 ? 'elevated' : 'manageable'}

Risk Assessment:
• Monitor weather conditions for ${currentLoad.route.mode} transport
• Ensure proper documentation for ${currentLoad.cargo.type} cargo
• Track container status throughout transit

Market Positioning:
• Current lane shows ${laneData[0]?.gap > 0 ? 'positive' : 'negative'} margin performance
• On-time delivery rate: ${laneData[0]?.onTime || 'N/A'}%
• Market confidence: ${laneData[0]?.confidence || 'Medium'}

Recommendations:
• Maintain current service level for customer satisfaction
• Consider alternative routing if cost pressures increase
• Implement proactive communication for status updates
• Review documentation workflow for efficiency gains

Note: AI insights generation unavailable. This analysis is based on structured data patterns.
    `.trim();
  }
}

// Export singleton instance
export const pdfReportService = new PDFReportService();
