import { StatusSummaryComponent } from './status-summary.component';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { render } from '@testing-library/angular';

describe('StatusSummaryComponent', () => {
  const defaultLocalAuthorities = {
    B: [{ name: 'B LA1', notes: true, status: 'Not updated', workers: 0 }],
    C: [{ name: 'C LA1', notes: false, status: 'Update, complete', workers: 10 }],
    D: [{ name: 'D LA1', notes: true, status: 'Not updated', workers: 10 }],
    E: [
      { name: 'E LA1', notes: false, status: 'Update, not complete', workers: 0 },
      { name: 'E LA2', notes: false, status: 'Update, not complete', workers: 0 },
    ],
    F: [
      { name: 'F LA1', notes: true, status: 'Confirmed, complete', workers: 10 },
      { name: 'F LA2', notes: false, status: 'Not updated', workers: 0 },
    ],
    G: [{ name: 'G LA1', notes: true, status: 'Not updated', workers: 10 }],
    H: [{ name: 'H LA1', notes: false, status: 'Confirmed, not complete', workers: 0 }],
    I: [{ name: 'I LA1', notes: true, status: 'Not updated', workers: 10 }],
    J: [
      { name: 'J LA1', notes: false, status: 'Not updated', workers: 0 },
      { name: 'J LA2', notes: true, status: 'Confirmed, complete', workers: 10 },
    ],
  };
  async function setup(localAuthoritiesOverrides = defaultLocalAuthorities) {
    const setupTools = await render(StatusSummaryComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                localAuthorities: localAuthoritiesOverrides,
              },
            },
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      component,
      ...setupTools,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the page heading', async () => {
    const { getByTestId } = await setup();
    const heading = getByTestId('heading');
    expect(heading.textContent).toEqual('Status summary');
  });

  describe('Status summary table', () => {
    it('should display the table headers', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId('year-heading').textContent.trim()).toEqual('Year');
      expect(getByTestId('signed-off-heading').textContent.trim()).toEqual('Signed off');
      expect(getByTestId('active-heading').textContent.trim()).toEqual('Active');
      expect(getByTestId('failed-data-quality-heading').textContent.trim()).toEqual('Failed data quality');
      expect(getByTestId('no-activity-heading').textContent.trim()).toEqual('No sign of activity on account');
    });

    describe('When there are local authorities in each category', () => {
      it('should display the correct table values', async () => {
        const { getByTestId } = await setup();
        expect(getByTestId('signed-off-value').textContent.trim()).toEqual('2');
        expect(getByTestId('active-value').textContent.trim()).toEqual('3');
        expect(getByTestId('failed-data-quality-value').textContent.trim()).toEqual('1');
        expect(getByTestId('no-activity-value').textContent.trim()).toEqual('6');
      });
    });

    describe('When there are no local authorities in some categories', () => {
      it('should display the correct table values', async () => {
        const customLocalAuthorities = {
          B: [{ name: 'H LA1', notes: false, status: 'Confirmed, not complete', workers: 0 }],
          C: [{ name: 'C LA1', notes: false, status: 'Update, complete', workers: 10 }],
          D: [{ name: 'H LA1', notes: false, status: 'Confirmed, not complete', workers: 0 }],
          E: [
            { name: 'E LA1', notes: false, status: 'Update, not complete', workers: 0 },
            { name: 'E LA2', notes: false, status: 'Update, not complete', workers: 0 },
          ],
          F: [{ name: 'H LA1', notes: false, status: 'Confirmed, not complete', workers: 0 }],
          G: [{ name: 'H LA1', notes: false, status: 'Confirmed, not complete', workers: 0 }],
          H: [{ name: 'H LA1', notes: false, status: 'Confirmed, not complete', workers: 0 }],
          I: [{ name: 'H LA1', notes: false, status: 'Confirmed, not complete', workers: 0 }],
          J: [{ name: 'H LA1', notes: false, status: 'Confirmed, not complete', workers: 0 }],
        };
        const { getByTestId } = await setup(customLocalAuthorities);
        expect(getByTestId('signed-off-value').textContent.trim()).toEqual('0');
        expect(getByTestId('active-value').textContent.trim()).toEqual('3');
        expect(getByTestId('failed-data-quality-value').textContent.trim()).toEqual('7');
        expect(getByTestId('no-activity-value').textContent.trim()).toEqual('0');
      });
    });
  });
});
