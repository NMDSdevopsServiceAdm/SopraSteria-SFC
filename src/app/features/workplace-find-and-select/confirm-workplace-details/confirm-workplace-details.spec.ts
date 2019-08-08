import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmWorkplaceDetails } from './confirm-workplace-details';

describe('ConfirmWorkplaceDetails', () => {
  let component: ConfirmWorkplaceDetails;
  let fixture: ComponentFixture<ConfirmWorkplaceDetails>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmWorkplaceDetails],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmWorkplaceDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
