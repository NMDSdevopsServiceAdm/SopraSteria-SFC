import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YearArrivedUkComponent } from './year-arrived-uk.component';

describe('YearArrivedUkComponent', () => {
  let component: YearArrivedUkComponent;
  let fixture: ComponentFixture<YearArrivedUkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [YearArrivedUkComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YearArrivedUkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
