import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredActivationLinkComponent } from './expired-activation-link.component';

describe('ExpiredActivationLinkComponent', () => {
  let component: ExpiredActivationLinkComponent;
  let fixture: ComponentFixture<ExpiredActivationLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExpiredActivationLinkComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpiredActivationLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
