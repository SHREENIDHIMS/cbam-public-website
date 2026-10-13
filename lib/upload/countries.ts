/** ISO 3166-1 alpha-2 codes plus a small alias map for country names seen in customs exports. */

const ISO_CODES =
  `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT
MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG
UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(/\s+/);

export const ISO_COUNTRY_CODES: ReadonlySet<string> = new Set(ISO_CODES);

const ALIASES: Readonly<Record<string, string>> = {
  china: 'CN',
  "people's republic of china": 'CN',
  'peoples republic of china': 'CN',
  'hong kong': 'HK',
  india: 'IN',
  turkiye: 'TR',
  turkey: 'TR',
  netherlands: 'NL',
  'the netherlands': 'NL',
  holland: 'NL',
  germany: 'DE',
  france: 'FR',
  italy: 'IT',
  spain: 'ES',
  poland: 'PL',
  belgium: 'BE',
  'viet nam': 'VN',
  vietnam: 'VN',
  'republic of korea': 'KR',
  'south korea': 'KR',
  korea: 'KR',
  'united arab emirates': 'AE',
  uae: 'AE',
  norway: 'NO',
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  'great britain': 'GB',
  egypt: 'EG',
  indonesia: 'ID',
  japan: 'JP',
  taiwan: 'TW',
  thailand: 'TH',
  malaysia: 'MY',
  russia: 'RU',
  'russian federation': 'RU',
  ukraine: 'UA',
  brazil: 'BR',
  canada: 'CA',
  australia: 'AU',
  'south africa': 'ZA',
  bangladesh: 'BD',
  pakistan: 'PK',
  oman: 'OM',
  'saudi arabia': 'SA',
  switzerland: 'CH',
  sweden: 'SE',
  finland: 'FI',
  austria: 'AT',
  ireland: 'IE',
  romania: 'RO',
  bulgaria: 'BG',
  'czech republic': 'CZ',
  czechia: 'CZ',
  mexico: 'MX',
  iceland: 'IS',
};

function fold(text: string): string {
  return text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export type CountryMatch =
  { kind: 'code'; code: string } | { kind: 'name'; code: string } | { kind: 'unknown' };

/** Resolves a cell to an ISO alpha-2 code, a recognised name, or unknown. Never guesses. */
export function matchCountry(raw: string): CountryMatch {
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();
  if (/^[A-Za-z]{2}$/.test(trimmed) && ISO_COUNTRY_CODES.has(upper)) {
    return { kind: 'code', code: upper };
  }
  const alias = ALIASES[fold(trimmed)];
  if (alias) return { kind: 'name', code: alias };
  return { kind: 'unknown' };
}
