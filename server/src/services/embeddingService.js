const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generates vector embedding array for text string
 */
const generateEmbedding = async (text) => {
  const apiKey = process.env.AI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      console.warn('Gemini embedding failed, using local vector representation:', err.message);
    }
  }

  // Fallback 64-dimensional pseudo-vector algorithm for in-memory cosine similarity search
  const vector = new Array(64).fill(0);
  const cleanText = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const words = cleanText.split(/\s+/);
  
  words.forEach((word, idx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const pos = Math.abs(hash) % 64;
    vector[pos] += 1 / (idx + 1);
  });

  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((val) => val / magnitude);
};

const cosineSimilarity = (vecA, vecB) => {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
};

module.exports = {
  generateEmbedding,
  cosineSimilarity,
};
