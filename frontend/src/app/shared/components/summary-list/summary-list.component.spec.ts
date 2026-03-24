import { render, fireEvent } from '@testing-library/angular';
import { SummaryListComponent } from './summary-list.component';

describe('SummaryListComponent', () => {
  async function setup(summaryList = [{ label: 'Full name', data: 'John Doe' }], displayShowPasswordToggle = false) {
    const setupTools = await render(SummaryListComponent, {
      imports: [],
      componentProperties: {
        summaryList,
        displayShowPasswordToggle
      }
    })

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('With no change link', () => {
    it('should show the summary list label and value', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Full name')).toBeTruthy();
      expect(queryByText('John Doe')).toBeTruthy();
    });
  })

  describe('With a change link', () => {
    it('should show the summary list label and value', async () => {
      const mockListWithLink = [
        { label: 'Full name',
          data: 'John Doe',
          route: { url: ['/registration/confirm-details/user-research-invite'] }
        }
      ];

      const { getByText, queryByText } = await setup(mockListWithLink);

      const changeLink = getByText('Change')

      expect(queryByText('Full name')).toBeTruthy();
      expect(queryByText('John Doe')).toBeTruthy();
      expect(changeLink.getAttribute('href')).toEqual(
        '/registration/confirm-details/user-research-invite'
      );
      expect(queryByText('Add')).toBeFalsy();
    });
  })

  describe('When there is no data', () => {
    it('should show the summary list label, value and an add link', async () => {
      const mockListWithLink = [
        { label: 'Full name',
          data: null,
          route: { url: ['/registration/confirm-details/user-research-invite'] }
        }
      ];

      const { getByText, queryByText } = await setup(mockListWithLink);

      const addLink = queryByText('Add')

      expect(queryByText('Full name')).toBeTruthy();
      expect(getByText('-')).toBeTruthy();
      expect(addLink.getAttribute('href')).toEqual(
        '/registration/confirm-details/user-research-invite'
      );
      expect(queryByText('Change')).toBeFalsy();
    });
  })

  describe('Show password button', () => {
    it('should hide the password before clicking show', async () => {
      const mockList = [{ label: 'Password', data: 'Password123' }];
      const { fixture, getByText, queryByText } = await setup(mockList, true);

      const expectedShownPassword = 'Password123';
      const expectedHiddenPassword = '******';
      fixture.detectChanges();

      expect(getByText(expectedHiddenPassword)).toBeTruthy();
      expect(queryByText(expectedShownPassword)).toBeFalsy();
    });

    it('should display the password after clicking show', async () => {
      const mockList = [{ label: 'Password', data: 'Password123' }];
      const { fixture, getByText, queryByText } = await setup(mockList, true);

      const expectedHiddenPassword = '******';
      const expectedShownPassword = 'Password123';

      const showPasswordButton = getByText('Show password');
      fireEvent.click(showPasswordButton);
      fixture.detectChanges();

      expect(queryByText(expectedHiddenPassword)).toBeFalsy();
      expect(queryByText(expectedShownPassword)).toBeTruthy();
    });
  });
});
