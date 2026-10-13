import { z } from 'zod';
import { SECTOR_KEYS, type SectorKey } from './rules-schema';

/**
 * Presentation content for sectors, keyed by the sector keys in rules. No regulatory values.
 * The list of sectors itself comes from rules.sectors; /sectors, the selectors and the guide
 * filters all read it from there, so a sector is never hard-coded in a component.
 * Example products are illustrations of product families, not statements of scope.
 */

export const sectorContentSchema = z.object({
  key: z.enum(SECTOR_KEYS),
  summary: z.string().min(1),
  dataNeeds: z.array(z.string().min(1)).min(1),
  overview: z.string().min(1),
  exampleProducts: z.array(z.string().min(1)).min(1),
  codeConcept: z.string().min(1),
  evidenceQuestions: z.array(z.string().min(1)).min(2),
  relatedGuide: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
export type SectorContent = z.infer<typeof sectorContentSchema>;

const CODE_CONCEPT_PREFIX = 'Scope follows the commodity code on the entry, not the product name.';

export const SECTOR_CONTENT: Readonly<Record<SectorKey, SectorContent>> = {
  aluminium: {
    key: 'aluminium',
    summary: 'Whether an aluminium product is in scope depends on its commodity code.',
    dataNeeds: ['Commodity codes', 'Country of origin', 'Producer emissions data'],
    overview:
      'Aluminium moves through several forms between smelter and finished article, and the forms are coded separately. Importers often hold a mix of raw metal, semi-finished products and finished articles.',
    exampleProducts: [
      'Unwrought aluminium and ingot',
      'Bars, rods and profiles',
      'Sheet, plate and foil',
      'Wire and tube',
    ],
    codeConcept: `${CODE_CONCEPT_PREFIX} A profile and a finished article made from it can sit under different codes.`,
    evidenceQuestions: [
      'Which smelter or casthouse produced the metal?',
      'Is the form of the product recorded the same way on every entry?',
      'Can the producer give verified emissions per tonne of product?',
    ],
    relatedGuide: 'commodity-codes-and-scope',
  },
  cement: {
    key: 'cement',
    summary: 'Cement lines are matched by commodity code and need producer-level data.',
    dataNeeds: ['Commodity codes', 'Country of origin', 'Producer emissions data'],
    overview:
      'Cement is usually bought in bulk from a small number of plants, which makes producer-level data both important and realistic to collect. Bagged and bulk shipments may be recorded differently.',
    exampleProducts: ['Grey cement, bulk', 'Grey cement, bagged', 'Other hydraulic cements'],
    codeConcept: `${CODE_CONCEPT_PREFIX} Check that bagged and bulk shipments of the same product use the code you expect.`,
    evidenceQuestions: [
      'Which plant made the cement?',
      'Is the same code used on every entry for the same product?',
      'Does the producer report emissions per tonne, with a method and a period?',
    ],
    relatedGuide: 'commodity-codes-and-scope',
  },
  fertilisers: {
    key: 'fertilisers',
    summary:
      'Fertiliser imports are matched by commodity code and often come from several producers.',
    dataNeeds: ['Commodity codes', 'Country of origin', 'Producer emissions data'],
    overview:
      'Fertiliser imports often come from several producers and in several grades. Blends and different grades can carry different codes, so a single supplier may appear under more than one.',
    exampleProducts: ['Single-nutrient fertilisers', 'Compound and blended fertilisers'],
    codeConcept: `${CODE_CONCEPT_PREFIX} Blends and grades from the same supplier may be coded differently.`,
    evidenceQuestions: [
      'Which plant and which product grade does each line relate to?',
      'Are blends split by product on the entry or recorded as one line?',
      'Does the producer report emissions per tonne of each grade?',
    ],
    relatedGuide: 'supplier-emissions-data',
  },
  hydrogen: {
    key: 'hydrogen',
    summary: 'Hydrogen imports are matched by commodity code and need producer-level data.',
    dataNeeds: ['Commodity codes', 'Country of origin', 'Producer emissions data'],
    overview:
      'Hydrogen is traded in smaller volumes and by fewer producers, so each supplier matters. How the hydrogen was produced is likely to be a central question when emissions data is requested.',
    exampleProducts: ['Hydrogen'],
    codeConcept: `${CODE_CONCEPT_PREFIX} Confirm the quantity is recorded in the unit your records need.`,
    evidenceQuestions: [
      'Which installation produced the hydrogen, and by what route?',
      'Is the quantity recorded consistently as mass?',
      'Can the producer share verified emissions data for the period?',
    ],
    relatedGuide: 'supplier-emissions-data',
  },
  iron_steel: {
    key: 'iron_steel',
    summary:
      'Iron and steel lines span many commodity codes; some related items fall outside scope.',
    dataNeeds: ['Commodity codes', 'Country of origin', 'Producer emissions data'],
    overview:
      'Iron and steel spans a wide range of products, from semi-finished steel to articles made from it. Many lines, many codes and many mills make this the sector where a clean ledger saves the most time.',
    exampleProducts: [
      'Flat products such as coil and sheet',
      'Long products such as bar and wire rod',
      'Tube and pipe',
      'Some articles made from steel',
    ],
    codeConcept: `${CODE_CONCEPT_PREFIX} Related items, such as scrap or finished articles, may fall under different codes from the steel they are made from, so check each one.`,
    evidenceQuestions: [
      'Which mill made the steel, and by which production route?',
      'Does the code on the entry match the code on the mill documents?',
      'Are articles made from steel coded separately from the raw product?',
    ],
    relatedGuide: 'commodity-codes-and-scope',
  },
};
