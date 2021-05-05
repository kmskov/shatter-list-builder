import { Component, ViewChild, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { UnitSelection, Weapon, weaponSort, sleep } from './common';
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

  unitEntryDivHeight = 0;

  isGalleryMode = false;

  unitTypeSortOrder: string[] = ['hq', 'core', 'armoredSupport', 'fireSupport', 'airSupport', 'special'];

  factionSummary: any[] = [{ id: 'atlanticCouncil', name: 'Atlantic Council', disabled: false },
  { id: 'crystallumHordes', name: 'Crystallum Hordes', disabled: true },
  { id: 'fed', name: 'Federation of Columbia', disabled: false },
  { id: 'vlast', name: 'Vlast', disabled: false }];

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

  async toggleGalleryMode() {
    const isEnable = !this.isGalleryMode;

    this.weaponSummary.clear();

    this.unitEntries.forEach(ue => {
      ue.toggleGalleryMode(isEnable);
    });
    await sleep(200);

    if (isEnable) {
      this.getUnitEntryComponentsHeights();
      this.unitEntryDivHeight = this.getUnitEntryElementHeight();
    }

    this.isGalleryMode = !this.isGalleryMode;
    this.changeDetectorRef.detectChanges();
  }

  getUnitEntryComponentsHeights(): number[] {
    const unitEntryHeights: number[] = [];
    this.unitEntries.forEach(ue => {
      unitEntryHeights.push(ue.getComponentHeight());
    });
    return unitEntryHeights;
  }

  getUnitEntryElementHeight(): number {
    const unitEntryHeights: number[] = this.getUnitEntryComponentsHeights();
    let i = 1;
    let j = unitEntryHeights.length - 1;

    let hc1 = unitEntryHeights[0];
    let hc2 = 0;

    do {
      if (hc1 <= hc2) {
        hc1 += unitEntryHeights[i];
        i += 1;
      } else {
        hc2 += unitEntryHeights[j];
        j -= 1;
      }
      console.log('i: ' + i + ', hc1: ' + hc1 + ', j: ' + j + ', hc2: ' + hc2);
    } while (i <= j);

    return hc1 >= hc2 ? hc1 + 10 : hc2 + 10;
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
