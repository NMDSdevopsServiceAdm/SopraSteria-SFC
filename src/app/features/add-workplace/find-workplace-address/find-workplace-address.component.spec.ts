import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindWorkplaceAddressComponent } from './find-workplace-address.component';

describe('FindWorkplaceAddressComponent', () => {
  let component: FindWorkplaceAddressComponent;
  let fixture: ComponentFixture<FindWorkplaceAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindWorkplaceAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindWorkplaceAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
