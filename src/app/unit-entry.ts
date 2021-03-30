import { UnitDefense } from './unit-defense';
import { UnitUpgrade } from './unit-upgrade';

export interface UnitEntry {
  name: string;
  basePoints: number;
  move: number;
  totalIntegrity: number;
  defense: UnitDefense;
  unitTags: string[];
  breakValue: number;
  squadComposition: string;
  weapons: string[];
  abilities: string[];
  upgrades: UnitUpgrade;
}
