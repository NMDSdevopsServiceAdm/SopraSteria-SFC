import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { render, RenderResult } from '@testing-library/angular';

import { TrainingAndQualificationsCategoriesComponent } from './training-and-qualifications-categories.component';

const sinon = require('sinon');

describe('TrainingAndQualificationsCategoriesComponent', () => {
  let component: RenderResult<TrainingAndQualificationsCategoriesComponent>;

  it('should create', async () => {
    var mockPermissionsService = sinon.createStubInstance(PermissionsService, {
      can: sinon.stub().returns(true),
    });

    component = await render(TrainingAndQualificationsCategoriesComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [ { provide: PermissionsService, useValue: mockPermissionsService } ],
      componentProperties: {
        workplace: {
          id: 123,
          uid: '123',
          name: 'Test Workplace',
        } as Establishment,
        trainingCategories: [],
      }
    });

    expect(component).toBeTruthy();
  });
});
