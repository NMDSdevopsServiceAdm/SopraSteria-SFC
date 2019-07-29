import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FindWorkplaceAddress } from './find-workplace-address';

describe('FindWorkplaceAddress', () => {
  let component: FindWorkplaceAddress;
  let fixture: ComponentFixture<FindWorkplaceAddress>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FindWorkplaceAddress],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindWorkplaceAddress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
