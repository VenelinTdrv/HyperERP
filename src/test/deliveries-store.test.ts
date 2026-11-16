import { describe, expect, it } from 'vitest';
import { getDeliveries, processDelivery, deliveryTransitions, deliveryToday } from '@/lib/deliveries-store';

describe('Shared demonstration deliveries', () => {
  it('includes all deliveries in each supported status', () => {
    expect(getDeliveries()).toHaveLength(10);
    expect(new Set(getDeliveries().map(row => row.status))).toEqual(new Set(['Очаквана', 'В транзит', 'Получена', 'Отказана']));
  });
  it('processes an expected delivery through transit and receipt in the shared list', () => {
    processDelivery('DEL-0017', 'В транзит');
    expect(getDeliveries().find(row => row.id === 'DEL-0017')?.status).toBe('В транзит');
    processDelivery('DEL-0017', 'Получена');
    expect(getDeliveries().find(row => row.id === 'DEL-0017')).toMatchObject({ status: 'Получена', received: deliveryToday(), editedBy: 'Демо оператор' });
  });
  it('keeps received and cancelled deliveries closed', () => {
    expect(deliveryTransitions('Получена')).toEqual([]);
    expect(deliveryTransitions('Отказана')).toEqual([]);
    expect(() => processDelivery('DEL-0015', 'В транзит')).toThrow();
    expect(() => processDelivery('DEL-0013', 'Получена')).toThrow();
  });
  it('can cancel an open delivery without a receipt date', () => {
    processDelivery('DEL-0016', 'Отказана');
    expect(getDeliveries().find(row => row.id === 'DEL-0016')).toMatchObject({ status: 'Отказана', received: '' });
  });
});