import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { EligibilityIconComponent } from '@shared/components/eligibility-icon/eligibility-icon.component';
import { InsetTextComponent } from '@shared/components/inset-text/inset-text.component';
import { BasicRecordComponent } from '@shared/components/staff-record-summary/basic-record/basic-record.component';
import { SummaryRecordValueComponent } from '@shared/components/summary-record-value/summary-record-value.component';
import { render, within } from '@testing-library/angular';

import { MandatoryDetailsComponent } from './mandatory-details.component';

describe('MandatoryDetailsComponent', () => {
    const sinon = require('sinon');
    const { build, fake, sequence } = require('@jackfranklin/test-data-bot');

    const establishmentBuilder = build('Establishment', {
        fields: {
            id: sequence(),
            uid: fake((f) => f.random.uuid()),
            name: fake((f) => f.lorem.sentence()),
        },
    });

    const establishment = establishmentBuilder() as Establishment;

    const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
        can: sinon.stub().returns(true),
    });

    let setup;
    beforeEach(async () => {
        setup = await render(MandatoryDetailsComponent, {
            imports: [
              RouterModule, RouterTestingModule, HttpClientTestingModule
            ],
            declarations: [
                InsetTextComponent, BasicRecordComponent, SummaryRecordValueComponent, EligibilityIconComponent
            ],
            providers: [{
                provide: WindowRef,
                useValue: WindowRef
            },
            {
                provide: FormBuilder,
                useValue: FormBuilder
            },
            {
                provide: WorkerService,
                useClass: MockWorkerService
            },
            {
                provide: PermissionsService,
                useValue: mockPermissionsService
            },
            {
                provide: ActivatedRoute,
                useValue: {
                    snapshot: {
                        url: [{ path: 1 }, { path: 2 }],
                        params: {
                            establishmentuid: establishment.uid
                        }
                    },
                    parent: {
                        snapshot: {
                            data: {
                                establishment
                            }
                        },
                    }
                }
            }]
        });

    });

    it('should create', async () => {
        const component = await setup;

        expect(component).toBeTruthy();
    });
    it('should show Worker information in summary list', async () => {
        const { click, getByTestId, fixture } = await setup;

        fixture.detectChanges();

        const container = within(getByTestId('summary'));
        const expectedWorker = fixture.componentInstance.worker;

        expect(container.getAllByText(expectedWorker.nameOrId));
        expect(container.getAllByText(expectedWorker.mainJob.title));
        expect(container.getAllByText(expectedWorker.contract));
    });
    it('should show have the title mandatory details on summary', async () => {
        const { click, getByTestId, fixture } = await setup;

        fixture.detectChanges();

        const container = within(getByTestId('summary'));

        expect(container.getAllByText('Mandatory details'));
    });
    it('should return to previous page if you click on the change link', async () => {
        const { click, getByTestId, fixture } = await setup;
        fixture.detectChanges();

        const container = within(getByTestId('summary'));
        const change = container.getByText('Change');
        expect(
            change.getAttribute('href')
        ).toEqual(
            `/workplace/${establishment.uid}/staff-record/${fixture.componentInstance.worker.uid}/staff-details`
        );
    });
    it('should submit and move to next page when add details button clicked', async () => {
        const { click, getByTestId, fixture } = await setup;

        fixture.detectChanges();

        const submission = spyOn(fixture.componentInstance, 'onSubmit');
        const detailsButton = getByTestId('add-details-button');
        detailsButton.click();
        expect(submission).toHaveBeenCalled();
    });
    it('should take you to to dashboard', async () => {
        const { click, getByTestId, fixture } = await setup;

        fixture.detectChanges();

        const navDash = spyOn(fixture.componentInstance, 'navigateToDashboard');
        const allWorkersButton = getByTestId('view-all-workers-button');
        click(allWorkersButton);
        expect(navDash).toHaveBeenCalled();
    });
});
