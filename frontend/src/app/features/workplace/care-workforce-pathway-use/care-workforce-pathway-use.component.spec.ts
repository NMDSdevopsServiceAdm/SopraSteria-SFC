import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CareWorkforcePathwayUseReason } from '@core/model/care-workforce-pathway.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { SharedModule } from '@shared/shared.module';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { repeat } from 'lodash';
import { of, throwError } from 'rxjs';

import { CareWorkforcePathwayUseComponent } from './care-workforce-pathway-use.component';

describe('CareWorkforcePathwayUseComponent', () => {
  const RadioButtonLabels = {
    YES: 'Yes, we use the pathway for one or more reasons',
    NO: 'No, we do not currently use the pathway',
    DO_NOT_KNOW: 'I do not know',
  };
  const mockReasons: Array<CareWorkforcePathwayUseReason> = [
    { id: 1, text: "To help define our organisation's values", isOther: false },
    { id: 2, text: 'To help update our job descriptions', isOther: false },
    { id: 10, text: 'For something else', isOther: true },
  ];

  const otherReason = mockReasons[2];

  const getInputByLabel = (labelText: string): HTMLInputElement => {
    return screen.getByLabelText(labelText);
  };

  const setup = async (overrides: any = {}) => {
    const routerSpy = jasmine.createSpy().and.resolveTo(true);
    const backServiceSpy = jasmine.createSpyObj('BackService', ['setBackLink']);

    const setupTools = await render(CareWorkforcePathwayUseComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides.establishmentService ?? {}),
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { careWorkforcePathwayUseReasons: mockReasons } } },
        },
        {
          provide: Router,
          useFactory: MockRouter.factory({
            navigate: routerSpy,
          }),
        },
        {
          provide: BackService,
          useValue: backServiceSpy,
        },
        {
          provide: PreviousRouteService,
          useValue: { getPreviousUrl: () => overrides?.previousUrl, getPreviousPage: () => overrides?.previousPage },
        },
        AlertService,
        WindowRef,
      ],
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);
    const establishmentServiceSpy = spyOn(establishmentService, 'updateCareWorkforcePathwayUse').and.returnValue(
      of({ ...establishmentService.establishment }),
    );

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const component = setupTools.fixture.componentInstance;
    return {
      ...setupTools,
      component,
      establishmentService,
      establishmentServiceSpy,
      routerSpy,
      backServiceSpy,
      alertSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a h1 heading and caption', async () => {
    const { getByRole, getByTestId } = await setup();

    const heading = getByRole('heading', { level: 1 });
    const sectionHeading = getByTestId('section-heading');

    expect(heading.textContent).toContain('Is your workplace using the care workforce pathway?');
    expect(sectionHeading.textContent).toEqual('Recruitment and benefits');
  });

  it('should show a reveal text to explain what is the care workforce pathway', async () => {
    const reveal = "What's the care workforce pathway (CWP)?";
    const revealText = [
      'The care workforce pathway outlines the knowledge, skills, values and behaviours needed for a career in adult social care. It provides a clear career structure for your staff.',
      "You'll use the pathway to set out how staff can gain skills, learn and develop, and progress in their careers.",
      'Read more about the care workforce pathway',
    ];

    const { getByTestId } = await setup();

    const revealElement = getByTestId('reveal-whatsCareWorkforcePathway');
    expect(revealElement.textContent).toContain(reveal);
    revealText.forEach((paragraph) => {
      expect(revealElement.textContent).toContain(paragraph);
    });
  });

  describe('form', () => {
    it('should show radio buttons for answer', async () => {
      const { getByRole } = await setup();

      Object.values(RadioButtonLabels).forEach((label) => {
        expect(getByRole('radio', { name: label })).toBeTruthy();
      });
    });

    it('should show a list of checkboxes for reasons when clicked "Yes"', async () => {
      const { fixture, getByLabelText, getByTestId } = await setup();

      userEvent.click(getByLabelText(RadioButtonLabels.YES));

      fixture.detectChanges();

      const reasonsContainer = getByTestId('reasons');
      expect(reasonsContainer).toBeTruthy();
      expect(reasonsContainer.className).not.toContain('govuk-radios__conditional--hidden');

      mockReasons.forEach((reason) => {
        expect(within(reasonsContainer).getByRole('checkbox', { name: reason.text })).toBeTruthy();
      });
    });

    it('should hide the reason checkboxes by default', async () => {
      const { getByTestId } = await setup();

      const reasonsContainer = getByTestId('reasons');
      expect(reasonsContainer.className).toContain('govuk-radios__conditional--hidden');
    });

    it(`should hide the reason checkboxes when user clicked "No" or "Don't know"`, async () => {
      const { fixture, getByTestId, getByLabelText } = await setup();
      fixture.autoDetectChanges();

      const reasonsContainer = getByTestId('reasons');

      userEvent.click(getByLabelText(RadioButtonLabels.YES));
      expect(reasonsContainer.className).not.toContain('govuk-radios__conditional--hidden');

      userEvent.click(getByLabelText(RadioButtonLabels.NO));
      expect(reasonsContainer.className).toContain('govuk-radios__conditional--hidden');

      userEvent.click(getByLabelText(RadioButtonLabels.YES));
      expect(reasonsContainer.className).not.toContain('govuk-radios__conditional--hidden');

      userEvent.click(getByLabelText(RadioButtonLabels.DO_NOT_KNOW));
      expect(reasonsContainer.className).toContain('govuk-radios__conditional--hidden');
    });

    it('should show a text box when user selected "For something else"', async () => {
      const { fixture, getByLabelText, getByTestId } = await setup();
      fixture.autoDetectChanges();

      userEvent.click(getByLabelText(RadioButtonLabels.YES));
      userEvent.click(getByLabelText(otherReason.text));

      const otherReasonsTextContainer = getByTestId('otherReasonsText');
      const textBox = within(otherReasonsTextContainer).getByRole('textbox', { name: 'Tell us what (optional)' });
      expect(textBox).toBeTruthy();
      expect(otherReasonsTextContainer.className).not.toContain('govuk-checkboxes__conditional--hidden');
    });

    it('should hide the text box when user unticked "For something else"', async () => {
      const { fixture, getByLabelText, getByTestId } = await setup();

      fixture.autoDetectChanges();

      userEvent.click(getByLabelText(RadioButtonLabels.YES));
      const checkbox = getByLabelText(otherReason.text);
      const otherReasonsTextContainer = getByTestId('otherReasonsText');

      userEvent.click(checkbox); // checkbox is ticked
      expect(otherReasonsTextContainer.className).not.toContain('govuk-checkboxes__conditional--hidden');

      userEvent.click(checkbox); // checkbox is unticked
      expect(otherReasonsTextContainer.className).toContain('govuk-checkboxes__conditional--hidden');
    });

    [RadioButtonLabels.NO, RadioButtonLabels.DO_NOT_KNOW].forEach((label) => {
      it(`should clear the selected reasons when user clicked "${label}"`, async () => {
        const { fixture, getByLabelText } = await setup();

        fixture.autoDetectChanges();

        userEvent.click(getByLabelText(RadioButtonLabels.YES));

        userEvent.click(getByLabelText(mockReasons[0].text));
        userEvent.click(getByLabelText(otherReason.text));
        userEvent.type(getInputByLabel('Tell us what (optional)'), 'some specific reasons');

        userEvent.click(getByLabelText(label));

        expect(getInputByLabel(mockReasons[0].text).checked).toBeFalse();
        expect(getInputByLabel(otherReason.text).checked).toBeFalse();
        expect(getInputByLabel('Tell us what (optional)').value).toEqual('');
      });
    });

    it('should clear the other reasons text when user untick the reason checkbox', async () => {
      const { fixture, getByLabelText } = await setup();

      fixture.autoDetectChanges();

      userEvent.click(getByLabelText(RadioButtonLabels.YES));

      userEvent.click(getByLabelText(otherReason.text));
      userEvent.type(getInputByLabel('Tell us what (optional)'), 'some free text');

      // untick checkbox
      userEvent.click(getByLabelText(otherReason.text));

      expect(getInputByLabel(otherReason.text).checked).toBeFalse();
      expect(getInputByLabel('Tell us what (optional)').value).toEqual('');
    });

    describe('prefill', () => {
      it('should prefill the form with the establishment data from backend', async () => {
        const mockEstablishment = {
          careWorkforcePathwayUse: {
            use: 'Yes',
            reasons: [
              { id: mockReasons[0].id, isOther: false },
              { id: otherReason.id, other: 'Free text entered for something else', isOther: true },
            ],
          },
        };

        await setup({ establishmentService: { establishment: mockEstablishment } });

        expect(getInputByLabel(RadioButtonLabels.YES).checked).toBeTrue();
        expect(getInputByLabel(RadioButtonLabels.NO).checked).toBeFalse();
        expect(getInputByLabel(RadioButtonLabels.DO_NOT_KNOW).checked).toBeFalse();

        expect(getInputByLabel(mockReasons[0].text).checked).toBeTrue();
        expect(getInputByLabel(mockReasons[1].text).checked).toBeFalse();
        expect(getInputByLabel(otherReason.text).checked).toBeTrue();

        expect(getInputByLabel('Tell us what (optional)').value).toEqual('Free text entered for something else');
      });
    });

    describe('form submit and validation', () => {
      it('should call updateCareWorkforcePathwayUse() method of establishment service', async () => {
        const { getByLabelText, getByText, establishmentServiceSpy } = await setup({
          establishmentService: { returnTo: null },
        });

        userEvent.click(getByLabelText(RadioButtonLabels.YES));

        userEvent.click(getByLabelText(mockReasons[0].text));
        userEvent.click(getByLabelText(otherReason.text));
        userEvent.type(getInputByLabel('Tell us what (optional)'), 'some specific reasons');

        userEvent.click(getByText('Save and continue'));

        const expectedPayload = {
          use: 'Yes' as const,
          reasons: [mockReasons[0], { ...otherReason, other: 'some specific reasons' }],
        };

        expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', expectedPayload);
      });

      it('should not call updateCareWorkforcePathwayUse() if user has not input anything', async () => {
        const { getByText, establishmentServiceSpy } = await setup({
          establishmentService: { returnTo: null },
        });

        userEvent.click(getByText('Save and continue'));

        expect(establishmentServiceSpy).not.toHaveBeenCalled();
      });

      it('should show an error message if "other" text field contain text that is longer than allowed', async () => {
        const { fixture, getByLabelText, getByText, getAllByText, establishmentServiceSpy } = await setup({
          establishmentService: { returnTo: null },
        });

        userEvent.click(getByLabelText(RadioButtonLabels.YES));

        userEvent.click(getByLabelText(mockReasons[0].text));
        userEvent.click(getByLabelText(otherReason.text));
        userEvent.type(getInputByLabel('Tell us what (optional)'), repeat('veryverylongtext', 100));

        userEvent.click(getByText('Save and continue'));

        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getAllByText('Reason must be 120 characters or fewer')).toHaveSize(2);

        expect(establishmentServiceSpy).not.toHaveBeenCalled();
      });

      it('should handle server error', async () => {
        const { fixture, getByText, establishmentServiceSpy } = await setup({
          establishmentService: { returnTo: null },
        });
        establishmentServiceSpy.and.returnValue(
          throwError(new HttpErrorResponse({ error: 'Bad request', status: 400 })),
        );

        userEvent.click(getInputByLabel(RadioButtonLabels.YES));
        userEvent.click(getByText('Save and continue'));

        fixture.detectChanges();

        expect(getByText('Failed to update care workforce pathway usage')).toBeTruthy();
      });
    });
  });

  describe('when in new workplace workflow', async () => {
    const overrides = { establishmentService: { returnTo: null } };

    it('should show a progress bar', async () => {
      const { getByTestId } = await setup(overrides);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should show a "Save and continue" cta button and "Skip this question" link', async () => {
      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should set the previous page to CWP awareness question page', async () => {
      const { component } = await setup(overrides);

      expect(component.previousRoute).toEqual(['/workplace', 'mocked-uid', 'care-workforce-pathway-awareness']);
    });

    it('should navigate to cash-loyalty page when skipped the question', async () => {
      const { getByText, routerSpy, establishmentServiceSpy } = await setup(overrides);

      userEvent.click(getByText('Skip this question'));

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'cash-loyalty']);
      expect(establishmentServiceSpy).not.toHaveBeenCalled();
    });

    it('should navigate to cash-loyalty page after submit', async () => {
      const { getByText, routerSpy, establishmentServiceSpy } = await setup(overrides);

      userEvent.click(getByText('Save and continue'));

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'cash-loyalty']);
      expect(establishmentServiceSpy).not.toHaveBeenCalled();
    });

    it('should set the back link to CWP awareness question', async () => {
      const { backServiceSpy } = await setup(overrides);

      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
        url: ['/workplace', 'mocked-uid', 'care-workforce-pathway-awareness'],
      });
    });
  });

  describe('When coming from summary panel', () => {
    const workplaceName = 'Test workplace name';
    const comingFromSummaryPanelOverrides = {
      establishmentService: {
        returnTo: { url: ['/dashboard'], fragment: 'home' },
        establishment: { name: workplaceName },
      },
      previousPage: 'care-workforce-pathway-awareness',
    };

    it('should display banner when user submits and return is to home page', async () => {
      const { fixture, getByText, getByLabelText, alertSpy } = await setup(comingFromSummaryPanelOverrides);

      userEvent.click(getByLabelText(RadioButtonLabels.YES));
      userEvent.click(getByLabelText(mockReasons[0].text));

      userEvent.click(getByText('Save and return'));
      await fixture.whenStable();

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `Care workforce pathway information saved in '${workplaceName}'`,
      });
    });

    it('should not display banner when user submits but has not come from home page', async () => {
      const { fixture, getByText, getByLabelText, alertSpy } = await setup();

      userEvent.click(getByLabelText(RadioButtonLabels.YES));
      userEvent.click(getByLabelText(mockReasons[0].text));

      userEvent.click(getByText('Save and return'));
      await fixture.whenStable();

      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should set the back link to CWP awareness question', async () => {
      const { backServiceSpy } = await setup(comingFromSummaryPanelOverrides);

      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
        url: ['/workplace', 'mocked-uid', 'care-workforce-pathway-awareness'],
      });
    });
  });

  describe('when coming from workplace summary', () => {
    const returnTo = {
      url: ['/dashboard'],
      fragment: 'workplace',
    };

    it('should set backlink to returnTo when directly visited from workplace summary', async () => {
      const { backServiceSpy } = await setup({
        previousPage: 'workplace',
        establishmentService: {
          returnTo,
        },
      });

      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith(returnTo);
    });

    it('should set backlink to CWP awareness question when visited via workplace summary --> awareness question', async () => {
      const { backServiceSpy } = await setup({
        previousPage: 'care-workforce-pathway-awareness',
        establishmentService: {
          returnTo,
        },
      });

      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
        url: ['/workplace', 'mocked-uid', 'care-workforce-pathway-awareness'],
      });
    });
  });
});
