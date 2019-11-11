import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectWorkplace } from './select-workplace';

describe('SelectWorkplace', () => {
  let component: SelectWorkplace;
  let fixture: ComponentFixture<SelectWorkplace>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectWorkplace],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectWorkplace);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
