import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { render } from '@testing-library/angular';

import { BulkUploadRelatedContentComponent } from './bulk-upload-related-content.component';

describe('BulkUploadRelatedContentComponent', () => {
  const setup = async (isAdmin = false, isLoggedIn: boolean = true) => {
    const { fixture, getByText, queryByText } = await render(BulkUploadRelatedContentComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BulkUploadModule],
      providers: [
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(isLoggedIn, isAdmin),
        },
      ],
      declarations: [BulkUploadRelatedContentComponent],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, queryByText };
  };

  it('should render a BulkUploadRelatedContentComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should not render View last bulk upload if not admin', async () => {
    const { fixture, queryByText } = await setup();

    fixture.detectChanges();
    const viewLastBU = queryByText('View last bulk upload');
    expect(viewLastBU).toBeFalsy();
  });

  it('should render View last bulk upload if admin', async () => {
    const { fixture, queryByText } = await setup(true);

    fixture.detectChanges();
    const viewLastBU = queryByText('View last bulk upload');
    expect(viewLastBU).toBeTruthy();
  });

  it('should not render About bulk upload when passed a false flag', async () => {
    const { component, fixture, queryByText } = await setup();

    component.showAboutBulkUpload = false;
    fixture.detectChanges();
    const viewLastBU = queryByText('About bulk upload');
    expect(viewLastBU).toBeFalsy();
  });

  it('should not render Get help with bulk uploads when passed a false flag', async () => {
    const { component, fixture, queryByText } = await setup();

    component.showGetHelpWithBulkUploads = false;
    fixture.detectChanges();
    const viewLastBU = queryByText('Get help with bulk uploads');
    expect(viewLastBU).toBeFalsy();
  });

  it('should not render View references when passed a false flag', async () => {
    const { component, fixture, queryByText } = await setup();

    component.showViewReferences = false;
    fixture.detectChanges();
    const viewLastBU = queryByText('View references');
    expect(viewLastBU).toBeFalsy();
  });

  it('should not render Data changes when passed a false flag', async () => {
    const { component, fixture, queryByText } = await setup();

    component.showDataChanges = false;
    fixture.detectChanges();
    const viewLastBU = queryByText('Data changes');
    expect(viewLastBU).toBeFalsy();
  });

  it('should not render links with false flags passed, but should render the other links', async () => {
    const { component, fixture, queryByText } = await setup(true);

    component.showAboutBulkUpload = false;
    component.showDataChanges = false;
    fixture.detectChanges();

    expect(queryByText('About bulk upload')).toBeFalsy();
    expect(queryByText('Data changes')).toBeFalsy();
    expect(queryByText('Get help with bulk uploads')).toBeTruthy();
    expect(queryByText('View last bulk upload')).toBeTruthy();
    expect(queryByText('View references')).toBeTruthy();
  });
});
