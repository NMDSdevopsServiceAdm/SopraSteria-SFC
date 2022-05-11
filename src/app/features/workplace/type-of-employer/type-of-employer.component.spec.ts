import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { TypeOfEmployerComponent } from './type-of-employer.component';

const { build, fake, sequence } = require('@jackfranklin/test-data-bot');

fdescribe('TypeOfEmployerComponent', () => {
  const establishmentBuilder = build('Establishment', {
    fields: {
      id: sequence(),
      uid: fake((f) => f.datatype.uuid()),
      nameOrId: fake((f) => f.lorem.sentence()),
    },
  });

  async function setup(shareWith: any = null, isAdmin = true, subsidiaries = 0) {
    const establishment = establishmentBuilder() as Establishment;

    const { fixture, getByText } = await render(TypeOfEmployerComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
    };
  }

  it('should render a TotalStaff component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the page title with the establishment name in it', async () => {
    const { component, getByText } = await setup();
    const establishmentName = component.establishment.name;
    expect(getByText(`What type of employer is ${establishmentName}?`)).toBeTruthy();
  });
});
