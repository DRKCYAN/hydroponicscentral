/**
 * Crop/stage nutrient target profiles (ppm elemental) — starting points for the
 * Recipe Solver. Real growers tune these; these are representative presets.
 */
export interface CropTarget {
  id: string;
  name: string;
  stage: string;
  ppm: { N: number; P: number; K: number; Ca: number; Mg: number; S: number };
  ecTarget: number; // dS/m rough
}

export const CROP_TARGETS: CropTarget[] = [
  {
    id: "lettuce-veg",
    name: "Lettuce / leafy greens",
    stage: "Vegetative",
    ppm: { N: 150, P: 45, K: 200, Ca: 160, Mg: 45, S: 60 },
    ecTarget: 1.4,
  },
  {
    id: "tomato-veg",
    name: "Tomato",
    stage: "Vegetative",
    ppm: { N: 180, P: 50, K: 250, Ca: 180, Mg: 50, S: 70 },
    ecTarget: 2.2,
  },
  {
    id: "tomato-fruit",
    name: "Tomato",
    stage: "Fruiting",
    ppm: { N: 150, P: 50, K: 350, Ca: 190, Mg: 55, S: 90 },
    ecTarget: 2.6,
  },
  {
    id: "strawberry",
    name: "Strawberry",
    stage: "Fruiting",
    ppm: { N: 120, P: 40, K: 210, Ca: 150, Mg: 45, S: 55 },
    ecTarget: 1.6,
  },
  {
    id: "basil",
    name: "Basil / herbs",
    stage: "Vegetative",
    ppm: { N: 160, P: 45, K: 210, Ca: 150, Mg: 45, S: 60 },
    ecTarget: 1.6,
  },
];
