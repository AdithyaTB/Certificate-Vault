const mongoose = require('mongoose');

// ── AuditLog ──────────────────────────────────────────────────────────────────
// Records every significant admin action for compliance and audit trail.
const auditLogSchema = new mongoose.Schema(
    {
        action: { type: String, required: true }, // e.g. 'DELETE_USER', 'BAN_USER', 'TOGGLE_FLAG'
        targetType: { type: String, default: '' },    // e.g. 'User', 'Certificate', 'Config'
        targetId: { type: String, default: '' },    // ID of affected doc
        targetName: { type: String, default: '' },    // Human-readable label
        adminEmail: { type: String, required: true },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // extra context
        ip: { type: String, default: '' },
    },
    { timestamps: true }
);

// ── Index for fast pagination queries ──────────────────────────────────────────
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
