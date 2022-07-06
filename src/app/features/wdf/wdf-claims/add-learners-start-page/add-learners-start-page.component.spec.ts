import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AddLearnersStartPageComponent } from './add-learners-start-page.component';

describe('AddLearnersStartPageComponent', () => {
  const setup = async (claimType = 'learningProgramme') => {
    window.history.pushState({ claimType }, '');

    const { fixture, getByText } = await render(AddLearnersStartPageComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
    });

    const component = fixture.componentInstance;

    return { component, getByText };
  };

  afterEach(() => {
    window.history.replaceState(undefined, '');
  });

  it('should render a WdfGrantLetterComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Staff record requirements message', () => {
    const messageWithDOB =
      'Staff records will need to include a name that matches the one shown on their learning award certificate, not an ID number, and a date of birth.';
    const messageWithoutDOB =
      'Staff records will need to include a name that matches the one shown on their learning award certificate, not an ID number.';

    it('should include DOB when claimType is learningProgramme', async () => {
      const { getByText } = await setup('learningProgramme');

      expect(getByText(messageWithDOB)).toBeTruthy();
    });

    it('should include DOB when claimType is digitalModule', async () => {
      const { getByText } = await setup('digitalModule');

      expect(getByText(messageWithDOB)).toBeTruthy();
    });

    it('should not include DOB when claimType is apprenticeship', async () => {
      const { getByText } = await setup('apprenticeship');

      expect(getByText(messageWithoutDOB)).toBeTruthy();
    });

    it('should not include DOB when claimType is qualification', async () => {
      const { getByText } = await setup('qualification');

      expect(getByText(messageWithoutDOB)).toBeTruthy();
    });
  });

  describe('Claim requirements message', () => {
    const claimAmountMessage = "You'll need to know the amount of money you want to claim for each learner.";

    it('should show amount message when claimType is learningProgramme', async () => {
      const { getByText } = await setup('learningProgramme');

      expect(getByText(claimAmountMessage)).toBeTruthy();
    });

    it('should show amount message when claimType is digitalModule', async () => {
      const { getByText } = await setup('digitalModule');

      expect(getByText(claimAmountMessage)).toBeTruthy();
    });

    it('should include learner number and amount in message when claimType is apprenticeship', async () => {
      const { getByText } = await setup('apprenticeship');

      expect(getByText("For each learner, you'll need to know:")).toBeTruthy();
      expect(getByText('their Unique Learner Number')).toBeTruthy();
      expect(getByText('the amount of money you want to claim')).toBeTruthy();
    });

    it('should not include DOB when claimType is qualification', async () => {
      const { getByText } = await setup('qualification');

      expect(getByText("For each learner, you'll need to know:")).toBeTruthy();
      expect(getByText('their Unique Learner Number')).toBeTruthy();
      expect(getByText('their Candidate Registration Number')).toBeTruthy();
      expect(getByText('the amount of money you want to claim')).toBeTruthy();
      expect(getByText('whether the qualification is part of an apprenticeship')).toBeTruthy();
    });
  });
});
