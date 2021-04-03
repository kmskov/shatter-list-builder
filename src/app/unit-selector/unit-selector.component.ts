import { Component, OnInit, Input } from '@angular/core';
import { UnitType } from '../unit-type';
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

  constructor() { }

  ngOnInit() {
    console.log('unit-selector.ngOnInit starting');

    this.unitTypes = rosters.base;

  //  console.log(JSON.stringify(this.unitTypes));

    this.faction = factions[this.factionName];

    console.log('unit-selector.ngOnInit finished');
  }

}
