import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AddMandatoryTrainingComponent } from './add-mandatory-training.component';
import { AddMandatoryTrainingModule } from './add-mandatory-training.module';

describe('AddMandatoryTrainingComponent', () => {
  async function setup() {
    const component = await render(AddMandatoryTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, AddMandatoryTrainingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        AlertService,
        BackService,
        DialogService,
        TrainingService,
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: '123',
                  },
                },
              },
            },
          },
        },
      ],
    });
    return {
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('setBackLink', async () => {
    it('should return to dashboard when the workplace is the primary workplace', async () => {
      const { component } = await setup();
      const expectedReturnUrl = { url: ['/dashboard'], fragment: 'training-and-qualifications' };

      component.fixture.componentInstance.primaryWorkplace.uid = '123';
      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(component.fixture.componentInstance.return).toEqual(expectedReturnUrl);
    });

    it('should return to subsidiary dashboard when the workplace is not the primary workplace', async () => {
      const { component } = await setup();
      const expectedReturnUrl = { url: ['/workplace', '123'], fragment: 'training-and-qualifications' };

      component.fixture.componentInstance.primaryWorkplace.uid = '125';
      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(component.fixture.componentInstance.return).toEqual(expectedReturnUrl);
    });
  });
});
