import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeOfEmployerComponent } from './type-of-employer.component';

describe('TypeOfEmployerComponent', () => {
  let component: TypeOfEmployerComponent;
  let fixture: ComponentFixture<TypeOfEmployerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeOfEmployerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeOfEmployerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
