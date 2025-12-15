export type RootStackParamList = {
  Root: undefined;
  ExercisePlayer: {
    exerciseId: string;
  };
  ProfessionSelect: undefined;
  Personalization: undefined;
  Settings: undefined;
  Achievements: undefined;
};

export type TabParamList = {
  Home: undefined;
  Exercises: undefined;
  Focus: undefined;
  Dashboard: {
    scrollTo?: 'history';
  };
};

