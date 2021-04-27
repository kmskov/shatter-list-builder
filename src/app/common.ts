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
  type: string;
  tags: string[];
  rof: any;
  range: WeaponRange;
  damage: number;
  active?: boolean;
}

export function weaponSort(a: Weapon, b: Weapon) {
  if (a.range.melee === false && b.range.melee === false) {
    const rofA = Number(Number.isInteger(a.rof));
    const rofB = Number(Number.isInteger(b.rof));
    if (rofA === rofB) {
      return a.range.max - b.range.max;
    } else {
      return rofA - rofB;
    }
  } else {
    return (a.range.melee ? 1 : 0) - (b.range.melee ? 1 : 0);
  }
}

export interface WeaponRange {
  min?: number;
  max?: number;
  melee: boolean;
}
