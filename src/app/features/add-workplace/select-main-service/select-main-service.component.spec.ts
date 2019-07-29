import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMainServiceComponent } from './select-main-service.component';

describe('SelectMainServiceComponent', () => {
  let component: SelectMainServiceComponent;
  let fixture: ComponentFixture<SelectMainServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectMainServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMainServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
