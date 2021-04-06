import { UnitDefense } from './unit-defense';
import { UnitUpgrade } from './unit-upgrade';
import { UnitCriticalThreshold } from './unit-critical-threshold';

export interface UnitEntry {
  name: string;
  basePoints: number;
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
