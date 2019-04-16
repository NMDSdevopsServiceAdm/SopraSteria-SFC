import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationCompleteComponent } from './registration-complete.component';

describe('RegistrationCompleteComponent', () => {
  let component: RegistrationCompleteComponent;
  let fixture: ComponentFixture<RegistrationCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrationCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
