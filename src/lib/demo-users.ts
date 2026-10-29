// Demonstration associations only; never use these values for access control.
export const USER_ROLES = ['Администратор', 'Инфлуенсър', 'Търговец на едро', 'Асистент'] as const;
export type UserRole = typeof USER_ROLES[number];
type AssignmentUser = { id: number; role: UserRole; influencerId?: number | undefined };

export function assistantAssignmentError(role: UserRole | '', influencerId: number | undefined, users: AssignmentUser[], editingId?: number): string | undefined {
  if (role !== 'Асистент') return undefined;
  if (!influencerId) return 'Изберете инфлуенсър';
  if (!users.some(user => user.id === influencerId && user.id !== editingId && user.role === 'Инфлуенсър')) return 'Изберете валиден инфлуенсър';
  return undefined;
}

export function hasAssignedAssistants(id: number, users: AssignmentUser[]): boolean {
  return users.some(user => user.role === 'Асистент' && user.influencerId === id);
}