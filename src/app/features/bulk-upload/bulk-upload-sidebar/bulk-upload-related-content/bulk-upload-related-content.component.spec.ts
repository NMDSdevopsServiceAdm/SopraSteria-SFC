import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockDataChangeService } from '@core/test-utils/MockDataChangesService';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { render } from '@testing-library/angular';

import { BulkUploadRelatedContentComponent } from './bulk-upload-related-content.component';

describe('BulkUploadRelatedContentComponent', () => {
  const dataChange = MockDataChangeService.dataChangeFactory();
  const dataChangeLastUpdated = MockDataChangeService.dataChangeLastUpdatedFactory();

  const setup = async (isAdmin = false, isLoggedIn: boolean = true) => {
    const { fixture, getByText, queryByText, getByTestId } = await render(BulkUploadRelatedContentComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BulkUploadModule],
      providers: [
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(isLoggedIn, isAdmin),
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                dataChange,
                dataChangeLastUpdated,
              },
            },
          }),
        },
      ],
      declarations: [BulkUploadRelatedContentComponent],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, queryByText, getByTestId };
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

  it('should not render Data changes when passed a false flag', async () => {
    const { component, fixture, queryByText } = await setup();

    component.getShowFlagForBUDataChanges();
    fixture.detectChanges();

    expect(component.dataChangeLastUpdated).not.toEqual(component.datachange);
  });

  it('should not show the flags when showFlagBUChanges is false', async () => {
    const { component, fixture, getByTestId } = await setup(true);
    component.showFlagBUChanges = false;
    const showFlag = getByTestId('showFlag');
    fixture.detectChanges();

    expect(showFlag).toBeFalsy;
  });
  it('should show the flags when showFlagBUChanges is true', async () => {
    const { component, fixture, getByTestId } = await setup(true);
    component.showFlagBUChanges = true;
    const showFlag = getByTestId('showFlag');
    fixture.detectChanges();

    expect(showFlag).toBeTruthy;
  });
});
