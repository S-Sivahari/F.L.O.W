export const mockApprovals = [
  { id: 'ap-1', blockId: 'b-10', engineerId: 'u-eng-3', submittedAt: new Date(Date.now() - 86400000).toISOString(), status: 'Pending', comment: null, reviewedBy: null, reviewedAt: null },
  { id: 'ap-2', blockId: 'b-11', engineerId: 'u-eng-4', submittedAt: new Date(Date.now() - 43200000).toISOString(), status: 'Pending', comment: null, reviewedBy: null, reviewedAt: null },
  { id: 'ap-3', blockId: 'b-12', engineerId: 'u-eng-1', submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'Approved', comment: null, reviewedBy: 'u-mgr-1', reviewedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 'ap-4', blockId: 'b-5', engineerId: 'u-eng-3', submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'Rejected', comment: 'DRC violations near M3 spacing — please rerun and update.', reviewedBy: 'u-mgr-2', reviewedAt: new Date(Date.now() - 86400000).toISOString() },
];
