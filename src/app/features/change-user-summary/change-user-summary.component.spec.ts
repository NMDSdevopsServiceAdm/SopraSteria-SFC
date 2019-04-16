import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeUserSummaryComponent } from './change-user-summary.component';

describe('ChangeUserSummaryComponent', () => {
  let component: ChangeUserSummaryComponent;
  let fixture: ComponentFixture<ChangeUserSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeUserSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeUserSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
