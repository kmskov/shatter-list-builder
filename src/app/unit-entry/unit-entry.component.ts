import { Component, OnInit } from '@angular/core';
import * as factions from '../factions.json';
import * as reference from '../reference.json';
import { UnitEntry } from '../unit-entry';

@Component({
  selector: 'app-unit-entry',
  templateUrl: './unit-entry.component.html',
  styleUrls: ['./unit-entry.component.css']
})
export class UnitEntryComponent implements OnInit {

  unitEntry: UnitEntry;
  weaponIds: string[] = [];
  weaponEntries: any[] = [];
  currentWeaponNames: string[] = [];

  abilityEntries: any[] = [];
  currentAbilityNames: string[] = [];

  integrity: number[] = [];

  constructor() { }

  ngOnInit() {
    console.log('unit-entry.ngOnInit starting');

    this.unitEntry = factions.vlast.hq[0];

    this.loadWeapons();

    this.loadAbilities();

    for (let i = 1; i <= this.unitEntry.totalIntegrity; i++) {
      this.integrity.push(i);
    }

    console.log('unit-entry.ngOnInit finished');
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

}
