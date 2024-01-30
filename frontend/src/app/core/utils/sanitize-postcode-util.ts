export class SanitizePostcodeUtil {
  public static sanitizePostcode = (postcode: string): string => {
    
    let cleanedPostcode = postcode.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();

    if (cleanedPostcode.length === 6) {
      cleanedPostcode = cleanedPostcode.substr(0, 3) + ' ' + cleanedPostcode.substr(3);
    } else if (cleanedPostcode.length === 7) {
      cleanedPostcode = cleanedPostcode.substr(0, 4) + ' ' + cleanedPostcode.substr(4);
    } else if (cleanedPostcode.length === 5) {
      cleanedPostcode = cleanedPostcode.substr(0, 2) + ' ' + cleanedPostcode.substr(2);
    }



    return /^([A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2})$/.test(postcode)
      ? postcode
      : null;
  };
}
