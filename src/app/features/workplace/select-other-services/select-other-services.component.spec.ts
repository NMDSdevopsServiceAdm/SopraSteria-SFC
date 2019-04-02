import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOtherServicesComponent } from './select-other-services.component';

describe('SelectOtherServicesComponent', () => {
  let component: SelectOtherServicesComponent;
  let fixture: ComponentFixture<SelectOtherServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectOtherServicesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectOtherServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
