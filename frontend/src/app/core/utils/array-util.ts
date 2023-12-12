export class ArrayUtil {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getDuplicates = (array: Array<any>, key: string): Array<any> => {
    return array.filter((e1) => {
      if (
        array.filter((e2) => {
          return e1[key] === e2[key];
        }).length > 1
      ) {
        return e1;
      }
    });
  };
}
