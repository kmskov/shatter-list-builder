export interface UnitEntry {
  name: string;
  id: string;

  basePoints: number; // Points per base
  currentPoints?: number;

  move: number;
  totalIntegrity: number;
  criticalThreshold?: UnitCriticalThreshold[];
  defense: UnitDefense;
  breakValue: number;

  squadComposition: number;
  unitTags: string[];
  weapons: string[];
  abilities: string[];
  upgrades: UnitUpgrade[];

  transportCapacity?: number;
}

export interface UnitDefense {
  dice: number;
  save: string;
}

export interface UnitCriticalThreshold {
  box: number;
  effect: string;
}


export interface UnitUpgrade {
  label: string;

  current?: number; // How many of these have been selected so far
  disabled?: boolean; // Can this be selected currently

  limit?: any;
  limitValue?: number;

  cost?: number;
  multiplyCostByBases?: boolean;

  upgradeType: UnitUpgradeType;
}

export interface UnitUpgradeType {
    type: string;
    id?: string;
    mutuallyExclusive?: string[];
}


