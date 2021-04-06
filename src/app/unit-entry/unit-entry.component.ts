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

    this.loadWeapons();
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

  loadWeapons(): void {
    this.unitEntry.weapons.forEach(weapon => {
      this.weaponIds.push(weapon);
    });
    this.unitEntry.upgrades.forEach(upgradeEntry => {
      if (upgradeEntry.hasOwnProperty('weapon')) {
        this.weaponIds.push(upgradeEntry.weapon);
      }
    });

    this.weaponIds.forEach(weaponId => {
      let weaponEntry = reference.weapons.find(i => i.id === weaponId);
      this.weaponEntries.push(weaponEntry);

      if ( this.unitEntry.weapons.indexOf(weaponEntry.id) > -1) {
        this.currentWeaponNames.push(weaponEntry.name);
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
  }

  removeUnit(): void {
    this.unitRemovalEvent.emit(this.unitSelection);
  }

}
