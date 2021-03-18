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
    const { component, fixture, queryByText } = await setup();
    component.showAll = true;
    fixture.detectChanges();
    const viewLastBU = queryByText('View last bulk upload');
    expect(viewLastBU).toBeFalsy();
  });

  it('should render View last bulk upload if admin', async () => {
    const { component, fixture, queryByText } = await setup(true);
    component.showAll = true;
    fixture.detectChanges();
    const viewLastBU = queryByText('View last bulk upload');
    expect(viewLastBU).toBeTruthy();
  });

  it('should not render View last bulk upload or View references if showAll false', async () => {
    const { component, fixture, queryByText } = await setup();
    component.showAll = false;
    fixture.detectChanges();
    const viewLastBU = queryByText('View last bulk upload');
    expect(viewLastBU).toBeFalsy();
    const viewReferences = queryByText('View references');
    expect(viewReferences).toBeFalsy();
  });

  it('should not render View last bulk upload or View references if showAll false and isAdmin true', async () => {
    const { component, fixture, queryByText } = await setup(true);
    component.showAll = false;
    fixture.detectChanges();
    const viewLastBU = queryByText('View last bulk upload');
    expect(viewLastBU).toBeFalsy();
    const viewReferences = queryByText('View references');
    expect(viewReferences).toBeFalsy();
  });
});
