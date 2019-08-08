import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMyWorkplacesComponent } from './view-my-workplaces.component';

describe('ViewMyWorkplacesComponent', () => {
  let component: ViewMyWorkplacesComponent;
  let fixture: ComponentFixture<ViewMyWorkplacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewMyWorkplacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMyWorkplacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
