import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { UnitEntryComponent } from './unit-entry/unit-entry.component';
import { UnitSelectorComponent } from './unit-selector/unit-selector.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { WeaponSummaryComponent } from './weapon-summary/weapon-summary.component';

@NgModule({
  declarations: [
    AppComponent,
    UnitEntryComponent,
    UnitSelectorComponent,
    WeaponSummaryComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatTableModule,
    MatIconModule,
    MatButtonToggleModule,
    MatToolbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
