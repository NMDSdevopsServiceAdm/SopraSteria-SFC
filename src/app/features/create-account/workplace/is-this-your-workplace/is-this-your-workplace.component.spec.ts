import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsThisYourWorkplaceComponent } from './is-this-your-workplace.component';

describe('IsThisYourWorkplaceComponent', () => {
  let component: IsThisYourWorkplaceComponent;
  let fixture: ComponentFixture<IsThisYourWorkplaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IsThisYourWorkplaceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IsThisYourWorkplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
