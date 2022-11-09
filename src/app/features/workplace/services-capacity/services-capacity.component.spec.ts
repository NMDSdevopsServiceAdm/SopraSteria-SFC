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
    const { fixture, getByText, getByTestId, queryByText, queryByTestId, getByLabelText } = await render(
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
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][0];
        const input = getByLabelText(question['question']);

        console.log(capacities[0]);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number of places you have must be a whole number';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a number less than 1 is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, queryByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '-1');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
        expect(queryByText('Number cannot be more than the places you have')).toBeFalsy();
        expect(queryByText(`Number cannot be more than the places you have (${service})`)).toBeFalsy();
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a decimal number is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number of places being used must be a whole number';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a number less than 1 is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '0');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[0]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if the number of places being used is greater than the places they have', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const questions: string = capacities[0]['questions'];
        const firstInput = getByLabelText(questions[0]['question']);
        const secondInput = getByLabelText(questions[1]['question']);

        userEvent.type(firstInput, '3');
        userEvent.type(secondInput, '5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number cannot be more than the places you have';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if the number of places being used has a number but the places they have is blank', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const questions: string = capacities[0]['questions'];
        const secondInput = getByLabelText(questions[1]['question']);

        userEvent.type(secondInput, '5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Enter how many places you have at the moment';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render only the min error message if first input has 0 and the second input has a number', async () => {
        const { component, fixture, getByText, getByLabelText, queryByText } = await setup();

        const capacities: any[] = component.capacities;
        const questions: string = capacities[0]['questions'];
        const firstInput = getByLabelText(questions[0]['question']);
        const secondInput = getByLabelText(questions[1]['question']);

        userEvent.type(firstInput, '0');
        userEvent.type(secondInput, '5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
        expect(queryByText('Number cannot be more than the places you have')).toBeFalsy();
        expect(queryByText(`Number cannot be more than the places you have (${service})`)).toBeFalsy();
      });

      it('should render only one error message on the second input if the second input is greater than first and it is outside of the number bounds', async () => {
        const { component, fixture, getByText, getByLabelText, queryByText } = await setup();

        const capacities: any[] = component.capacities;
        const questions: string = capacities[0]['questions'];
        const firstInput = getByLabelText(questions[0]['question']);
        const secondInput = getByLabelText(questions[1]['question']);

        userEvent.type(firstInput, '4');
        userEvent.type(secondInput, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
        expect(queryByText('Number cannot be more than the places you have')).toBeFalsy();
        expect(queryByText(`Number cannot be more than the places you have (${service})`)).toBeFalsy();
      });

      it('should render error on both inputs if the first input has a value less than 1 and the second input has a value in bounds', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const questions: string = capacities[0]['questions'];
        const firstInput = getByLabelText(questions[0]['question']);
        const secondInput = getByLabelText(questions[1]['question']);

        userEvent.type(firstInput, '-1');
        userEvent.type(secondInput, '10');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const firstErrorMessage = 'Number must be between 1 and 999';
        const secondErrorMessage = 'Number cannot be more than the places you have';
        const service = capacities[0].service.split(': ')[1];
        expect(getByText(firstErrorMessage)).toBeTruthy();
        expect(getByText(`${firstErrorMessage} (${service})`)).toBeTruthy();
        expect(getByText(secondErrorMessage)).toBeTruthy();
        expect(getByText(`${secondErrorMessage} (${service})`)).toBeTruthy();
      });
    });

    describe(`questions including the word 'bed'`, () => {
      it('should render the correct error message if a decimal number is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number of beds you have must be a whole number';
        const service = capacities[1].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a number less than 1 is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText, queryByText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '-1');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[1].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
        expect(queryByText('Number cannot be more than the beds you have')).toBeFalsy();
        expect(queryByText(`Number cannot be more than the beds you have (${service})`)).toBeFalsy();
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question that is first in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[1].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a decimal number is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number of beds being used must be a whole number';
        const service = capacities[1].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a number less than 1 is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '0');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[1].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question that is second in the sequence', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[1]['questions'][1];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[1].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if the number of beds being used is greater than the beds they have', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const questions: string = capacities[1]['questions'];
        const firstInput = getByLabelText(questions[0]['question']);
        const secondInput = getByLabelText(questions[1]['question']);

        userEvent.type(firstInput, '3');
        userEvent.type(secondInput, '5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number cannot be more than the beds you have';
        const service = capacities[1].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if the number of beds being used has a number but the beds they have is blank', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const questions: string = capacities[1]['questions'];
        const secondInput = getByLabelText(questions[1]['question']);

        userEvent.type(secondInput, '5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Enter how many beds you have';
        const service = capacities[1].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render only the min error message if first input has 0 and the second input has a number', async () => {
        const { component, fixture, getByText, getByLabelText, queryByText } = await setup();

        const capacities: any[] = component.capacities;
        const questions: string = capacities[1]['questions'];
        const firstInput = getByLabelText(questions[0]['question']);
        const secondInput = getByLabelText(questions[1]['question']);

        userEvent.type(firstInput, '0');
        userEvent.type(secondInput, '5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[1].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
        expect(queryByText('Number cannot be more than the beds you have')).toBeFalsy();
        expect(queryByText(`Number cannot be more than the beds you have (${service})`)).toBeFalsy();
      });
    });

    describe(`question including the words 'people receiving care'`, () => {
      it(`should render the correct error message if a decimal number is inputted for a question with 'people receiving care' in it`, async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[2]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number of people receiving care must be a whole number';
        const service = capacities[2].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a number less than 1 is inputted for the question', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[2]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '0');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[2].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[2]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[2].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });
    });

    describe(`question including the words 'people using the service'`, () => {
      it(`should render the correct error message if a decimal number is inputted for a question with 'people receiving care' in it`, async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[3]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '3.5');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number of people using the service must be a whole number';
        const service = capacities[3].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a number less than 1 is inputted for the question', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[3]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '0');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[3].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });

      it('should render the correct error message if a number greater than 999 is inputted for the question', async () => {
        const { component, fixture, getByText, getByLabelText } = await setup();

        const capacities: any[] = component.capacities;
        const question: string = capacities[3]['questions'][0];
        const input = getByLabelText(question['question']);

        userEvent.type(input, '1000');
        userEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        const errorMessage = 'Number must be between 1 and 999';
        const service = capacities[3].service.split(': ')[1];
        expect(getByText(errorMessage)).toBeTruthy();
        expect(getByText(`${errorMessage} (${service})`)).toBeTruthy();
      });
    });
  });
});
