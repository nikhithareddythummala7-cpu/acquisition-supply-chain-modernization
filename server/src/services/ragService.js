const { GoogleGenerativeAI } = require('@google/generative-ai');
const { retrieveRelevantContext } = require('./retrievalService');

/**
 * Main RAG Chat Service Pipeline
 */
const generateRAGAnswer = async (query, user) => {
  // 1. Retrieve permission-aware context & evidence references
  const { contextText, evidenceSources } = await retrieveRelevantContext(query, user);

  // Guardrail check for domain relevance
  const systemDomainKeywords = [
    'procurement', 'requisition', 'requirement', 'supplier', 'vendor',
    'bid', 'contract', 'shipment', 'delivery', 'delay', 'inspection',
    'risk', 'compliance', 'forecast', 'anomaly', 'audit', 'score', 'status'
  ];
  
  const queryLower = query.toLowerCase();
  const isDomainRelevant = systemDomainKeywords.some((kw) => queryLower.includes(kw));

  if (!isDomainRelevant && !contextText) {
    return {
      answer: "I can help with acquisition, procurement, supplier, contract, risk, and supply-chain information available in this system. Please ask a question related to active requisitions, supplier scores, contracts, shipments, or risks.",
      evidenceSources: [],
      sourcesCount: 0,
    };
  }

  // 2. Call LLM or Local Generator with context
  const apiKey = process.env.AI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `System Context / Role: You are the AI Acquisition & Supply Chain Assistant.
User Role: ${user ? user.role : 'GUEST'}
User Question: "${query}"

Retrieved Database Context:
${contextText || 'No specific records matched the query.'}

Instructions:
1. Answer the question using ONLY facts from the retrieved database context.
2. If the user is asking about records they are authorized to see, summarize clearly.
3. If no matching records exist in context, clearly state that no matching records were found in the database.
4. Do NOT fabricate suppliers, contracts, or facts.
5. Keep response clear, professional, and well-structured with bullet points.`;

      const result = await model.generateContent(prompt);
      const answer = result.response.text();

      return {
        answer,
        evidenceSources,
        sourcesCount: evidenceSources.length,
      };
    } catch (err) {
      console.warn('RAG Gemini call failed, utilizing local deterministic synthesizer:', err.message);
    }
  }

  // 3. Fallback Synthesizer if LLM key is absent or fails
  let synthesisAnswer = '';

  if (contextText) {
    synthesisAnswer = `Based on the authorized system database records retrieved for your role (${user ? user.role : 'GUEST'}), here is the synthesis for your query:\n\n` +
      `**Retrieved Key Findings:**\n` +
      contextText.split('\n').map((line) => `• ${line}`).join('\n') +
      `\n\n**AI Recommendation:** High-priority items should be regularly monitored through the respective Procurement, Contract, or Logistics dashboards.`;
  } else {
    synthesisAnswer = `No specific matching records were found in the database for query "${query}" under your current role permissions (${user ? user.role : 'GUEST'}). Please verify record ID or check filter settings.`;
  }

  return {
    answer: synthesisAnswer,
    evidenceSources,
    sourcesCount: evidenceSources.length,
  };
};

module.exports = { generateRAGAnswer };
