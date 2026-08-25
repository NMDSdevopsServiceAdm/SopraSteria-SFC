import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ReviewAndConfirmNurseFieldOfPracticeComponent } from './review-and-confirm-nurse-field-of-practice.component';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

const mockFieldsOfPractice = [
  { id: 1, label: 'Adult nursing' },
  { id: 2, label: 'Mental health nursing' },
  { id: 3, label: 'Learning disabilities nursing' },
  { id: 4, label: "Children's nursing" },
];

fdescribe('ReviewAndConfirmNurseFieldOfPracticeComponent', () => {
  const defaultNurses = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];

  const setup = async (overrides: any = {}) => {
    const mockNurses = overrides.mockNurses ?? defaultNurses;
    const routerSpy = jasmine.createSpy('navigate').and.resolveTo(true);

    const setuptools = await render(ReviewAndConfirmNurseFieldOfPracticeComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: AlertService,
          useValue: { addAlert: () => {} },
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { registeredNurses: mockNurses, allNurseFieldsOfPractice: mockFieldsOfPractice },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const fixture = setuptools.fixture;
    const component = fixture.componentInstance;
    fixture.autoDetectChanges();

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);

    const updateWorkersSpy = spyOn(establishmentService, 'updateWorkers').and.returnValue(of({}));
    const workerService = injector.inject(WorkerService);

    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const router = injector.inject(Router) as Router;
    router.navigate = routerSpy;

    return {
      ...setuptools,
      component,
      fixture,
      establishmentService,
      workerService,
      alertServiceSpy,
      router,
      routerSpy,
      updateWorkersSpy,
    };
  };

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a heading and a caption (section heading)', async () => {
    const { getByRole, getByTestId } = await setup();

    const heading = getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain(
      "Review and confirm these nurses' Nursing and Midwifery Council fields of practice",
    );

    const caption = getByTestId('caption');
    expect(caption.textContent).toEqual('Staff records');
  });

  it('should show a link to nursing and midwifery council register', async () => {
    const { getByRole } = await setup();

    const expectedLinkText = /Search the Nursing and Midwifery Council register/;

    expect(getByRole('link', { name: expectedLinkText })).toBeTruthy();
  });

  describe('table with form', () => {
    it('should show a table which list every registered nurse in the workplace', async () => {
      const { getByTestId } = await setup();

      defaultNurses.forEach((nurse, index) => {
        const nurseRow = getByTestId(`worker-row-${index}`);
        expect(within(nurseRow).getByText(nurse.nameOrId)).toBeTruthy();
      });
    });

    it('should show in each row a toggle button and checkboxes for every nurse field of practice', async () => {
      const { getByTestId } = await setup();

      defaultNurses.forEach((_nurse, index) => {
        const nurseRow = getByTestId(`worker-row-${index}`);
        expect(within(nurseRow).getByText('Add details')).toBeTruthy();

        const answerCell = within(nurseRow).getByTestId(`worker-answer-${index}`);
        expect(answerCell.textContent.trim()).toEqual('-');

        mockFieldsOfPractice.forEach((field) => {
          const checkbox = within(nurseRow).getByRole('checkbox', { name: field.label }) as HTMLInputElement;
          expect(checkbox).toBeTruthy();
          expect(checkbox.checked).toBeFalse();
        });
      });
    });

    it('should show / hide the checkboxes when toggle button is clicked', async () => {
      const { getByTestId } = await setup();

      const nurseRow = getByTestId('worker-row-0');

      const checkboxes = getByTestId('worker-checkboxes-0');
      expect(checkboxes).toHaveClass('govuk-visually-hidden');

      userEvent.click(within(nurseRow).getByText('Add details'));
      expect(checkboxes).not.toHaveClass('govuk-visually-hidden');

      userEvent.click(within(nurseRow).getByText('Hide details'));
      expect(checkboxes).toHaveClass('govuk-visually-hidden');
    });

    const nurseA = workerBuilder({
      overrides: { nurseFieldOfPractice: [mockFieldsOfPractice[0], mockFieldsOfPractice[1]] },
    }) as Worker;
    const nurseB = workerBuilder({
      overrides: { nurseFieldOfPractice: [mockFieldsOfPractice[2], mockFieldsOfPractice[1]] },
    }) as Worker;

    it('should prefill the previous answers for nurse questions', async () => {
      const mockNurses = [nurseA, nurseB];
      const { getByTestId } = await setup({ mockNurses });

      mockNurses.forEach((nurse, index) => {
        const nurseRow = getByTestId(`worker-row-${index}`);
        expect(within(nurseRow).getByText('Change details')).toBeTruthy();

        const answerCell = within(nurseRow).getByTestId(`worker-answer-${index}`);

        const previousAnswers = nurse.nurseFieldOfPractice!;
        expect(previousAnswers.length).toBeGreaterThan(0);

        previousAnswers.forEach((field) => {
          expect(answerCell.textContent.trim()).toContain(field.label);
        });

        mockFieldsOfPractice.forEach((field) => {
          const checkbox = within(nurseRow).getByRole('checkbox', { name: field.label }) as HTMLInputElement;

          const shouldBeTicked = previousAnswers.some((answer) => answer.id === field.id);

          expect(checkbox.checked).toEqual(shouldBeTicked);
        });
      });
    });

    it('should update the fields chosen when user tick or untick the checkboxes', async () => {
      const { getByTestId } = await setup({ mockNurses: [nurseA] });

      const nurseRow = getByTestId(`worker-row-0`);
      expect(within(nurseRow).getByText('Change details')).toBeTruthy();

      const answerCell = within(nurseRow).getByTestId('worker-answer-0');

      const previousAnswers = nurseA.nurseFieldOfPractice!;
      expect(previousAnswers.length).toBeGreaterThan(0);

      previousAnswers.forEach((field) => {
        expect(answerCell.textContent.trim()).toContain(field.label);
      });

      // untick answer 0
      const checkboxA = within(nurseRow).getByRole('checkbox', { name: previousAnswers[0].label }) as HTMLInputElement;
      userEvent.click(checkboxA);

      expect(answerCell.textContent.trim()).not.toContain(previousAnswers[0].label);

      // untick answer 1
      const checkboxB = within(nurseRow).getByRole('checkbox', { name: previousAnswers[1].label }) as HTMLInputElement;
      userEvent.click(checkboxB);

      // should show a dash "-" when all checkbox unticked
      expect(answerCell.textContent.trim()).toEqual('-');

      // tick a new answer
      const newAnswer = mockFieldsOfPractice[3];
      const checkboxC = within(nurseRow).getByRole('checkbox', { name: newAnswer.label }) as HTMLInputElement;
      userEvent.click(checkboxC);

      expect(answerCell.textContent.trim()).toEqual(newAnswer.label);
    });
  });

  describe('form submit', () => {
    it('should show a submit button and a cancel link', async () => {
      const { getByRole, getByText } = await setup();

      const button = getByRole('button', { name: 'Confirm all details' });
      const cancelLink = getByText('Cancel');

      expect(button).toBeTruthy();
      expect(cancelLink.getAttribute('href')).toContain('/dashboard#home');
    });

    it('should call updateWorkers on submit', async () => {
      const { getByRole, getByTestId, updateWorkersSpy } = await setup();

      const button = getByRole('button', { name: 'Confirm all details' });

      const nurseRowA = getByTestId(`worker-row-0`);
      const chosenAnswersA = [0, 2, 3].map((index) => mockFieldsOfPractice[index]);

      chosenAnswersA.forEach((field) => {
        const checkbox = within(nurseRowA).getByRole('checkbox', { name: field.label });
        userEvent.click(checkbox);
      });

      const nurseRowB = getByTestId(`worker-row-1`);
      const chosenAnswersB = [1, 3].map((index) => mockFieldsOfPractice[index]);

      chosenAnswersB.forEach((field) => {
        const checkbox = within(nurseRowB).getByRole('checkbox', { name: field.label });
        userEvent.click(checkbox);
      });

      userEvent.click(button);

      expect(updateWorkersSpy).toHaveBeenCalledWith('mocked-uid', [
        { uid: defaultNurses[0].uid, nurseFieldOfPractice: chosenAnswersA },
        { uid: defaultNurses[1].uid, nurseFieldOfPractice: chosenAnswersB },
      ]);
    });

    it('should return to home dashboard with an alert message on submit', async () => {
      const { fixture, getByRole, getByTestId, alertServiceSpy } = await setup();

      const button = getByRole('button', { name: 'Confirm all details' });

      const nurseRowA = getByTestId(`worker-row-0`);
      const chosenAnswersA = [0, 2, 3].map((index) => mockFieldsOfPractice[index]);

      chosenAnswersA.forEach((field) => {
        const checkbox = within(nurseRowA).getByRole('checkbox', { name: field.label });
        userEvent.click(checkbox);
      });

      userEvent.click(button);

      await fixture.whenStable();

      expect(alertServiceSpy).toHaveBeenCalledWith({ type: 'success', message: 'NMC fields of practice confirmed' });
    });
  });
});
