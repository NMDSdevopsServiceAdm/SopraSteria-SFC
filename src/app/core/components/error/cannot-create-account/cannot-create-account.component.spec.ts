import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CannotCreateAccountComponent } from './cannot-create-account.component';

describe('CannotCreateAccountComponent', () => {
  async function setup(flow = 'registration') {
    const { fixture, getByTestId } = await render(CannotCreateAccountComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        BackService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { flow },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    return { component, getByTestId };
  }

  it('should render the CannotCreateAccountComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('create account', () => {
    it('should render the correct heading', async () => {
      const { getByTestId } = await setup();
      const expectedHeading = 'We cannot create an account for you at the moment';

      expect(getByTestId('heading').textContent).toEqual(expectedHeading);
    });

    it('should render the correct first paragraph', async () => {
      const { getByTestId } = await setup();
      const createAccountParagraphText = 'create an account';

      expect(getByTestId('firstParagraph').textContent).toContain(createAccountParagraphText);
    });
  });

  describe('add workplace', () => {
    it('should render the correct heading', async () => {
      const { getByTestId } = await setup('add-workplace');
      const expectedHeading = 'You cannot add this workplace at the moment';

      expect(getByTestId('heading').textContent).toEqual(expectedHeading);
    });

    it('should render the correct first paragraph', async () => {
      const { getByTestId } = await setup('add-workplace');
      const addWorkplaceParagraphText = 'add a new workplace';

      expect(getByTestId('firstParagraph').textContent).toContain(addWorkplaceParagraphText);
    });
  });
});
