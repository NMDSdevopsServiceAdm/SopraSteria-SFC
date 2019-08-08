import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffRecordsTabComponent } from './staff-records-tab.component';

describe('StaffRecordsTabComponent', () => {
  let component: StaffRecordsTabComponent;
  let fixture: ComponentFixture<StaffRecordsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StaffRecordsTabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffRecordsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
