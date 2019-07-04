import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffReferencesPageComponent } from './staff-references-page.component';

describe('WorkplaceReferencesPageComponent', () => {
  let component: StaffReferencesPageComponent;
  let fixture: ComponentFixture<StaffReferencesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffReferencesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffReferencesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
