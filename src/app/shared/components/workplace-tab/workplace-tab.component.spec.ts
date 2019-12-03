import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NumericAnswerPipe } from '@shared/pipes/numeric-answer.pipe';

import { Establishment } from '../../../../mockdata/establishment';
import { EligibilityIconComponent } from '../eligibility-icon/eligibility-icon.component';
import { InsetTextComponent } from '../inset-text/inset-text.component';
import { SummaryRecordValueComponent } from '../summary-record-value/summary-record-value.component';
import { WorkplaceSummaryComponent } from '../workplace-summary/workplace-summary.component';
import { WorkplaceTabComponent } from './workplace-tab.component';

describe('WorkplaceTabComponent', () => {
  let component: WorkplaceTabComponent;
  let fixture: ComponentFixture<WorkplaceTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [
        WorkplaceTabComponent,
        WorkplaceSummaryComponent,
        InsetTextComponent,
        SummaryRecordValueComponent,
        NumericAnswerPipe,
        EligibilityIconComponent
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceTabComponent);
    component = fixture.componentInstance;
    component.workplace = Establishment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
