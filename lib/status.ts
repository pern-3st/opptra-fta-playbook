type Tone = 'navy' | 'orange' | 'grey' | 'green' | 'blue' | 'amber';
type Variant = 'solid' | 'outline';

export function statusTone(status: string): { tone: Tone; variant: Variant } {
  switch (status) {
    case 'Active':
      return { tone: 'green', variant: 'solid' };
    case 'Under Review':
      return { tone: 'blue', variant: 'solid' };
    case 'Negotiating':
      return { tone: 'amber', variant: 'solid' };
    case 'Paused':
      return { tone: 'amber', variant: 'outline' };
    case 'Inactive':
      return { tone: 'grey', variant: 'outline' };
    case 'None':
      return { tone: 'grey', variant: 'outline' };
    default:
      return { tone: 'grey', variant: 'solid' };
  }
}
