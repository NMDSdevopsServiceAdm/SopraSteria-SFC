import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaversComponent } from './leavers.component';

describe('LeaversComponent', () => {
  let component: LeaversComponent;
  let fixture: ComponentFixture<LeaversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaversComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
