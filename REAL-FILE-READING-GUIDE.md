# Real File Reading Implementation Guide

## Current Issue

ChatGPT is NOT reading your actual uploaded files. Instead, it's using hardcoded mock data, which is why you see generic JSONs like:

- Always "MAERSK SHANGHAI" vessel
- Always "Shanghai Electronics Co." shipper
- Always "INV-2024-001" invoice numbers

## Why This Happens

The current implementation uses mock document text instead of actually parsing your uploaded PDFs.

## Solution: Implement Real File Reading

### 1. Install PDF Parsing Libraries

```bash
npm install pdf-parse
npm install pdf2pic  # For image-based PDFs
npm install tesseract.js  # For OCR
```

### 2. Update the File Processing Function

Replace the current `processDocumentWithChatGPT` function with:

```javascript
import pdf from "pdf-parse";

const processDocumentWithChatGPT = async (file, documentType) => {
  try {
    setProcessingStatus(`Reading ${documentType} document...`);

    let documentText = "";

    if (file.type === "application/pdf") {
      // Extract text from PDF
      const pdfBuffer = await file.arrayBuffer();
      const pdfData = await pdf(Buffer.from(pdfBuffer));
      documentText = pdfData.text;
    } else if (file.type.includes("text")) {
      // Read text files directly
      documentText = await readTextFile(file);
    } else {
      // For images, use OCR
      documentText = await extractTextFromImage(file);
    }

    setProcessingStatus(`ChatGPT analyzing ${documentType} document...`);

    // Send REAL document text to ChatGPT
    const extractedJson = await chatGPTService.analyzeDocument(
      documentText,
      documentType
    );

    // Parse and return the result
    const parsedJson = JSON.parse(extractedJson);

    return {
      id: `doc-${Date.now()}`,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
      extractedJson: parsedJson,
      validationStatus: "valid",
      fileSize: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
};
```

### 3. Add OCR for Image Files

```javascript
import Tesseract from "tesseract.js";

const extractTextFromImage = async (file) => {
  const {
    data: { text },
  } = await Tesseract.recognize(file, "eng");
  return text;
};
```

### 4. Update ChatGPT Service

Ensure the ChatGPT service is configured to handle real document content:

```javascript
// In chatgpt.js
buildDocumentAnalysisPrompt(documentText, documentType) {
  return `Analyze this REAL ${documentType} document and extract the following information in JSON format:

Document Text (extracted from actual file):
${documentText}

Please extract the relevant information...`;
}
```

## Current Workaround

For now, the system shows a warning that it's in "Demo Mode" and explains that real file reading requires additional libraries.

## Testing Real File Reading

1. Install the required libraries
2. Update the file processing function
3. Test with your actual PDF files
4. Verify that ChatGPT extracts data from your real documents

## Expected Results

After implementing real file reading, you should see:

- Actual vessel names from your PDFs
- Real invoice numbers from your documents
- Actual cargo descriptions from your files
- Real financial data from your invoices

Instead of generic mock data like "MAERSK SHANGHAI" and "INV-2024-001".
