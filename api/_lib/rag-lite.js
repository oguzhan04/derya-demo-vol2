// ============================================================================
// Edge-Compatible RAG Library (Pure JavaScript)
// ============================================================================

// ============================================================================
// Text Processing Functions
// ============================================================================

/**
 * Chunks text into overlapping segments for embedding and retrieval.
 * 
 * @param {string} text - The text to chunk
 * @param {number} maxLen - Maximum length of each chunk (default: 800)
 * @param {number} overlap - Number of characters to overlap between chunks (default: 100)
 * @returns {string[]} Array of text chunks
 */
export function chunkText(text, maxLen = 800, overlap = 100) {
  if (text.length <= maxLen) {
    return [text];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxLen;
    
    // If we're not at the end, try to break at a sentence boundary
    if (end < text.length) {
      const lastSentenceEnd = text.lastIndexOf('.', end);
      const lastSpace = text.lastIndexOf(' ', end);
      
      // Prefer sentence boundary, then word boundary
      if (lastSentenceEnd > start + maxLen * 0.5) {
        end = lastSentenceEnd + 1;
      } else if (lastSpace > start + maxLen * 0.5) {
        end = lastSpace;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start position with overlap
    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
}

// ============================================================================
// Vector Operations
// ============================================================================

/**
 * Calculates the cosine similarity between two vectors.
 * 
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} Cosine similarity score between -1 and 1
 */
export function cosine(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ============================================================================
// Index Management
// ============================================================================

/**
 * Builds a RAG index from document chunks and their embeddings.
 * 
 * @param {string} docId - Unique identifier for the document
 * @param {string[]} chunks - Array of text chunks
 * @param {number[][]} embeddings - Array of embedding vectors corresponding to chunks
 * @param {string} model - Model name used for embeddings
 * @returns {Object} Complete RAG index
 */
export function buildIndex(docId, chunks, embeddings, model) {
  if (chunks.length !== embeddings.length) {
    throw new Error('Number of chunks must match number of embeddings');
  }

  return {
    id: docId,
    model,
    items: chunks.map((text, index) => ({
      id: `${docId}-chunk-${index}`,
      text,
      vector: embeddings[index],
    })),
  };
}

/**
 * Selects the top K most similar items from a RAG index based on cosine similarity.
 * 
 * @param {Object} index - The RAG index to search
 * @param {number[]} queryVector - The query vector to compare against
 * @param {number} k - Number of top results to return (default: 6)
 * @returns {Object[]} Array of top K results with similarity scores
 */
export function selectTopK(index, queryVector, k = 6) {
  const results = [];

  for (const item of index.items) {
    const score = cosine(queryVector, item.vector);
    results.push({
      id: item.id,
      text: item.text,
      score,
    });
  }

  // Sort by score (descending) and take top K
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .filter(result => result.score > 0); // Only return positive similarities
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculates the magnitude (norm) of a vector.
 * 
 * @param {number[]} vector - The vector to calculate magnitude for
 * @returns {number} The magnitude of the vector
 */
export function magnitude(vector) {
  let sum = 0;
  for (let i = 0; i < vector.length; i++) {
    sum += vector[i] * vector[i];
  }
  return Math.sqrt(sum);
}

/**
 * Normalizes a vector to unit length.
 * 
 * @param {number[]} vector - The vector to normalize
 * @returns {number[]} The normalized vector
 */
export function normalize(vector) {
  const mag = magnitude(vector);
  if (mag === 0) {
    return vector.slice(); // Return copy of original vector
  }
  return vector.map(component => component / mag);
}

/**
 * Calculates the dot product of two vectors.
 * 
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} The dot product
 */
export function dotProduct(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Calculates the Euclidean distance between two vectors.
 * 
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} The Euclidean distance
 */
export function euclideanDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Calculates the Manhattan distance between two vectors.
 * 
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} The Manhattan distance
 */
export function manhattanDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum;
}
