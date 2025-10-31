// Workflow persistence service for AgentBuilder
// Handles saving and loading workflows from localStorage

const STORAGE_KEY = 'agent_workflows';

// Load all workflows from localStorage
export const loadWorkflows = () => {
  try {
    const workflowsData = localStorage.getItem(STORAGE_KEY);
    return workflowsData ? JSON.parse(workflowsData) : [];
  } catch (error) {
    console.error('Error loading workflows:', error);
    return [];
  }
};

// Save a workflow
export const saveWorkflow = (workflow) => {
  try {
    const workflows = loadWorkflows();
    const existingIndex = workflows.findIndex(w => w.id === workflow.id);
    
    const workflowToSave = {
      ...workflow,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      workflows[existingIndex] = workflowToSave;
    } else {
      workflows.push(workflowToSave);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
    return true;
  } catch (error) {
    console.error('Error saving workflow:', error);
    return false;
  }
};

// Delete a workflow
export const deleteWorkflow = (workflowId) => {
  try {
    const workflows = loadWorkflows();
    const filtered = workflows.filter(w => w.id !== workflowId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return false;
  }
};

// Get a specific workflow by ID
export const getWorkflowById = (workflowId) => {
  const workflows = loadWorkflows();
  return workflows.find(w => w.id === workflowId);
};

// Create a new workflow with auto-generated ID
export const createWorkflow = (name, nodes = [], connections = []) => {
  return {
    id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name || 'Untitled Workflow',
    nodes,
    connections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Import workflow from JSON
export const importWorkflow = (jsonData) => {
  try {
    if (typeof jsonData === 'string') {
      jsonData = JSON.parse(jsonData);
    }
    
    const workflow = {
      ...jsonData,
      id: jsonData.id || `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: jsonData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return saveWorkflow(workflow) ? workflow : null;
  } catch (error) {
    console.error('Error importing workflow:', error);
    return null;
  }
};

