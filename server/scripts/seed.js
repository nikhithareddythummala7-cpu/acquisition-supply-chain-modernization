const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../src/models/User');
const ProcurementRequirement = require('../src/models/ProcurementRequirement');
const Supplier = require('../src/models/Supplier');
const ContactPerson = require('../src/models/ContactPerson');
const BidSubmission = require('../src/models/BidSubmission');
const SupplyContract = require('../src/models/SupplyContract');
const Shipment = require('../src/models/Shipment');
const InspectionReport = require('../src/models/InspectionReport');
const RiskAssessment = require('../src/models/RiskAssessment');
const ComplianceRecord = require('../src/models/ComplianceRecord');
const AuditTrail = require('../src/models/AuditTrail');
const Notification = require('../src/models/Notification');
const DemandForecast = require('../src/models/DemandForecast');
const VectorEmbedding = require('../src/models/VectorEmbedding');
const { generateEmbedding } = require('../src/services/embeddingService');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/acquisition_system';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // 1. Check if Default Administrator already exists
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@acquisition.com').toLowerCase();
    const adminName = process.env.ADMIN_NAME || 'System Administrator';
    const adminPasswordRaw = process.env.ADMIN_PASSWORD || 'Admin@12345';

    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      // Create admin user only if it does not exist
      adminUser = await User.create({
        fullName: adminName,
        email: adminEmail,
        password: adminPasswordRaw, // User schema pre-save hook hashes password using bcrypt
        role: 'ADMIN',
        organization: 'Department of Acquisition & Logistics',
        isActive: true,
      });
      console.log(`[SEED] Administrator account created: ${adminEmail} (Role: ADMIN)`);
    } else {
      console.log(`[SEED] Administrator account already exists: ${adminEmail}. Skipping duplicate admin creation.`);
    }

    // 2. Check if operational demo dataset already exists
    const usersCount = await User.countDocuments();

    if (usersCount <= 1) {
      console.log('[SEED] Seeding demo multi-role users and operational dataset...');

      const salt = await bcrypt.genSalt(10);
      const defaultPassword = await bcrypt.hash('password123', salt);

      const userSeedData = [
        { fullName: 'Mark Thorne', email: 'procurement@defense.gov', role: 'PROCUREMENT_OFFICER' },
        { fullName: 'Elena Rostova', email: 'analyst@logistics.org', role: 'SUPPLY_CHAIN_ANALYST' },
        { fullName: 'David Vance', email: 'auditor@compliance.gov', role: 'COMPLIANCE_AUDITOR' },
        { fullName: 'Robert Sterling', email: 'vendor@apexdef.com', role: 'VENDOR', organization: 'Apex Defense Solutions Inc.' },
        { fullName: 'Claire Montgomery', email: 'contracts@defense.gov', role: 'CONTRACT_MANAGER' },
        { fullName: 'General James Vance', email: 'commander@ops.gov', role: 'OPERATIONS_COMMANDER' },
        { fullName: 'Dr. Anita Roy', email: 'risk@defense.gov', role: 'RISK_SPECIALIST' },
        { fullName: 'Marcus Brody', email: 'external@oversight.org', role: 'EXTERNAL_AUDITOR' },
        { fullName: 'Patricia Chen', email: 'officer2@defense.gov', role: 'PROCUREMENT_OFFICER' },
      ].map((u) => ({
        ...u,
        password: defaultPassword,
        phone: '+1 (555) 019-2831',
        organization: u.organization || 'Department of Acquisition & Logistics',
        isActive: true,
      }));

      const demoUsers = await User.insertMany(userSeedData);
      console.log(`[SEED] Seeded ${demoUsers.length} Multi-Role Demo Users.`);

      const officerUser = demoUsers.find((u) => u.role === 'PROCUREMENT_OFFICER');

      // 3. Seed Suppliers
      const supplierNames = [
        'Apex Defense Solutions Inc.', 'Aegis Tactical Systems', 'Titan Logistics & Cargo',
        'Vanguard Electronics Corp', 'Orion Aerospace Systems', 'CyberGuard Defense Systems',
        'Global Freight Dynamics', 'Matrix Heavy Industries', 'Sentinel Medical Supplies',
        'Nordic Armored Logistics', 'Pacific Rim Communications', 'Atlas Engineering Group',
        'Hyperion Fiber Optics', 'Bravo Tactical Gear', 'Quantum Sensor Technology'
      ];

      const supplierSeedData = supplierNames.map((name, idx) => ({
        supplierId: `SUP-2026-${String(idx + 1).padStart(3, '0')}`,
        companyName: name,
        contactPersonName: `Representative ${idx + 1}`,
        email: `contact@${name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        phone: `+1 (800) ${555 + idx}-9000`,
        address: {
          street: `${100 + idx * 12} Enterprise Way`,
          city: idx % 2 === 0 ? 'Arlington' : 'Huntsville',
          state: idx % 2 === 0 ? 'VA' : 'AL',
          country: 'USA',
          zip: '22202',
        },
        category: [idx % 3 === 0 ? 'Defense Equipment' : idx % 3 === 1 ? 'IT & Communications' : 'Logistics'],
        yearsInBusiness: 4 + idx,
        qualityScore: 75 + Math.floor(Math.random() * 23),
        deliveryScore: 70 + Math.floor(Math.random() * 28),
        complianceScore: 80 + Math.floor(Math.random() * 18),
        riskScore: Math.floor(Math.random() * 35),
        status: idx === 13 ? 'SUSPENDED' : 'ACTIVE',
      }));

      const suppliers = await Supplier.insertMany(supplierSeedData);
      console.log(`[SEED] Seeded ${suppliers.length} Suppliers.`);

      // 4. Seed Procurement Requirements
      const categories = ['Defense Equipment', 'IT & Communications', 'Logistics Services', 'Medical Supplies', 'Raw Materials'];
      const reqSeedData = Array.from({ length: 20 }).map((_, idx) => ({
        requestId: `PR-2026-${String(idx + 1).padStart(3, '0')}`,
        title: [
          'Tactical Satellite Communications Antenna System',
          'Heavy Transport Container Truck Fleet',
          'Field Hospital Medical Oxygen Concentrators',
          'Secure Encryption Key Storage Modules',
          'High-Grade Reinforced Steel Girders',
          'Unmanned Reconnaissance Drone Batteries',
          'Thermal Imaging Goggles & Sensors',
          'Logistics Warehouse Sorting Systems',
          'Hardened Mobile Command Laptops',
          'Emergency Tactical Rations (MRE Packs)',
          'Armored Vehicle Replacement Tracks',
          'High-Frequency Airborne Radio Sets',
          'Disaster Relief Water Filtration Units',
          'Solar Power Microgrid Generators',
          'Cyber Defense Threat Monitoring Servers',
          'Aviation Jet Fuel Supply Batch Alpha',
          'Field Decontamination Spray Kits',
          'Fiber Optic Submarine Cable Spools',
          'Heavy Duty All-Terrain Crane',
          'Protective Kevlar Armor Vests'
        ][idx],
        description: `Comprehensive requisition for acquisition of high-specification equipment for logistics deployment. Technical requirements must conform to strict standards.`,
        category: categories[idx % categories.length],
        quantity: 50 + idx * 25,
        unitOfMeasure: 'Units',
        estimatedBudget: 150000 + idx * 75000,
        requiredDate: new Date(Date.now() + (30 + idx * 5) * 24 * 60 * 60 * 1000),
        priority: idx % 4 === 0 ? 'CRITICAL' : idx % 4 === 1 ? 'HIGH' : 'MEDIUM',
        department: 'Logistics & Supply Division',
        status: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'BIDDING', 'CONTRACTING', 'COMPLETED'][idx % 7],
        createdBy: officerUser._id,
        assignedOfficer: officerUser._id,
      }));

      const requirements = await ProcurementRequirement.insertMany(reqSeedData);
      console.log(`[SEED] Seeded ${requirements.length} Procurement Requirements.`);

      // 5. Seed Bids
      const bidSeedData = Array.from({ length: 30 }).map((_, idx) => {
        const reqItem = requirements[idx % requirements.length];
        const supItem = suppliers[idx % suppliers.length];
        return {
          bidId: `BID-2026-${String(idx + 1).padStart(3, '0')}`,
          procurementRequestId: reqItem._id,
          supplierId: supItem._id,
          quotedPrice: Math.round(reqItem.estimatedBudget * (0.85 + Math.random() * 0.25)),
          deliveryTimeDays: 15 + (idx % 5) * 10,
          validityPeriodDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          technicalProposal: `Technical proposal submitted by ${supItem.companyName} guaranteeing ISO 9001 compliance and complete milestone delivery warranty.`,
          paymentTerms: 'Milestone Payments - Net 30',
          status: ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'][idx % 5],
        };
      });

      const bids = await BidSubmission.insertMany(bidSeedData);
      console.log(`[SEED] Seeded ${bids.length} Bids.`);

      // 6. Seed Supply Contracts
      const contractSeedData = Array.from({ length: 10 }).map((_, idx) => ({
        contractNumber: `CTR-2026-${String(idx + 1).padStart(3, '0')}`,
        procurementRequestId: requirements[idx]._id,
        supplierId: suppliers[idx]._id,
        title: `Supply Agreement for ${requirements[idx].title}`,
        description: 'Formal binding contract covering specifications, warranty, delivery schedule, and penalty terms.',
        contractValue: requirements[idx].estimatedBudget,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + (15 + idx * 20) * 24 * 60 * 60 * 1000),
        status: idx === 1 ? 'EXPIRED' : 'ACTIVE',
        createdBy: adminUser._id,
      }));

      const contracts = await SupplyContract.insertMany(contractSeedData);
      console.log(`[SEED] Seeded ${contracts.length} Supply Contracts.`);

      // 7. Seed Shipments
      const shipmentSeedData = Array.from({ length: 20 }).map((_, idx) => ({
        shipmentId: `SHP-2026-${String(idx + 1).padStart(3, '0')}`,
        contractId: contracts[idx % contracts.length]._id,
        supplierId: suppliers[idx % suppliers.length]._id,
        item: requirements[idx % requirements.length].title,
        quantity: 100 + idx * 10,
        shippedQuantity: 100 + idx * 10,
        expectedDeliveryDate: new Date(Date.now() + (idx - 5) * 24 * 60 * 60 * 1000),
        currentLocation: idx % 3 === 0 ? 'Port of Entry Customs' : 'Central Warehouse Hub Alpha',
        carrierName: 'Global Cargo Express',
        trackingNumber: `TRK-8899-${1000 + idx}`,
        status: idx % 5 === 0 ? 'DELAYED' : idx % 5 === 1 ? 'DELIVERED' : 'IN_TRANSIT',
        inspectionStatus: idx % 2 === 0 ? 'PASSED' : 'PENDING',
      }));

      const shipments = await Shipment.insertMany(shipmentSeedData);
      console.log(`[SEED] Seeded ${shipments.length} Shipments.`);

      // 8. Seed Inspection Reports
      const inspectionSeedData = Array.from({ length: 15 }).map((_, idx) => ({
        inspectionId: `INS-2026-${String(idx + 1).padStart(3, '0')}`,
        shipmentId: shipments[idx]._id,
        inspector: adminUser._id,
        inspectionDate: new Date(),
        receivedQuantity: 100,
        acceptedQuantity: idx % 4 === 0 ? 80 : 100,
        rejectedQuantity: idx % 4 === 0 ? 20 : 0,
        qualityStatus: idx % 4 === 0 ? 'FAILED' : 'PASSED',
        defects: idx % 4 === 0 ? ['Minor surface corrosion', 'Package seal broken'] : [],
        notes: 'Physical verification performed against technical specification checklist.',
      }));

      await InspectionReport.insertMany(inspectionSeedData);
      console.log(`[SEED] Seeded 15 Inspection Reports.`);

      // 9. Seed Risk Assessments
      const riskSeedData = Array.from({ length: 20 }).map((_, idx) => ({
        riskId: `RSK-2026-${String(idx + 1).padStart(3, '0')}`,
        relatedEntityType: idx % 2 === 0 ? 'Supplier' : 'ProcurementRequirement',
        relatedEntityId: idx % 2 === 0 ? suppliers[idx % suppliers.length]._id : requirements[idx % requirements.length]._id,
        supplierRisk: 10 + idx * 4,
        deliveryRisk: 15 + idx * 3,
        qualityRisk: 10 + idx * 2,
        complianceRisk: 5 + idx * 2,
        financialRisk: 10 + idx * 3,
        operationalRisk: 15 + idx * 4,
        overallRisk: idx % 4 === 0 ? 'CRITICAL' : idx % 4 === 1 ? 'HIGH' : idx % 4 === 2 ? 'MEDIUM' : 'LOW',
        riskFactors: ['Geopolitical transit corridor bottleneck', 'Single-source raw component vulnerability'],
        mitigationActions: ['Identify contingent regional supplier', 'Increase safety stock threshold'],
        status: 'IDENTIFIED',
        createdBy: adminUser._id,
      }));

      await RiskAssessment.insertMany(riskSeedData);
      console.log(`[SEED] Seeded 20 Risk Assessments.`);

      // 10. Seed Vector Embeddings for RAG Search
      const vectorData = [];
      for (let i = 0; i < requirements.length; i++) {
        const req = requirements[i];
        const text = `Procurement Request [${req.requestId}] "${req.title}". Category: ${req.category}. Budget: $${req.estimatedBudget}. Description: ${req.description}`;
        const emb = await generateEmbedding(text);
        vectorData.push({
          entityType: 'ProcurementRequirement',
          entityId: req._id,
          chunkIndex: 0,
          chunkContent: text,
          embedding: emb,
          metadata: { title: req.title, category: req.category, sourceRef: req.requestId },
        });
      }

      await VectorEmbedding.insertMany(vectorData);
      console.log(`[SEED] Indexed ${vectorData.length} RAG Vector Embeddings.`);
    } else {
      console.log('[SEED] Operational database records already initialized.');
    }

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
