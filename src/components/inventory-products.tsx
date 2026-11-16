import { useState } from 'react';
import { Plus, Check, Search, ScanLine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InventoryScanner } from '@/components/inventory-scanner';
import { findInventoryProducts, inventoryProductByCode, inventoryLines, type InventoryLine } from '@/lib/inventory-store';

export function InventoryProducts({ warehouse, skus, onSkus, counts, onCounts }: { warehouse: string; skus: string[]; onSkus: (skus: string[]) => void; counts: Record<string, string>; onCounts: (counts: Record<string, string>) => void }) {
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const matches = findInventoryProducts(warehouse, query);
  const add = (line: InventoryLine) => {
    onSkus(skus.includes(line.sku) ? skus : [...skus, line.sku]);
    setNotice(skus.includes(line.sku) ? `${line.name} вече е добавен.` : `${line.name} е добавен.`);
    setQuery(''); setError('');
  };
  const scan = (code: string) => {
    setScanning(false);
    const line = inventoryProductByCode(warehouse, code);
    if (line) add(line);
    else { setQuery(code); setError('Няма продукт с този SKU. Изберете продукт по име или въведете валиден SKU.'); }
  };
  return <>
    <label htmlFor="inventory-product" className="mb-2 block text-xs">Добави продукт</label>
    <div className="flex items-center gap-2"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input id="inventory-product" className="pl-9" placeholder="Име или SKU" value={query} onChange={event => { setQuery(event.target.value); setError(''); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); const exact = inventoryProductByCode(warehouse, query); const single = matches.length === 1 ? matches[0] : undefined; if (exact) add(exact); else if (query.trim() && single) add(single); else if (!matches.length) scan(query); } }}/></div><Button type="button" variant="outline" size="icon" aria-label="Сканирай продукт" title="Сканирай продукт" onClick={() => setScanning(true)}><ScanLine/></Button></div>
    {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    {query.trim() && <ul aria-label="Намерени продукти" className="mt-2 max-h-64 overflow-y-auto divide-y divide-border border-y border-border">{matches.map(line => <li key={line.sku} className="flex items-center gap-2 py-2"><div className="min-w-0 flex-1"><p className="break-words text-sm">{line.name}</p><p className="break-all text-xs text-muted-foreground">{line.sku} · Нал. {line.expected}</p></div><Button type="button" size="icon" variant="outline" disabled={skus.includes(line.sku)} aria-label={`Добави ${line.name}`} title={`Добави ${line.name}`} onClick={() => add(line)}>{skus.includes(line.sku) ? <Check/> : <Plus/>}</Button></li>)}{!matches.length && <li className="py-3 text-sm text-muted-foreground">Няма намерени продукти.</li>}</ul>}
    {notice && <p role="status" className="mt-2 text-xs text-primary">{notice}</p>}
    <div className="mt-4 border-t border-border"><div className="grid grid-cols-[minmax(0,1fr)_40px_70px_28px] items-center gap-2 py-3 text-xs text-muted-foreground"><span>Продукт / SKU</span><span>Нал.</span><span>Преброено</span><span/></div>{inventoryLines(warehouse).filter(line => skus.includes(line.sku)).map(line => <div key={line.sku} className="grid grid-cols-[minmax(0,1fr)_40px_70px_28px] items-center gap-2 border-t border-border py-3"><div className="min-w-0"><strong className="block break-words text-sm">{line.name}</strong><span className="block break-all text-xs text-muted-foreground">{line.sku}</span></div><span className="text-sm tabular-nums">{line.expected}</span><Input type="number" min={0} step={1} inputMode="numeric" aria-label={`Преброено ${line.name}`} value={counts[line.sku] ?? ''} placeholder="—" onChange={event => onCounts({ ...counts, [line.sku]: event.target.value })}/><Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`Премахни ${line.name}`} title={`Премахни ${line.name}`} onClick={() => { onSkus(skus.filter(sku => sku !== line.sku)); const next = { ...counts }; delete next[line.sku]; onCounts(next); setNotice(''); }}><X/></Button></div>)}{!skus.length && <p className="border-t border-border py-4 text-sm text-muted-foreground">Няма добавени продукти.</p>}</div>
    {scanning && <InventoryScanner onScan={scan} onClose={() => setScanning(false)}/>}
  </>;
}