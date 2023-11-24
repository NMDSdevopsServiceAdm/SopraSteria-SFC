import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpiredActivationLinkComponent } from './expired-activation-link.component';

describe('ExpiredActivationLinkComponent', () => {
  let component: ExpiredActivationLinkComponent;
  let fixture: ComponentFixture<ExpiredActivationLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpiredActivationLinkComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiredActivationLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
