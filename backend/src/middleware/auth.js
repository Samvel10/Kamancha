const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

const RANK = { USER: 1, DEVELOPER: 2, MANAGER: 3, DIRECTOR: 4, ADMIN: 5 };

function rankOf(role) {
  return RANK[role] || 0;
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Require minimum role. Walks the rank ladder so DIRECTOR/ADMIN pass when minRole=MANAGER, etc.
function requireMinRole(minRole) {
  const minRank = rankOf(minRole);
  return [verifyToken, async (req, res, next) => {
    // Re-fetch from DB so a SUSPENDED/DELETED account can't keep operating with a fresh token
    try {
      const fresh = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true, status: true },
      });
      if (!fresh) return res.status(401).json({ error: 'User not found' });
      if (fresh.status !== 'ACTIVE') return res.status(403).json({ error: 'Account ' + fresh.status.toLowerCase() });
      if (rankOf(fresh.role) < minRank) return res.status(403).json({ error: 'Insufficient role' });
      req.user.role = fresh.role;
      next();
    } catch (err) { next(err); }
  }];
}

// Require requester to outrank the target user (strict >)
async function assertRankAbove(requesterId, targetUserId) {
  const [requester, target] = await Promise.all([
    prisma.user.findUnique({ where: { id: requesterId }, select: { role: true } }),
    prisma.user.findUnique({ where: { id: targetUserId }, select: { role: true } }),
  ]);
  if (!requester || !target) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  if (rankOf(requester.role) <= rankOf(target.role)) {
    const err = new Error('Cannot manage equal or higher rank');
    err.status = 403;
    throw err;
  }
  return { requester, target };
}

function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
}

module.exports = { verifyToken, verifyAdmin, requireMinRole, assertRankAbove, generateTokens, rankOf, RANK };
