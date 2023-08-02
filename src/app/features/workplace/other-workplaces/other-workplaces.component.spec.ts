import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { QuestionComponent } from '@features/workers/question/question.component';
import { SubmitButtonComponent } from '@shared/components/submit-button/submit-button.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { OtherWorkplacesComponent } from './other-workplaces.component';

describe('OtherWorkplacesComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId } = await render(
      OtherWorkplacesComponent,
      {
        imports: [HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
        providers: [
          { provide: BreadcrumbService, useClass: MockBreadcrumbService },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
        ],
      },
    );
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId };
  };

  it('should render an OtherWorkplacesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the count of other workplaces', async () => {
    const { component, getByText } = await setup();
    expect(getByText('Your other workplaces (3)')).toBeTruthy();
  });
});
