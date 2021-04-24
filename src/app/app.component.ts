import { Component, ViewChild, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { UnitSelection } from './unit-selection';
import { UnitSelectorComponent } from './unit-selector/unit-selector.component';
import { UnitEntryComponent } from './unit-entry/unit-entry.component';
import factions from './factions.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Project Shatter - List Builder';

  currFactionName = 'crystallumHordes';
  currFactionLabel: string;
  currPointsTotal = 0;

  currentList: UnitSelection[] = [];

  @ViewChildren(UnitEntryComponent) unitEntries: QueryList<UnitEntryComponent>;
  @ViewChild(UnitSelectorComponent) unitSelectionCmp: UnitSelectorComponent;

  isGalleryMode = false;

  unitTypeSortOrder: string[] = ['hq', 'core', 'armoredSupport', 'fireSupport' , 'airSupport', 'special'];

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

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

  selectFaction(factionName: string): void {
    if (factionName !== this.currFactionName) {
      this.currFactionName = undefined;
      this.changeDetectorRef.detectChanges();
      this.currentList = [];
      this.currPointsTotal = 0;
      this.currFactionName = factionName;
      this.changeDetectorRef.detectChanges();
      this.currFactionLabel = factions[factionName].name;
    }
  }

  toggleGalleryMode(): void {
    this.isGalleryMode = !this.isGalleryMode;

    this.unitEntries.forEach(ue => {
      ue.toggleGalleryMode(this.isGalleryMode);
    });

    this.changeDetectorRef.detectChanges();
  }
}
