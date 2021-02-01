import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';

import { BulkUploadInfoComponent } from '../bulk-upload-info/bulk-upload-info.component';
import { CodesAndGuidanceComponent } from '../codes-and-guidance/codes-and-guidance.component';
import { BulkUploadStartPageComponent } from './bulk-upload-start-page.component';

describe('BulkUploadStartPage', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(BulkUploadStartPageComponent, {
      imports: [RouterTestingModule],
      providers: [],
      declarations: [BulkUploadStartPageComponent, BulkUploadInfoComponent, CodesAndGuidanceComponent],
    });
    const component = fixture.componentInstance;

    return { component, getByText };
  };

  it('should render a StartPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to workplace references page when Continue button is clicked', async () => {
    const { getByText } = await setup();
    const continueButton = getByText('Continue');
    expect(continueButton.getAttribute('href')).toBe('/workplace-references');
  });

  it('should return to home page(dashboard) when Cancel link is clicked', async () => {
    const { getByText } = await setup();
    const cancelButton = getByText('Cancel');
    expect(cancelButton.getAttribute('href')).toBe('/dashboard');
  });
});
