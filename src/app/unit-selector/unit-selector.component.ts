import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UnitType } from '../unit-type';
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

    this.unitTypes = rosters.base;

    this.faction = factions[this.factionName];

    console.log('unit-selector.ngOnInit finished');
  }

  addUnit(faction: string, unitType: string, index: number) {
    console.log('addUnit: ' + faction + ', ' + unitType + ', ' + index)
    let unitSelection = {factionName: faction, unitType: unitType, index: index};
    this.unitSelectionEvent.emit(unitSelection)
  }

}
