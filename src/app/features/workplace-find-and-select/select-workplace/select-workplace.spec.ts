import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectWorkplaceComponent } from './select-workplace';

describe('SelectWorkplaceComponent', () => {
  let component: SelectWorkplaceComponent;
  let fixture: ComponentFixture<SelectWorkplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectWorkplaceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectWorkplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
