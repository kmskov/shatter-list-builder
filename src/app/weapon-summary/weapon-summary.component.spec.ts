import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeaponSummaryComponent } from './weapon-summary.component';

describe('WeaponSummaryComponent', () => {
  let component: WeaponSummaryComponent;
  let fixture: ComponentFixture<WeaponSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeaponSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeaponSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
