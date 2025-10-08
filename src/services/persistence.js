// Data persistence service for loads and extracted JSONs
// This handles saving and loading data from localStorage and future database integration

const STORAGE_KEYS = {
  LOADS: 'logistics_loads_data',
  DOCUMENTS: 'logistics_documents_data',
  SETTINGS: 'logistics_settings'
};

// Load data from localStorage
export const loadDataFromStorage = () => {
  try {
    const loadsData = localStorage.getItem(STORAGE_KEYS.LOADS);
    const documentsData = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    
    return {
      loads: loadsData ? JSON.parse(loadsData) : [],
      documents: documentsData ? JSON.parse(documentsData) : {}
    };
  } catch (error) {
    console.error('Error loading data from storage:', error);
    return { loads: [], documents: {} };
  }
};

// Save data to localStorage
export const saveDataToStorage = (loads, documents = {}) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOADS, JSON.stringify(loads));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    console.log('Data saved to localStorage successfully');
    return true;
  } catch (error) {
    console.error('Error saving data to storage:', error);
    return false;
  }
};

// Save a single load
export const saveLoad = (load) => {
  try {
    const { loads } = loadDataFromStorage();
    const existingIndex = loads.findIndex(l => l.id === load.id);
    
    if (existingIndex >= 0) {
      loads[existingIndex] = load;
    } else {
      loads.push(load);
    }
    
    return saveDataToStorage(loads);
  } catch (error) {
    console.error('Error saving load:', error);
    return false;
  }
};

// Get all loads
export const getAllLoads = () => {
  const { loads } = loadDataFromStorage();
  return loads;
};

// Get a specific load by ID
export const getLoadById = (loadId) => {
  const { loads } = loadDataFromStorage();
  return loads.find(load => load.id === loadId);
};

// Update a load
export const updateLoad = (loadId, updates) => {
  try {
    const { loads } = loadDataFromStorage();
    const loadIndex = loads.findIndex(l => l.id === loadId);
    
    if (loadIndex >= 0) {
      loads[loadIndex] = { ...loads[loadIndex], ...updates, updatedAt: new Date().toISOString() };
      return saveDataToStorage(loads);
    }
    return false;
  } catch (error) {
    console.error('Error updating load:', error);
    return false;
  }
};

// Delete a load
export const deleteLoad = (loadId) => {
  try {
    const { loads } = loadDataFromStorage();
    const filteredLoads = loads.filter(l => l.id !== loadId);
    return saveDataToStorage(filteredLoads);
  } catch (error) {
    console.error('Error deleting load:', error);
    return false;
  }
};

// Save extracted JSON data for a document
export const saveDocumentJson = (loadId, documentType, extractedJson) => {
  try {
    const { loads } = loadDataFromStorage();
    const load = loads.find(l => l.id === loadId);
    
    if (load) {
      if (!load.documents[documentType]) {
        load.documents[documentType] = {
          status: 'completed',
          files: [],
          lastUpdated: null
        };
      }
      
      const newFile = {
        id: `doc-${Date.now()}`,
        filename: `${documentType}_${Date.now()}.json`,
        uploadedAt: new Date().toISOString(),
        extractedJson: extractedJson,
        validationStatus: 'valid',
        fileSize: JSON.stringify(extractedJson).length,
        mimeType: 'application/json'
      };
      
      load.documents[documentType].files.push(newFile);
      load.documents[documentType].lastUpdated = new Date().toISOString();
      load.documents[documentType].status = 'completed';
      
      return saveDataToStorage(loads);
    }
    return false;
  } catch (error) {
    console.error('Error saving document JSON:', error);
    return false;
  }
};

// Export all data as JSON
export const exportAllData = () => {
  const data = loadDataFromStorage();
  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    loads: data.loads,
    documents: data.documents
  };
};

// Import data from JSON
export const importData = (jsonData) => {
  try {
    if (jsonData.loads) {
      saveDataToStorage(jsonData.loads, jsonData.documents || {});
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Clear all data
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOADS);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    console.log('All data cleared from localStorage');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// Get storage usage statistics
export const getStorageStats = () => {
  try {
    const loadsData = localStorage.getItem(STORAGE_KEYS.LOADS);
    const documentsData = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    
    return {
      loadsCount: loadsData ? JSON.parse(loadsData).length : 0,
      loadsSize: loadsData ? loadsData.length : 0,
      documentsSize: documentsData ? documentsData.length : 0,
      totalSize: (loadsData?.length || 0) + (documentsData?.length || 0)
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return { loadsCount: 0, loadsSize: 0, documentsSize: 0, totalSize: 0 };
  }
};
