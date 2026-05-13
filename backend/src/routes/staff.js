const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { prisma } = require('../config/db');
const { requireMinRole, assertRankAbove, rankOf, RANK } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/email');

const SELECT_USER = {
  id: true, email: true, name: true, phone: true, role: true, status: true,
  createdAt: true, createdById: true,
  createdBy: { select: { id: true, name: true, role: true } },
  staffProfile: { select: { position: true, baseSalary: true, hiredAt: true } },
};

// ── List visible users ────────────────────────────────────────────────────
// USER role can't access. Others see only people strictly below their rank, plus customers.
router.get('/users', ...requireMinRole('DEVELOPER'), async (req, res, next) => {
  try {
    const myRank = rankOf(req.user.role);
    const visibleRoles = Object.entries(RANK)
      .filter(([_, r]) => r < myRank)
      .map(([role]) => role);
    const where = { role: { in: visibleRoles } };
    if (req.query.role && visibleRoles.includes(req.query.role)) {
      where.role = req.query.role;
    }
    if (req.query.status) where.status = req.query.status;
    const users = await prisma.user.findMany({
      where,
      select: SELECT_USER,
      orderBy: [{ role: 'desc' }, { createdAt: 'desc' }],
    });
    res.json({ data: users });
  } catch (err) { next(err); }
});

router.get('/users/:id', ...requireMinRole('DEVELOPER'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id }, select: SELECT_USER });
    if (!user) return res.status(404).json({ error: 'Not found' });
    if (rankOf(user.role) >= rankOf(req.user.role)) {
      return res.status(403).json({ error: 'Cannot view equal or higher rank' });
    }
    res.json({ data: user });
  } catch (err) { next(err); }
});

// ── Create user ───────────────────────────────────────────────────────────
// Manager+ can create. The target role must be strictly below requester's rank.
router.post('/users', ...requireMinRole('MANAGER'), async (req, res, next) => {
  try {
    const { email, name, phone, role = 'USER', baseSalary, position } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'email and name required' });
    if (!RANK[role]) return res.status(400).json({ error: 'Invalid role' });
    if (rankOf(role) >= rankOf(req.user.role)) {
      return res.status(403).json({ error: 'Cannot create equal or higher rank' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    // Generate random temp password
    const tempPassword = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 10);
    const hash = await bcrypt.hash(tempPassword, 12);

    const data = {
      email, name, password: hash, role,
      status: 'ACTIVE', createdById: req.user.id,
    };
    if (phone) data.phone = phone;

    const user = await prisma.user.create({
      data,
      select: SELECT_USER,
    });

    // Attach staff profile for non-USER roles
    if (role !== 'USER') {
      await prisma.staffProfile.create({
        data: {
          userId: user.id,
          baseSalary: typeof baseSalary === 'number' ? baseSalary : 0,
          position: position || role,
        },
      });
    }

    // Send welcome email (mocks to log if SMTP not configured)
    try {
      const creator = await prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true } });
      await sendWelcomeEmail({
        to: email, name, email, tempPassword,
        createdByName: creator?.name, role, lang: 'hy',
      });
    } catch (err) {
      console.error('welcome email failed:', err.message);
    }

    res.status(201).json({ data: user, tempPassword });
  } catch (err) { next(err); }
});

// ── Update user (suspend/reactivate/delete/edit) ─────────────────────────
router.patch('/users/:id', ...requireMinRole('MANAGER'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await assertRankAbove(req.user.id, id);

    const { status, name, phone, baseSalary, position } = req.body;
    const data = {};
    if (status && ['ACTIVE', 'SUSPENDED', 'DELETED'].includes(status)) data.status = status;
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone || null;

    const user = await prisma.user.update({ where: { id }, data, select: SELECT_USER });

    if (typeof baseSalary === 'number' || position) {
      await prisma.staffProfile.upsert({
        where: { userId: id },
        create: { userId: id, baseSalary: baseSalary || 0, position: position || user.role },
        update: { ...(typeof baseSalary === 'number' ? { baseSalary } : {}), ...(position ? { position } : {}) },
      });
    }

    res.json({ data: user });
  } catch (err) { next(err); }
});

