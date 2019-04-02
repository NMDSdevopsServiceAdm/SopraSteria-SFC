import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmStartersComponent } from './confirm-starters.component';

describe('ConfirmStartersComponent', () => {
  let component: ConfirmStartersComponent;
  let fixture: ComponentFixture<ConfirmStartersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmStartersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmStartersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
