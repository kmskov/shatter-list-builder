export interface UnitSelection {
  factionName: string;
  unitType: string;
  id: string;
}

export interface Ability {
  id: string;
  label: string;
  type: string;
  active?: boolean;
  base?: boolean;
}

export interface Weapon {
  id: string;
  name: string;
  type?: string;
  tags: string[];
  rof: any;
  range: WeaponRange;
  damage: number;

  active?: boolean;
  number?: number;
}

export interface WeaponRange {
  min?: number;
  max?: number;
  melee: boolean;
}

export function weaponSort(a: Weapon, b: Weapon) {
  if (a.range.melee === b.range.melee) {
    return a.name.localeCompare(b.name);
  } else {
    return (a.range.melee ? 1 : 0) - (b.range.melee ? 1 : 0);
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
