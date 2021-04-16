import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import factions from '../factions.json';
import reference from '../reference.json';
import { UnitEntry, UnitUpgrade } from './unit-entry';
import { UnitSelection } from '../unit-selection';

@Component({
  selector: 'app-unit-entry',
  templateUrl: './unit-entry.component.html',
  styleUrls: ['./unit-entry.component.css']
})
export class UnitEntryComponent implements OnInit {

  @Input() unitSelection: UnitSelection;

  unitEntry: UnitEntry;
  weaponIds: string[] = [];
  weaponEntries: any[] = [];
  currentWeaponNames: string[] = [];

  abilityEntries: any[] = [];
  currentAbilityNames: string[] = [];

  integrity: string[] = [];

  unitTransport: UnitSelection;
  transportPoints = 0;

  @ViewChild(UnitEntryComponent) unitTransportEntryCmp: UnitEntryComponent;

  @Output() unitRemovalEvent = new EventEmitter<UnitSelection>();
  @Output() pointsUpdateEvent = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
    // console.log('unit-entry.ngOnInit starting');

    const factionUnit = factions[this.unitSelection.factionName][this.unitSelection.unitType].find(i => i.id === this.unitSelection.id);
    this.unitEntry = (JSON.parse(JSON.stringify(factionUnit))); // Deep clone

    this.loadWeaponsAndUpgrades();
    this.loadAbilities();
    this.loadIntegrity();

    this.unitEntry.currentPoints = 0;
    this.recalcTotalUnitPoints();

    // console.log('unit-entry.ngOnInit finished');
  }

  loadIntegrity(): void {
    for (let i = 1, j = 0; i <= this.unitEntry.totalIntegrity; i++) {
      if ('criticalThreshold' in this.unitEntry && i === this.unitEntry.criticalThreshold[j].box) {
        this.integrity.push(this.unitEntry.criticalThreshold[j].effect);
        j = j++;
      } else {
        this.integrity.push('normal');
      }
    }
  }

  loadWeaponsAndUpgrades(): void {
    this.unitEntry.weapons.forEach(weapon => {
      this.weaponIds.push(weapon);
    });
    this.unitEntry.upgrades.forEach(upgradeEntry => {
      if (upgradeEntry.upgradeType.type === 'weapon') {
        this.weaponIds.push(upgradeEntry.upgradeType.id);
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

    this.weaponIds.forEach(weaponId => {
      const weaponEntry = reference.weapons.find(i => i.id === weaponId);
      this.weaponEntries.push(weaponEntry);

      if ( this.unitEntry.weapons.indexOf(weaponEntry.id) > -1) {
        this.currentWeaponNames.push(weaponEntry.name);
      }
    });

    this.weaponEntries.sort((a: any, b: any) => {
      if (a.range.melee === true && b.range.melee === true) {
        return 0;
      } else if (a.range.melee === true && b.range.melee !== true) {
        return 1;
      } else if (b.range.melee === true && a.range.melee !== true) {
        return -1;
      } else {
        return a.range.max - b.range.max;
      }
    });
  }

  loadAbilities(): void {
    const abilityIds = [];

    this.unitEntry.abilities.forEach(ability => {
      abilityIds.push(ability);
    });

    abilityIds.forEach(abilityId => {
      const abilityEntry = reference.abilities.find(i => i.id === abilityId);
      this.abilityEntries.push(abilityEntry);

      if ( this.unitEntry.abilities.indexOf(abilityEntry.id) > -1) {
        this.currentAbilityNames.push(abilityEntry.label);
      }
    });
  }

  addUpgrade(upgrade: UnitUpgrade): void {
    console.log(JSON.stringify(upgrade));

    upgrade.current += 1;

    this.disableMutExUpgrades(upgrade, true);

    let newType = '';
    switch (upgrade.upgradeType.type) {
      case 'weapon':
        newType = reference.weapons.find(i => i.id === upgrade.upgradeType.id).name;
        if (this.currentWeaponNames.indexOf(newType) === -1) {
          this.currentWeaponNames.push(reference.weapons.find(i => i.id === upgrade.upgradeType.id).name);
        }
        break;
      case 'ability':
        if (this.currentWeaponNames.indexOf(newType) === -1) {
          this.currentAbilityNames.push(reference.abilities.find(i => i.id === upgrade.upgradeType.id).label);
        }
        break;
      case 'extraBase':
        this.unitEntry.squadComposition += 1;
        this.updateAllBaseCountLimits();
        break;
      case 'transport':
        if (this.unitTransport === undefined) {
          this.unitTransport = {factionName: this.unitSelection.factionName, unitType: 'transport', id: upgrade.upgradeType.id}
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

    let index = -1;
    switch (upgrade.upgradeType.type) {
      case 'weapon':
        index = this.currentWeaponNames.indexOf(reference.weapons.find(i => i.id === upgrade.upgradeType.id).name, 0);
        if (index > -1 && upgrade.current === 0) {
          this.currentWeaponNames.splice(index, 1);
        }
        break;
      case 'ability':
        index = this.currentAbilityNames.indexOf(reference.abilities.find(i => i.id === upgrade.upgradeType.id).label, 0);
        if (index > -1 && upgrade.current === 0) {
          this.currentAbilityNames.splice(index, 1);
        }
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

}
