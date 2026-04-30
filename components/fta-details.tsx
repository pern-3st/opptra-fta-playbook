import type { FTA, Lane } from '@/lib/types';
import { Card, StepHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Notice } from './ui/notice';
import { Tile } from './ui/tile';
import { Markdown } from './markdown';

interface Props {
  fta: FTA;
  lane: Lane;
  alternatives: FTA[];
  originName: string;
  destinationName: string;
  freeZoneFallback?: boolean;
}

export function FTADetails({ fta, lane, alternatives, originName, destinationName, freeZoneFallback }: Props) {
  const tracks = parseTracks(fta.body.tracks);

  return (
    <Card className="border-orange/20">
      <StepHeader
        title={fta.name}
        subtitle={fta.fullName}
        aside={
          <Badge tone={fta.status === 'Active' ? 'orange' : 'grey'}>
            {fta.statusLabel || fta.status}
          </Badge>
        }
      />

      {freeZoneFallback && (
        <p className="text-xs text-grey mb-3 italic">
          No free-zone variant configured for this lane — showing the standard lane.
        </p>
      )}

      {fta.body.description && (
        <div className="mb-4"><Markdown>{fta.body.description}</Markdown></div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Tile label="In Force" value={fta.inForce} />
        <Tile label="Coverage" value={fta.coverage} />
        <Tile label="COO Form" value={fta.cooForm} />
        <Tile label="RoO" value={fta.roo} />
      </div>

      <div className="mb-5">
        <h3 className="font-heading font-bold text-navy mb-2">Tariff Concession Framework</h3>
        {tracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tracks.map((t, i) => (
              <Tile key={i} label={t.label} value={t.value} />
            ))}
          </div>
        ) : (
          <Tile label="" value={fta.tariffFramework} />
        )}
      </div>

      {(lane.cooForm || lane.notes) && (
        <Notice className="mt-4">
          <Badge tone="orange" className="mb-2">Lane-specific</Badge>
          {lane.cooForm && <p><strong>COO form: </strong>{lane.cooForm}</p>}
          {lane.notes && <p className="mt-1">{lane.notes}</p>}
        </Notice>
      )}

      {alternatives.length > 0 && (
        <div className="mt-5 pt-5 border-t border-black/5">
          <h3 className="font-heading font-bold text-navy mb-2">
            Other agreements covering {originName} → {destinationName}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {alternatives.map(alt => (
              <Badge key={alt.id} tone="navy">
                {alt.shortCode || alt.name}
                {alt.statusLabel && <span className="opacity-70"> · {alt.statusLabel}</span>}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-grey italic">
            Compare duty schedules, RoO, and COO burden across these agreements before finalising the one you claim under.
          </p>
        </div>
      )}
    </Card>
  );
}

function parseTracks(md: string): { label: string; value: string }[] {
  return md.split('\n')
    .map(l => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
    .map(l => {
      const idx = l.indexOf(': ');
      return idx === -1 ? { label: l, value: '' } : { label: l.slice(0, idx), value: l.slice(idx + 2) };
    });
}
