import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisabilityComponent } from './disability.component';

describe('DisabilityComponent', () => {
  let component: DisabilityComponent;
  let fixture: ComponentFixture<DisabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DisabilityComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
