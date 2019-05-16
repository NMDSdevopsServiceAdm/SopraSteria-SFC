import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSharingWithLocalAuthoritiesComponent } from './data-sharing-with-local-authorities.component';

describe('StaffComponent', () => {
  let component: DataSharingWithLocalAuthoritiesComponent;
  let fixture: ComponentFixture<DataSharingWithLocalAuthoritiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DataSharingWithLocalAuthoritiesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSharingWithLocalAuthoritiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
