import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOtherServicesListComponent } from './select-other-services-list.component';

describe('SelectOtherServicesListComponent', () => {
  let component: SelectOtherServicesListComponent;
  let fixture: ComponentFixture<SelectOtherServicesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectOtherServicesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectOtherServicesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
