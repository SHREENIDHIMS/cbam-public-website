import {
  createLiabilityPreviewInputSchema,
  type CreateLiabilityPreviewInput,
} from '@/lib/api/schemas';
import type { FileType } from './file-checks';
import type { ValidationResult } from './validate-rows';

/**
 * Builds the only thing that leaves the browser: mapped, validated rows plus the file hash and
 * counts. Headers, raw cells and the file name are never part of it.
 */
export function buildPreviewRequest(input: {
  fileSha256: string;
  fileType: FileType;
  sheetName: string | null;
  validation: ValidationResult;
}): CreateLiabilityPreviewInput {
  return createLiabilityPreviewInputSchema.parse({
    fileSha256: input.fileSha256,
    fileType: input.fileType,
    sheetName: input.sheetName,
    rows: input.validation.payloadRows,
    clientSummary: input.validation.counts,
  });
}

export function rowBand(includedRows: number): 'under_100' | '100_1000' | '1000_5000' {
  if (includedRows < 100) return 'under_100';
  if (includedRows < 1000) return '100_1000';
  return '1000_5000';
}
