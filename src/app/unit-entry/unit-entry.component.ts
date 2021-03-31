import { Component, OnInit } from '@angular/core';
import * as factions from '../factions.json';
import * as reference from '../reference.json';

@Component({
  selector: 'app-unit-entry',
  templateUrl: './unit-entry.component.html',
  styleUrls: ['./unit-entry.component.css']
})
export class UnitEntryComponent implements OnInit {

  unitEntry: any;
  weaponIds: string[] = [];
  weaponEntries: any[] = [];
  currentWeaponNames: string[] = [];

  constructor() { }

  ngOnInit() {
    this.unitEntry = factions.vlast.hq[0];

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

    console.log('unit-entry.ngOnInit finished');
  }

}
