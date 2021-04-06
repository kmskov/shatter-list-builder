export interface UnitUpgrade {
  label: string;
  cost: number;
  current?: number; //how many of these have been selected so far
  diabled?: boolean; //can this be selected currently
  limit?: number;
  multiplier?: string;
  weapon?: string;
  mutuallyExclusive?: string[];
  ability?: string;
}
