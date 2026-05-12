import { ROLES } from '../constants/roles.js';

const PERMISSIONS = {
  'view:dashboard': [ROLES.ADMIN, ROLES.MANAGER, ROLES.ENGINEER],
  'view:blocks': [ROLES.ADMIN, ROLES.MANAGER],
  'view:effort': [ROLES.ADMIN, ROLES.MANAGER, ROLES.ENGINEER],
  'view:workflow': [ROLES.ADMIN, ROLES.MANAGER, ROLES.ENGINEER],
  'create:block': [ROLES.ADMIN, ROLES.MANAGER],
  'delete:block': [ROLES.ADMIN, ROLES.MANAGER],
  'edit:block': [ROLES.ADMIN, ROLES.MANAGER],
  'override:effort': [ROLES.ADMIN, ROLES.MANAGER],
  'advance:stage': [ROLES.ENGINEER],
  'log:hours': [ROLES.ADMIN, ROLES.MANAGER, ROLES.ENGINEER],
};

export function canAccess(role, action) {
  if (!role) return false;
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  return allowed.includes(role);
}
