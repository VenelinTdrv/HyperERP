import { useSyncExternalStore } from 'react';

// Session-only client nomenclature: shared by the clients list and the dedicated add screen.
export const CLIENT_CITIES = ['София', 'Пловдив', 'Варна', 'Бургас', 'Ямбол', 'Стара Загора', 'Русе'];
export const CLIENT_EDITOR = 'Венелин Тодоров';

export type ClientAddress = { id: number; city: string; kind: 'street' | 'place'; street: string; number: string; place: string };
export type ClientKind = 'person' | 'company';
export type ClientInput = {
  kind: ClientKind; first: string; last: string; company: string; eik: string; vat: string; mol: string;
  email: string; iban: string; phone: string; notes: string; addresses: ClientAddress[]; primary: number;
};
export type Client = ClientInput & {
  id: number; blacklisted: boolean; createdBy: string; createdAt: string; editedBy: string; editedAt: string;
};

const person = { kind: 'person' as ClientKind, company: '', eik: '', vat: '', mol: '', email: '', iban: '' };

const initial: Client[] = [
  { id: 11, ...person, kind: 'company', first: '', last: '', company: 'Козметик Груп ООД', eik: '205987654', vat: 'BG205987654', mol: 'Ивана Петрова', email: 'office@kozmetikgroup.bg', iban: 'BG80BNBG96611020345678', phone: '029888777', blacklisted: false, notes: 'Фактура на фирмата, доставка до офиса', addresses: [{ id: 1, city: 'София', kind: 'street', street: 'България', number: '102', place: '' }], primary: 1, createdBy: 'Master Admin', createdAt: '14.10.2026, 10:20', editedBy: '', editedAt: '' },
  { id: 1, ...person, first: 'Мария', last: 'Георгиева', phone: '0891234567', blacklisted: false, notes: 'Предпочита доставка следобед', addresses: [{ id: 1, city: 'Ямбол', kind: 'street', street: 'Стара планина', number: '1А', place: '' }], primary: 1, createdBy: 'Master Admin', createdAt: '14.10.2026, 11:03', editedBy: '', editedAt: '' },
  { id: 2, ...person, first: 'Иван', last: 'Иванов', phone: '0895055199', blacklisted: false, notes: 'Спешно', addresses: [{ id: 1, city: 'Ямбол', kind: 'street', street: 'Ангел Кънчев', number: '10', place: '' }, { id: 2, city: 'София', kind: 'place', street: '', number: '', place: 'Бизнес парк, сграда 4' }], primary: 1, createdBy: 'Виктория Григорова', createdAt: '14.10.2026, 11:21', editedBy: '', editedAt: '' },
  { id: 3, ...person, first: 'Елена', last: 'Петрова', phone: '0887112233', blacklisted: false, notes: '', addresses: [{ id: 1, city: 'Пловдив', kind: 'street', street: 'Капитан Райчо', number: '56', place: '' }], primary: 1, createdBy: 'Master Admin', createdAt: '13.10.2026, 16:40', editedBy: 'Master Admin', editedAt: '14.10.2026, 09:12' },
  { id: 4, ...person, first: 'Георги', last: 'Димитров', phone: '0897654321', blacklisted: false, notes: 'Плаща по банков път', addresses: [{ id: 1, city: 'София', kind: 'street', street: 'Витоша', number: '15', place: '' }], primary: 1, createdBy: 'Виктория Григорова', createdAt: '13.10.2026, 10:15', editedBy: '', editedAt: '' },
  { id: 5, ...person, first: 'Николина', last: 'Стефанова', phone: '0888222333', blacklisted: false, notes: '', addresses: [{ id: 1, city: 'Варна', kind: 'street', street: 'Княз Борис I', number: '8', place: '' }], primary: 1, createdBy: 'Master Admin', createdAt: '12.10.2026, 14:05', editedBy: '', editedAt: '' },
  { id: 6, ...person, first: 'Петя', last: 'Колева', phone: '0879111222', blacklisted: false, notes: 'Доставка до офис', addresses: [{ id: 1, city: 'Пловдив', kind: 'place', street: '', number: '', place: 'Бизнес център, етаж 3' }], primary: 1, createdBy: 'Виктория Григорова', createdAt: '12.10.2026, 09:30', editedBy: '', editedAt: '' },
  { id: 7, ...person, first: 'Десислава', last: 'Радева', phone: '0895555666', blacklisted: false, notes: '', addresses: [{ id: 1, city: 'Бургас', kind: 'street', street: 'Александър Батенберг', number: '22', place: '' }], primary: 1, createdBy: 'Master Admin', createdAt: '11.10.2026, 17:45', editedBy: '', editedAt: '' },
  { id: 8, ...person, first: 'Христо', last: 'Янев', phone: '0888444555', blacklisted: true, notes: 'Предпочита наложен платеж', addresses: [{ id: 1, city: 'Ямбол', kind: 'street', street: 'Цар Иван Асень II', number: '7', place: '' }, { id: 2, city: 'София', kind: 'street', street: 'Пиротска', number: '40', place: '' }], primary: 1, createdBy: 'Венелин Тодоров', createdAt: '11.10.2026, 12:20', editedBy: 'Венелин Тодоров', editedAt: '13.10.2026, 08:40' },
  { id: 9, ...person, first: 'Саня', last: 'Тодорова', phone: '0877888999', blacklisted: false, notes: '', addresses: [{ id: 1, city: 'Стара Загора', kind: 'street', street: 'Г. С. Раковски', number: '33', place: '' }], primary: 1, createdBy: 'Виктория Григорова', createdAt: '10.10.2026, 15:10', editedBy: '', editedAt: '' },
  { id: 10, ...person, first: 'Мирослав', last: 'Киров', phone: '0896333444', blacklisted: false, notes: 'Променен адрес за празниците', addresses: [{ id: 1, city: 'Русе', kind: 'street', street: 'Цар Освободител', number: '4', place: '' }], primary: 1, createdBy: 'Master Admin', createdAt: '09.10.2026, 11:00', editedBy: '', editedAt: '' },
];

