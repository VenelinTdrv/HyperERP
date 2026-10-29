import { describe, expect, it } from 'vitest';
import { assistantAssignmentError, hasAssignedAssistants, USER_ROLES } from '@/lib/demo-users';

const users = [{ id: 1, role: 'Администратор' as const }, { id: 2, role: 'Инфлуенсър' as const }, { id: 3, role: 'Търговец на едро' as const }];
describe('Demo assistant assignments', () => {
  it('includes the assistant role', () => { expect(USER_ROLES).toContain('Асистент'); });
  it('requires an influencer for assistants', () => { expect(assistantAssignmentError('Асистент', undefined, users)).toBe('Изберете инфлуенсър'); });
  it('accepts an influencer assignment', () => { expect(assistantAssignmentError('Асистент', 2, users)).toBeUndefined(); });
  it('rejects other roles and missing users', () => {
    for (const id of [1, 3, 99]) expect(assistantAssignmentError('Асистент', id, users)).toBe('Изберете валиден инфлуенсър');
  });
  it('does not allow self assignment', () => { expect(assistantAssignmentError('Асистент', 2, users, 2)).toBe('Изберете валиден инфлуенсър'); });
  it('does not require assignment for other roles', () => { expect(assistantAssignmentError('Администратор', undefined, users)).toBeUndefined(); });
  it('protects influencers with assigned assistants', () => {
    const linked = [...users, { id: 4, role: 'Асистент' as const, influencerId: 2 }];
    expect(hasAssignedAssistants(2, linked)).toBe(true);
    expect(hasAssignedAssistants(1, linked)).toBe(false);
  });
});