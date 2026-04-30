import { getPlaybookData } from '@/lib/data';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PlaybookClient } from './client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const data = await getPlaybookData();
  return (
    <>
      <Header syncedAt={data.syncedAt} />
      <PlaybookClient data={data} />
      <Footer />
    </>
  );
}
