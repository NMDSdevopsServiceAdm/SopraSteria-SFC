import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SubmitExitButtonsComponent } from './submit-exit-buttons.component';

describe('SubmitExitButtonsComponent', () => {
  let component: SubmitExitButtonsComponent;
  let fixture: ComponentFixture<SubmitExitButtonsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [],
        declarations: [SubmitExitButtonsComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitExitButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
