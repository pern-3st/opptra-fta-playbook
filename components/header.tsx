'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { resyncAction } from '@/app/actions';

function ago(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  return `${Math.round(m / 60)} h ago`;
}

export function Header({ syncedAt }: { syncedAt: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="bg-navy text-white px-10 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-heading font-light text-lg">FTA Playbook</span>
        <span className="text-xs uppercase tracking-widest text-white/45">Opptra Internal</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/60">Synced {ago(syncedAt)}</span>
        <Button
          disabled={pending}
          onClick={() => start(async () => {
            await resyncAction();
            router.refresh();
          })}
          className="bg-white/10 hover:bg-white/20"
        >
          {pending ? 'Resyncing…' : 'Resync now'}
        </Button>
      </div>
    </header>
  );
}
