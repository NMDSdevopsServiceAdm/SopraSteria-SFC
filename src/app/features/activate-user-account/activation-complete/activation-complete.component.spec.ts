import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivationCompleteComponent } from './activation-complete.component';

describe('ActivationCompleteComponent', () => {
  let component: ActivationCompleteComponent;
  let fixture: ComponentFixture<ActivationCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivationCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivationCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
