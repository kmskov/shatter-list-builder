export interface Ability {
  id: string;
  label: string;
  type: string;
  active?: boolean;
}

export interface Weapon {
  id: string;
  name: string;
  type: string;
  tags: string[];
  rof: any;
  range: WeaponRange;
  damage: number;
}

export interface WeaponRange {
  min?: number;
  max?: number;
  melee: boolean;
}
