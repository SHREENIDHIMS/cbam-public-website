import { describe, expect, it } from 'vitest';
import {
  REQUIRED_FIELD_KEYS,
  UPLOAD_FIELDS,
  UPLOAD_FIELD_KEYS,
  uploadFieldSchema,
} from '@/lib/config/upload-fields';
import { toolsConfig } from '@/lib/config/tools';

describe('upload fields', () => {
  it('defines every key once, in schema-valid form', () => {
    expect(UPLOAD_FIELDS.map((field) => field.key)).toEqual([...UPLOAD_FIELD_KEYS]);
    for (const field of UPLOAD_FIELDS)
      expect(uploadFieldSchema.safeParse(field).success).toBe(true);
  });

  it('makes four fields required', () => {
    expect([...REQUIRED_FIELD_KEYS].sort()).toEqual(
      ['commodityCode', 'customsValue', 'importDate', 'netMass'].sort(),
    );
  });

  it('keeps synonyms unique across fields and lower case', () => {
    const all = UPLOAD_FIELDS.flatMap((field) => field.synonyms.map((synonym) => synonym.text));
    expect(new Set(all).size).toBe(all.length);
    for (const text of all) expect(text).toBe(text.toLowerCase());
  });

  it('marks single common words as generic', () => {
    const generic = UPLOAD_FIELDS.flatMap((field) =>
      field.synonyms.filter((synonym) => synonym.generic).map((synonym) => synonym.text),
    );
    expect(generic).toEqual(
      expect.arrayContaining([
        'commodity',
        'date',
        'mass',
        'weight',
        'quantity',
        'value',
        'origin',
      ]),
    );
  });
});

describe('upload limits', () => {
  it('are configured in one place', () => {
    expect(toolsConfig.upload).toMatchObject({
      maxFileBytes: 10 * 1024 * 1024,
      maxDataRows: 5000,
      extensions: ['.csv', '.xlsx'],
      headerScanRows: 20,
      issuePageSize: 50,
    });
  });
});
