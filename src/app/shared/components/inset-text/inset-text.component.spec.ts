import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { InsetTextComponent } from './inset-text.component';

describe('InsetTextComponent', () => {
  async function setup() {
    const { getByRole, getByText, getByLabelText, getByTestId, fixture, queryByText, queryByTestId } = await render(
      InsetTextComponent,
      {
        imports: [SharedModule],
        providers: [],
        componentProperties: {
          color: 'todo',
          closable: false,
          noFloatRight: false,
        },
      },
    );

    const component = fixture.componentInstance;

    return {
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      queryByText,
      fixture,
      component,
      queryByTestId,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show close link', async () => {
    const { component, getByText, fixture, getByRole } = await setup();

    component.closable = true;
    fixture.detectChanges();

    expect(getByText('Close')).toBeTruthy();
    expect(getByRole('link', { name: /close/i })).toBeTruthy();
  });

  it('should show the link provided', async () => {
    const { component, getByText, fixture, getByRole } = await setup();

    const linkText = 'Cancel this';

    component.linkTextForAlert = linkText;
    fixture.detectChanges();

    expect(getByText(linkText)).toBeTruthy();
    expect(getByRole('link', { name: linkText })).toBeTruthy();
  });

  it('should show the no float link', async () => {
    const { component, getByTestId, fixture, getByRole, queryByTestId } = await setup();

    const linkText = 'Cancel this';

    component.linkTextForAlert = linkText;
    component.noFloatRight = true;

    fixture.detectChanges();

    expect(getByTestId('noFloatRight')).toBeTruthy();
    expect(queryByTestId('floatRight')).toBeFalsy();
  });

  it('should show the float link', async () => {
    const { component, getByTestId, fixture, queryByTestId } = await setup();

    const linkText = 'Cancel this';

    component.linkTextForAlert = linkText;
    component.noFloatRight = false;

    fixture.detectChanges();

    expect(getByTestId('floatRight')).toBeTruthy();
    expect(queryByTestId('noFloatRight')).toBeFalsy();
  });
});
