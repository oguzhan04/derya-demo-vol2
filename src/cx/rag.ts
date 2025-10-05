// ============================================================================
// RAG (Retrieval-Augmented Generation) Module
// ============================================================================

/**
 * Interface for a RAG index containing document chunks and their embeddings.
 */
export interface RAGIndex {
  id: string;
  model: string;
  items: Array<{
    id: string;
    text: string;
    vector: number[];
  }>;
}

/**
 * Result of a similarity search in the RAG index.
 */
export interface RAGSearchResult {
  id: string;
  text: string;
  score: number;
}

// ============================================================================
// Text Processing Functions
// ============================================================================

/**
 * Chunks text into overlapping segments for embedding and retrieval.
 * 
 * @param text - The text to chunk
 * @param maxLen - Maximum length of each chunk (default: 800)
 * @param overlap - Number of characters to overlap between chunks (default: 100)
 * @returns Array of text chunks
 * 
 * @example
 * ```typescript
 * const chunks = chunkText("This is a long document...", 200, 50);
 * // Returns: ["This is a long document...", "document with overlap...", ...]
 * ```
 */
export function chunkText(text: string, maxLen: number = 800, overlap: number = 100): string[] {
  if (text.length <= maxLen) {
    return [text];
  }

  const chunks: string[] = [];
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
 * @param a - First vector
 * @param b - Second vector
 * @returns Cosine similarity score between -1 and 1
 * 
 * @example
 * ```typescript
 * const similarity = cosine([1, 0, 0], [0, 1, 0]); // Returns 0
 * const similarity = cosine([1, 0, 0], [1, 0, 0]); // Returns 1
 * ```
 */
export function cosine(a: number[], b: number[]): number {
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
 * @param docId - Unique identifier for the document
 * @param chunks - Array of text chunks
 * @param embeddings - Array of embedding vectors corresponding to chunks
 * @param model - Model name used for embeddings
 * @returns Complete RAG index
 * 
 * @example
 * ```typescript
 * const index = buildIndex('doc-123', ['chunk1', 'chunk2'], [[0.1, 0.2], [0.3, 0.4]], 'text-embedding-3-small');
 * ```
 */
export function buildIndex(
  docId: string,
  chunks: string[],
  embeddings: number[][],
  model: string
): RAGIndex {
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
 * @param index - The RAG index to search
 * @param queryVector - The query vector to compare against
 * @param k - Number of top results to return (default: 6)
 * @returns Array of top K results with similarity scores
 * 
 * @example
 * ```typescript
 * const results = selectTopK(index, [0.1, 0.2, 0.3], 3);
 * // Returns: [{ id: 'chunk-1', text: '...', score: 0.95 }, ...]
 * ```
 */
export function selectTopK(
  index: RAGIndex,
  queryVector: number[],
  k: number = 6
): RAGSearchResult[] {
  const results: RAGSearchResult[] = [];

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
 * Merges multiple RAG indexes into a single index.
 * 
 * @param indexes - Array of RAG indexes to merge
 * @returns Combined RAG index
 */
export function mergeIndexes(indexes: RAGIndex[]): RAGIndex {
  if (indexes.length === 0) {
    throw new Error('At least one index is required');
  }

  const mergedItems = indexes.flatMap(index => index.items);
  const model = indexes[0].model; // Use model from first index

  return {
    id: `merged-${Date.now()}`,
    model,
    items: mergedItems,
  };
}

/**
 * Filters a RAG index to only include items above a similarity threshold.
 * 
 * @param index - The RAG index to filter
 * @param queryVector - The query vector for similarity calculation
 * @param threshold - Minimum similarity score (default: 0.5)
 * @returns Filtered RAG index
 */
export function filterBySimilarity(
  index: RAGIndex,
  queryVector: number[],
  threshold: number = 0.5
): RAGIndex {
  const filteredItems = index.items.filter(item => {
    const score = cosine(queryVector, item.vector);
    return score >= threshold;
  });

  return {
    id: index.id,
    model: index.model,
    items: filteredItems,
  };
}

/**
 * Calculates the average embedding vector from multiple vectors.
 * 
 * @param vectors - Array of embedding vectors
 * @returns Average vector
 */
export function averageVector(vectors: number[][]): number[] {
  if (vectors.length === 0) {
    throw new Error('At least one vector is required');
  }

  const dimensions = vectors[0].length;
  const average = new Array(dimensions).fill(0);

  for (const vector of vectors) {
    if (vector.length !== dimensions) {
      throw new Error('All vectors must have the same dimensions');
    }
    for (let i = 0; i < dimensions; i++) {
      average[i] += vector[i];
    }
  }

  // Normalize by number of vectors
  for (let i = 0; i < dimensions; i++) {
    average[i] /= vectors.length;
  }

  return average;
}

/**
 * Validates that a RAG index has the expected structure.
 * 
 * @param index - The index to validate
 * @returns True if valid, false otherwise
 */
export function validateIndex(index: any): index is RAGIndex {
  return (
    typeof index === 'object' &&
    typeof index.id === 'string' &&
    typeof index.model === 'string' &&
    Array.isArray(index.items) &&
    index.items.every((item: any) =>
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.text === 'string' &&
      Array.isArray(item.vector) &&
      item.vector.every((v: any) => typeof v === 'number')
    )
  );
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default chunk size for text processing.
 */
export const DEFAULT_CHUNK_SIZE = 800;

/**
 * Default overlap size for text chunking.
 */
export const DEFAULT_OVERLAP = 100;

/**
 * Default number of top results to return from similarity search.
 */
export const DEFAULT_TOP_K = 6;

/**
 * Default similarity threshold for filtering results.
 */
export const DEFAULT_SIMILARITY_THRESHOLD = 0.5;
