import { ROLES } from '../constants/roles.js';

const PERMISSIONS = {
  'view:dashboard': [ROLES.ADMIN, ROLES.MANAGER, ROLES.ENGINEER],
  'view:blocks': [ROLES.ADMIN, ROLES.MANAGER],
  'view:effort': [ROLES.ADMIN, ROLES.MANAGER],
  'view:assignments': [ROLES.MANAGER, ROLES.ADMIN],
  'view:workflow': [ROLES.ADMIN, ROLES.MANAGER, ROLES.ENGINEER],
  'view:approvals': [ROLES.MANAGER, ROLES.ENGINEER, ROLES.ADMIN],
  'create:block': [ROLES.ADMIN, ROLES.MANAGER],
  'delete:block': [ROLES.ADMIN],
  'edit:block': [ROLES.ADMIN, ROLES.MANAGER],
  'assign:engineer': [ROLES.MANAGER, ROLES.ADMIN],
  'override:effort': [ROLES.MANAGER, ROLES.ADMIN],
  'approve:block': [ROLES.MANAGER, ROLES.ADMIN],
  'advance:stage': [ROLES.ADMIN, ROLES.MANAGER, ROLES.ENGINEER],
};

export function canAccess(role, action) {
  if (!role) return false;
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  return allowed.includes(role);
}
