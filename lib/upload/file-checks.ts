import { toolsConfig } from '@/lib/config/tools';

export type FileType = 'csv' | 'xlsx';
export type FileRejection = 'file_type' | 'macro_file' | 'file_size';

export type FileCheck =
  { ok: true; fileType: FileType } | { ok: false; reason: FileRejection; message: string };

export interface FileLike {
  name: string;
  type: string;
  size: number;
}

const MEGABYTE = 1024 * 1024;

export const FILE_CHECK_MESSAGES: Record<FileRejection, string> = {
  file_type:
    'This file type is not supported. Upload a .csv or .xlsx file. Older .xls files can be saved as .xlsx first.',
  macro_file:
    'Macro-enabled workbooks (.xlsm, .xlsb) are not accepted. Save a copy as a plain .xlsx or .csv file and upload that.',
  file_size: `This file is larger than ${toolsConfig.upload.maxFileBytes / MEGABYTE} MB. Export fewer rows or split the file and try again.`,
};

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

/**
 * Checks extension, MIME type and size before anything is read. A MIME type that is empty is
 * accepted because browsers often leave it blank for spreadsheets; a wrong one is not.
 */
export function checkFile(file: FileLike): FileCheck {
  const extension = extensionOf(file.name);
  const { maxFileBytes, mimeAllowList } = toolsConfig.upload;

  if (extension === '.xlsm' || extension === '.xlsb' || extension === '.xltm') {
    return { ok: false, reason: 'macro_file', message: FILE_CHECK_MESSAGES.macro_file };
  }
  if (file.type === 'application/vnd.ms-excel.sheet.macroenabled.12') {
    return { ok: false, reason: 'macro_file', message: FILE_CHECK_MESSAGES.macro_file };
  }

  const fileType: FileType | null =
    extension === '.csv' ? 'csv' : extension === '.xlsx' ? 'xlsx' : null;
  if (!fileType) {
    return { ok: false, reason: 'file_type', message: FILE_CHECK_MESSAGES.file_type };
  }

  const mime = file.type.toLowerCase().split(';')[0]!.trim();
  if (!mimeAllowList[fileType].includes(mime)) {
    return { ok: false, reason: 'file_type', message: FILE_CHECK_MESSAGES.file_type };
  }

  if (file.size > maxFileBytes) {
    return { ok: false, reason: 'file_size', message: FILE_CHECK_MESSAGES.file_size };
  }
  return { ok: true, fileType };
}
