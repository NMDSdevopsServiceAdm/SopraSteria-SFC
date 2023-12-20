import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InsetTextComponent } from './inset-text.component';

describe('InsetTextComponent', () => {
  let component: InsetTextComponent;
  let fixture: ComponentFixture<InsetTextComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [InsetTextComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(InsetTextComponent);
    component = fixture.componentInstance;
    component.color = 'todo';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
