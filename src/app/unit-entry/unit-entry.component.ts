import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import factions from '../factions.json';
import reference from '../reference.json';
import { UnitEntry, UnitUpgrade } from './unit-entry';
import { UnitSelection, Weapon, Ability, weaponSort } from '../common';

@Component({
  selector: 'app-unit-entry',
  templateUrl: './unit-entry.component.html',
  styleUrls: ['./unit-entry.component.css']
})
export class UnitEntryComponent implements OnInit {

  @Input() unitSelection: UnitSelection;

  unitEntry: UnitEntry;

  weaponEntries: Weapon[] = [];
  abilityEntries: Ability[] = [];

  unitTransport: UnitSelection;
  transportPoints = 0;

  isExpanded = true;
  isGalleryMode = false;

  @ViewChild(UnitEntryComponent) unitTransportEntryCmp: UnitEntryComponent;

  @Output() unitRemovalEvent = new EventEmitter<UnitSelection>();
  @Output() pointsUpdateEvent = new EventEmitter<number>();
  @Output() weaponsExportEvent = new EventEmitter<Weapon[]>();

  constructor(private el: ElementRef, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    // console.log('unit-entry.ngOnInit starting');

    const factionUnit = factions[this.unitSelection.factionName][this.unitSelection.unitType].find(i => i.id === this.unitSelection.id);
    this.unitEntry = (JSON.parse(JSON.stringify(factionUnit))); // Deep clone

    this.loadUpgrades();
    this.loadWeapons();
    this.loadAbilities();

    this.unitEntry.currentPoints = 0;
    this.recalcTotalUnitPoints();

    // console.log('unit-entry.ngOnInit finished');
  }

  getComponentHeight(): number {
    return this.el.nativeElement.offsetHeight;
  }

  setExpanded(): void {
    this.isExpanded = false;
  }

  loadUpgrades(): void {
    this.unitEntry.upgrades.forEach(upgradeEntry => {
      if (upgradeEntry.upgradeType.type === 'weapon') {
        const newWeapon: Weapon = (JSON.parse(JSON.stringify(reference.weapons.find(i => i.id === upgradeEntry.upgradeType.id))));
        newWeapon.active = false;
        this.weaponEntries.push(newWeapon);
      } else if (upgradeEntry.upgradeType.type === 'ability') {
        const newAbility: Ability = (JSON.parse(JSON.stringify(reference.abilities.find(i => i.id === upgradeEntry.upgradeType.id))));
        newAbility.active = false;
        this.abilityEntries.push(newAbility);
      }

      if (!upgradeEntry.hasOwnProperty('limit')) {
        upgradeEntry.limitValue = 1;
      } else if (upgradeEntry.limit === 'baseCount') {
        upgradeEntry.limitValue = this.unitEntry.squadComposition;
      } else { // it's a number
        upgradeEntry.limitValue = upgradeEntry.limit;
      }

      if (upgradeEntry.cost === undefined) {
        upgradeEntry.cost = 0;
      }

      upgradeEntry.current = 0;
      upgradeEntry.disabled = false;

      if (upgradeEntry.upgradeType.mutuallyExclusive === undefined) {
        upgradeEntry.upgradeType.mutuallyExclusive = [];
      }
    });
  }

  loadWeapons(): void {
    this.unitEntry.weapons.forEach(weapon => {
      const weaponEntry: Weapon = (JSON.parse(JSON.stringify(reference.weapons.find(i => i.id === weapon))));
      weaponEntry.active = true;
      this.weaponEntries.push(weaponEntry);
    });

    this.weaponEntries.sort(weaponSort);
  }

  loadAbilities(): void {
    this.unitEntry.abilities.forEach(ability => {
      const abilityEntry: Ability = (JSON.parse(JSON.stringify(reference.abilities.find(i => i.id === ability))));
      abilityEntry.active = true;
      abilityEntry.base = true;
      this.abilityEntries.push(abilityEntry);
    });
  }

