import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockBulkUploadService } from '@core/test-utils/MockBulkUploadService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockWorkerService, workerBuilder } from '@core/test-utils/MockWorkerService';
import { AdminSkipService } from '@features/bulk-upload/admin-skip.service';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StaffReferencesComponent } from './staff-references-page.component';

describe('StaffReferencesComponent', () => {
  async function setup(references: Worker[] = []) {
    const component = await render(StaffReferencesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, BulkUploadModule],
      providers: [
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
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
                references: references,
                workplaceReferences: [{ uid: 123 }],
              },
              paramMap: {
                get(uid) {
                  return 123;
                },
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

  it('should render a StaffReferencesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show missing worker error when submitting with empty field(2 messages - 1 top, 1 under field)', async () => {
    const worker = workerBuilder();
    const references = [worker] as Worker[];
    const { component } = await setup(references);
    const form = component.fixture.componentInstance.form;
    const errorMessage = `Enter a unique reference for ${worker.nameOrId}`;

    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
    form.controls[`reference-${worker.uid}`].setValue('');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage, { exact: false }).length).toBe(2);
    expect(form.controls[`reference-${worker.uid}`].errors).toEqual({ required: true });
  });

  it('should hide missing worker error after filling empty field and resubmitting', async () => {
    const worker = workerBuilder();
    const references = [worker] as Worker[];
    const { component } = await setup(references);
    const form = component.fixture.componentInstance.form;
    const errorMessage = `Enter a unique reference for ${worker.nameOrId}`;

    form.controls[`reference-${worker.uid}`].setValue('');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();

    form.controls[`reference-${worker.uid}`].setValue('valid');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
  });

  it('should show maxlength error when submitting with field which is too long(2 messages - 1 top, 1 under field)', async () => {
    const worker = workerBuilder();
    const references = [worker] as Worker[];
    const { component } = await setup(references);
    const maxLength = component.fixture.componentInstance.maxLength;
    const workerReference = 'This is over fifty characters................................................';
    const errorMessage = `Reference must be ${maxLength} characters or fewer`;
    const form = component.fixture.componentInstance.form;

    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
    form.controls[`reference-${worker.uid}`].setValue(workerReference);
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage, { exact: false }).length).toBe(2);
    expect(form.controls[`reference-${worker.uid}`].errors).toEqual({
      maxlength: {
        requiredLength: maxLength,
        actualLength: workerReference.length,
      },
    });
  });

  it('should hide maxlength error when field is changed to valid length', async () => {
    const worker = workerBuilder();
    const references = [worker] as Worker[];
    const { component } = await setup(references);
    const maxLength = component.fixture.componentInstance.maxLength;
    const workerReference = 'This is over fifty characters................................................';
    const errorMessage = `Reference must be ${maxLength} characters or fewer`;
    const form = component.fixture.componentInstance.form;

    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
    form.controls[`reference-${worker.uid}`].setValue(workerReference);
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(form.controls[`reference-${worker.uid}`].errors).toEqual({
      maxlength: {
        requiredLength: maxLength,
        actualLength: workerReference.length,
      },
    });

    form.controls[`reference-${worker.uid}`].setValue('valid');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
  });

  it('should show duplicate error when submitting with same input in multiple boxes(4 messages - 2 top, 2 under fields)', async () => {
    const workers = [workerBuilder(), workerBuilder()];
    const references = workers as Worker[];
    const { component } = await setup(references);
    const form = component.fixture.componentInstance.form;
    const errorMessage = 'This reference matches another, it needs to be unique';

    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
    form.controls[`reference-${workers[0].uid}`].markAsDirty();
    form.controls[`reference-${workers[1].uid}`].markAsDirty();
    form.controls[`reference-${workers[0].uid}`].setValue('abc');
    form.controls[`reference-${workers[1].uid}`].setValue('abc');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage, { exact: false }).length).toBe(4);
    expect(form.controls[`reference-${workers[0].uid}`].errors).toEqual({ duplicate: true });
    expect(form.controls[`reference-${workers[1].uid}`].errors).toEqual({ duplicate: true });
  });

  it('should only show 1 duplicate error when submitting with same input in 2 box when 1 dirty', async () => {
    const workers = [workerBuilder(), workerBuilder()];
    const references = workers as Worker[];
    const { component } = await setup(references);
    const form = component.fixture.componentInstance.form;
    const errorMessage = 'This reference matches another, it needs to be unique';

    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
    form.controls[`reference-${workers[0].uid}`].markAsDirty();
    form.controls[`reference-${workers[0].uid}`].setValue('abc');
    form.controls[`reference-${workers[1].uid}`].setValue('abc');
    component.fixture.detectChanges();
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage, { exact: false }).length).toBe(2);
    expect(form.controls[`reference-${workers[0].uid}`].errors).toEqual({ duplicate: true });
    expect(form.controls[`reference-${workers[1].uid}`].errors).toEqual(null);
  });

  it('should remove duplicate error messages after submitting with same input and then changing one field', async () => {
    const workers = [workerBuilder(), workerBuilder()];
    const references = workers as Worker[];
    const { component } = await setup(references);
    const form = component.fixture.componentInstance.form;
    const errorMessage = 'This reference matches another, it needs to be unique';

    form.controls[`reference-${workers[0].uid}`].markAsDirty();
    form.controls[`reference-${workers[1].uid}`].markAsDirty();
    form.controls[`reference-${workers[0].uid}`].setValue('abc');
    form.controls[`reference-${workers[1].uid}`].setValue('abc');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage, { exact: false }).length).toBe(4);

    form.controls[`reference-${workers[0].uid}`].setValue('a');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(component.queryByText(errorMessage, { exact: false })).toBeNull();
    expect(form.controls[`reference-${workers[0].uid}`].errors).toEqual(null);
  });

  it('should continue validation once duplicate errors are resolved', async () => {
    const workers = [workerBuilder(), workerBuilder()];
    const references = workers as Worker[];
    const { component } = await setup(references);
    const form = component.fixture.componentInstance.form;
    const uniqueErrorMessage = 'This reference matches another, it needs to be unique';
    const maxLength = component.fixture.componentInstance.maxLength;
    const lengthErrorMessage = `Reference must be ${maxLength} characters or fewer`;
    const overMaxValue = 'abcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabc';

    form.controls[`reference-${workers[0].uid}`].markAsDirty();
    form.controls[`reference-${workers[1].uid}`].markAsDirty();
    form.controls[`reference-${workers[0].uid}`].setValue(overMaxValue);
    form.controls[`reference-${workers[1].uid}`].setValue(overMaxValue);
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(lengthErrorMessage, { exact: false }).length).toBe(4);

    form.controls[`reference-${workers[0].uid}`].setValue('abc');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(component.getAllByText(lengthErrorMessage, { exact: false }).length).toBe(2);
    expect(form.controls[`reference-${workers[0].uid}`].errors).toEqual(null);

    form.controls[`reference-${workers[1].uid}`].setValue('abc');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(component.getAllByText(uniqueErrorMessage, { exact: false }).length).toBe(4);

    form.controls[`reference-${workers[1].uid}`].setValue('abcd');
    component.fixture.componentInstance.onSubmit(event);
    component.fixture.detectChanges();
    expect(component.queryByText(uniqueErrorMessage, { exact: false })).toBeNull();
    expect(component.queryByText(lengthErrorMessage, { exact: false })).toBeNull();
    expect(form.controls[`reference-${workers[0].uid}`].errors).toEqual(null);
    expect(form.controls[`reference-${workers[1].uid}`].errors).toEqual(null);
  });
});
