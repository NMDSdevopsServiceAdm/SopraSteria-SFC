import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Workplace } from '@core/model/my-workplaces.model';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockBulkUploadService } from '@core/test-utils/MockBulkUploadService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { AdminSkipService } from '@features/bulk-upload/admin-skip.service';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { bool, build, fake, sequence } from '@jackfranklin/test-data-bot';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WorkplaceReferencesComponent } from './workplace-references-page.component';

const establishmentBuilder = build('Workplace', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.sentence()),
    dataOwner: 'Workplace',
    dataPermissions: '',
    dataOwnerPermissions: '',
    isParent: bool(),
  },
});

describe('WorkplaceReferencesComponent', () => {
  async function setup(references: Workplace[] = []) {
    const component = await render(WorkplaceReferencesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, BulkUploadModule],
      providers: [
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BulkUploadService,
          useClass: MockBulkUploadService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workplaceReferences: references,
              },
            },
          },
        },
        BackService,
        FormBuilder,
        ErrorSummaryService,
        AdminSkipService,
      ],
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;

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
});
