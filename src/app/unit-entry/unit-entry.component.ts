import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import factions from '../factions.json';
import reference from '../reference.json';
import { UnitEntry, UnitUpgrade } from './unit-entry';
import { UnitSelection } from '../unit-selection';
import { Weapon, Ability } from '../reference';

@Component({
  selector: 'app-unit-entry',
  templateUrl: './unit-entry.component.html',
  styleUrls: ['./unit-entry.component.css']
})
export class UnitEntryComponent implements OnInit {

  @Input() unitSelection: UnitSelection;

  unitEntry: UnitEntry;
  weaponIds: string[] = [];
  weaponEntries: Weapon[] = [];
  currentWeaponNames: string[] = [];

  abilityEntries: Ability[] = [];

  unitTransport: UnitSelection;
  transportPoints = 0;

  isGalleryMode = false;

  @ViewChild(UnitEntryComponent) unitTransportEntryCmp: UnitEntryComponent;

  @Output() unitRemovalEvent = new EventEmitter<UnitSelection>();
  @Output() pointsUpdateEvent = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
    // console.log('unit-entry.ngOnInit starting');

    const factionUnit = factions[this.unitSelection.factionName][this.unitSelection.unitType].find(i => i.id === this.unitSelection.id);
    this.unitEntry = (JSON.parse(JSON.stringify(factionUnit))); // Deep clone

    this.loadUpgrades();
    this.loadWeapons();
    this.loadAbilities();

    this.unitEntry.currentPoints = 0;
    this.recalcTotalUnitPoints();

