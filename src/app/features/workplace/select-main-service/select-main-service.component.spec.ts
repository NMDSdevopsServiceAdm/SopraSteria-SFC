import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SelectMainServiceComponent } from '@features/workplace/select-main-service/select-main-service.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('SelectMainServiceComponent', () => {
  async function setup() {
    const component = await render(SelectMainServiceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    return {
      component,
    };
  }

  it('should render', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });
});
