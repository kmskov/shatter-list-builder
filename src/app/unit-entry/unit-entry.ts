export interface UnitEntry {
  name: string;
  basePoints: number;
  currentPoints?: number;
  move: number;
  totalIntegrity: number;
  defense: UnitDefense;
  unitTags: string[];
  breakValue: number;
  criticalThreshold?: UnitCriticalThreshold[];
  squadComposition: number;
  weapons: string[];
  abilities: string[];
  upgrades: UnitUpgrade[];
}

export interface UnitDefense {
  dice: number;
  save: string;
}

export interface UnitCriticalThreshold {
  box: number,
  effect: string
}


export interface UnitUpgrade {
  label: string;
  
  current?: number; //how many of these have been selected so far
  disabled?: boolean; //can this be selected currently

  limit?: any;
  limitValue?: number;

  cost: number;
  multiplyCostByBases?: boolean;
  
  upgradeType: UnitUpgradeType;
}

export interface UnitUpgradeType {
    type: string;
    id?: string;
    mutuallyExclusive?: string[];
}