  addUpgrade(upgrade: UnitUpgrade): void {
    upgrade.current += 1;

    this.disableMutExUpgrades(upgrade, true);

    switch (upgrade.upgradeType.type) {
      case 'weapon':
        const mutExWeapons = upgrade.upgradeType.mutuallyExclusive;
        this.weaponEntries.forEach(we => {
          if (upgrade.upgradeType.id === we.id) {
            we.active = true;
            if (upgrade.limitValue > 1) {
              we.number = upgrade.current;
            }
          } else if (mutExWeapons.includes(we.id)) {
            we.active = false;
          }
        });
        break;
      case 'ability':
        const mutExAbilities = upgrade.upgradeType.mutuallyExclusive;
        this.abilityEntries.forEach(ab => {
          if (upgrade.upgradeType.id === ab.id) {
            ab.active = true;
          } else if (mutExAbilities.includes(ab.id)) {
            ab.active = false;
          }
        });
        break;
      case 'extraBase':
        this.unitEntry.squadComposition += 1;
        this.updateAllBaseCountLimits();
        break;
      case 'transport':
        if (this.unitTransport === undefined) {
          this.unitTransport = { factionName: this.unitSelection.factionName, unitType: 'transport', id: upgrade.upgradeType.id };
        } else {
          this.unitTransportEntryCmp.addTransport(1);
        }
        if (upgrade.limit === 'baseCount') {
          this.updateBaseCountLimit(upgrade, upgrade.upgradeType.id);
        }
        break;
      case 'unitTag':
        this.unitEntry.unitTags.push(upgrade.upgradeType.id);
        if (upgrade.upgradeType.hasOwnProperty('mutuallyExclusive')) {
          upgrade.upgradeType.mutuallyExclusive.forEach(mutEx => {
            const tagIndex = this.unitEntry.unitTags.indexOf(mutEx);
            if (tagIndex > -1) {
              this.unitEntry.unitTags.splice(tagIndex, 1);
            }
          });
        }
        break;
      default:
    }

    this.recalcTotalUnitPoints();
  }

  removeUpgrade(upgrade: UnitUpgrade): void {

    if (upgrade.current > 0) {
      upgrade.current -= 1;
    }

    this.disableMutExUpgrades(upgrade, false);

    switch (upgrade.upgradeType.type) {
      case 'weapon':
        this.weaponEntries.forEach(we => {
          if (upgrade.current === 0) {
            if (upgrade.upgradeType.id === we.id) {
              we.active = false;
            } else if (upgrade.upgradeType.mutuallyExclusive.includes(we.id)) {
              we.active = true;
            }
          } else {
            if (upgrade.upgradeType.id === we.id && upgrade.limitValue > 1) {
              we.number = upgrade.current;
            }
          }
        });
        break;
      case 'ability':
        this.abilityEntries.forEach(ab => {
          if (upgrade.upgradeType.id === ab.id) {
            ab.active = false;
          } else if (ab.base && upgrade.upgradeType.mutuallyExclusive.includes(ab.id)) {
            ab.active = true;
          }
        });
        break;
      case 'extraBase':
        this.unitEntry.squadComposition -= 1;
        this.updateAllBaseCountLimits();
        break;
      case 'transport':
        if (upgrade.current === 0) {
          this.unitTransport = undefined;
          this.transportPoints = 0;
        } else {
          this.unitTransportEntryCmp.addTransport(-1);
        }
        if (upgrade.limit === 'baseCount') {
          this.updateBaseCountLimit(upgrade, upgrade.upgradeType.id);
        }
        break;
      case 'unitTag':
        const tagIndex = this.unitEntry.unitTags.indexOf(upgrade.upgradeType.id);
        if (tagIndex > -1) {
          this.unitEntry.unitTags.splice(tagIndex, 1);
        }
        if (upgrade.upgradeType.hasOwnProperty('mutuallyExclusive')) {
          upgrade.upgradeType.mutuallyExclusive.forEach(mutEx => { // Honestly this doesn't work for unit tags that have multiple
            this.unitEntry.unitTags.push(mutEx);                   // mutex tags but there are no such instances yet so...
          });
        }
        break;
      default:
    }

    this.recalcTotalUnitPoints();
  }

