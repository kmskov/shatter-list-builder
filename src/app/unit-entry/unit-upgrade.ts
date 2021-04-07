export interface UnitUpgrade {
  label: string;
  cost: number;
  current?: number; //how many of these have been selected so far
  disabled?: boolean; //can this be selected currently
  limit?: any;
  limitValue?: number;
  multiplier?: string;
  weapon?: string; 
  mutuallyExclusive?: string[];
  ability?: string;
}
