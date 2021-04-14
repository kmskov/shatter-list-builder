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
  unitTypeSortOrder: string[] = ['hq', 'core', 'armoredSupport', 'fireSupport' , 'airSupport', 'special'];

  @ViewChild(UnitSelectorComponent) unitSelectionCmp: UnitSelectorComponent;

  addUnit(unitSelection: UnitSelection): void {
    this.currentList.push(unitSelection);
    this.currentList.sort((a: UnitSelection, b: UnitSelection) => {
      return this.unitTypeSortOrder.indexOf(a.unitType) - this.unitTypeSortOrder.indexOf(b.unitType);
    });
  }

  removeUnit(unitSelection: UnitSelection): void {
    const index = this.currentList.indexOf(unitSelection, 0);
    if (index > -1) {
      this.currentList.splice(index, 1);
    }
    this.unitSelectionCmp.removeUnit(unitSelection.unitType);
  }

  updatePoints(difference: number): void {
    this.currPointsTotal += difference;
  }
}