  updateAllBaseCountLimits(): void {
    this.unitEntry.upgrades.forEach(upg => {
      if (upg.limit === 'baseCount') {
        this.updateBaseCountLimit(upg, upg.upgradeType.type === 'transport' ? upg.upgradeType.id : undefined);
      }
    });
  }

  updateBaseCountLimit(upgrade: UnitUpgrade, transportId: string): void {
    let transportCapacity = 1;
    if (transportId !== undefined) {
      transportCapacity = factions[this.unitSelection.factionName].transport.find(i => i.id === transportId).transportCapacity;
    }
    upgrade.limitValue = Math.ceil(this.unitEntry.squadComposition / transportCapacity);
  }

  showUpgradeWarning(upgrade: UnitUpgrade): boolean {
    let res = false;
    if (upgrade.current > upgrade.limitValue) {
      res = true;
    } else if (upgrade.upgradeType.type === 'transport' && upgrade.current > 0 && upgrade.current !== upgrade.limitValue) {
      res = true;
    }
    return res;
  }

  addTransport(num: number): void {
    this.unitEntry.squadComposition += num;
    this.updateAllBaseCountLimits();
    this.recalcTotalUnitPoints();
  }

  disableMutExUpgrades(currUpgrade: UnitUpgrade, disable: boolean): void {
    if (currUpgrade.upgradeType.hasOwnProperty('mutuallyExclusive')) {
      const mutExUpgrades = currUpgrade.upgradeType.mutuallyExclusive;

      this.unitEntry.upgrades.forEach(upg => {
        // Find each upgrade that matches the mutex property and where that property value is named in this upgrades list of mutex upgrades
        if (upg.upgradeType.type === currUpgrade.upgradeType.type && mutExUpgrades.includes(upg.upgradeType.id)) {
          upg.disabled = disable;
        }
      });
    }
  }

  recalcTotalUnitPoints(): void {
    let difference = 0;
    let totalPoints = (this.unitEntry.basePoints * this.unitEntry.squadComposition) + this.transportPoints;

    this.unitEntry.upgrades.forEach(upg => {
      if (upg.current > 0 && upg.upgradeType.type !== 'extraBase') {
        if (upg.hasOwnProperty('multiplyCostByBases')) {
          totalPoints += upg.cost * this.unitEntry.squadComposition;
        } else {
          totalPoints += upg.cost * upg.current;
        }
      }
    });

    difference = totalPoints - this.unitEntry.currentPoints;
    this.unitEntry.currentPoints = totalPoints;
    this.updateListPoints(difference);
  }

  removeUnit(): void {
    this.updateListPoints(-1 * this.unitEntry.currentPoints);
    this.unitRemovalEvent.emit(this.unitSelection);
  }

  updateListPoints(difference: number): void {
    this.pointsUpdateEvent.emit(difference);
  }

  updateTransportPoints(difference: number): void {
    this.transportPoints += difference;
    this.recalcTotalUnitPoints();
  }

  toggleGalleryMode(enable: boolean): void {
    this.isGalleryMode = enable;
    if (this.unitTransportEntryCmp !== undefined) {
      this.unitTransportEntryCmp.toggleGalleryMode(enable);
    }
    if (enable) {
      this.isExpanded = true;
      this.changeDetectorRef.detectChanges();
      const currWeapons: Weapon[] = this.getActiveWeapons();
      if (this.unitTransportEntryCmp !== undefined) {
        this.unitTransportEntryCmp.getActiveWeapons().forEach(we => {
          currWeapons.push(we);
        });
      }
      this.weaponsExportEvent.emit(currWeapons);
    }
  }

  getActiveWeapons(): Weapon[] {
    const currWeapons: Weapon[] = [];
    this.weaponEntries.forEach(curr => {
      if (curr.active) {
        currWeapons.push(curr);
      }
    });
    return currWeapons;
  }

  getAbilityNames(): string[] {
    // console.log(JSON.stringify(this.abilityEntries));
    const res: string[] = [];
    this.abilityEntries.forEach(curr => {
      if (curr.active) {
        let label = curr.label;
        if (curr.type === 'A') {
          label += ' [A]';
        }
        res.push(label);
      }
    });
    return res;
  }
}
