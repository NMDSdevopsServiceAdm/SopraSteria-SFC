import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsetTextComponent, Status } from './inset-text.component';

describe('InsetTextComponent', () => {
  let component: InsetTextComponent;
  let fixture: ComponentFixture<InsetTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InsetTextComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsetTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
