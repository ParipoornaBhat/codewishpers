// src/lib/localFunctions.ts

export const supportedTypes = ["number", "string", "char", "boolean", "array", "object", "float", "any"] as const;
export type SupportedType = typeof supportedTypes[number];

// ----------- HELPERS FOR SIGNED COMPLEMENTS -----------
const bitWidthForSigned = (nums: number[]) => {
  const maxAbs = Math.max(...nums.map(n => Math.abs(n)));
  const magBits = maxAbs === 0 ? 1 : Math.floor(Math.log2(maxAbs)) + 1;
  return magBits + 1; // magnitude bits + sign bit
};

const toTwosWidth = (n: number, w: number) => {
  if (n >= 0) return n.toString(2).padStart(w, "0");
  const W = BigInt(w);
  const val = (BigInt(1) << W) + BigInt(n); // n is negative
  // Keep exactly w bits
  return val.toString(2).slice(-w).padStart(w, "1");
};

// ----------- INPUT PARSER -----------
export function parseInput(value: string, type: SupportedType): any {
  try {
    switch (type) {
      case "number": {
        const num = Number(value);
        if (!/^-?\d+(\.\d+)?$/.test(value.trim()) || isNaN(num)) {
          throw new Error(`"${value}" is not a valid number.`);
        }
        return num;
      }

      case "float": {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`"${value}" is not a valid float number.`);
        }
        return parseFloat(num.toFixed(4));
      }

      case "string": {
        if (typeof value !== "string") {
          throw new Error(`Value must be a string.`);
        }
        return value;
      }

      case "char": {
        const trimmed = value.trim();
        if (trimmed.length === 1) return trimmed.charAt(0);
        if (
          trimmed.length === 3 &&
          ((trimmed[0] === "'" && trimmed[2] === "'") ||
            (trimmed[0] === '"' && trimmed[2] === '"'))
        ) {
          return trimmed.charAt(1);
        }
        throw new Error(`"${value}" is not a valid single character.`);
      }

      case "boolean": {
        const val = value.toLowerCase();
        if (val !== "true" && val !== "false") {
          throw new Error(`"${value}" is not a valid boolean. Use "true" or "false".`);
        }
        return val === "true";
      }

      case "array": {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error(`"${value}" is not a valid array. Use format like "[1,2,3]".`);
        }
        return parsed;
      }

      case "object": {
        const parsed = JSON.parse(value);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error(`"${value}" is not a valid object. Use format like {"key":"value"}.`);
        }
        return parsed;
      }

      case "any": {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }

      default:
        throw new Error(`Unsupported input type "${type}"`);
    }
  } catch (err: any) {
    throw new Error(`Input error for type "${type}": ${err.message}`);
  }
}

// ----------- OUTPUT FORMATTER -----------
export function formatOutput(value: any, type: SupportedType): string {
  try {
    if (type === "any") {
      if (value === null || value === undefined) return String(value);
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    }

    switch (type) {
      case "number":
        return Number(value).toString();

      case "float":
        return parseFloat(value).toFixed(4);

      case "string":
      case "boolean":
        return String(value);

      case "char":
        if (value === undefined || value === null) return String(value);
        const v = typeof value === "string" ? value : String(value);
        return `'${v.charAt(0)}'`;

      case "array":
      case "object":
        return JSON.stringify(value);

      default:
        return String(value);
    }
  } catch {
    throw new Error("Error formatting output");
  }
}

