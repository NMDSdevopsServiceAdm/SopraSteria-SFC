import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectWorkplaceAddressComponent } from './select-workplace-address.component';

describe('SelectWorkplaceAddressComponent', () => {
  let component: SelectWorkplaceAddressComponent;
  let fixture: ComponentFixture<SelectWorkplaceAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectWorkplaceAddressComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectWorkplaceAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
