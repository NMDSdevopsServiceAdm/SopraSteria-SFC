import { environment } from 'src/environments/environment';

export const DATE_PARSE_FORMAT = 'YYYY-MM-DD';
export const DATE_DISPLAY_DEFAULT = 'DD/MM/YYYY';
export const DATE_DISPLAY_FULL = 'D MMMM YYYY';
export const NIN_PATTERN =
  /^(?!BG)(?!GB)(?!NK)(?!KN)(?!TN)(?!NT)(?!ZZ)(?:[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z])(?:\s*\d\s*){6}([A-D]|\s)$/;
export const POSTCODE_PATTERN =
  /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,50}$/;
export const INT_PATTERN = /^-?[0-9]*$/;
export const FLOAT_PATTERN = /^([0-9]*[.])?[0-9]+$/;
export const SALARY_PATTERN = /^-?\d*$|^-?\d*\.\d{0,2}$/;
export const API_PATTERN = /^\/api\//;
export const ADD_USER_API = `${environment.appRunnerEndpoint}/api/user/add`;
export const ALPHA_NUMERIC_WITH_HYPHENS_UNDERSCORES = /^[A-Za-z0-9_-]*$/;
export const FILE_UPLOAD_TYPES = ['CSV', 'ZIP'];
export const EMAIL_PATTERN = /^[A-Za-z0-9._'%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;
export const PHONE_PATTERN = /^[0-9 x(?=ext 0-9+)]{8,50}$/;
export const DATE_DAY_VALID = /^(0?[1-9]|[12][0-9]|3[01])$/;
export const DATE_MONTH_VALID = /^(0?[1-9]|[1][0-2])$/;
