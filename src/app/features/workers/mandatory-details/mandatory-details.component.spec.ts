import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { WindowRef } from '@core/services/window.ref';
import { InsetTextComponent } from '@shared/components/inset-text/inset-text.component';
import { BasicRecordComponent } from '@shared/components/staff-record-summary/basic-record/basic-record.component';
import { render, RenderResult, within } from '@testing-library/angular';

import { MandatoryDetailsComponent } from './mandatory-details.component';

const sinon = require('sinon');
const { build, fake, sequence, perBuild, oneOf } = require('@jackfranklin/test-data-bot');

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    name: fake((f) => f.lorem.sentence()),
  },
});

const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    NameOrIdValue: fake((f) => f.name.findName()),
    mainJob: perBuild(() => {
      return {
        id: sequence(),
        title: fake((f) => f.lorem.sentence()),
      };
    }),
    contract: oneOf('Permanent', 'Temporary', 'Pool or Bank', 'Agency', 'Other')
  },
});

fdescribe('MandatoryDetailsComponent', () => {
  let component: RenderResult<MandatoryDetailsComponent>;
  const establishment = establishmentBuilder() as Establishment;

  it('should create', async () => {
    component = await render(MandatoryDetailsComponent, {
      imports: [
        RouterTestingModule, HttpClientTestingModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
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
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            url: [{ path: 1 }, { path: 2 }]
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

    expect(component).toBeTruthy();
  });
  it('should show Worker information in summary list', async () => {

    const worker = workerBuilder();

    const { click, getByTestId } = await render(MandatoryDetailsComponent, {
      imports: [
        RouterTestingModule, HttpClientTestingModule
      ],
      declarations: [
        InsetTextComponent, BasicRecordComponent
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
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            url: [{ path: 1 }, { path: 2 }]
          },
          parent: {
            snapshot: {
              data: {
                establishment
              }
            },
          }
        }
      }],
      componentProperties: {
        worker
      }
    });

    const container = within(getByTestId('summary'));

    expect(container.getAllByText(worker.NameOrIdValue));
    expect(container.getAllByText(worker.mainJob));
    expect(container.getAllByText(worker.contract));
  });
});
