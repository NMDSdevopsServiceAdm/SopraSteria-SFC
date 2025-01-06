import { render, within } from '@testing-library/angular';
import { WorkplaceNameAddress } from './workplace-name-address.component';
import { SharedModule } from '@shared/shared.module';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { Establishment } from '@core/model/establishment.model';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

fdescribe('WorkplaceNameAddress', () => {
  const setup = async (overrides: any = {}) => {
    const establishment = establishmentBuilder() as Establishment;
    const setupTools = await render(WorkplaceNameAddress, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [],
      componentProperties: {
        canEditEstablishment: overrides.canEditEstablishment,
        workplace: establishment,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should create WorkplaceNameAddress', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should not render a Change link if permission to edit is false', async () => {
    const overrides = {
      canEditEstablishment: false,
    };
    const { component, fixture, getByText, queryByText } = await setup(overrides);

    const changeLink = queryByText('Change');

    expect(changeLink).toBeFalsy();
  });

  it('should render a Change link', async () => {
    const overrides = {
      canEditEstablishment: true,
    };
    const { component, fixture, getByText } = await setup(overrides);

    const changeLink = getByText('Change');

    expect(changeLink).toBeTruthy();
    //expect(changeLink.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-workplace-details`);
  });
});
