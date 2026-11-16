import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function InventoryScanner({ onScan, onClose }: { onScan: (code: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const callback = useRef(onScan);
  callback.current = onScan;
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let stop: (() => void) | undefined;
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Камерата не е достъпна. Въведете SKU ръчно.');
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        if (cancelled || !video.current) return;
        const controls = await new BrowserMultiFormatReader().decodeFromConstraints({ video: { facingMode: { ideal: 'environment' } }, audio: false }, video.current, (result, _error, controls) => {
          if (cancelled || !result) return;
          cancelled = true; controls.stop(); callback.current(result.getText());
        });
        stop = () => controls.stop();
        if (cancelled) controls.stop(); else setReady(true);
      } catch (error) {
        if (cancelled) return;
        const name = error instanceof Error ? error.name : '';
        setError(name === 'NotAllowedError' ? 'Разрешете достъп до камерата или въведете SKU ръчно.' : name === 'NotFoundError' ? 'Не е намерена камера. Въведете SKU ръчно.' : error instanceof Error ? error.message : 'Камерата не може да бъде отворена.');
      }
    }
    void start();
    return () => { cancelled = true; stop?.(); };
  }, []);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Сканиране на продукт</DialogTitle><DialogDescription>Баркод или QR код със SKU на продукта</DialogDescription></DialogHeader>
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : <><video ref={video} muted playsInline autoPlay aria-label="Камера за сканиране" className="aspect-[4/3] w-full rounded-md bg-muted object-cover"/><p role="status" className="text-sm text-muted-foreground">{ready ? 'Очаква се код…' : 'Отваряне на камерата…'}</p></>}
    <Button variant="outline" onClick={onClose}>Затвори</Button>
  </DialogContent></Dialog>;
}