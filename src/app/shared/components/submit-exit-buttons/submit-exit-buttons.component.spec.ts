import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitExitButtonsComponent } from './submit-exit-buttons.component';

describe('SubmitExitButtonsComponent', () => {
  let component: SubmitExitButtonsComponent;
  let fixture: ComponentFixture<SubmitExitButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitExitButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitExitButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