let clients = initial;
let notice = '';
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const useClients = () => useSyncExternalStore(subscribe, () => clients, () => clients);
export const useClientNotice = () => useSyncExternalStore(subscribe, () => notice, () => notice);
export const getClients = () => clients;
export const setClientNotice = (text: string) => { notice = text; emit(); };
export const clearClientNotice = () => setClientNotice('');

export const clientName = (c: Pick<Client, 'kind' | 'first' | 'last' | 'company'>) =>
  c.kind === 'company' ? c.company : `${c.first} ${c.last}`.trim();
export const addrText = (a?: ClientAddress) => !a ? '—' : a.kind === 'street' ? `ул. ${a.street} ${a.number}` : a.place;
export const primaryOf = (c: Client) => c.addresses.find(a => a.id === c.primary) ?? c.addresses[0];

const stamp = () => '14.10.2026, ' + new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });

export function createClient(data: ClientInput): Client {
  const client: Client = {
    ...data,
    addresses: data.addresses.map(a => ({ ...a })),
    id: clients.reduce((max, c) => Math.max(max, c.id), 0) + 1,
    blacklisted: false,
    createdBy: CLIENT_EDITOR,
    createdAt: stamp(),
    editedBy: '',
    editedAt: '',
  };
  clients = [...clients, client];
  emit();
  return client;
}

export function updateClient(id: number, data: ClientInput) {
  clients = clients.map(c => c.id === id ? { ...c, ...data, editedBy: CLIENT_EDITOR, editedAt: stamp() } : c);
  emit();
}

export function deleteClient(id: number) {
  clients = clients.filter(c => c.id !== id);
  emit();
}

export function setClientBlacklist(id: number, blacklisted: boolean) {
  const current = clients.find(c => c.id === id);
  if (!current || current.blacklisted === blacklisted) return;
  clients = clients.map(c => c.id === id ? { ...c, blacklisted, editedBy: CLIENT_EDITOR, editedAt: stamp() } : c);
  emit();
}
