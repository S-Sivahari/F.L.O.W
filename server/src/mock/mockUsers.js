import { ROLES } from '../shared/constants/roles.js';

export const mockUsers = [
  { id: 'u-admin-1', name: 'Avery Chen', email: 'avery@flow.io', role: ROLES.ADMIN, avatarInitials: 'AC' },
  { id: 'u-mgr-1', name: 'Priya Raman', email: 'priya@flow.io', role: ROLES.MANAGER, avatarInitials: 'PR' },
  { id: 'u-mgr-2', name: 'Marco Silva', email: 'marco@flow.io', role: ROLES.MANAGER, avatarInitials: 'MS' },
  { id: 'u-eng-1', name: 'Hiro Tanaka', email: 'hiro@flow.io', role: ROLES.ENGINEER, avatarInitials: 'HT' },
  { id: 'u-eng-2', name: 'Sara Kowalski', email: 'sara@flow.io', role: ROLES.ENGINEER, avatarInitials: 'SK' },
  { id: 'u-eng-3', name: 'Diego Alvarez', email: 'diego@flow.io', role: ROLES.ENGINEER, avatarInitials: 'DA' },
  { id: 'u-eng-4', name: 'Lina Park', email: 'lina@flow.io', role: ROLES.ENGINEER, avatarInitials: 'LP' },
  { id: 'u-eng-5', name: 'Omar Haddad', email: 'omar@flow.io', role: ROLES.ENGINEER, avatarInitials: 'OH' },
];

export const MAX_BLOCKS_PER_ENGINEER = 3;
