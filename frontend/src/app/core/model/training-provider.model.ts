export type TrainingProvider = {
  id: number;
  name: string;
  isOther: boolean;
};

export type GetTrainingProvidersResponse = {
  trainingProviders: Array<TrainingProvider>;
};
