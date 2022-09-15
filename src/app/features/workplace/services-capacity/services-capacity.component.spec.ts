import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { QuestionComponent } from '@features/workers/question/question.component';
import { SubmitButtonComponent } from '@shared/components/submit-button/submit-button.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ServicesCapacityComponent } from './services-capacity.component';

describe('ServicesCapacityComponent', () => {
  const setup = async (returnUrl = true) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId, getByLabelText } = await render(
      ServicesCapacityComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
        providers: [
          { provide: BreadcrumbService, useClass: MockBreadcrumbService },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
            useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnUrl),
            deps: [HttpClient],
          },
          FormBuilder,
          ErrorSummaryService,
          SubmitButtonComponent,
          QuestionComponent,
        ],
      },
    );
    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
      queryByTestId,
      getByLabelText,
      routerSpy,
    };
  };

  it('should render a ServicesCapacityComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the section, the question but not the progress bar when not in the flow', async () => {
    const { getByText, getByTestId, queryByTestId } = await setup();

    expect(getByTestId('section-heading')).toBeTruthy();
    expect(getByText(`What's the capacity of your services?`)).toBeTruthy();
    expect(queryByTestId('progress-bar')).toBeFalsy();
  });

  it('should render the progress bar when in the flow', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.return = null;
    fixture.detectChanges();

    expect(getByTestId('progress-bar')).toBeTruthy();
  });

  it('should render the categories that require capacities', async () => {
    const { component, getByText } = await setup();

    const capacities = component.capacities;
    capacities.forEach((capacity) => {
      const questions: any[] = capacity['questions'];
      expect(getByText(capacity['service'])).toBeTruthy();
      questions.forEach((question) => {
        expect(question.question).toBeTruthy();
      });
    });
  });

  describe('error messages', () => {
    describe(`questions inluding the word 'places'`, () => {
      it('should render the correct error message if a decimal number is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Places you have must be a whole number');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number less than 1 is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '0');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a decimal number is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Places being used must be a whole number');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number less than 1 is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '0');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if the number of places being used is greater than the places they have', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const questions: string = capacities[0]['questions'];
        const firstInput = getByLabelText(questions[0]['question']);
        const secondInput = getByLabelText(questions[1]['question']);

        userEvent.type(firstInput, '3');
        userEvent.type(secondInput, '5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number cannot be more than the places you have');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });
    });

    describe(`questions including the word 'bed'`, () => {
      it('should render the correct error message if a decimal number is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Beds you have must be a whole number');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number less than 1 is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '0');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a decimal number is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Beds being used must be a whole number');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number less than 1 is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '0');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if the number of beds being used is greater than the beds they have', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const questions: string = capacities[1]['questions'];
        const firstInput = getByLabelText(questions[0]['question']);
        const secondInput = getByLabelText(questions[1]['question']);

        userEvent.type(firstInput, '3');
        userEvent.type(secondInput, '5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number cannot be more than the beds you have');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });
    });

    describe(`question including the words 'people receiving care'`, () => {
      it(`should render the correct error message if a decimal number is inputted for a question with 'people receiving care' in it`, async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[2]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('People receiving care must be a whole number');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number less than 1 is inputted for the question', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[2]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '0');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[2]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });
    });

    describe(`question including the words 'people using the service'`, () => {
      it(`should render the correct error message if a decimal number is inputted for a question with 'people receiving care' in it`, async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[3]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('People using the service must be a whole number');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number less than 1 is inputted for the question', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[3]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '0');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[3]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = getAllByText('Number must be between 1 and 999');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toEqual(2);
      });
    });
  });
});
