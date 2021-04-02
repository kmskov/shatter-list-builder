import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Project Shatter - List Builder';

  currFaction = 'vlast';
  currUnitType = 'hq';
  currUnitTypeIndex = 0;

  // [faction]="currFaction" [unitType]="currUnitType" [unitTypeIndex]="currUnitTypeIndex"
}
