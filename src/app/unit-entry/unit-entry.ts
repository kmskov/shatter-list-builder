export interface UnitEntry {
  name: string;
  id: string;

  basePoints: number; // Points per base
  currentPoints?: number;

  move: number;
  totalIntegrity: number;
  defense: UnitDefense;
  breakValue: number;

  squadComposition: number;
  unitTags: string[];
  mutEx?: string[];
  weapons: string[];
  abilities: string[];
  transportCapacity?: number;
  upgrades: UnitUpgrade[];
}

export interface UnitDefense {
  dice: number;
  save: string;
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


