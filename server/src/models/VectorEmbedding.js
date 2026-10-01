const mongoose = require('mongoose');

const vectorEmbeddingSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    chunkIndex: {
      type: Number,
      default: 0,
    },
    chunkContent: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      title: String,
      category: String,
      roleAccessList: [String],
      sourceRef: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VectorEmbedding', vectorEmbeddingSchema);
