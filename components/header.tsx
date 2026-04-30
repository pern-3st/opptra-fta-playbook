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
    <header className="bg-navy text-white">
      <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-heading font-light text-lg">FTA Playbook</span>
          <span className="text-xs uppercase tracking-widest text-white/45">Opptra Internal</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-white/60">Synced {ago(syncedAt)}</span>
          <Button
            variant="ghost-on-dark"
            size="sm"
            disabled={pending}
            onClick={() => start(async () => {
              await resyncAction();
              router.refresh();
            })}
          >
            {pending ? 'Resyncing…' : 'Resync now'}
          </Button>
        </div>
      </div>
    </header>
  );
}
