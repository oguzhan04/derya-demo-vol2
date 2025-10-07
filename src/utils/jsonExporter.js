// JSON export utilities for load data
// This creates clean JSON files with clear document sections

export const exportLoadAsJson = (load) => {
  // Create a clean JSON structure with clear document sections
  const exportData = {
    // Load metadata
    loadId: load.id,
    status: load.status,
    completion: load.completion,
    createdAt: load.createdAt,
    updatedAt: load.updatedAt,
    
    // Route information
    route: {
      origin: load.route.origin,
      destination: load.route.destination,
      mode: load.route.mode,
      distance: load.route.distance,
      estimatedTransitDays: load.route.estimatedTransitDays
    },
    
    // Cargo details
    cargo: {
      type: load.cargo.type,
      value: load.cargo.value,
      weight: load.cargo.weight,
      volume: load.cargo.volume,
      containers: load.cargo.containers,
      hazardous: load.cargo.hazardous,
      temperatureControlled: load.cargo.temperatureControlled
    },
    
    // Document sections - each document type has its own clear section
    documents: {
      // Bill of Lading section
      billOfLading: {
        status: load.documents.billOfLading.status,
        files: load.documents.billOfLading.files.map(file => ({
          id: file.id,
          filename: file.filename,
          uploadedAt: file.uploadedAt,
          extractedData: file.extractedJson, // Renamed for clarity
          validationStatus: file.validationStatus,
          fileSize: file.fileSize,
          mimeType: file.mimeType
        })),
        lastUpdated: load.documents.billOfLading.lastUpdated
      },
      
      // Commercial Invoice section
      commercialInvoice: {
        status: load.documents.commercialInvoice.status,
        files: load.documents.commercialInvoice.files.map(file => ({
          id: file.id,
          filename: file.filename,
          uploadedAt: file.uploadedAt,
          extractedData: file.extractedJson,
          validationStatus: file.validationStatus,
          fileSize: file.fileSize,
          mimeType: file.mimeType
        })),
        lastUpdated: load.documents.commercialInvoice.lastUpdated
      },
      
      // Invoices section
      invoices: {
        status: load.documents.invoices.status,
        files: load.documents.invoices.files.map(file => ({
          id: file.id,
          filename: file.filename,
          uploadedAt: file.uploadedAt,
          extractedData: file.extractedJson,
          validationStatus: file.validationStatus,
          fileSize: file.fileSize,
          mimeType: file.mimeType
        })),
        lastUpdated: load.documents.invoices.lastUpdated
      },
      
      // Rate Table section
      rateTable: {
        status: load.documents.rateTable.status,
        files: load.documents.rateTable.files.map(file => ({
          id: file.id,
          filename: file.filename,
          uploadedAt: file.uploadedAt,
          extractedData: file.extractedJson,
          validationStatus: file.validationStatus,
          fileSize: file.fileSize,
          mimeType: file.mimeType
        })),
        lastUpdated: load.documents.rateTable.lastUpdated
      },
      
      // Quotation section
      quotation: {
        status: load.documents.quotation.status,
        files: load.documents.quotation.files.map(file => ({
          id: file.id,
          filename: file.filename,
          uploadedAt: file.uploadedAt,
          extractedData: file.extractedJson,
          validationStatus: file.validationStatus,
          fileSize: file.fileSize,
          mimeType: file.mimeType
        })),
        lastUpdated: load.documents.quotation.lastUpdated
      },
      
      // Booking section
      booking: {
        status: load.documents.booking.status,
        files: load.documents.booking.files.map(file => ({
          id: file.id,
          filename: file.filename,
          uploadedAt: file.uploadedAt,
          extractedData: file.extractedJson,
          validationStatus: file.validationStatus,
          fileSize: file.fileSize,
          mimeType: file.mimeType
        })),
        lastUpdated: load.documents.booking.lastUpdated
      },
      
      // Tracking section
      tracking: {
        status: load.documents.tracking.status,
        files: load.documents.tracking.files.map(file => ({
          id: file.id,
          filename: file.filename,
          uploadedAt: file.uploadedAt,
          extractedData: file.extractedJson,
          validationStatus: file.validationStatus,
          fileSize: file.fileSize,
          mimeType: file.mimeType
        })),
        lastUpdated: load.documents.tracking.lastUpdated
      }
    },
    
    // Analysis results
    analysis: load.analysis ? {
      riskScore: load.analysis.riskScore,
      predictedCost: load.analysis.predictedCost,
      predictedTransitDays: load.analysis.predictedTransitDays,
      similarLoads: load.analysis.similarLoads,
      alerts: load.analysis.alerts,
      recommendations: load.analysis.recommendations
    } : null
  };
  
  return exportData;
};

// Export all loads as a single JSON file
export const exportAllLoadsAsJson = (loads) => {
  return {
    exportDate: new Date().toISOString(),
    totalLoads: loads.length,
    loads: loads.map(load => exportLoadAsJson(load))
  };
};

// Create a summary JSON with just the key information
export const exportLoadSummary = (load) => {
  return {
    loadId: load.id,
    route: `${load.route.origin} → ${load.route.destination}`,
    cargo: load.cargo.type,
    status: load.status,
    completion: load.completion,
    documentCounts: {
      billOfLading: load.documents.billOfLading.files.length,
      commercialInvoice: load.documents.commercialInvoice.files.length,
      invoices: load.documents.invoices.files.length,
      rateTable: load.documents.rateTable.files.length,
      quotation: load.documents.quotation.files.length,
      booking: load.documents.booking.files.length,
      tracking: load.documents.tracking.files.length
    },
    totalFiles: Object.values(load.documents).reduce((sum, doc) => sum + doc.files.length, 0)
  };
};


