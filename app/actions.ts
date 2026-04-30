'use server';
import { revalidateTag } from 'next/cache';
import { PLAYBOOK_TAG } from '@/lib/data';

// Server Action: same-origin enforced by Next, so this is no longer
// callable from external clients the way the old POST route was.
export async function resyncAction() {
  revalidateTag(PLAYBOOK_TAG, 'max');
  return { ok: true, revalidatedAt: new Date().toISOString() };
}
