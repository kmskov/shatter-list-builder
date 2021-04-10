import { Component, ViewChild } from '@angular/core';
import { UnitSelection } from './unit-selection';
import {UnitSelectorComponent } from './unit-selector/unit-selector.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Project Shatter - List Builder';

  currFactionName = 'vlast';
  currPointsTotal = 0;

  currentList: UnitSelection[] = [];

  @ViewChild(UnitSelectorComponent) unitSelectionCmp: UnitSelectorComponent;

  addUnit(unitSelection: UnitSelection): void {
    this.currentList.push(unitSelection);
  }

  removeUnit(unitSelection: UnitSelection): void {
    const index = this.currentList.indexOf(unitSelection, 0);
    if (index > -1) {
      this.currentList.splice(index, 1);
    }
    this.unitSelectionCmp.removeUnit(unitSelection.unitType, unitSelection.id);
  }

  updatePoints(difference: number): void {
    this.currPointsTotal += difference;
  }
}
