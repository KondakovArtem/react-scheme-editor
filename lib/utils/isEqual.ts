import equal from 'fast-deep-equal';

export { equal as isEqual };

// export function isEqual(value1: any, value2: any): boolean {
//     if (value1 === value2) {
//       return true;
//     }
//     if (typeof value1 !== 'object' || typeof value2 !== 'object' || value1 === null || value2 === null) {
//       return false;
//     }
//     const keys1 = Object.keys(value1);
//     const keys2 = Object.keys(value2);
//     if (keys1.length !== keys2.length) {
//       return false;
//     }
//     for (let key of keys1) {
//       if (!keys2.includes(key) || !isEqual(value1[key], value2[key])) {
//         return false;
//       }
//     }
//     return true;
//   }
