import { claimCategories, commandNames, inputTypes, listeningModes } from './types';

export const schemaFiles = [
  'schemas/claim-taxonomy.schema.json',
  'schemas/listening-output.schema.json',
  'schemas/router-output.schema.json',
  'schemas/routing-plan.schema.json',
  'schemas/command-output.schema.json',
  'schemas/reference-map.schema.json',
  'schemas/comparative-listening-output.schema.json',
] as const;

export const appContract = {
  claimCategories,
  commandNames,
  inputTypes,
  listeningModes,
  schemaFiles,
};
