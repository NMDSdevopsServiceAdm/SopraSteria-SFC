import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { BenefitAccordionComponent } from './benefit-accordion.component';

describe('BenefitAccordionComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(BenefitAccordionComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
      providers: [],
      componentProperties: {
        index: 0,
        benefit: {
          title: 'Test benefit',
          open: false,
        },
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      getByText,
    };
  }

  it('should create BenefitAccordionComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display benefit title', async () => {
    const { component, getByText } = await setup();
    expect(getByText(component.benefit.title)).toBeTruthy();
  });
});
