import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database,
  Plus,
  Eye,
  Download,
  Trash2,
  Edit3,
  Truck,
  Ship,
  Code,
  X
} from 'lucide-react';
import { getAllLoads } from '../../data/mockLoads';
import { analyzeLoad } from '../../services/analysis';
import { exportLoadAsJson } from '../../utils/jsonExporter';

const documentCategories = [
  { key: 'billOfLading', name: 'Bill of Lading', icon: FileText },
  { key: 'commercialInvoice', name: 'Commercial Invoice', icon: FileText },
  { key: 'invoices', name: 'Invoices', icon: FileText },
  { key: 'rateTable', name: 'Rate Table', icon: Database },
  { key: 'quotation', name: 'Quotation', icon: FileText },
  { key: 'booking', name: 'Booking', icon: FileText },
  { key: 'tracking', name: 'Tracking', icon: Clock }
];

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-blue-600" />;
    case 'partial':
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    case 'active':
      return <Clock className="w-4 h-4 text-slate-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-slate-100 border-slate-200 text-slate-800';
    case 'partial':
      return 'bg-amber-100 border-amber-200 text-amber-800';
    case 'active':
      return 'bg-blue-100 border-blue-200 text-blue-800';
    default:
      return 'bg-slate-100 border-slate-200 text-slate-700';
  }
};

const getCategoryColor = () => {
  return 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100';
};

export default function ViewData() {
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [selectedLoadJson, setSelectedLoadJson] = useState(null);

  // Get real data from mock loads
  const allLoads = getAllLoads();
  const filteredLoads = allLoads.filter(load => 
    filterStatus === 'all' || load.status.toLowerCase() === filterStatus.toLowerCase()
  );

  const handleViewJson = (load) => {
    // Use the JSON exporter to create clean JSON with clear document sections
    const cleanJson = exportLoadAsJson(load);
    setSelectedLoadJson(cleanJson);
    setShowJsonModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[color:var(--deep-blue)] tracking-tight mb-2">
          View Data
        </h1>
        <p className="text-slate-600">
          Browse and explore all your uploaded and integrated data by load
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Loads</option>
            <option value="planning">Planning</option>
            <option value="in transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          New Load
        </button>
      </div>

      {/* Loads List */}
      <div className="space-y-4">
        {filteredLoads.map((load) => (
          <div 
            key={load.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Load Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                    <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{load.id}</h3>
                  </div>
                  <div className="hidden md:flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <Ship className="w-4 h-4 text-slate-600" />
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{load.route.origin}</span>
                    <span className="h-px w-10 bg-slate-300"></span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{load.route.destination}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{load.cargo.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Completion:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${load.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{load.completion}%</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    load.status === 'delivered' ? 'bg-slate-100 text-slate-800' :
                    load.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {load.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Categories */}
            <div className="p-6">
              <div className="grid grid-cols-7 gap-4">
                {documentCategories.map((category) => {
                  const docData = load.documents[category.key];
                  const Icon = category.icon;
                  
                  return (
                    <div 
                      key={category.key}
                      className={`p-4 rounded-lg border-2 transition-all hover:shadow-sm cursor-pointer ${
                        docData.status === 'completed' ? 'border-solid' : 'border-dashed'
                      } ${getCategoryColor()}`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium">{category.name}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(docData.status)}
                          <span className="text-xs">
                            {docData.files.length > 0 ? `${docData.files.length} file${docData.files.length > 1 ? 's' : ''}` : 'No files'}
                          </span>
                        </div>
                        {docData.lastUpdated && (
                          <span className="text-xs text-gray-500">
                            {new Date(docData.lastUpdated).toLocaleDateString()}
                          </span>
                        )}
                        <button className="mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                          <Upload className="w-3 h-3" />
                          Upload
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button 
                    onClick={() => handleViewJson(load)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Code className="w-4 h-4" />
                    View JSON
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLoads.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No loads found</h3>
          <p className="text-gray-600 mb-6">
            {filterStatus === 'all' 
              ? "You haven't created any loads yet. Start by creating your first load."
              : `No loads found with status "${filterStatus}". Try changing the filter.`
            }
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
            <Plus className="w-4 h-4" />
            Create First Load
          </button>
        </div>
      )}

      {/* JSON Modal */}
      {showJsonModal && selectedLoadJson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Code className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  JSON Data - {selectedLoadJson.loadId}
                </h3>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* JSON Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(selectedLoadJson, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Document sections: Bill of Lading, Commercial Invoice, Invoices, Rate Table, Quotation, Booking, Tracking
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(selectedLoadJson, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedLoadJson.loadId}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </button>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
