import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewWorkplaceComponent } from './view-workplace.component';

describe('WorkplaceSummaryComponent', () => {
  let component: ViewWorkplaceComponent;
  let fixture: ComponentFixture<ViewWorkplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewWorkplaceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewWorkplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
