import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UnitType } from './unit-type';
import { UnitSelection } from '../common';
import factions from '../factions.json';
import rosters from '../rosters.json';

@Component({
  selector: 'app-unit-selector',
  templateUrl: './unit-selector.component.html',
  styleUrls: ['./unit-selector.component.css']
})
export class UnitSelectorComponent implements OnInit {

  @Input() factionName: string;

  faction: any;

  unitTypes: UnitType[];

  disabledSelections: string[] = [];

  @Output() unitSelectionEvent = new EventEmitter<UnitSelection>();

  constructor() { }

  ngOnInit() {
    // console.log('unit-selector.ngOnInit starting');

    this.faction = factions[this.factionName];

    this.unitTypes = rosters.base;
    this.unitTypes.forEach(type => {
      type.current = 0;
    });

    // console.log('unit-selector.ngOnInit finished');
  }

  addUnit(faction: string, type: string, unitId: string, mutEx: string[]) {
    this.unitTypes.find(i => i.id === type).current += 1;

    if (mutEx !== undefined) {
      mutEx.forEach(m => {
        if (!this.disabledSelections.includes(m)) {
          this.disabledSelections.push(m);
        }
      });
    }

    const unitSelection = { factionName: faction, unitType: type, id: unitId };
    this.unitSelectionEvent.emit(unitSelection);
  }

  removeUnit(unitType: string, unitId: string) {
    this.unitTypes.find(i => i.id === unitType).current -= 1;

    const mutEx = this.faction[unitType].find(i => i.id === unitId).mutEx;
    if (mutEx !== undefined) {
      mutEx.forEach(m => {
        const idx = this.disabledSelections.indexOf(m);
        if (idx > -1) {
          this.disabledSelections.splice(idx, 1);
        }
      });
    }
  }

}