    // console.log('unit-entry.ngOnInit finished');
  }

  loadUpgrades(): void {
    this.unitEntry.upgrades.forEach(upgradeEntry => {
      if (upgradeEntry.upgradeType.type === 'weapon') {
        this.weaponIds.push(upgradeEntry.upgradeType.id);
      } else if (upgradeEntry.upgradeType.type === 'ability') {
        const newAbility: Ability = (JSON.parse(JSON.stringify(reference.abilities.find(i => i.id === upgradeEntry.upgradeType.id))));
        newAbility.active = false;
        this.abilityEntries.push(newAbility);
      }

      if (!upgradeEntry.hasOwnProperty('limit')) {
        upgradeEntry.limitValue = 1;
      } else if (upgradeEntry.limit === 'baseCount') {
        upgradeEntry.limitValue = this.unitEntry.squadComposition;
      } else { // it's a number
        upgradeEntry.limitValue = upgradeEntry.limit;
      }

      if (upgradeEntry.cost === undefined) {
        upgradeEntry.cost = 0;
      }

      upgradeEntry.current = 0;
      upgradeEntry.disabled = false;
    });
  }

  loadWeapons(): void {
    this.unitEntry.weapons.forEach(weapon => {
      this.weaponIds.push(weapon);
    });

    this.weaponIds.forEach(weaponId => {
      const weaponEntry = reference.weapons.find(i => i.id === weaponId);
      this.weaponEntries.push(weaponEntry);

      if ( this.unitEntry.weapons.indexOf(weaponEntry.id) > -1) {
        this.currentWeaponNames.push(weaponEntry.name);
      }
    });

    this.weaponEntries.sort((a: Weapon, b: Weapon) => {
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
    });
  }

  loadAbilities(): void {
    this.unitEntry.abilities.forEach(ability => {
      const abilityEntry: Ability = (JSON.parse(JSON.stringify(reference.abilities.find(i => i.id === ability))));
      abilityEntry.active = true;
      abilityEntry.base = true;
      this.abilityEntries.push(abilityEntry);
    });
  }

  addUpgrade(upgrade: UnitUpgrade): void {

    upgrade.current += 1;

    this.disableMutExUpgrades(upgrade, true);

    switch (upgrade.upgradeType.type) {
      case 'weapon':
        const newWeaponName = reference.weapons.find(i => i.id === upgrade.upgradeType.id).name;
        if (this.currentWeaponNames.indexOf(newWeaponName) === -1) {
          this.currentWeaponNames.push(reference.weapons.find(i => i.id === upgrade.upgradeType.id).name);
        }
        break;
      case 'ability':
        const mutExAbilities = upgrade.upgradeType.mutuallyExclusive;
        this.abilityEntries.forEach(ab => {
          if (upgrade.upgradeType.id === ab.id) {
            ab.active = true;
          } else if (mutExAbilities.includes(ab.id)) {
            ab.active = false;
          }
        });
        console.log(JSON.stringify(this.abilityEntries));
        break;
      case 'extraBase':
        this.unitEntry.squadComposition += 1;
        this.updateAllBaseCountLimits();
        break;
      case 'transport':
        if (this.unitTransport === undefined) {
          this.unitTransport = {factionName: this.unitSelection.factionName, unitType: 'transport', id: upgrade.upgradeType.id};
        } else {
          this.unitTransportEntryCmp.addTransport();
        }
        if (upgrade.limit === 'baseCount') {
          this.updateBaseCountLimit(upgrade, upgrade.upgradeType.id);
        }
        break;
      default:
    }

    this.recalcTotalUnitPoints();
  }

  removeUpgrade(upgrade: UnitUpgrade): void {

    if (upgrade.current > 0) {
      upgrade.current -= 1;
    }

    this.disableMutExUpgrades(upgrade, false);

    switch (upgrade.upgradeType.type) {
      case 'weapon':
        const index = this.currentWeaponNames.indexOf(reference.weapons.find(i => i.id === upgrade.upgradeType.id).name, 0);
        if (index > -1 && upgrade.current === 0) {
          this.currentWeaponNames.splice(index, 1);
        }
        break;
      case 'ability':
        this.abilityEntries.forEach(ab => {
          if (upgrade.upgradeType.id === ab.id) {
            ab.active = false;
          } else if (ab.base && upgrade.upgradeType.mutuallyExclusive.includes(ab.id)) {
            ab.active = true;
          }
        });
        console.log(JSON.stringify(this.abilityEntries));
        break;
      case 'extraBase':
        this.unitEntry.squadComposition -= 1;
        this.updateAllBaseCountLimits();
        break;
      case 'transport':
        if (upgrade.current === 0) {
          this.unitTransport = undefined;
          this.transportPoints = 0;
        } else {
          this.unitTransportEntryCmp.subtractTransport();
        }
        if (upgrade.limit === 'baseCount') {
          this.updateBaseCountLimit(upgrade, upgrade.upgradeType.id);
        }
        break;
      default:
    }

    this.recalcTotalUnitPoints();
  }

  updateAllBaseCountLimits(): void {
    this.unitEntry.upgrades.forEach(upg => {
      if (upg.limit === 'baseCount') {
        this.updateBaseCountLimit(upg, upg.upgradeType.type === 'transport' ? upg.upgradeType.id : undefined);
      }
    });
  }

  updateBaseCountLimit(upgrade: UnitUpgrade, transportId: string): void {
    let transportCapacity = 1;
    if (transportId !== undefined) {
      transportCapacity = factions[this.unitSelection.factionName].transport.find(i => i.id === transportId).transportCapacity;
    }
    upgrade.limitValue = Math.round(this.unitEntry.squadComposition / transportCapacity);
  }

  addTransport(): void {
    this.unitEntry.squadComposition += 1;
    this.updateAllBaseCountLimits();
    this.recalcTotalUnitPoints();
  }

  subtractTransport(): void {
    this.unitEntry.squadComposition -= 1;
    this.updateAllBaseCountLimits();
    this.recalcTotalUnitPoints();
  }

  disableMutExUpgrades(currUpgrade: UnitUpgrade, disable: boolean): void {
    if (currUpgrade.upgradeType.hasOwnProperty('mutuallyExclusive')) {
      const mutExUpgrades = currUpgrade.upgradeType.mutuallyExclusive;

      this.unitEntry.upgrades.forEach(upg => {
        // Find each upgrade that matches the mutex property and where that property value is named in this upgrades list of mutex upgrades
        if (upg.upgradeType.type === currUpgrade.upgradeType.type && mutExUpgrades.includes(upg.upgradeType.id)) {
          upg.disabled = disable;
        }
      });
    }
  }

  recalcTotalUnitPoints(): void {

    let difference = 0;
    let totalPoints = (this.unitEntry.basePoints * this.unitEntry.squadComposition) + this.transportPoints;

    this.unitEntry.upgrades.forEach(upg => {
      if (upg.current > 0 && upg.upgradeType.type !== 'extraBase')  {
        if (upg.hasOwnProperty('multiplyCostByBases')) {
          totalPoints += upg.cost * this.unitEntry.squadComposition;
        } else {
          totalPoints += upg.cost * upg.current;
        }
      }
    });

    difference = totalPoints - this.unitEntry.currentPoints;
    this.unitEntry.currentPoints = totalPoints;
    this.updateListPoints(difference);
  }

  removeUnit(): void {
    this.updateListPoints(-1 * this.unitEntry.currentPoints);
    this.unitRemovalEvent.emit(this.unitSelection);
  }

  updateListPoints(difference: number): void {
    this.pointsUpdateEvent.emit(difference);
  }

  updateTransportPoints(difference: number): void {
    this.transportPoints += difference;
    this.recalcTotalUnitPoints();
  }

  toggleGalleryMode(enable: boolean): void {
    console.log('unitEntry.toggleGalleryMode unit: ' + this.unitEntry.name + ', enable: ' + enable);
    this.isGalleryMode = enable;
    if (this.unitTransportEntryCmp !== undefined) {
      this.unitTransportEntryCmp.toggleGalleryMode(enable);
    }
  }

  getNumberArray(length: number): number[] {
    const a: number[] = [];
    for (let i = 0; i < length; i++) {
      a.push(i);
    }
    return a;
  }
}
