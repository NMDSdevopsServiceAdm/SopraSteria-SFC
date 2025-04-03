import { render } from '@testing-library/angular';
import { UpdateLeaversComponent } from './update-leavers.component';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormatUtil } from '@core/utils/format-util';

describe('UpdateLeaversComponent', () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 1);

  const todayOneYearAgo = FormatUtil.formatDateToLocaleDateString(today);

  const radioButtonLabels = {
    None: `No staff left on or after ${todayOneYearAgo}`,
    DoNotKnow: `I do not know how many staff left on or after ${todayOneYearAgo}`,
    Default: ''
  }

  const setup = async () => {
    const setupTools = await render(UpdateLeaversComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the page heading', async () => {
    const { getByRole } = await setup()

    const heading = getByRole('heading', { level: 1 });

    expect(heading.textContent).toEqual(`Update the number of staff who've left SINCE ${todayOneYearAgo}`);
  })

  it("should show the reveal text for 'Why we ask for this information'", async () => {
    const { getByText } = await setup()

    const reveal = getByText('Why we ask for this information');
      const revealText = getByText(
        "To show DHSC and the government the size of staff retention issues and help them make national and local policy and funding decisions.",
      );

      expect(reveal).toBeTruthy();
      expect(revealText).toBeTruthy();
  })

  it("should show warning icon with text", async () => {
    const { getByTestId } = await setup()

    const warningTextId = getByTestId('warning-text');
      const warningTextContent =
        `Remember to SUBTRACT or REMOVE any staff who left before ${todayOneYearAgo}`

      expect(warningTextId.textContent).toContain(warningTextContent);
  })

  it('should show the table title', async () => {
    const { getByText } = await setup()

    const tableTitleText = getByText('Leavers in the last 12 months')

    expect(tableTitleText).toBeTruthy()
  })

  it('should show the "Add more job roles" button', async () => {
    const { getByRole } = await setup();
    const addButton = getByRole('button', { name: 'Add more job roles' });

    expect(addButton).toBeTruthy();
  });

  it('should show a radio button for "No", and another for "I do not know"', async () => {
    const { getByLabelText } = await setup();

    expect(getByLabelText(radioButtonLabels.None)).toBeTruthy();
    expect(getByLabelText(radioButtonLabels.DoNotKnow)).toBeTruthy();
  });

  it('should show a "Save and return" button and Cancel link', async () => {
    const { getByRole, getByText } = await setup();

    expect(getByRole('button', { name: 'Save and return' })).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });
});
