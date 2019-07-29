import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectWorkplaceAddress } from './select-workplace-address';

describe('SelectWorkplaceAddress', () => {
  let component: SelectWorkplaceAddress;
  let fixture: ComponentFixture<SelectWorkplaceAddress>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectWorkplaceAddress],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectWorkplaceAddress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
