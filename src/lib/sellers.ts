// Shared demo seller nomenclature: every order, sale and payment is credited to one influencer or wholesale merchant.
export const SELLERS = [
  { id: 'Виктория Григорова', type: 'Инфлуенсър' },
  { id: 'Елена Петрова', type: 'Инфлуенсър' },
  { id: 'Мария Иванова', type: 'Инфлуенсър' },
  { id: 'Козметик Груп ООД', type: 'Търговец на едро' },
] as const;

export const sellerType = (id: string) => SELLERS.find(s => s.id === id)?.type ?? '';
