import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  const setup = async (currentSection = 'Section 1') => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(ProgressBarComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      componentProperties: {
        header: 'Section Heading',
        sections: ['Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 5'],
        currentSection,
      },
      declarations: [],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, queryByTestId };
  };

  it('should render a User Account Summary Workplace Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the section heading', async () => {
    const { getByText } = await setup();

    expect(getByText('Section Heading')).toBeTruthy();
  });

  it('should render all the sections', async () => {
    const { getByText } = await setup();

    expect(getByText('Section 1')).toBeTruthy();
    expect(getByText('Section 2')).toBeTruthy();
    expect(getByText('Section 3')).toBeTruthy();
    expect(getByText('Section 4')).toBeTruthy();
    expect(getByText('Section 5')).toBeTruthy();
  });

  describe('First section in progress', () => {
    it('should show the current section icon next to the first section and no additional classes on the text', async () => {
      const { getByText, getByTestId } = await setup();
      const section1Text = getByText('Section 1');

      expect(getByTestId('currentSection-0')).toBeTruthy();
      expect(section1Text.getAttribute('class')).not.toContain('asc-colour-grey');
      expect(section1Text.getAttribute('class')).not.toContain('govuk-!-font-weight-bold');
    });

    it('should show the todo icon next to all but first section and grey text ', async () => {
      const { getByText, getByTestId } = await setup();

      const section2Text = getByText('Section 2');
      const section3Text = getByText('Section 3');
      const section4Text = getByText('Section 4');
      const section5Text = getByText('Section 5');

      expect(getByTestId('todo-1')).toBeTruthy();
      expect(getByTestId('todo-2')).toBeTruthy();
      expect(getByTestId('todo-3')).toBeTruthy();
      expect(getByTestId('todo-4')).toBeTruthy();

      expect(section2Text.getAttribute('class')).toContain('asc-colour-grey');
      expect(section3Text.getAttribute('class')).toContain('asc-colour-grey');
      expect(section4Text.getAttribute('class')).toContain('asc-colour-grey');
      expect(section5Text.getAttribute('class')).toContain('asc-colour-grey');
    });

    it('should not render a line after the last section icon', async () => {
      const { getByTestId, queryByTestId } = await setup();

      expect(getByTestId('greenLine-0')).toBeTruthy();
      expect(getByTestId('greenLine-1')).toBeTruthy();
      expect(getByTestId('greenLine-2')).toBeTruthy();
      expect(getByTestId('greenLine-3')).toBeTruthy();
      expect(queryByTestId('greenLine-4')).toBeFalsy();
    });
  });

  describe('Third section in progress', () => {
    it('should show the current section icon next to the third section and no additional classes on the text', async () => {
      const { getByTestId, getByText } = await setup('Section 3');

      const section3Text = getByText('Section 3');

      expect(getByTestId('currentSection-2')).toBeTruthy();
      expect(section3Text.getAttribute('class')).not.toContain('asc-colour-grey');
      expect(section3Text.getAttribute('class')).not.toContain('govuk-!-font-weight-bold');
    });

    it('should show the completed icon next to the first 2 sections and bold text ', async () => {
      const { getByText, getByTestId } = await setup('Section 3');

      const section1Text = getByText('Section 1');
      const section2Text = getByText('Section 2');

      expect(getByTestId('completed-0')).toBeTruthy();
      expect(getByTestId('completed-1')).toBeTruthy();

      expect(section1Text.getAttribute('class')).toContain('govuk-!-font-weight-bold');
      expect(section2Text.getAttribute('class')).toContain('govuk-!-font-weight-bold');
    });

    it('should show the todo icon next to all but first section and grey text ', async () => {
      const { getByText, getByTestId } = await setup('Section 3');

      const section4Text = getByText('Section 4');
      const section5Text = getByText('Section 5');

      expect(getByTestId('todo-3')).toBeTruthy();
      expect(getByTestId('todo-4')).toBeTruthy();

      expect(section4Text.getAttribute('class')).toContain('asc-colour-grey');
      expect(section5Text.getAttribute('class')).toContain('asc-colour-grey');
    });
  });

  describe('Last section in progress', () => {
    it('should show the current section icon next to the last section and no additional classes on the text', async () => {
      const { getByTestId, getByText } = await setup('Section 5');

      const section3Text = getByText('Section 5');

      expect(getByTestId('currentSection-4')).toBeTruthy();
      expect(section3Text.getAttribute('class')).not.toContain('asc-colour-grey');
      expect(section3Text.getAttribute('class')).not.toContain('govuk-!-font-weight-bold');
    });

    it('should show the completed icon next to all but last section and bold text ', async () => {
      const { getByText, getByTestId } = await setup('Section 5');

      const section1Text = getByText('Section 1');
      const section2Text = getByText('Section 2');
      const section3Text = getByText('Section 3');
      const section4Text = getByText('Section 4');

      expect(getByTestId('completed-0')).toBeTruthy();
      expect(getByTestId('completed-1')).toBeTruthy();
      expect(getByTestId('completed-2')).toBeTruthy();
      expect(getByTestId('completed-3')).toBeTruthy();

      expect(section1Text.getAttribute('class')).toContain('govuk-!-font-weight-bold');
      expect(section2Text.getAttribute('class')).toContain('govuk-!-font-weight-bold');
      expect(section3Text.getAttribute('class')).toContain('govuk-!-font-weight-bold');
      expect(section4Text.getAttribute('class')).toContain('govuk-!-font-weight-bold');
    });
  });
});
