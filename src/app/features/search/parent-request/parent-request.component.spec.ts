import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { FirstErrorPipe } from '@shared/pipes/first-error.pipe';
import { render } from '@testing-library/angular';
import { throwError } from 'rxjs';
import { spy } from 'sinon';

import { ParentRequestComponent } from './parent-request.component';

fdescribe('ParentRequestComponent', () => {
  async function getParentRequestComponent() {
    const parentRequest = {
      establishmentId: 1111,
      workplaceId: 'B1234567',
      userName: 'Mary Poppins',
      orgName: 'Fawlty Towers',
      requested: new Date()
    };

    return await render(ParentRequestComponent, {
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [ParentRequestsService],
      declarations: [FirstErrorPipe],
      componentProperties: {
        index: 0,
        removeParentRequest: {
          emit: spy(),
        } as any,
        parentRequest,
      },
    });
  }

  it('should create', async() => {
    const component = await getParentRequestComponent();

    expect(component).toBeTruthy();
  });
});
