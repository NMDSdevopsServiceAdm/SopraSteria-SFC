import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AccordionSectionComponent } from './accordion-section.component';

fdescribe('AccordionSectionComponent', () => {
  const setup = async (override: any = {}) => {
    const componentProps = {
      title: 'Care providing roles',
      description: 'Jobs like care worker, community support, support worker',
      ...override,
    };
    const { fixture, getByText, queryByText } = await render(AccordionSectionComponent, {
      imports: [SharedModule],
      providers: [],
      componentProperties: componentProps,
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      queryByText,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a title and description', async () => {
    const { getByText } = await setup({ title: 'accordion title', description: 'some description' });
    expect(getByText('accordion title')).toBeTruthy();
    expect(getByText('some description')).toBeTruthy();
  });

  it('should render a show button by default', async () => {
    const { getByText } = await setup();
    expect(getByText('Show')).toBeTruthy();
  });

  it('should render a hide button at start time when expandedAtStart is true', async () => {
    const { getByText, queryByText } = await setup({ expandedAtStart: true });

    expect(queryByText('Show')).toBeFalsy();
    expect(getByText('Hide')).toBeTruthy();
  });

  it('should render inner html within a div element with class "govuk-accordion__section-content"', async () => {
    const mockHtmlTemplate = `
    <app-accordion-section>
      <p>Content to be rendered in accordion</p>
    </app-accordion-section>
    `;

    const { getByText } = await render(mockHtmlTemplate, {
      imports: [SharedModule],
      providers: [],
    });

    const accordionContent = getByText('Content to be rendered in accordion');
    expect(accordionContent).toBeTruthy();
    expect(accordionContent.parentElement.className).toContain('govuk-accordion__section-content');
  });
});
