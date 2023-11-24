import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SubmitExitButtonsComponent } from './submit-exit-buttons.component';

describe('SubmitExitButtonsComponent', () => {
  let component: SubmitExitButtonsComponent;
  let fixture: ComponentFixture<SubmitExitButtonsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [SubmitExitButtonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitExitButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
