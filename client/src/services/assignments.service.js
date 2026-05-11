import { apiRequest, toId, withAvatarInitials } from "./api.js";

const MAX_BLOCKS_PER_ENGINEER = 3;

function normalizeAssignment(assignment) {
  const engineer = withAvatarInitials(assignment.engineerId);
  return {
    ...assignment,
    id: toId(assignment),
    blockId: toId(assignment.blockId),
    engineerId: engineer?.id || toId(assignment.engineerId),
    engineer,
    engineerName: engineer?.name || "Engineer",
    engineerInitials: engineer?.avatarInitials || "EN",
  };
}

/** @api GET /api/assignments — List engineer-block assignments */
export async function getAssignments() {
  const assignments = await apiRequest("/api/assignments");
  return assignments.map(normalizeAssignment);
}

/** @api POST /api/assignments — Assign engineer to a block */
export async function assignEngineer(blockId, engineerId) {
  const assignment = await apiRequest("/api/assignments", {
    method: "POST",
    body: JSON.stringify({ blockId, engineerId }),
  });
  return normalizeAssignment(assignment);
}

/** @api DELETE /api/assignments/:id — Unassign an engineer from a block */
export async function unassign(blockId) {
  await apiRequest(`/api/assignments/${blockId}`, { method: "DELETE" });
  return true;
}

export async function getEngineerLoad(engineerId) {
  const response = await apiRequest(`/api/assignments/load/${engineerId}`);
  return response.load || 0;
}

export async function getEngineers() {
  const engineers = await apiRequest("/api/assignments/engineers/list");
  return engineers.map((engineer) =>
    withAvatarInitials({
      ...engineer,
      id: toId(engineer),
    }),
  );
}

export { MAX_BLOCKS_PER_ENGINEER };
