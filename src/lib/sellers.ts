// Shared demo seller nomenclature: every order, sale and payment is credited to one influencer or wholesale merchant.
export const SELLERS = [
  { id: 'Виктория Григорова', type: 'Инфлуенсър' },
  { id: 'Елена Петрова', type: 'Инфлуенсър' },
  { id: 'Мария Иванова', type: 'Инфлуенсър' },
  { id: 'Козметик Груп ООД', type: 'Търговец на едро' },
] as const;

export const sellerType = (id: string) => SELLERS.find(s => s.id === id)?.type ?? '';

// Demonstration assistants: each one works for exactly one influencer and sees that person's orders.
export const ASSISTANTS = [
  { id: 'Десислава Колева', worksFor: 'Виктория Григорова' },
  { id: 'Симона Тодорова', worksFor: 'Мария Иванова' },
] as const;

export const assistantWorksFor = (id: string) => ASSISTANTS.find(a => a.id === id)?.worksFor ?? '';

// Which seller each demo order and sale is credited to. The same map backs „Поръчки" and „Продажби",
// so both screens agree about who sold what.
export const sellerByOrder: Record<string, string> = {
  'ORD-0027': 'Виктория Григорова',
  'ORD-0026': 'Виктория Григорова',
  'ORD-0025': 'Виктория Григорова',
  'ORD-0024': 'Виктория Григорова',
  'ORD-0023': 'Елена Петрова',
  'ORD-0022': 'Козметик Груп ООД',
  'ORD-0021': 'Виктория Григорова',
  'ORD-0020': 'Мария Иванова',
  'ORD-0019': 'Елена Петрова',
  'ORD-0018': 'Виктория Григорова',
  'ORD-0017': 'Мария Иванова',
  'ORD-0016': 'Козметик Груп ООД',
  'ORD-0015': 'Елена Петрова',
};
