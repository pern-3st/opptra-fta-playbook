import type { FTA, Lane, Product, ComplianceDefaults } from '@/lib/types';
import { Card, StepHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Notice } from './ui/notice';
import { Markdown } from './markdown';
import { resolveFallbackPlaybookFields } from '@/lib/fallback';

interface Props {
  fta: FTA;
  lane: Lane;
  product: Product | null;
  hsn?: string;
  isManualEntry?: boolean;
  defaults: ComplianceDefaults;
  fallback: FTA | null;
  originName: string;
  destinationName: string;
  syncedAt: string;
}

const REVIEWED_FMT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export function Playbook({ fta, lane, product, hsn, isManualEntry, defaults, fallback, originName, destinationName, syncedAt }: Props) {
  const resolved = resolveFallbackPlaybookFields(fta, fallback);
  const ftaLabel = fta.shortCode || fta.name;
  const cooForm = lane.cooForm || resolved.cooForm;
  const extras = parseBullets(fta.body.extras);
  const hsnLabel = product?.hsnPrimary ?? hsn ?? '';

  return (
    <Card className="bg-canvas">
      <StepHeader
        title="Preferential COO Claim Playbook"
        subtitle={`A pre-shipment and at-import checklist for claiming ${fta.name} on this consignment. Use it with the business team and the customs broker before the Bill of Entry is filed.`}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Badge tone="navy">{originName} → {destinationName}</Badge>
        <Badge tone="navy">HS {hsnLabel}</Badge>
        <Badge tone="navy">FTA: {ftaLabel}</Badge>
        {lane.isFreeZone && <Badge tone="orange">Free Zone shipment</Badge>}
        {isManualEntry && <Badge tone="orange">Manual-entry tariff line</Badge>}
      </div>

      <div className="mb-5">
        <h4 className="font-heading font-bold text-navy mb-2">Documents to be furnished</h4>
        <Markdown>{defaults.documentRequirements}</Markdown>
      </div>

      <div className="mb-5">
        <h4 className="font-heading font-bold text-navy mb-2">Conditions to be met for claiming preferential duty</h4>
        <Markdown>{defaults.claimConditions}</Markdown>
      </div>

      <div className="mb-5">
        <h4 className="font-heading font-bold text-navy mb-2">{ftaLabel} — specifics for this lane</h4>
        <ul className="list-disc pl-5 text-sm text-navy space-y-1.5">
          {cooForm && <li><strong>COO / Origin Proof:</strong> {cooForm}</li>}
          {resolved.validity && <li><strong>COO Validity:</strong> {resolved.validity}</li>}
          {resolved.claimWindow && <li><strong>Claim window:</strong> {resolved.claimWindow}</li>}
          {resolved.retention && <li><strong>Record retention:</strong> {resolved.retention}</li>}
          {extras.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      </div>

      {fta.body.chapterNotes && (
        <div className="mb-5">
          <h4 className="font-heading font-bold text-navy mb-2">Chapter Notes</h4>
          <Markdown>{fta.body.chapterNotes}</Markdown>
        </div>
      )}

      {fta.body.resources && (
        <div className="mb-5">
          <h4 className="font-heading font-bold text-navy mb-2">Resources</h4>
          <Markdown>{fta.body.resources}</Markdown>
        </div>
      )}

      <Notice className="mt-6">
        <strong>Indicative guidance only.</strong> Duty rates and RoO thresholds shown in this tool are at chapter/heading level and reflect the most commonly cited provisions. Before filing, verify the exact 8-digit rate and RoO against the live customs notification in the destination country and cross-check with the <code>FTA_Import_Duty_Matrix.xlsx</code> workbook. Last synced from source: {REVIEWED_FMT.format(new Date(syncedAt))}.
      </Notice>
    </Card>
  );
}

function parseBullets(md: string): string[] {
  return md.split('\n')
    .map(l => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}