// ----------- LOCAL FUNCTIONS DIRECTORY -----------
export const localFunctions: Record<string, (...args: any[]) => any> = {
  // Q1 fn 1,2,3
  fn1: (arr: number[]) => {
    if (!Array.isArray(arr)) {
      throw new Error(`Expected array input like [10] or [2, 1]`);
    }
    if (arr.length === 0 || typeof arr[0] !== "number" || !Number.isInteger(arr[0])) {
      throw new Error(`Expected at least one integer inside array.`);
    }
    return parseFloat(arr[0].toFixed(4));
  },
  fn2: (n: number) => {
    if (typeof n !== "number" || !Number.isInteger(n)) {
      throw new Error(`Expected a single integer like 10, received ${n}`);
    }
    const result = Math.log(n) / Math.log(2);
    return parseFloat(result.toFixed(4));
  },
  fn3: (f: number) => {
    if (typeof f !== "number") {
      throw new Error(`Expected a number like 2.5, received ${f}`);
    }
    const result = Math.pow(5, f);
    if (Number.isInteger(result)) {
      return result;
    }
    return parseFloat(result.toFixed(4));
  },

  // Q2 fn 4,5,6
  fn4: (x: number) => {
    if (typeof x !== "number" || x < 0) {
      throw new Error(`Expected a positive number, received ${x}`);
    }
    const str = String(Math.floor(x));
    if (str.length <= 1) {
      throw new Error(`Expected a number with at least 2 digits, received ${x}`);
    }
    const mid = Math.floor(str.length / 2);
    const first = parseInt(str.slice(0, mid), 10);
    const second = parseInt(str.slice(mid), 10);
    return [first, second];
  },
  fn5: (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length !== 2) {
      throw new Error(`Expected an array of 2 numbers`);
    }
    const sumDigits = (num: number) =>
      String(Math.abs(num))
        .split("")
        .reduce((sum, d) => sum + Number(d), 0);
    return arr.map(sumDigits);
  },
  fn6: (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length !== 2) {
      throw new Error(`Expected an array of 2 numbers`);
    }
    return arr[0] === arr[1];
  },

  // Q3 Fn 7,8,9
  fn7: (arr: number[]) => {
    if (!Array.isArray(arr) || !arr.every(n => typeof n === "number")) {
      throw new Error(`Expected an array of numbers`);
    }
    return [...arr];
  },
  fn8: (arr: number[]) => {
    if (!Array.isArray(arr) || !arr.every(n => typeof n === "number")) {
      throw new Error(`Expected an array of numbers`);
    }
    return [0, ...arr.slice(0, -1)];
  },
  fn9: (a: number[], b: number[]) => {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      throw new Error(`Expected two arrays of equal length`);
    }
    return a.map((val, i) => val - b[i]!);
  },

  // Q4 fn10
  fn10: (arr: number[]) => {
    if (!Array.isArray(arr) || !arr.every(n => typeof n === "number" && Number.isInteger(n))) {
      throw new Error(`Expected an array of integers`);
    }
    const xorResult = arr.reduce((acc, val) => acc ^ val, 0);
    return [xorResult];
  },

  // Q5 fn11, fn12, fn13
  fn11: (x: number) => x * 5,
  fn12: (x: number) => x * 2,
  fn13: (x: number) => x * 10,

  // Q6 fn14, fn15, fn16, fn17
  fn14: (x: number) => x - 5,
  fn15: (x: number) => x + 3,
  fn16: (x: number) => x - 4,
  fn17: (x: number) => x + 2,

  // Q7 & Q9 fn18, fn19, fn20
  fn18: (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length !== 2 || !arr.every(Number.isInteger)) {
      throw new Error(`Expected an array of two integers`);
    }
    const w = bitWidthForSigned(arr);
    return arr.map(n => toTwosWidth(n, w));
  },
  fn19: (arr: string[]) => {
    if (!Array.isArray(arr) || arr.length !== 2 || !arr.every(s => /^[01]+$/.test(s))) {
      throw new Error(`Expected an array of 2 binary strings`);
    }
    const [a, b] = arr;
    const len = Math.max(a!.length, b!.length);
    const aP = a!.padStart(len, a![0]);
    const bP = b!.padStart(len, b![0]);
    const inv = bP.split("").map(ch => (ch === "0" ? "1" : "0")).join("");
    let carry = 1, out = "";
    for (let i = len - 1; i >= 0; i--) {
      const sum = (inv[i] === "1" ? 1 : 0) + carry;
      out = String(sum & 1) + out;
      carry = sum >> 1;
    }
    return [aP, out];
  },
  fn20: (arr: unknown[]) => {
    if (!Array.isArray(arr) || arr.length !== 2) {
      throw new Error(`Expected binary array like ["010","101"]`);
    }
    const strArr = arr.map(x => String(x));
    if (!strArr.every(s => /^[01]+$/.test(s))) {
      throw new Error(`Expected binary strings`);
    }
    const [a, b] = strArr;
    const len = Math.max(a!.length, b!.length);
    const aP = a!.padStart(len, a![0]);
    const bP = b!.padStart(len, b![0]);
    const toSignedInt = (bin: string) => {
      const w = bin.length;
      const val = BigInt("0b" + bin);
      const msbOne = bin[0] === "1";
      return Number(msbOne ? val - (BigInt(1) << BigInt(w)) : val);
    };
    return toSignedInt(aP) + toSignedInt(bP);
  },

  // Q8 fn 21, 22
  fn21: (n: number) => {
    if (typeof n !== "number" || !Number.isInteger(n)) {
      throw new Error(`Expected an integer`);
    }
    const str = String(Math.abs(n)).split("").map(d => parseInt(d, 10));
    if (n < 0 && str.length > 0 && typeof str[0] === "number") {
      str[0] = -str[0];
    }
    return str;
  },
  fn22: (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length === 0 || !arr.every(n => Number.isInteger(n))) {
      throw new Error(`Expected an array of integers`);
    }
    const absSum = arr.reduce((a, b) => a + Math.abs(b), 0);
    return [arr[0]! < 0 ? -absSum : absSum];
  },

  // ----------- SOLUTION FUNCTIONS -----------
  Q001S: (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length < 1 || typeof arr[0] !== "number" || !Number.isInteger(arr[0])) {
      throw new Error(`Expected an array like [10]`);
    }
    const firstInt = arr[0];
    if (firstInt <= 0) {
      throw new Error(`Log base 2 is undefined for non-positive numbers.`);
    }
    const log2 = parseFloat((Math.log(firstInt) / Math.log(2)).toFixed(4));
    const result = Math.pow(5, log2);
    return Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
  },
  Q002S: (x: number) => {
    if (typeof x !== "number" || x < 0) {
      throw new Error(`Expected a positive number`);
    }
    const str = String(Math.floor(x));
    const mid = Math.floor(str.length / 2);
    const first = parseInt(str.slice(0, mid), 10);
    const second = parseInt(str.slice(mid), 10);
    const sumDigits = (num: number) =>
      String(Math.abs(num))
        .split("")
        .reduce((sum, d) => sum + Number(d), 0);
    return sumDigits(first) === sumDigits(second);
  },
  Q003S: (prefixSum: number[]) => {
    if (!Array.isArray(prefixSum) || !prefixSum.every(n => typeof n === "number")) {
      throw new Error(`Expected an array of numbers`);
    }
    const arr1: number[] = [...prefixSum];
    const arr2: number[] = [0, ...prefixSum.slice(0, -1)];
    return arr1.map((val, i) => val - arr2[i]!);
  },
  Q004S: (arr: number[]) => {
    if (!Array.isArray(arr) || !arr.every(n => typeof n === "number" && Number.isInteger(n))) {
      throw new Error(`Expected an array of integers`);
    }
    return arr.reduce((acc, val) => acc ^ val, 0);
  },
  Q005S: (x: number) => x * 50,
  Q006S: (x: number) => (x * 10) - 2,
  Q007S: (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length !== 2) {
      throw new Error(`Expected an array of two integers`);
    }
    return arr[0]! - arr[1]!;
  },
  Q008S: (input: number) => {
    const s = String(input).trim();
    const isNegative = s.startsWith("-");
    const digits = isNegative ? s.slice(1) : s;
    let sum = 0;
    for (let i = 0; i < digits.length; i++) sum += digits.charCodeAt(i) - 48;
    return isNegative ? -sum : sum;
  },
  Q009S: (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length !== 2) {
      throw new Error(`Expected an array of two integers`);
    }
    return arr[0]! + arr[1]!;
  },

  // ----------- ROUND 1 FUNCTIONS -----------
  R1Q1: (n: number) => {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error(`Expected a positive integer`);
    }
    let result: number[] = [n];
    while (n !== 1) {
      if (n % 2 === 0) n = n / 2;
      else n = 3 * n + 1;
      result.push(n);
    }
    return result.join("->");
  },
  R1Q2: (n: number) => {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error(`Expected a non-negative integer`);
    }
    let maxCount = 0;
    let currentCount = 0;
    while (n > 0) {
      if (n & 1) {
        currentCount++;
        maxCount = Math.max(maxCount, currentCount);
      } else {
        currentCount = 0;
      }
      n >>= 1;
    }
    return maxCount;
  },
  R1Q3: (arr: any[]) => {
    if (!Array.isArray(arr) || arr.length !== 2) {
      throw new Error(`Expected [string, number]`);
    }
    const [str, k] = arr;
    if (typeof str !== "string" || !Number.isInteger(k) || k < 0) {
      throw new Error(`Expected [string, non-negative integer]`);
    }
    const n = str.length;
    const chars = str.split("");
    for (let i = 0; i < n; i++) {
      if (str[i] === "*") {
        const start = Math.max(0, i - k);
        const end = Math.min(n - 1, i + k);
        for (let j = start; j <= end; j++) {
          chars[j] = "#";
        }
      }
    }
    return chars.join("");
  },
  R1Q4: (matrixInput: any, dirPattern: any) => {
    if (!Array.isArray(matrixInput) || !matrixInput.every(r => typeof r === "string")) {
      throw new Error(`Expected string[] matrix`);
    }
    if (typeof dirPattern !== "string") {
      throw new Error(`Expected string path`);
    }
    const rows = matrixInput.length;
    if (rows === 0) return "";
    const cols = matrixInput[0]!.length;
    let startRow = -1, startCol = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < matrixInput[r]!.length; c++) {
        if (matrixInput[r]![c] === "i") {
          startRow = r;
          startCol = c;
          break;
        }
      }
      if (startRow !== -1) break;
    }
    if (startRow === -1) throw new Error("No starting position 'i' found");

    let r = startRow, c = startCol;
    const moves: Record<string, [number, number]> = {
      ">": [0, 1],
      "<": [0, -1],
      "^": [-1, 0],
      "v": [1, 0],
    };

    for (const move of dirPattern) {
      const [dr, dc] = moves[move] ?? [0, 0];
      const nr = r + dr, nc = c + dc;
      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        matrixInput[nr]![nc] !== "#"
      ) {
        r = nr;
        c = nc;
      }
    }

    const result: string[] = [];
    for (let i = 0; i < rows; i++) {
      let newRow = "";
      for (let j = 0; j < matrixInput[i]!.length; j++) {
        if (i === r && j === c) {
          newRow += "i";
        } else if (i === startRow && j === startCol) {
          newRow += ".";
        } else {
          newRow += matrixInput[i]![j];
        }
      }
      result.push(newRow);
    }
    return result.join("\n");
  },
  R1Q5: (n: number) => {
    if (typeof n !== "number" || !Number.isInteger(n) || n < 0) {
      throw new Error(`Expected a non-negative integer`);
    }
    let a = 0, b = 1;
    for (let i = 0; i < n; i++) {
      const temp = a;
      a = b;
      b = temp + b;
    }
    return a;
  },
};
