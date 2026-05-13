const { prisma } = require('../config/db');
const { requireMinRole, rankOf } = require('./auth');

// Check page permission for DEVELOPER. MANAGER+ always allowed.
function canAccessResource(action) {
  return async (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: 'Unauthorized' });
    if (rankOf(role) >= rankOf('MANAGER')) return next();
    if (role !== 'DEVELOPER') return res.status(403).json({ error: 'Forbidden' });

    const resource = req.permResource;
    if (!resource) return next();

    const perm = await prisma.pagePermission.findUnique({
      where: { userId_resource: { userId: req.user.id, resource } },
    });
    if (!perm) return res.status(403).json({ error: `No permission for ${resource}` });
    if (action === 'view'   && !perm.canView)   return res.status(403).json({ error: 'View not allowed' });
    if (action === 'edit'   && !perm.canEdit)   return res.status(403).json({ error: 'Edit not allowed' });
    if (action === 'delete' && !perm.canDelete) return res.status(403).json({ error: 'Delete not allowed' });
    next();
  };
}

function withResource(resource) {
  return (req, _res, next) => { req.permResource = resource; next(); };
}

// Stack helper: minimum DEVELOPER + resource permission check
function requireResource(resource, action = 'view') {
  return [...requireMinRole('DEVELOPER'), withResource(resource), canAccessResource(action)];
}

module.exports = { canAccessResource, withResource, requireResource };
