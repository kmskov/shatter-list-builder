import { Component, ViewChild, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { UnitSelection, Weapon, weaponSort } from './common';
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

  currFactionName = 'atlanticCouncil';
  currFactionLabel = factions[this.currFactionName].name;
  currPointsTotal = 0;

  pointsLimit = 450;
  isOverPointsLimit = false;

  currUnitList: UnitSelection[] = [];

  weaponSummary = new Map<string, Weapon>();

  @ViewChildren(UnitEntryComponent) unitEntries: QueryList<UnitEntryComponent>;
  @ViewChild(UnitSelectorComponent) unitSelectionCmp: UnitSelectorComponent;

  isGalleryMode = false;

  unitTypeSortOrder: string[] = ['hq', 'core', 'armoredSupport', 'fireSupport', 'airSupport', 'special'];

  factionSummary: any[] = [{ id: 'atlanticCouncil', name: 'Atlantic Council', disabled: false },
                  { id: 'crystallumHordes', name: 'Crystallum Hordes', disabled: true  },
                  { id: 'fed', name: 'Federation of Columbia', disabled: false  },
                  { id: 'vlast', name: 'Vlast', disabled: false  }]

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  addUnit(unitSelection: UnitSelection): void {
    this.currUnitList.push(unitSelection);
    this.currUnitList.sort((a: UnitSelection, b: UnitSelection) => {
      return this.unitTypeSortOrder.indexOf(a.unitType) - this.unitTypeSortOrder.indexOf(b.unitType);
    });
  }

  removeUnit(unitSelection: UnitSelection): void {
    const index = this.currUnitList.indexOf(unitSelection, 0);
    if (index > -1) {
      this.currUnitList.splice(index, 1);
    }
    this.unitSelectionCmp.removeUnit(unitSelection.unitType, unitSelection.id);
  }

  updatePoints(difference: number): void {
    this.currPointsTotal += difference;
    if (this.currPointsTotal > this.pointsLimit) {
      this.isOverPointsLimit = true;
    } else {
      this.isOverPointsLimit = false;
    }
  }

  selectFaction(factionName: string): void {
    if (factionName !== this.currFactionName) {
      this.currFactionName = undefined;
      this.changeDetectorRef.detectChanges();
      this.currUnitList = [];
      this.currPointsTotal = 0;
      this.currFactionName = factionName;
      this.changeDetectorRef.detectChanges();
      this.currFactionLabel = factions[factionName].name;
    }
  }

  toggleGalleryMode(): void {
    this.isGalleryMode = !this.isGalleryMode;
    this.weaponSummary.clear();

    this.unitEntries.forEach(ue => {
      ue.toggleGalleryMode(this.isGalleryMode);
    });

    this.changeDetectorRef.detectChanges();
  }

  addWeapons(weapons: Weapon[]): void {
    // console.log(JSON.stringify(weapons));
    weapons.forEach(weap => {
      if (!this.weaponSummary.has(weap.id)) {
        this.weaponSummary.set(weap.id, weap);
      }
    });
  }

  getWeaponEntries(): Weapon[] {
    const res: Weapon[] = [];
    const it = this.weaponSummary.values();
    let weap = it.next();
    while (!weap.done) {
      res.push(weap.value);
      weap = it.next();
    }
    res.sort(weaponSort);
    return res;
  }
}
