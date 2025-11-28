import { fireEvent, render } from '@testing-library/angular';
import { OtherLinksComponent } from './other-links.component';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute } from '@angular/router';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';

describe('OtherLinksComponent', () => {
  async function setup(overrides: any = {}) {
    const { fixture, getByText, getByRole, queryByText } = await render(OtherLinksComponent, {
      imports: [SharedModule],
      declarations: [],
      providers: [{ provide: ActivatedRoute, useValue: MockActivatedRoute }],
      componentProperties: {
        isParentSubsidiaryView: overrides.isParentSubsidiaryView ?? false,
        canBulkUpload: overrides.canBulkUpload ?? false,
        canViewReports: overrides.canViewReports ?? false,
        canLinkToParent: overrides.canLinkToParent ?? false,
        isParent: overrides.isParent ?? false,
        canBecomeAParent: overrides.canBecomeAParent ?? false,
        linkToParentRequestedStatus: overrides.linkToParentRequestedStatus ?? false,
        canRemoveParentAssociation: overrides.canRemoveParentAssociation ?? false,
        canViewDataPermissionsLink: overrides.canViewDataPermissionsLink ?? false,
        canViewChangeDataOwner: overrides.canViewChangeDataOwner ?? false,
        parentStatusRequested: overrides.parentStatusRequested ?? false,
        isOwnershipRequested: overrides.isOwnershipRequested ?? false,
      },
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
      const overrides = {
        canBulkUpload: true,
        isParentSubsidiaryView: false,
      };
      const { getByText } = await setup(overrides);

      const otherLinkText = getByText('Bulk upload your data');

      expect(otherLinkText).toBeTruthy();
      expect(otherLinkText.getAttribute('href')).toEqual('/bulk-upload');
    });

    it('should not show when canBulkUpload is true and isParentSubsidiaryView is true', async () => {
      const overrides = {
        canBulkUpload: true,
        isParentSubsidiaryView: true,
      };

      const { queryByText } = await setup(overrides);

      const otherLinkText = queryByText('Bulk upload your data');

      expect(otherLinkText).toBeFalsy();
    });

    it('should not show when canBulkUpload is false and isParentSubsidiaryView is true', async () => {
      const overrides = {
        canBulkUpload: false,
        isParentSubsidiaryView: true,
      };

      const { queryByText } = await setup(overrides);

      const otherLinkText = queryByText('Bulk upload your data');

      expect(otherLinkText).toBeFalsy();
    });

    it('should not show when canBulkUpload is false and isParentSubsidiaryView is false', async () => {
      const overrides = {
        canBulkUpload: false,
        isParentSubsidiaryView: false,
      };

      const { queryByText } = await setup(overrides);

      const otherLinkText = queryByText('Bulk upload your data');

      expect(otherLinkText).toBeFalsy();
    });
  });

  describe('benefits bundle', () => {
    it('should show a link that takes you to the benefits bundle page if isParentSubsidiaryView is false', async () => {
      const overrides = {
        isParentSubsidiaryView: false,
      };

      const { getByText } = await setup(overrides);

      const benefitsBundleLink = getByText('View the ASC-WDS Benefits Bundle');

      expect(benefitsBundleLink).toBeTruthy();
      expect(benefitsBundleLink.getAttribute('href')).toBe('/benefits-bundle');
    });

    it('should not show a link to the benefits bundle page if isParentSubsidiaryView is true', async () => {
      const overrides = {
        isParentSubsidiaryView: true,
      };

      const { queryByText } = await setup(overrides);

      const benefitsBundleLink = queryByText('View the ASC-WDS Benefits Bundle');

      expect(benefitsBundleLink).toBeFalsy();
    });
  });

  it('should show about ASC-WDS link', async () => {
    const { getByText } = await setup();

    const otherLinkText = getByText('About ASC-WDS');

    expect(otherLinkText).toBeTruthy();
    expect(otherLinkText.getAttribute('href')).toEqual('/about-ascwds');
  });

  describe('Link to my parent organisation', () => {
    it('should not show Link to a parent workplace pending before requesting', async () => {
      const overrides = {
        isParent: false,
        canLinkToParent: true,
        canBecomeAParent: true,
        linkToParentRequestedStatus: false,
        parentStatusRequested: false,
      };

      const { queryByText } = await setup(overrides);

      const expectedMessage = 'Link to a parent workplace (request pending)';
      expect(queryByText(expectedMessage)).toBeFalsy();
      expect(queryByText('Link to a parent workplace')).toBeTruthy();
      expect(queryByText(`Become a parent and manage other workplaces' data`)).toBeTruthy();
    });

    it('should show the link to parent link with the correct href', async () => {
      const overrides = {
        isParent: false,
        canLinkToParent: true,
        canBecomeAParent: true,
        linkToParentRequestedStatus: false,
        parentStatusRequested: false,
      };

      const { getByText } = await setup(overrides);

      const linkToParentLink = getByText('Link to a parent workplace');
      expect(linkToParentLink).toBeTruthy();
      expect(linkToParentLink.getAttribute('href')).toEqual('/link-to-parent');
    });

    it('should show Link to a parent workplace pending after requesting', async () => {
      const overrides = {
        isParent: false,
        canLinkToParent: true,
        linkToParentRequestedStatus: true,
      };

      const { queryByText } = await setup(overrides);

      const linkToParentPendingLink = queryByText('Link to a parent workplace (request pending)');
      expect(linkToParentPendingLink).toBeTruthy();
      expect(linkToParentPendingLink.getAttribute('href')).toEqual('/link-to-parent');

      expect(queryByText('Link to a parent workplace')).toBeFalsy();
      expect(queryByText(`Become a parent and manage other workplaces' data`)).toBeFalsy();
    });
  });

  describe('Become a parent organisation', () => {
    it('should show become a parent and manage link and not show Link to a parent workplace pending before requesting', async () => {
      const overrides = {
        isParent: false,
        canLinkToParent: true,
        canBecomeAParent: true,
        linkToParentRequestedStatus: false,
        parentStatusRequested: false,
      };

      const { queryByText } = await setup(overrides);

      const expectedMessage = 'Link to my parent organisation pending';
      expect(queryByText(expectedMessage)).toBeFalsy();
      expect(queryByText('Link to a parent workplace')).toBeTruthy();
      expect(queryByText(`Become a parent and manage other workplaces' data`)).toBeTruthy();
    });

    it('should show the become a parent link with the correct href', async () => {
      const overrides = {
        isParent: false,
        canLinkToParent: true,
        canBecomeAParent: true,
        linkToParentRequestedStatus: false,
        parentStatusRequested: false,
      };

      const { getByText } = await setup(overrides);

      const becomeAParentlink = getByText(`Become a parent and manage other workplaces' data`);
      expect(becomeAParentlink).toBeTruthy();
      expect(becomeAParentlink.getAttribute('href')).toEqual('/become-a-parent');
    });

    it('should show the become a parent pending request link with the correct href', async () => {
      const overrides = {
        isParent: false,
        canBecomeAParent: true,
        linkToParentRequestedStatus: false,
        parentStatusRequested: true,
      };
      const { getByText, queryByText } = await setup(overrides);

      const becomeAParentPendinglink = getByText(`Become a parent and manage other workplaces' data (request pending)`);
      expect(becomeAParentPendinglink).toBeTruthy();
      expect(queryByText('Link to my parent organisation')).toBeFalsy();
      expect(becomeAParentPendinglink.getAttribute('href')).toEqual('/become-a-parent');
    });
  });

  describe('Data owner', () => {
    it('should not show a link if canViewChangeDataOwner is false', async () => {
      const overrides = {
        canViewChangeDataOwner: false,
      };
      const { queryByText } = await setup(overrides);

      expect(queryByText('Change data owner')).toBeFalsy();
      expect(queryByText('Data request pending')).toBeFalsy();
    });

    it('shows "Change data owner" with the correct href when isOwnershipRequested is false', async () => {
      const overrides = {
        canViewChangeDataOwner: true,
        isOwnershipRequested: false,
      };
      const { getByText } = await setup(overrides);

      const changeDataOwnerLink = getByText('Change data owner');

      expect(changeDataOwnerLink).toBeTruthy();
      expect(changeDataOwnerLink.getAttribute('href')).toEqual('/workplace/change-data-owner');
    });

    it('shows "data request pending" when ownership has been requested', async () => {
      const overrides = {
        canViewChangeDataOwner: true,
        isOwnershipRequested: true,
      };
      const { component, fixture, getByText } = await setup(overrides);

      const dataRequestPendinglink = getByText('Data request pending');

      expect(dataRequestPendinglink).toBeTruthy();

      const emitSpy = spyOn(component.cancelChangeDataOwnerRequestEvent, 'emit');
      expect(emitSpy).not.toHaveBeenCalled();

      fireEvent.click(dataRequestPendinglink);
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('change data permissions', () => {
    it('does not show the change data permissions link if canViewDataPermissionsLink is false', async () => {
      const overrides = {
        canViewDataPermissionsLink: false,
      };
      const { queryByText } = await setup(overrides);

      const changeDataPermissionsLink = queryByText('Change data permissions');

      expect(changeDataPermissionsLink).toBeFalsy();
    });

    it('shows the change data permissions link if canViewDataPermissionsLink is true', async () => {
      const overrides = {
        canViewDataPermissionsLink: true,
      };
      const { getByText } = await setup(overrides);

      const changeDataPermissionsLink = getByText('Change data permissions');

      expect(changeDataPermissionsLink).toBeTruthy();
      expect(changeDataPermissionsLink.getAttribute('href')).toEqual('/workplace/change-data-permissions');
    });
  });

  describe('remove parent association', () => {
    it('should not not show link if canRemoveParentAssociation is false', async () => {
      const overrides = {
        canRemoveParentAssociation: false,
      };

      const { queryByText } = await setup(overrides);

      const removeLinkToParentLink = queryByText('Remove link to my parent organisation');

      expect(removeLinkToParentLink).toBeFalsy();
    });

    describe('canRemoveParentAssociation is true', () => {
      it('should emit to show OwnershipChangeMessageDialog if canRemoveParentAssociation is true', async () => {
        const overrides = {
          canRemoveParentAssociation: true,
          canViewChangeDataOwner: true,
        };
        const { component, fixture, getByText } = await setup(overrides);

        const removeLinkToParentlink = getByText(`Remove the link to your parent workplace`);
        expect(removeLinkToParentlink).toBeTruthy();

        const emitSpy = spyOn(component.ownershipChangeMessageEvent, 'emit');
        expect(emitSpy).not.toHaveBeenCalled();

        fireEvent.click(removeLinkToParentlink);
        fixture.detectChanges();

        expect(emitSpy).toHaveBeenCalled();
      });

      it('should show remove link to parent if data owner', async () => {
        const overrides = {
          canRemoveParentAssociation: true,
          canViewChangeDataOwner: false,
        };
        const { getByText } = await setup(overrides);

        const removeLinkToParentlink = getByText(`Remove the link to your parent workplace`);

        expect(removeLinkToParentlink).toBeTruthy();
        expect(removeLinkToParentlink.getAttribute('href')).toBe('/remove-link-to-parent');
      });
    });
  });
});
