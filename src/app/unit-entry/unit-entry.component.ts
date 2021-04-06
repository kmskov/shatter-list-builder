import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import factions from '../factions.json';
import reference from '../reference.json';
import { UnitEntry } from './unit-entry';
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
        upgradeEntry.limit = 1;
      }
      upgradeEntry.current = 0;
      upgradeEntry.diabled = false;
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

  addUpgrade(upgrade: any): void {
    this.unitEntry.basePoints += upgrade.cost;
    upgrade.current += 1;
  }

  removeUpgrade(upgrade: any): void {
    this.unitEntry.basePoints -= upgrade.cost;
    if(upgrade.current > 0) {
      upgrade.current -= 1;
    }
  }

  removeUnit(): void {
    this.unitRemovalEvent.emit(this.unitSelection);
  }

}
