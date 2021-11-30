import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  async function setup() {
    const component = await render(SearchComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
    });

    return {
      component,
    };
  }

  it('should render a SearchComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a search for a workplace link that links to sfcadmin/search/workplace', async () => {
    const { component } = await setup();

    const searchForWorkplaceLink = component.queryByText('Search for a workplace');
    expect(searchForWorkplaceLink).toBeTruthy();
    expect(searchForWorkplaceLink.getAttribute('href')).toBe('/sfcadmin/search/workplace');
  });

  it('should render a search for a user link that links to sfcadmin/search/user', async () => {
    const { component } = await setup();

    const searchForUserLink = component.queryByText('Search for a user');
    expect(searchForUserLink).toBeTruthy();
    expect(searchForUserLink.getAttribute('href')).toBe('/sfcadmin/search/user');
  });

  it('should render a search for a group link that links to sfcadmin/search/group', async () => {
    const { component } = await setup();

    const searchForGroupLink = component.queryByText('Search for a group');
    expect(searchForGroupLink).toBeTruthy();
    expect(searchForGroupLink.getAttribute('href')).toBe('/sfcadmin/search/group');
  });
});
