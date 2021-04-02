import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { UnitEntryComponent } from './unit-entry/unit-entry.component';
import { UnitSelectorComponent } from './unit-selector/unit-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    UnitEntryComponent,
    UnitSelectorComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