// Hard delete reserved for ADMIN
router.delete('/users/:id', ...requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await assertRankAbove(req.user.id, id);
    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Per-page permissions ──────────────────────────────────────────────────
// Manager+ can grant; granter must outrank target.
router.get('/users/:id/permissions', ...requireMinRole('DEVELOPER'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    // Developer can read only their own, others can read for managed users
    if (rankOf(req.user.role) < RANK.MANAGER && id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (id !== req.user.id) {
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
      if (target && rankOf(target.role) >= rankOf(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    const perms = await prisma.pagePermission.findMany({
      where: { userId: id },
      orderBy: { resource: 'asc' },
    });
    res.json({ data: perms });
  } catch (err) { next(err); }
});

router.put('/users/:id/permissions', ...requireMinRole('MANAGER'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await assertRankAbove(req.user.id, id);
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) return res.status(400).json({ error: 'permissions array required' });

    // Replace all permissions for this user
    await prisma.$transaction([
      prisma.pagePermission.deleteMany({ where: { userId: id } }),
      ...permissions.map((p) => prisma.pagePermission.create({
        data: {
          userId: id,
          resource: String(p.resource),
          canView: !!p.canView,
          canEdit: !!p.canEdit,
          canDelete: !!p.canDelete,
          grantedById: req.user.id,
        },
      })),
    ]);

    const fresh = await prisma.pagePermission.findMany({ where: { userId: id }, orderBy: { resource: 'asc' } });
    res.json({ data: fresh });
  } catch (err) { next(err); }
});

// ── KPI ───────────────────────────────────────────────────────────────────
async function fetchKpi(id) {
  const [profile, entries, target] = await Promise.all([
    prisma.staffProfile.findUnique({ where: { userId: id } }),
    prisma.kpiEntry.findMany({
      where: { userId: id },
      include: { issuedBy: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({ where: { id }, select: { id: true, name: true, role: true, email: true } }),
  ]);
  const fines = entries.filter((e) => e.type === 'FINE' && !e.voided).reduce((s, e) => s + e.amount, 0);
  const bonuses = entries.filter((e) => e.type === 'BONUS' && !e.voided).reduce((s, e) => s + e.amount, 0);
  const baseSalary = profile?.baseSalary || 0;
  return { user: target, profile, entries, summary: { baseSalary, fines, bonuses, net: baseSalary - fines + bonuses } };
}

router.get('/me/kpi', ...requireMinRole('DEVELOPER'), async (req, res, next) => {
  try { res.json({ data: await fetchKpi(req.user.id) }); }
  catch (err) { next(err); }
});

router.get('/users/:id/kpi', ...requireMinRole('DEVELOPER'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (id !== req.user.id) {
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
      if (!target || rankOf(target.role) >= rankOf(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    res.json({ data: await fetchKpi(id) });
  } catch (err) { next(err); }
});

router.post('/users/:id/kpi', ...requireMinRole('MANAGER'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await assertRankAbove(req.user.id, id);
    const { type, amount, reason } = req.body;
    if (!['FINE', 'BONUS'].includes(type)) return res.status(400).json({ error: 'type must be FINE or BONUS' });
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'amount must be positive' });
    if (!reason || reason.length < 2) return res.status(400).json({ error: 'reason required' });

    const entry = await prisma.kpiEntry.create({
      data: { userId: id, type, amount: Math.round(amount), reason, issuedById: req.user.id },
      include: { issuedBy: { select: { id: true, name: true, role: true } } },
    });
    res.status(201).json({ data: entry });
  } catch (err) { next(err); }
});

router.patch('/kpi/:entryId/void', ...requireMinRole('MANAGER'), async (req, res, next) => {
  try {
    const entryId = parseInt(req.params.entryId);
    const entry = await prisma.kpiEntry.findUnique({ where: { id: entryId } });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    // Issuer or higher-ranked person can void
    if (entry.issuedById !== req.user.id) {
      const issuer = await prisma.user.findUnique({ where: { id: entry.issuedById }, select: { role: true } });
      if (issuer && rankOf(req.user.role) <= rankOf(issuer.role)) {
        return res.status(403).json({ error: 'Cannot void entry from equal or higher rank' });
      }
    }
    const voided = await prisma.kpiEntry.update({
      where: { id: entryId },
      data: { voided: true, voidedAt: new Date() },
    });
    res.json({ data: voided });
  } catch (err) { next(err); }
});

module.exports = router;
