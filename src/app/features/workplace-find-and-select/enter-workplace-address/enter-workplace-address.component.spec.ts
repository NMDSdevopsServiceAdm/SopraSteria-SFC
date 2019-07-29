import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EnterWorkplaceAddress } from './enter-workplace-address';

describe('EnterWorkplaceAddressComponent', () => {
  let component: EnterWorkplaceAddress;
  let fixture: ComponentFixture<EnterWorkplaceAddress>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EnterWorkplaceAddress],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterWorkplaceAddress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
