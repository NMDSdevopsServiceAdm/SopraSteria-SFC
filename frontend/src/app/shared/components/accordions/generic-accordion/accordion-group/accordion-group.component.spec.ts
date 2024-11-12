import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionGroupComponent } from './accordion-group.component';

describe('AccordionGroupComponent', () => {
  let component: AccordionGroupComponent;
  let fixture: ComponentFixture<AccordionGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccordionGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccordionGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
