// Test script for PDF report generation
import { pdfReportService } from './pdfReportService.js';
import { getAllLoads } from '../data/mockLoads.js';

// Test function to verify PDF generation
export async function testPdfGeneration() {
  try {
    console.log('Testing PDF report generation...');
    
    // Get sample data
    const allLoads = getAllLoads();
    const currentLoadId = 'LOAD-2024-001';
    const laneData = [
      {
        name: 'Shanghai—Los Angeles',
        yourMargin: 18.5,
        marketMargin: 17.2,
        gap: 1.3,
        onTime: 88,
        suggestion: null,
        confidence: 'High',
        source: 'Market data + Load analysis',
        isCurrent: true,
        loadId: currentLoadId,
        customer: 'LA Electronics Inc.',
        cargo: 'Electronics'
      }
    ];
    
    // Generate the report
    const result = await pdfReportService.generateLaneComparisonReport(currentLoadId, laneData);
    
    console.log('PDF generation test completed:', result);
    return result;
  } catch (error) {
    console.error('PDF generation test failed:', error);
    throw error;
  }
}

// Export for manual testing
export { testPdfGeneration };
