import { describe, expect, it } from 'vitest';
import { checkFile } from '@/lib/upload/file-checks';

const file = (name: string, type = '', size = 1000) => ({ name, type, size });

describe('checkFile', () => {
  it('accepts csv and xlsx, including an empty or generic MIME type', () => {
    expect(checkFile(file('a.csv', 'text/csv'))).toEqual({ ok: true, fileType: 'csv' });
    expect(checkFile(file('A.CSV', 'application/vnd.ms-excel'))).toEqual({
      ok: true,
      fileType: 'csv',
    });
    expect(checkFile(file('a.xlsx', ''))).toEqual({ ok: true, fileType: 'xlsx' });
    expect(
      checkFile(
        file('a.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      ),
    ).toEqual({ ok: true, fileType: 'xlsx' });
  });

  it('rejects macro-enabled workbooks with their own reason', () => {
    for (const name of ['a.xlsm', 'a.xlsb', 'a.XLSM']) {
      expect(checkFile(file(name))).toMatchObject({ ok: false, reason: 'macro_file' });
    }
    const result = checkFile(file('a.xlsm'));
    expect(result.ok === false && result.message).toMatch(/Macro-enabled/);
  });

  it('rejects other extensions, including legacy xls', () => {
    for (const name of ['a.xls', 'a.pdf', 'a', 'a.csv.exe', 'a.txt']) {
      expect(checkFile(file(name))).toMatchObject({ ok: false, reason: 'file_type' });
    }
  });

  it('rejects a MIME type that does not match the extension', () => {
    expect(checkFile(file('a.csv', 'application/pdf'))).toMatchObject({
      ok: false,
      reason: 'file_type',
    });
    expect(checkFile(file('a.xlsx', 'image/png'))).toMatchObject({
      ok: false,
      reason: 'file_type',
    });
  });

  it('enforces the size limit at 10 MB', () => {
    expect(checkFile(file('a.csv', 'text/csv', 10 * 1024 * 1024))).toMatchObject({ ok: true });
    expect(checkFile(file('a.csv', 'text/csv', 10 * 1024 * 1024 + 1))).toMatchObject({
      ok: false,
      reason: 'file_size',
    });
  });
});
