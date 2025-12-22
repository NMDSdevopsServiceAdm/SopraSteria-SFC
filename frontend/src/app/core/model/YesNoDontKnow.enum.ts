export enum YesNoDontKnow {
  Yes = 'Yes',
  No = 'No',
  DontKnow = "Don't know",
}

export const YesNoDontKnowOptions = Object.freeze([
  { value: YesNoDontKnow.Yes, label: 'Yes' },
  { value: YesNoDontKnow.No, label: 'No' },
  { value: YesNoDontKnow.DontKnow, label: 'I do not know' },
]);
