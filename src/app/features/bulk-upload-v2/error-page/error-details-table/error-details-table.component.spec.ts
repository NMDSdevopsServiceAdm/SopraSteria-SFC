import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorDetailsTableComponent } from './error-details-table.component';

describe('ErrorDetailsTableComponent', () => {
  let component: ErrorDetailsTableComponent;
  let fixture: ComponentFixture<ErrorDetailsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorDetailsTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorDetailsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
