import { render } from '@testing-library/angular';
import { WorkplaceNameAddress } from './workplace-name-address.component';
import { SharedModule } from '@shared/shared.module';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { Establishment } from '@core/model/establishment.model';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('WorkplaceNameAddress', () => {
  const setup = async (override: any = {}) => {
    const establishment = establishmentBuilder() as Establishment;
    const setupTools = await render(WorkplaceNameAddress, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [],
      componentProperties: {
        canEditEstablishment: override.canEditEstablishment,
        workplace: override.workplace ? override.workplace : establishment,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should create WorkplaceNameAddress', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render the workplace name and address', async () => {
    const workplace = {
      name: 'Care 1',
      address: 'Care Home, Leeds',
      address1: 'Care Home',
      address2: 'Care Street',
      address3: 'Town',
      town: 'Leeds',
      county: 'Yorkshire',
      postcode: 'LS1 1AB',
    };

    const { getByText } = await setup({ workplace });

    expect(getByText(workplace.name)).toBeTruthy();
    expect(getByText(workplace.address1)).toBeTruthy();
    expect(getByText(workplace.address2, { exact: false })).toBeTruthy();
    expect(getByText(workplace.address3, { exact: false })).toBeTruthy();
    expect(getByText(workplace.town, { exact: false })).toBeTruthy();
    expect(getByText(workplace.county, { exact: false })).toBeTruthy();
    expect(getByText(workplace.postcode, { exact: false })).toBeTruthy();
  });

  it('should not render a Change link if permission to edit is false', async () => {
    const overrides = {
      canEditEstablishment: false,
    };
    const { queryByText } = await setup(overrides);

    const changeLink = queryByText('Change');

    expect(changeLink).toBeFalsy();
  });

  it('should render a Change link', async () => {
    const overrides = {
      canEditEstablishment: true,
    };
    const { component, getByText } = await setup(overrides);

    const changeLink = getByText('Change');

    expect(changeLink).toBeTruthy();
    expect(changeLink.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-workplace-details`);
  });
});
