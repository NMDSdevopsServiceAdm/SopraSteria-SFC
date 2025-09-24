import { render } from '@testing-library/angular';
import { provideRouter, RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PageNoLongerAvailableComponent } from './page-no-longer-available.component';

describe('PageNoLongerAvailableComponent', () => {
  const setup = async () => {
    const setupTools = await render(PageNoLongerAvailableComponent, {
      imports: [RouterModule],
      declarations: [],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
      componentProperties: {},
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the page heading', async () => {
    const { getByRole } = await setup();

    expect(getByRole('heading', { name: 'Page no longer available' })).toBeTruthy();
  });

  it('should show a link to the homepage', async () => {
    const { getByText } = await setup();

    const linkText = getByText('Return to the homepage');

    expect(linkText).toBeTruthy();
    expect(linkText.getAttribute('href')).toEqual('/login');
  });
});
