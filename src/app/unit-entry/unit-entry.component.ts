import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import factions from '../factions.json';
import reference from '../reference.json';
import { UnitEntry } from './unit-entry';
import { UnitSelection } from '../unit-selection';
import { UnitUpgrade } from './unit-upgrade';

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

  @Output() unitRemovalEvent = new EventEmitter<UnitSelection>();

  constructor() { }

  ngOnInit() {
    console.log('unit-entry.ngOnInit starting');

    console.log('faction: ' + this.unitSelection.factionName + ', unitType: ' + this.unitSelection.unitType + ', index: ' + this.unitSelection.index);

    this.unitEntry = factions[this.unitSelection.factionName][this.unitSelection.unitType][this.unitSelection.index];

    this.loadWeaponsAndUpgrades();
    this.loadAbilities();
    this.loadIntegrity();

    console.log('unit-entry.ngOnInit finished');
  }

  loadIntegrity(): void {
    for (let i = 1, j = 0; i <= this.unitEntry.totalIntegrity; i++) {
      if ("criticalThreshold" in this.unitEntry && i === this.unitEntry.criticalThreshold[j].box) {
        this.integrity.push(this.unitEntry.criticalThreshold[j].effect);
        j = j++;
      } else {
        this.integrity.push("normal");
      }
    }
  }

  loadWeaponsAndUpgrades(): void {
    this.unitEntry.weapons.forEach(weapon => {
      this.weaponIds.push(weapon);
    });
    this.unitEntry.upgrades.forEach(upgradeEntry => {
      if (upgradeEntry.hasOwnProperty('weapon')) {
        this.weaponIds.push(upgradeEntry.weapon);
      }
      if (!upgradeEntry.hasOwnProperty('limit')) {
        upgradeEntry.limitValue = 1;
      } else if (upgradeEntry.limit === 'baseCount') {
        upgradeEntry.limitValue = this.unitEntry.squadComposition;
      } else { // it's a number
        upgradeEntry.limitValue = upgradeEntry.limit;
      }
      upgradeEntry.current = 0;
      upgradeEntry.disabled = false;
    });

    this.weaponIds.forEach(weaponId => {
      let weaponEntry = reference.weapons.find(i => i.id === weaponId);
      this.weaponEntries.push(weaponEntry);

      if ( this.unitEntry.weapons.indexOf(weaponEntry.id) > -1) {
        this.currentWeaponNames.push(weaponEntry.name);
      }
    });

    this.weaponEntries.sort(function(a: any, b: any) {
      if(a.range.melee===true && b.range.melee === true) {
        return 0;
      } else if(a.range.melee===true && b.range.melee !== true) {
        return 1;
      } else if (b.range.melee===true && a.range.melee !== true) {
        return -1;
      } else {
        return a.range.max - b.range.max;
      }
    });
  }

  loadAbilities(): void {
    var abilityIds = [];
    
    this.unitEntry.abilities.forEach(ability => {
      abilityIds.push(ability);
    });

    abilityIds.forEach(abilityId => {
      let abilityEntry = reference.abilities.find(i => i.id === abilityId);
      this.abilityEntries.push(abilityEntry);

      if ( this.unitEntry.abilities.indexOf(abilityEntry.id) > -1) {
        this.currentAbilityNames.push(abilityEntry.label);
      }
    });
  }

  addUpgrade(upgrade: UnitUpgrade): void {
    let costMultiplier = this.getUpgradeCostMultiplier(upgrade);
    this.unitEntry.basePoints += (costMultiplier * upgrade.cost);
    
    upgrade.current += 1;
    
    this.disableMutExUpgrades(upgrade, true);
    
    if (upgrade.hasOwnProperty('weapon')) {
        this.currentWeaponNames.push(reference.weapons.find(i => i.id === upgrade.weapon).name); 
    } else if (upgrade.hasOwnProperty('ability')) {
        this.currentAbilityNames.push(reference.abilities.find(i => i.id === upgrade.ability).label); 
    }
  }

  removeUpgrade(upgrade: UnitUpgrade): void {
    let costMultiplier = this.getUpgradeCostMultiplier(upgrade);
    this.unitEntry.basePoints -= (costMultiplier * upgrade.cost);
    
    if(upgrade.current > 0) {
      upgrade.current -= 1;
    }

    this.disableMutExUpgrades(upgrade, false);

    if (upgrade.hasOwnProperty('weapon')) {
      let label = reference.weapons.find(i => i.id === upgrade.weapon).name;
      const index = this.currentWeaponNames.indexOf(label, 0);
      if (index > -1) {
        this.currentWeaponNames.splice(index, 1);
      }
    } else if (upgrade.hasOwnProperty('ability')) {
      let label = reference.abilities.find(i => i.id === upgrade.ability).label;
      const index = this.currentAbilityNames.indexOf(label, 0);
      if (index > -1) {
        this.currentAbilityNames.splice(index, 1);
      }
    }
  }

  getUpgradeCostMultiplier(upgrade: UnitUpgrade): number {
    if(upgrade.multiplier === 'baseCount') {
      return this.unitEntry.squadComposition;
    } else if (!isNaN(parseInt(upgrade.multiplier))) {
      return parseInt(upgrade.multiplier);
    } else {
      return 1;
    }
  }

  disableMutExUpgrades(upgrade: UnitUpgrade, isAdd: boolean): void {
    if (upgrade.hasOwnProperty('mutuallyExclusive')) {
      let mutExUpgrades = upgrade.mutuallyExclusive;

      let mutExProperty: string;
      if (upgrade.hasOwnProperty('weapon')) {
        mutExProperty = 'weapon'; 
      } else if (upgrade.hasOwnProperty('ability')) {
        mutExProperty = 'ability';
      }
      
      this.unitEntry.upgrades.forEach(upgrade => {
        //Find each upgrade that matches the mutex property and where that property value is named in this upgrades list of mutex upgrades
        if(upgrade.hasOwnProperty(mutExProperty) && mutExUpgrades.includes(upgrade[mutExProperty])) {
          upgrade.disabled = isAdd;
        }
      });
    }
  }

  removeUnit(): void {
    this.unitRemovalEvent.emit(this.unitSelection);
  }

}
