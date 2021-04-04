import { Component } from '@angular/core';
import { UnitSelection } from './unit-selection';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Project Shatter - List Builder';

   currFactionName = 'vlast';
  // currUnitType: string;
  // currUnitTypeIndex: number;

  currentList: UnitSelection[] = [];

  addUnit(unitSelection: UnitSelection) {
    console.log('AppComponent.addUnit: ' + JSON.stringify(unitSelection));
    // this.currFactionName = unitSelection.faction;
    // this.currUnitType = unitSelection.unitType;
    // this.currUnitTypeIndex = unitSelection.index;

    this.currentList.push(unitSelection);
  }
}
