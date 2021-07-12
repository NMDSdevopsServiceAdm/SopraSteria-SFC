import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameOfWorkplaceComponent } from './name-of-workplace.component';

describe('NameOfWorkplaceComponent', () => {
  let component: NameOfWorkplaceComponent;
  let fixture: ComponentFixture<NameOfWorkplaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NameOfWorkplaceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameOfWorkplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
