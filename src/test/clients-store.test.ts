import { describe, expect, it } from 'vitest';

import {
  addrText, clientName, createClient, deleteClient, getClients, primaryOf,
  setClientBlacklist, updateClient, type ClientInput,
} from '@/lib/clients-store';

const input: ClientInput = {
  kind: 'company', first: '', last: '', company: 'Арома Трейд ЕООД', eik: '206112233', vat: '', mol: '',
  email: '', iban: '', phone: '0899000111', notes: '',
  addresses: [{ id: 1, city: 'София', kind: 'street', street: 'Цар Симеон', number: '5', place: '' }],
  primary: 1,
};

describe('clients store', () => {
  it('adds a client on the shared store with the next id and an active status', () => {
    const before = getClients().length;
    const created = createClient(input);
    expect(getClients()).toHaveLength(before + 1);
    expect(created.id).toBe(12);
    expect(clientName(created)).toBe('Арома Трейд ЕООД');
    expect(created.blacklisted).toBe(false);
    expect(created.createdBy).toBe('Венелин Тодоров');
    expect(created.editedBy).toBe('');
    expect(getClients().at(-1)?.phone).toBe('0899000111');
  });

  it('keeps the caller address list untouched when a client is added', () => {
    const created = createClient(input);
    created.addresses[0]!.street = 'Променена';
    expect(input.addresses[0]!.street).toBe('Цар Симеон');
  });

  it('marks a client in the black list and credits the edit', () => {
    const target = getClients().find(c => c.phone === '0891234567')!;
    expect(target.blacklisted).toBe(false);
    setClientBlacklist(target.id, true);
    const after = getClients().find(c => c.id === target.id)!;
    expect(after.blacklisted).toBe(true);
    expect(after.editedBy).toBe('Венелин Тодоров');
    setClientBlacklist(target.id, false);
    expect(getClients().find(c => c.id === target.id)!.blacklisted).toBe(false);
  });

  it('saves an edit without changing the client id or the list size', () => {
    const before = getClients().length;
    const target = getClients().find(c => c.phone === '0891234567')!;
    updateClient(target.id, { ...target, notes: 'Нов адрес по желание' });
    const after = getClients().find(c => c.id === target.id)!;
    expect(getClients()).toHaveLength(before);
    expect(after.notes).toBe('Нов адрес по желание');
    expect(after.editedBy).toBe('Венелин Тодоров');
  });

  it('removes only the chosen client', () => {
    const before = getClients().length;
    const created = getClients().at(-1)!;
    deleteClient(created.id);
    expect(getClients()).toHaveLength(before - 1);
    expect(getClients().some(c => c.id === created.id)).toBe(false);
  });

  it('reads the primary address as street and number text', () => {
    const client = getClients().find(c => c.phone === '0895055199')!;
    expect(clientName(client)).toBe('Иван Иванов');
    expect(addrText(primaryOf(client))).toBe('ул. Ангел Кънчев 10');
  });
});
