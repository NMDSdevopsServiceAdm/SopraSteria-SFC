import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordEditComponent } from './edit.component';

describe('ResetPasswordEditComponent', () => {
  let component: ResetPasswordEditComponent;
  let fixture: ComponentFixture<ResetPasswordEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResetPasswordEditComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
