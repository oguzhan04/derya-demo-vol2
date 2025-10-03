import { useState, useEffect } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import ParsingBar from './ParsingBar'

export default function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)

  // Create file-specific parse settings
  const getFileParseSettings = (fileId) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    return file?.parseSettings || { docType: 'auto', dateFormat: 'auto', numberFormat: 'auto' }
  }

  const updateFileParseSettings = (fileId, newSettings) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, parseSettings: newSettings }
        : file
    ))
    
    // If this is the currently selected file, also update selected settings
    if (selectedFile?.id === fileId) {
      parseFile(selectedFile, newSettings)
    }
  }

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    if (selectedFile?.id === fileId) {
      setSelectedFile(null)
      setParsedData(null)
    }
  }

  const selectFileForParsing = (file) => {
    setSelectedFile(file)
    // Use the file's own parse settings
    const fileSettings = getFileParseSettings(file.id)
    parseFile(file, fileSettings)
  }

  const parseFile = (file, settings) => {
    if (!file) return
    
    // Simulate parsing with mock data based on settings
    const mockData = generateMockParsedData(settings)
    setParsedData(mockData)
  }

  const generateMockParsedData = (settings) => {
    const rows = []
    const docTypes = {
      auto: 'Invoice',
      invoice: 'Commercial Invoice',
      packing: 'Packing List', 
      bl: 'Bill of Lading',
      awb: 'Air Waybill',
      freightInvoice: 'Freight Invoice',
      customs: 'Customs Declaration'
    }
    
    const dateFormats = {
      auto: 'DD/MM/YYYY',
      DMY: 'DD/MM/YYYY',
      MDY: 'MM/DD/YYYY'
    }
    
    const numberFormats = {
      auto: '1,234.56',
      us: '1,234.56',
      eu: '1.234,56'
    }

    // Generate 20 mock rows
    for (let i = 1; i <= 20; i++) {
      rows.push({
        id: i,
        reference: `REF-${String(i).padStart(4, '0')}`,
        description: `Item ${i} - ${docTypes[settings.docType]}`,
        quantity: i * 10,
        unitPrice: numberFormats[settings.numberFormat],
        total: numberFormats[settings.numberFormat],
        date: formatDate(new Date(), dateFormats[settings.dateFormat]),
        status: i % 3 === 0 ? 'Processed' : i % 3 === 1 ? 'Pending' : 'Completed'
      })
    }
    
    return {
      fileName: selectedFile?.name || 'Unknown',
      docType: docTypes[settings.docType],
      header: ['Reference', 'Description', 'Qty', 'Unit Price', 'Total', 'Date', 'Status'],
      rows: rows
    }
  }

  const formatDate = (date, format) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    
    if (format === 'MM/DD/YYYY') return `${month}/${day}/${year}`
    return `${day}/${month}/${year}`
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️'
    return '📁'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[color:var(--deep-blue)] tracking-tight mb-2">
          Document Upload
        </h1>
        <p className="text-slate-600">
          Upload freight documents, invoices, bills of lading, and shipment documents.
        </p>
      </div>

      {/* Upload Drop Zone */}
      <section className="rounded-3xl shadow-soft bg-white border border-slate-200/60">
        <div className="p-8">
          <div 
            className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-12 text-center hover:border-[color:var(--accent)] hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-[color:var(--accent)]/10">
                <Upload size={32} className="text-[color:var(--accent)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Drag & drop your files here</h3>
                <p className="text-slate-500 mb-4">or click to browse your computer</p>
                <div className="text-sm text-slate-400">
                  Supports PDF, Excel, Word, images, and archives
                </div>
              </div>
            </div>
          </div>
          
          <input
            id="file-input"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
          />
        </div>
      </section>

      {/* Uploaded Files List - Always visible */}
        <section className="rounded-3xl shadow-soft bg-white border border-slate-200/60">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={20} className="text-[color:var(--deep-blue)]" />
              <h3 className="font-semibold text-slate-900">Uploaded Files ({uploadedFiles.length})</h3>
            </div>
            
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className={`p-4 rounded-xl border border-slate-200/60 transition-colors duration-200 ${
                      selectedFile?.id === file.id ? 'bg-[color:var(--accent)]/10 border-[color:var(--accent)]' : 'bg-slate-50 hover:bg-slate-100'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getFileIcon(file.type)}</div>
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => selectFileForParsing(file)}
                        >
                          <div className="font-medium text-slate-900 truncate">{file.name}</div>
                          <div className="text-sm text-slate-500">{formatFileSize(file.size)}</div>
                          {selectedFile?.id === file.id && (
                            <div className="text-xs text-[color:var(--accent)] mt-1">✓ Selected for parsing</div>
                          )}
                        </div>
                        
                        {/* Individual parsing controls */}
                        <div className="flex items-center gap-3">
                          {/* Document Type */}
                          <div className="flex flex-col">
                            <label className="text-xs text-slate-500 mb-1">Type</label>
                            <select
                              className="text-xs rounded-lg border-slate-300 focus:ring-1 focus:ring-slate-300 w-28"
                              value={getFileParseSettings(file.id).docType}
                              onChange={e => updateFileParseSettings(file.id, {
                                ...getFileParseSettings(file.id),
                                docType: e.target.value
                              })}
                            >
                              <option value="auto">Auto</option>
                              <option value="invoice">Invoice</option>
                              <option value="packing">Packing</option>
                              <option value="bl">B/L</option>
                              <option value="awb">AWB</option>
                              <option value="freightInvoice">Freight</option>
                              <option value="customs">Customs</option>
                            </select>
                          </div>

                          {/* Date Format */}
                          <div className="flex flex-col">
                            <label className="text-xs text-slate-500 mb-1">Date</label>
                            <select
                              className="text-xs rounded-lg border-slate-300 focus:ring-1 focus:ring-slate-300 w-20"
                              value={getFileParseSettings(file.id).dateFormat}
                              onChange={e => updateFileParseSettings(file.id, {
                                ...getFileParseSettings(file.id),
                                dateFormat: e.target.value
                              })}
                            >
                              <option value="auto">Auto</option>
                              <option value="DMY">DD/MM</option>
                              <option value="MDY">MM/DD</option>
                            </select>
                          </div>

                          {/* Number Format */}
                          <div className="flex flex-col">
                            <label className="text-xs text-slate-500 mb-1">Numbers</label>
                            <select
                              className="text-xs rounded-lg border-slate-300 focus:ring-1 focus:ring-slate-300 w-16"
                              value={getFileParseSettings(file.id).numberFormat}
                              onChange={e => updateFileParseSettings(file.id, {
                                ...getFileParseSettings(file.id),
                                numberFormat: e.target.value
                              })}
                            >
                              <option value="auto">Auto</option>
                              <option value="us">US</option>
                              <option value="eu">EU</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-2 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors duration-200"
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

            {/* Demo placeholder when no files */}
            {uploadedFiles.length === 0 && (
              <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50">
                <div className="flex items-center gap-4 opacity-75">
                  <div className="text-2xl text-slate-400">📄</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-500 truncate">No document uploaded</div>
                    <div className="text-sm text-slate-400">Click "Browse files" or drag & drop to upload</div>
                  </div>
                  
                  {/* Static demo parsing controls */}
                  <div className="flex items-center gap-3">
                    {/* Document Type */}
                    <div className="flex flex-col">
                      <label className="text-xs text-slate-400 mb-1">Type</label>
                      <div className="text-xs rounded-lg border-slate-300 bg-slate-100 text-slate-500 px-2 py-1 w-16">
                        Auto
                      </div>
                    </div>

                    {/* Date Format */}
                    <div className="flex flex-col">
                      <label className="text-xs text-slate-400 mb-1">Date</label>
                      <div className="text-xs rounded-lg border-slate-300 bg-slate-100 text-slate-500 px-2 py-1 w-12">
                        Auto
                      </div>
                    </div>

                    {/* Number Format */}
                    <div className="flex flex-col">
                      <label className="text-xs text-slate-400 mb-1">Numbers</label>
                      <div className="text-xs rounded-lg border-slate-300 bg-slate-100 text-slate-500 px-2 py-1 w-12">
                        Auto
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-full bg-slate-200 text-slate-400">
                    <X size={16} />
                  </div>
                </div>
              </div>
            )}
          </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">
                  Total files: {uploadedFiles.length}
                </span>
                <button 
                  onClick={() => console.log('Process files:', uploadedFiles)}
                  className="bg-[color:var(--accent)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[color:var(--deep-blue)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploadedFiles.length === 0}
                >
                  Process Files
                </button>
              </div>
            </div>
          </div>
        </section>

      {/* Parsing Bar & Preview */}
      {selectedFile && (
        <>
          {/* ParsingBar */}
          <ParsingBar value={parseSettings} onChange={setParseSettings} />

          {/* Preview Table */}
          <section className="rounded-3xl shadow-soft bg-white border border-slate-200/60">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Document Preview</h3>
                <p className="text-sm text-slate-500">
                  Showing first 20 rows • {parsedData?.docType} • Adjust parsing settings above
                </p>
              </div>

              {parsedData && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          {parsedData.header.map((header, index) => (
                            <th key={index} className="px-4 py-3 text-left font-medium text-slate-700 text-xs uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {parsedData.rows.map((row, index) => (
                          <tr key={row.id} className={index % 2 === 0 ? 'bg-white': 'bg-slate-25'}>
                            <td className="px-4 py-3 text-slate-900 font-medium">{row.reference}</td>
                            <td className="px-4 py-3 text-slate-700">{row.description}</td>
                            <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
                            <td className="px-4 py-3 text-slate-700">{row.unitPrice}</td>
                            <td className="px-4 py-3 text-slate-700">{row.total}</td>
                            <td className="px-4 py-3 text-slate-700">{row.date}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                row.status === 'Processed' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                    Showing {parsedData.rows.length} of {parsedData.rows.length} rows
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
