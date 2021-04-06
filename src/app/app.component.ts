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

  addUnit(unitSelection: UnitSelection): void {
    console.log('AppComponent.addUnit: ' + JSON.stringify(unitSelection));
    // this.currFactionName = unitSelection.faction;
    // this.currUnitType = unitSelection.unitType;
    // this.currUnitTypeIndex = unitSelection.index;

    this.currentList.push(unitSelection);
  }

  removeUnit(unitSelection: UnitSelection): void {
    const index = this.currentList.indexOf(unitSelection, 0);
    if (index > -1) {
      this.currentList.splice(index, 1);
    }
  }
}
