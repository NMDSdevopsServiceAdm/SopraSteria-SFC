import { render } from '@testing-library/angular';
import { OtherLinksComponent } from './other-links.component';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute } from '@angular/router';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';

describe('OtherLinksComponent', () => {
  async function setup() {
    const { fixture, getByText, getByRole, queryByText } = await render(OtherLinksComponent, {
      imports: [SharedModule],
      declarations: [],
      providers: [{ provide: ActivatedRoute, useValue: MockActivatedRoute }],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
      getByRole,
      queryByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show ASC-WDS certificate link', async () => {
    const { getByText } = await setup();

    const otherLinkText = getByText('Get your ASC-WDS certificate');

    expect(otherLinkText).toBeTruthy();
    expect(otherLinkText.getAttribute('href')).toEqual('/asc-wds-certificate');
  });

  describe('bulk upload link', () => {
    it('should show when canBulkUpload is true and isParentSubsidiaryView is false', async () => {
      const { component, getByText, fixture } = await setup();

      component.canBulkUpload = true;
      component.isParentSubsidiaryView = false;

      fixture.detectChanges();

      const otherLinkText = getByText('Bulk upload your data');

      expect(otherLinkText).toBeTruthy();
      expect(otherLinkText.getAttribute('href')).toEqual('/bulk-upload');
    });

    it('should not show when canBulkUpload is true and isParentSubsidiaryView is true', async () => {
      const { component, queryByText, fixture } = await setup();

      component.canBulkUpload = true;
      component.isParentSubsidiaryView = true;

      fixture.detectChanges();

      const otherLinkText = queryByText('Bulk upload your data');

      expect(otherLinkText).toBeFalsy();
    });

    it('should not show when canBulkUpload is false and isParentSubsidiaryView is true', async () => {
      const { component, queryByText, fixture } = await setup();

      component.canBulkUpload = false;
      component.isParentSubsidiaryView = true;

      fixture.detectChanges();

      const otherLinkText = queryByText('Bulk upload your data');

      expect(otherLinkText).toBeFalsy();
    });

    it('should not show when canBulkUpload is false and isParentSubsidiaryView is false', async () => {
      const { component, queryByText, fixture } = await setup();

      component.canBulkUpload = false;
      component.isParentSubsidiaryView = false;

      fixture.detectChanges();

      const otherLinkText = queryByText('Bulk upload your data');

      expect(otherLinkText).toBeFalsy();
    });
  });

  describe('funding', () => {
    it('should show link if canViewReports is true and isParentSubsidiaryView is false', async () => {
      const { component, getByText, fixture } = await setup();

      component.canViewReports = true;
      component.isParentSubsidiaryView = false;
      fixture.detectChanges();

      const otherLinkText = getByText('Does your data meet funding requirements?');

      expect(otherLinkText).toBeTruthy();
      expect(otherLinkText.getAttribute('href')).toEqual('/funding');
    });

    it('should not show link if canViewReports is true and isParentSubsidiaryView is true', async () => {
      const { component, queryByText, fixture } = await setup();

      component.canViewReports = true;
      component.isParentSubsidiaryView = true;
      fixture.detectChanges();

      const otherLinkText = queryByText('Does your data meet funding requirements?');

      expect(otherLinkText).toBeFalsy();
    });

    it('should not show link if canViewReports is false and isParentSubsidiaryView is true', async () => {
      const { component, queryByText, fixture } = await setup();

      component.canViewReports = false;
      component.isParentSubsidiaryView = true;
      fixture.detectChanges();

      const otherLinkText = queryByText('Does your data meet funding requirements?');

      expect(otherLinkText).toBeFalsy();
    });

    it('should not show link if canViewReports is false and isParentSubsidiaryView is false', async () => {
      const { component, queryByText, fixture } = await setup();

      component.canViewReports = false;
      component.isParentSubsidiaryView = false;
      fixture.detectChanges();

      const otherLinkText = queryByText('Does your data meet funding requirements?');

      expect(otherLinkText).toBeFalsy();
    });
  });

  it('should show about ASC-WDS link', async () => {
    const { getByText } = await setup();

    const otherLinkText = getByText('About ASC-WDS');

    expect(otherLinkText).toBeTruthy();
    expect(otherLinkText.getAttribute('href')).toEqual('/about-ascwds');
  });
});
