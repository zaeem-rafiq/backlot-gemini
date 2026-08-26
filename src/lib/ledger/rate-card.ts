export interface RateCard {
  name: string;
  currency: "USD";
  crewDaily: {
    directorOfPhotography: number;
    firstAssistantCamera: number;
    gaffer: number;
    keyGrip: number;
    soundMixer: number;
    firstAssistantDirector: number;
    productionAssistant: number;
    paCount: number;
    // Conditional roles
    stuntCoordinator: number;
    animalWrangler: number;
    sfxTech: number;
    hairMakeup: number;
  };
  nightCrewPremiumRate: number; // 0.15 = 15%
  castDaily: {
    speakingPerformer: number;
    backgroundPerformer: number;
  };
  equipmentDaily: {
    cameraPackage: number;
    lightingGripPackage: number;
    soundPackage: number;
  };
  locationsLogistics: {
    locationPerDay: number;
    mealPerPersonPerDay: number;
    transportPerCompanyMove: number;
    productionInsuranceFlat: number;
  };
  postProduction: {
    editorFlat: number;
    colorGradeFlat: number;
    soundMixFlat: number;
    musicLicensingFlat: number;
    vfxPerShot: number;
  };
  contingencyRate: number; // 0.10 = 10%
}

export const DEFAULT_INDIE_RATE_CARD: RateCard = {
  name: "US Non-Union Indie Short (2026 Standard)",
  currency: "USD",
  crewDaily: {
    directorOfPhotography: 650,
    firstAssistantCamera: 350,
    gaffer: 400,
    keyGrip: 300,
    soundMixer: 450,
    firstAssistantDirector: 500,
    productionAssistant: 150,
    paCount: 2,
    stuntCoordinator: 650,
    animalWrangler: 400,
    sfxTech: 450,
    hairMakeup: 350,
  },
  nightCrewPremiumRate: 0.15,
  castDaily: {
    speakingPerformer: 250,
    backgroundPerformer: 125,
  },
  equipmentDaily: {
    cameraPackage: 450,
    lightingGripPackage: 350,
    soundPackage: 125,
  },
  locationsLogistics: {
    locationPerDay: 400,
    mealPerPersonPerDay: 22,
    transportPerCompanyMove: 180,
    productionInsuranceFlat: 650,
  },
  postProduction: {
    editorFlat: 1500,
    colorGradeFlat: 600,
    soundMixFlat: 650,
    musicLicensingFlat: 400,
    vfxPerShot: 275,
  },
  contingencyRate: 0.10,
};
