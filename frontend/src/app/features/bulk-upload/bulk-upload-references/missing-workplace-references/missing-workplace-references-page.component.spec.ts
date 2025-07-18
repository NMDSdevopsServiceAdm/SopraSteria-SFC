import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Workplace } from '@core/model/my-workplaces.model';
import { AuthService } from '@core/services/auth.service';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockBulkUploadService } from '@core/test-utils/MockBulkUploadService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { AdminSkipService } from '@features/bulk-upload/admin-skip.service';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { bool, build, fake, sequence } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { MissingWorkplaceReferencesComponent } from './missing-workplace-references-page.component';

const establishmentBuilder = build('Workplace', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.sentence()),
    dataOwner: 'Workplace',
    dataPermissions: '',
    dataOwnerPermissions: '',
    isParent: bool(),
    localIdentifier: null,
  },
});

describe('MissingWorkplaceReferencesComponent', () => {
  async function setup(references: Workplace[] = []) {
    const component = await render(MissingWorkplaceReferencesComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, BulkUploadModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BulkUploadService,
          useClass: MockBulkUploadService,
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, false),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workplaceReferences: references,
                nextWorkplace: {
                  establishment: 1,
                  worker: 2,
                  establishmentList: [{ uid: '123', name: 'Workplace Steve' }],
                },
              },
            },
          },
        },
        BackService,
        UntypedFormBuilder,
        ErrorSummaryService,
        AdminSkipService,
      ],
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;
    spyOn(router, 'navigate').and.resolveTo(true);

    return {
      component,
      establishmentService,
      router,
    };
  }

  const event = new Event('click');

  it('should render a WorkplaceReferencesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show missing workplace error when submitting with empty field(2 messages - 1 top, 1 under field)', async () => {
    const workplace = establishmentBuilder();
    const references = [workplace] as Workplace[];
    const { component } = await setup(references);
    const form = component.fixture.componentInstance.form;
    const errorMessage = `Enter a unique reference for ${workplace.name}`;

    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
    form.controls[`reference-${workplace.uid}`].setValue('');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage, { exact: false }).length).toBe(2);
    expect(form.controls[`reference-${workplace.uid}`].errors).toEqual({ required: true });
  });

  it('should hide missing workplace error after filling empty field and resubmitting', async () => {
    const workplace = establishmentBuilder();
    const references = [workplace] as Workplace[];
    const { component } = await setup(references);
    const form = component.fixture.componentInstance.form;

    const errorMessage = `Enter a unique reference for ${workplace.name}`;

    form.controls[`reference-${workplace.uid}`].setValue('');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();

    form.controls[`reference-${workplace.uid}`].setValue('valid');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
  });

  it('should show maxlength error when submitting with field which is too long(2 messages - 1 top, 1 under field)', async () => {
    const workplace = establishmentBuilder() as Workplace;
    const references = [workplace];
    const { component } = await setup(references);
    const maxLength = component.fixture.componentInstance.maxLength;
    const workplaceReference = 'This is over fifty characters................................................';
    const errorMessage = `Reference must be ${maxLength} characters or fewer`;
    const form = component.fixture.componentInstance.form;

    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
    form.controls[`reference-${workplace.uid}`].setValue(workplaceReference);
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage, { exact: false }).length).toBe(2);
    expect(form.controls[`reference-${workplace.uid}`].errors).toEqual({
      maxlength: {
        requiredLength: maxLength,
        actualLength: workplaceReference.length,
      },
    });
  });

  it('should show duplicate error when submitting with same input in multiple boxes(4 messages - 2 top, 2 under fields)', async () => {
    const workplaces = [establishmentBuilder(), establishmentBuilder()] as Workplace[];
    const { component } = await setup(workplaces);
    const form = component.fixture.componentInstance.form;
    const errorMessage = 'This reference matches another, it needs to be unique';

    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
    form.controls[`reference-${workplaces[0].uid}`].markAsDirty();
    form.controls[`reference-${workplaces[1].uid}`].markAsDirty();
    form.controls[`reference-${workplaces[0].uid}`].setValue('abc');
    form.controls[`reference-${workplaces[1].uid}`].setValue('abc');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage, { exact: false }).length).toBe(4);
    expect(form.controls[`reference-${workplaces[0].uid}`].errors).toEqual({ duplicate: true });
    expect(form.controls[`reference-${workplaces[1].uid}`].errors).toEqual({ duplicate: true });
  });

  it('should show duplicate error when submitting with same input in 1 box when 1 dirty', async () => {
    const workplaces = [establishmentBuilder(), establishmentBuilder()] as Workplace[];
    const references = workplaces;
    const { component } = await setup(references);
    const form = component.fixture.componentInstance.form;
    const errorMessage = 'This reference matches another, it needs to be unique';

    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
    form.controls[`reference-${workplaces[0].uid}`].markAsDirty();
    form.controls[`reference-${workplaces[0].uid}`].setValue('abc');
    form.controls[`reference-${workplaces[1].uid}`].setValue('abc');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage, { exact: false }).length).toBe(2);
    expect(form.controls[`reference-${workplaces[0].uid}`].errors).toEqual({ duplicate: true });
    expect(form.controls[`reference-${workplaces[1].uid}`].errors).toEqual(null);
  });

  it('should show empty references at top of table on page load', async () => {
    const workplaces = [establishmentBuilder(), establishmentBuilder()] as Workplace[];
    workplaces[0].localIdentifier = 'hello';
    const { component } = await setup(workplaces);
    const firstReferenceRow = component.getByTestId('reference-0');
    const workplaceNameWithEmptyReference = workplaces[1].name;

    expect(firstReferenceRow.textContent.includes(workplaceNameWithEmptyReference));
  });

  it('should hide filled references on page load and show them after clicking Show all references', async () => {
    const workplaces = [establishmentBuilder(), establishmentBuilder()] as Workplace[];
    workplaces[0].localIdentifier = 'hello';
    const { component } = await setup(workplaces);
    const filledReferenceRow = component.getByTestId('reference-1');
    expect(filledReferenceRow.className.includes('govuk-visually-hidden')).toBeTruthy();

    const showAllReferencesToggle = component.getByText('Show all references');

    fireEvent.click(showAllReferencesToggle);
    component.fixture.detectChanges();

    expect(filledReferenceRow.className.includes('govuk-visually-hidden')).toBeFalsy();
  });

  it('should not show workplaces that are pending or in progress', async () => {
    const childWorkplace1 = {
      ...establishmentBuilder(),
      ustatus: null,
    };

    const childWorkplace2 = {
      ...establishmentBuilder(),
      ustatus: 'PENDING',
    };

    const childWorkplace3 = {
      ...establishmentBuilder(),
      ustatus: 'IN PROGRESS',
    };

    const workplaces = [childWorkplace1, childWorkplace2, childWorkplace3] as Workplace[];
    const { component } = await setup(workplaces);

    expect(component.getByTestId('reference-0')).toBeTruthy();
    expect(component.queryByTestId('reference-1')).toBeFalsy();
    expect(component.queryByTestId('reference-2')).toBeFalsy();

    expect(component.getByText(workplaces[0].name)).toBeTruthy();
    expect(component.queryByText(workplaces[1].name)).toBeFalsy();
    expect(component.queryByText(workplaces[2].name)).toBeFalsy();
  });
});
