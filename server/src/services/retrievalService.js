const ProcurementRequirement = require('../models/ProcurementRequirement');
const Supplier = require('../models/Supplier');
const SupplyContract = require('../models/SupplyContract');
const Shipment = require('../models/Shipment');
const RiskAssessment = require('../models/RiskAssessment');
const BidSubmission = require('../models/BidSubmission');
const ComplianceRecord = require('../models/ComplianceRecord');
const VectorEmbedding = require('../models/VectorEmbedding');
const { generateEmbedding, cosineSimilarity } = require('./embeddingService');

/**
 * Permission-Aware Context Retrieval Service
 */
const retrieveRelevantContext = async (query, user) => {
  const queryLower = query.toLowerCase();
  const retrievedDocs = [];
  const evidenceSources = [];

  // Role permissions check
  const userRole = user ? user.role : 'GUEST';

  // 1. Procurement Requirements
  if (['ADMIN', 'PROCUREMENT_OFFICER', 'SUPPLY_CHAIN_ANALYST', 'COMPLIANCE_AUDITOR', 'OPERATIONS_COMMANDER', 'RISK_SPECIALIST', 'EXTERNAL_AUDITOR'].includes(userRole)) {
    const reqs = await ProcurementRequirement.find({}).limit(20);
    reqs.forEach((req) => {
      if (
        queryLower.includes(req.title.toLowerCase()) ||
        queryLower.includes(req.requestId.toLowerCase()) ||
        queryLower.includes(req.category.toLowerCase()) ||
        queryLower.includes('procurement') ||
        queryLower.includes('request') ||
        queryLower.includes('equipment') ||
        queryLower.includes('requirement')
      ) {
        retrievedDocs.push({
          type: 'Procurement Requirement',
          id: req.requestId,
          content: `Requisition [${req.requestId}] "${req.title}" | Category: ${req.category} | Budget: $${req.estimatedBudget.toLocaleString()} | Status: ${req.status} | Priority: ${req.priority} | Department: ${req.department}`,
        });
        evidenceSources.push({
          type: 'ProcurementRequirement',
          id: req._id,
          reference: `${req.requestId}: ${req.title}`,
        });
      }
    });
  }

  // 2. Suppliers
  if (['ADMIN', 'PROCUREMENT_OFFICER', 'SUPPLY_CHAIN_ANALYST', 'COMPLIANCE_AUDITOR', 'OPERATIONS_COMMANDER', 'RISK_SPECIALIST', 'EXTERNAL_AUDITOR'].includes(userRole)) {
    const suppliers = await Supplier.find({}).limit(20);
    suppliers.forEach((sup) => {
      if (
        queryLower.includes(sup.companyName.toLowerCase()) ||
        queryLower.includes(sup.supplierId.toLowerCase()) ||
        queryLower.includes('supplier') ||
        queryLower.includes('vendor') ||
        queryLower.includes('score') ||
        queryLower.includes('delay') ||
        queryLower.includes('performance')
      ) {
        retrievedDocs.push({
          type: 'Supplier Profile',
          id: sup.supplierId,
          content: `Supplier [${sup.supplierId}] "${sup.companyName}" | Quality: ${sup.qualityScore}/100 | Delivery: ${sup.deliveryScore}/100 | Compliance: ${sup.complianceScore}/100 | Risk: ${sup.riskScore}/100 | Status: ${sup.status}`,
        });
        evidenceSources.push({
          type: 'Supplier',
          id: sup._id,
          reference: `${sup.supplierId}: ${sup.companyName}`,
        });
      }
    });
  }

  // 3. Contracts
  if (['ADMIN', 'CONTRACT_MANAGER', 'PROCUREMENT_OFFICER', 'COMPLIANCE_AUDITOR', 'OPERATIONS_COMMANDER', 'EXTERNAL_AUDITOR'].includes(userRole)) {
    const contracts = await SupplyContract.find({}).populate('supplierId').limit(20);
    contracts.forEach((ctr) => {
      if (
        queryLower.includes(ctr.contractNumber.toLowerCase()) ||
        queryLower.includes(ctr.title.toLowerCase()) ||
        queryLower.includes('contract') ||
        queryLower.includes('expir') ||
        queryLower.includes('value') ||
        queryLower.includes('penalty')
      ) {
        const endDateStr = ctr.endDate ? new Date(ctr.endDate).toLocaleDateString() : 'N/A';
        retrievedDocs.push({
          type: 'Supply Contract',
          id: ctr.contractNumber,
          content: `Contract [${ctr.contractNumber}] "${ctr.title}" | Value: $${ctr.contractValue.toLocaleString()} | Status: ${ctr.status} | End Date: ${endDateStr} | Supplier: ${ctr.supplierId?.companyName || 'N/A'}`,
        });
        evidenceSources.push({
          type: 'SupplyContract',
          id: ctr._id,
          reference: `${ctr.contractNumber}: ${ctr.title}`,
        });
      }
    });
  }

  // 4. Shipments & Logistics
  if (['ADMIN', 'SUPPLY_CHAIN_ANALYST', 'OPERATIONS_COMMANDER', 'RISK_SPECIALIST', 'EXTERNAL_AUDITOR'].includes(userRole)) {
    const shipments = await Shipment.find({}).limit(20);
    shipments.forEach((shp) => {
      if (
        queryLower.includes(shp.shipmentId.toLowerCase()) ||
        queryLower.includes(shp.trackingNumber.toLowerCase()) ||
        queryLower.includes('shipment') ||
        queryLower.includes('transit') ||
        queryLower.includes('delay') ||
        queryLower.includes('delivery')
      ) {
        retrievedDocs.push({
          type: 'Shipment Tracking',
          id: shp.shipmentId,
          content: `Shipment [${shp.shipmentId}] Item: ${shp.item} | Status: ${shp.status} | Expected Delivery: ${new Date(shp.expectedDeliveryDate).toLocaleDateString()} | Location: ${shp.currentLocation} | Tracking #: ${shp.trackingNumber}`,
        });
        evidenceSources.push({
          type: 'Shipment',
          id: shp._id,
          reference: `${shp.shipmentId}: ${shp.item}`,
        });
      }
    });
  }

  // 5. Risk Assessments
  if (['ADMIN', 'RISK_SPECIALIST', 'OPERATIONS_COMMANDER', 'COMPLIANCE_AUDITOR', 'EXTERNAL_AUDITOR'].includes(userRole)) {
    const risks = await RiskAssessment.find({}).limit(20);
    risks.forEach((rsk) => {
      if (
        queryLower.includes(rsk.riskId.toLowerCase()) ||
        queryLower.includes('risk') ||
        queryLower.includes('critical') ||
        queryLower.includes('high') ||
        queryLower.includes('mitigat')
      ) {
        retrievedDocs.push({
          type: 'Risk Assessment',
          id: rsk.riskId,
          content: `Risk Record [${rsk.riskId}] Severity: ${rsk.overallRisk} | Status: ${rsk.status} | Entity Type: ${rsk.relatedEntityType} | Factors: ${(rsk.riskFactors || []).join(', ')}`,
        });
        evidenceSources.push({
          type: 'RiskAssessment',
          id: rsk._id,
          reference: `${rsk.riskId}: Severity ${rsk.overallRisk}`,
        });
      }
    });
  }

  // 6. Vector Similarity Search over indexed documents
  try {
    const queryEmbedding = await generateEmbedding(query);
    const vectorDocs = await VectorEmbedding.find({}).limit(50);
    
    const scoredDocs = vectorDocs
      .map((doc) => {
        const score = cosineSimilarity(queryEmbedding, doc.embedding || []);
        return { doc, score };
      })
      .filter((item) => item.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    scoredDocs.forEach(({ doc }) => {
      retrievedDocs.push({
        type: `Indexed Vector Doc (${doc.entityType})`,
        id: doc.metadata?.sourceRef || doc._id.toString(),
        content: doc.chunkContent,
      });
    });
  } catch (err) {
    console.warn('Vector retrieval step skipped:', err.message);
  }

  // Remove duplicate evidence sources
  const uniqueSourcesMap = new Map();
  evidenceSources.forEach((item) => uniqueSourcesMap.set(item.reference, item));
  const uniqueSources = Array.from(uniqueSourcesMap.values()).slice(0, 6);

  return {
    contextText: retrievedDocs.map((d) => `[${d.type} - ${d.id}] ${d.content}`).join('\n'),
    evidenceSources: uniqueSources,
  };
};

module.exports = { retrieveRelevantContext };
