import { Component, OnInit, Input } from '@angular/core';
import { Weapon } from '../common';

@Component({
  selector: 'app-weapon-summary',
  templateUrl: './weapon-summary.component.html',
  styleUrls: ['./weapon-summary.component.css']
})
export class WeaponSummaryComponent implements OnInit {

  @Input() weaponList: Weapon[] = [];

  headers: string[] = ['name', 'tags', 'rof', 'range', 'damage'];

  constructor() { }

  ngOnInit(): void {
    this.weaponList.forEach(we => {
      we.tags.sort();
    });
  }

}
