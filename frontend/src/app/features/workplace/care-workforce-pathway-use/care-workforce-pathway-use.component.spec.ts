import { CareWorkforcePathwayUseComponent } from './care-workforce-pathway-use.component';
import { render, within } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import userEvent from '@testing-library/user-event';
import { CareWorkforcePathwayUseReason } from '@core/model/care-workforce-pathway.model';

fdescribe('CareWorkforcePathwayUseComponent', () => {
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

  const reasonForSomethingElse = mockReasons[2];

  const setup = async (overrides: any = {}) => {
    const setupTools = await render(CareWorkforcePathwayUseComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides.establishmentService ?? {}),
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;
    return { ...setupTools, component };
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
      userEvent.click(getByLabelText(reasonForSomethingElse.text));

      const otherReasonsTextContainer = getByTestId('otherReasonsText');
      const textBox = within(otherReasonsTextContainer).getByRole('textbox', { name: 'Tell us what (optional)' });
      expect(textBox).toBeTruthy();
      expect(otherReasonsTextContainer.className).not.toContain('govuk-checkboxes__conditional--hidden');
    });

    it('should hide the text box when user unticked "For something else"', async () => {
      const { fixture, getByLabelText, getByTestId } = await setup();

      fixture.autoDetectChanges();

      userEvent.click(getByLabelText(RadioButtonLabels.YES));
      const checkbox = getByLabelText(reasonForSomethingElse.text);
      const otherReasonsTextContainer = getByTestId('otherReasonsText');

      userEvent.click(checkbox); // checkbox is ticked
      expect(otherReasonsTextContainer.className).not.toContain('govuk-checkboxes__conditional--hidden');

      userEvent.click(checkbox); // checkbox is unticked
      expect(otherReasonsTextContainer.className).toContain('govuk-checkboxes__conditional--hidden');
    });

    xit('should clear the selected reasons when user clicked "No"', async () => {});
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

    xit('should set the previous page to CWP awareness question page', async () => {});

    xit('should set the next page to xxx', async () => {});
  });
});
