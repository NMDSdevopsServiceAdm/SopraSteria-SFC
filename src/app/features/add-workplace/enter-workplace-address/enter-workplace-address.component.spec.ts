import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterWorkplaceAddressComponent } from './enter-workplace-address.component';

describe('EnterWorkplaceAddressComponent', () => {
  let component: EnterWorkplaceAddressComponent;
  let fixture: ComponentFixture<EnterWorkplaceAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterWorkplaceAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterWorkplaceAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
