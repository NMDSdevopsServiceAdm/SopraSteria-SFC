import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSharingComponent } from './data-sharing.component';

describe('StaffComponent', () => {
  let component: DataSharingComponent;
  let fixture: ComponentFixture<DataSharingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DataSharingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
