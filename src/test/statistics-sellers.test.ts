import { describe, expect, it } from 'vitest';
import { pickSellers } from '@/routes/statistics';

// The seller dropdown in Статистика covers both roles on its own, so a separate
// "type" filter is not allowed to narrow it again.
describe('seller list in Статистика', () => {
  it('lists every influencer and wholesale trader when nobody is chosen', () => {
    expect(pickSellers('').map(s => s.id)).toEqual([
      'Виктория Григорова',
      'Елена Петрова',
      'Мария Иванова',
      'Козметик Груп ООД',
    ]);
  });

  it('narrows to the chosen seller only', () => {
    expect(pickSellers('Елена Петрова').map(s => s.id)).toEqual(['Елена Петрова']);
  });
});
