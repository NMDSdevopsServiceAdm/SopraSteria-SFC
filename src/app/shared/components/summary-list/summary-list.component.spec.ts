import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SummaryListComponent } from './summary-list.component';

describe('SummaryListComponent', () => {
  let component: SummaryListComponent;
  let fixture: ComponentFixture<SummaryListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [SummaryListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
