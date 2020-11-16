export class CloneObjectUtil {
  public static clone(object: Object) {
    return JSON.parse(JSON.stringify(object));
  }
}
