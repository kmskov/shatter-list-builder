import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UnitType } from './unit-type';
import { UnitSelection } from '../unit-selection';
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

  @Output() unitSelectionEvent = new EventEmitter<UnitSelection>();

  constructor() { }

  ngOnInit() {
    console.log('unit-selector.ngOnInit starting');

    this.faction = factions[this.factionName];

    this.unitTypes = rosters.base;
    this.unitTypes.forEach(type => {
      type.current = 0;
    });

    console.log('unit-selector.ngOnInit finished');
  }

  addUnit(faction: string, unitType: string, unitId: string) {
    this.unitTypes.find(i => i.id == unitType).current += 1;
    console.log('add unit: ' + JSON.stringify(this.unitTypes.find(i => i.id == unitType)));
    let unitSelection = {factionName: faction, unitType: unitType, id: unitId};
    this.unitSelectionEvent.emit(unitSelection);
  }

  removeUnit(unitType: string, unitId: string) {
    console.log('remove unit: ' + JSON.stringify(this.unitTypes.find(i => i.id == unitType)));
    this.unitTypes.find(i => i.id == unitType).current -= 1;
  }

}
