import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmLeaversComponent } from './confirm-leavers.component';

describe('ConfirmLeaversComponent', () => {
  let component: ConfirmLeaversComponent;
  let fixture: ComponentFixture<ConfirmLeaversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmLeaversComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmLeaversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
