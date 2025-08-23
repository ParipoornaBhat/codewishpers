import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { FUNCTION_META, type FunctionMeta } from "@/lib/functionMeta";

// ----------- ZOD SCHEMA TYPES (Optional, can be used in frontend too) -----------

export const supportedTypes = ["number", "string", "char", "boolean", "array", "object", "float"] as const;
export type SupportedType = typeof supportedTypes[number];

// ----------- INPUT PARSER -----------
// Helpers (put once near your pipeline)
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

function parseInput(value: string, type: SupportedType): any {
  try {
    switch (type) {
      case "number": {
        // Strict number (int or float)
        const num = Number(value);
        if (!/^-?\d+(\.\d+)?$/.test(value.trim()) || isNaN(num)) {
          throw new Error(`"${value}" is not a valid number.`);
        }
        return num;
      }

      case "float": {
        // Accept integers or decimals, always return with 4 precision
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

      default:
        throw new Error(`Unsupported input type "${type}"`);
    }
  } catch (err: any) {
    throw new Error(`Input error for type "${type}": ${err.message}`);
  }
}

function formatOutput(value: any, type: SupportedType): string {
  try {
    switch (type) {
      case "number":
        // Return as-is without padding
        return Number(value).toString();

      case "float":
        // Force 4 decimal precision, pad with zeros, return as string
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



// ----------- DYNAMIC PROCEDURE BUILDER -----------

function buildDynamicProcedure(
  funcId: string,
  logicFn: (...args: any[]) => any
) {
  const meta = FUNCTION_META.find((f) => f.id === funcId) as FunctionMeta;
  if (!meta) throw new Error(`Function metadata not found for ${funcId}`);

  return publicProcedure
    .input(z.array(z.string()))
    .mutation(({ input }) => {
      try {
        if (input.length !== meta.numInputs) {
          return {
            success: false,
            error: `Expected ${meta.numInputs} inputs, received ${input.length}`,
          };
        }

        const parsedInputs = meta.inputTypes.map((type, i) =>
          parseInput(input[i] ?? "", type as SupportedType)
        );

        const result = logicFn(...parsedInputs);

          // ✅ If the function itself returns an error object, pass it as is
        if (result && typeof result === "object" && "success" in result && result.success === false) {
          return result;
        }
        return {
          success: true,
          result: formatOutput(result, meta.outputType as SupportedType),
        };
      } catch (err: any) {
        // Log internally (optional)
        console.error(`[${funcId}] Function Error:`, err);

        // Return safe error structure
        return {
          success: false,
          error: err.message || "An unexpected error occurred.",
        };
      }
    });
}


// ----------- ROUTER EXPORT -----------

export const functionRouter = createTRPCRouter({
  // fn1: buildDynamicProcedure("fn1", (x: number) => x ** 2),
  // fn2: buildDynamicProcedure("fn2", (a: number, b: number) => a + b),
  // fn3: buildDynamicProcedure("fn3", (x: number) => x ** 3),
// fn4: buildDynamicProcedure("fn4", (x: number) => x * 2),
  // fn5: buildDynamicProcedure("fn5", (x: number) => x / 2),
  // fn6: buildDynamicProcedure("fn6", (x: number) => Math.sqrt(x)),

  //Q1 fn 1,2,3
  fn1: buildDynamicProcedure("fn1", (arr: number[]) => {
    const meta = { numInputs: 1 }; // meta for error messages

    // Must be an array
    if (!Array.isArray(arr)) {
      return {
        success: false,
        error: `Expected array input like [10] or [2, 1], received ${JSON.stringify(arr)}`,
      };
    }

    // Must contain at least one number
    if (arr.length === 0 || typeof arr[0] !== "number" || !Number.isInteger(arr[0])) {
      return {
        success: false,
        error: `Expected ${meta.numInputs} inputs, received ${arr.length}. Example: [10] or [2, 1]`,
      };
    }
    // Return the first element (integer)
    return parseFloat(arr[0].toFixed(4));
  }),
  fn2: buildDynamicProcedure("fn2", (n: number) => {
    if (typeof n !== "number" || !Number.isInteger(n)) {
      return {
        success: false,
        error: `Expected a single integer like 10, received ${n}`,
      };
    }
    const result = Math.log(n) / Math.log(2); // log base 2
    return parseFloat(result.toFixed(4));
  }),
  fn3: buildDynamicProcedure("fn3", (f: number) => {
    if (typeof f !== "number") {
      return {
        success: false,
        error: `Expected a number like 2.5 or 5 or 2, received ${f}`,
      };
    }
    const result = Math.pow(5, f);
    // Check if result is an integer
    if (Number.isInteger(result)) {
      return result; // No decimal formatting
    }
    return parseFloat(result.toFixed(4)); // Keep 4 decimal places for floats
  }),

  
  //Q2 fn 4,5,6
  // Fn4: Number -> 2 bisected digit arrays
  fn4: buildDynamicProcedure("fn4", (x: number) => {
  if (typeof x !== "number" || x < 0) {
    return {
      success: false,
      error: `Expected a positive number, received ${x}`,
    };
  }

  const str = String(Math.floor(x)); // ensure int

  if (str.length <= 1) {
    return {
      success: false,
      error: `Expected a number with at least 2 digits, received ${x}`,
    };
  }

  const mid = Math.floor(str.length / 2);
  const first = parseInt(str.slice(0, mid), 10);
  const second = parseInt(str.slice(mid), 10);

  return [first, second];
}),
  // Fn5: Array -> sum of digits for each element
  fn5: buildDynamicProcedure("fn5", (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length !== 2) {
      return {
        success: false,
        error: `Expected an array of 2 numbers, received ${JSON.stringify(arr)}`,
      };
    }

    const sumDigits = (num: number) =>
      String(Math.abs(num))
        .split("")
        .reduce((sum, d) => sum + Number(d), 0);

    return arr.map(sumDigits);
  }),
  // Fn6: Compare 2 numbers -> true/false
  fn6: buildDynamicProcedure("fn6", (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length !== 2) {
      return {
        success: false,
        error: `Expected an array of 2 numbers, received ${JSON.stringify(arr)}`,
      };
    }
    return arr[0] === arr[1];
  }),

  //Q3 Fn 7,8,9
// Fn7: List[int] → copy of the list
  fn7: buildDynamicProcedure("fn7", (arr: number[]) => {
    if (!Array.isArray(arr) || !arr.every(n => typeof n === "number")) {
      return {
        success: false,
        error: `Expected an array of numbers, received ${JSON.stringify(arr)}`,
      };
    }
    return [...arr];
  }),
  // Fn8: List[int] → shift right, insert 0 at front
  fn8: buildDynamicProcedure("fn8", (arr: number[]) => {
    if (!Array.isArray(arr) || !arr.every(n => typeof n === "number")) {
      return {
        success: false,
        error: `Expected an array of numbers, received ${JSON.stringify(arr)}`,
      };
    }
    return [0, ...arr.slice(0, -1)];
  }),
  // Fn9: (List a, List b) → element-wise difference
  fn9: buildDynamicProcedure("fn9", (a: number[], b: number[]) => {
    if (
      !Array.isArray(a) ||
      !Array.isArray(b) ||
      a.length !== b.length ||
      !a.every(n => typeof n === "number") ||
      !b.every(n => typeof n === "number")
    ) {
      return {
        success: false,
        error: `Expected two arrays of equal length containing numbers.`,
      };
    }
    // Non-null assertion (!) ensures TS knows b[i] exists
    const original: number[] = a.map((val, i) => val - b[i]!);
    return original;
  }),

  //Q4 fn10 + fn1
  // fn10: buildDynamicProcedure("fn10", (x: number) => x * 5),
  fn10: buildDynamicProcedure("fn10", (arr: number[]) => {
  if (!Array.isArray(arr) || !arr.every(n => typeof n === "number" && Number.isInteger(n))) {
    return {
      success: false,
      error: `Expected an array of integers, received ${JSON.stringify(arr)}`,
    };
  }

  const xorResult = arr.reduce((acc, val) => acc ^ val, 0);
  return [xorResult]; // return as array for fn1 to consume
}),

//Q5 fn11, fn12, fn13
  fn11: buildDynamicProcedure("fn11", (x: number) => x*5),
  fn12: buildDynamicProcedure("fn12", (x: number) => x*2),
  fn13: buildDynamicProcedure("fn13", (x: number) => x*10),

//Q6 fn 13,14,15 or 13,16,17
  fn14: buildDynamicProcedure("fn14", (x: number) => x - 5),
  fn15: buildDynamicProcedure("fn15", (x: number) => x + 3),
  fn16: buildDynamicProcedure("fn16", (x: number) => x - 4),
  fn17: buildDynamicProcedure("fn17", (x: number) => x + 2),

  // Q7 fn 18,19,20 + Q9 fn 18,20 //  
  // fn18: Convert integers → **shared-width** two’s-complement strings
  fn18: buildDynamicProcedure("fn18", (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length !== 2 || !arr.every(Number.isInteger)) {
      return { success: false, error: `Expected an array of two integers, received ${JSON.stringify(arr)}` };
    }
    const w = bitWidthForSigned(arr);
    return arr.map(n => toTwosWidth(n, w));
  }),
  // fn19: [a, two’s complement(b)] at **fixed width**, ignore overflow carry
  fn19: buildDynamicProcedure("fn19", (arr: string[]) => {
    if (!Array.isArray(arr) || arr.length !== 2 || !arr.every(s => /^[01]+$/.test(s))) {
      return { success: false, error: `Expected an array of 2 binary strings, received ${JSON.stringify(arr)}` };
    }

    const [a, b] = arr;
    const len = Math.max(a!.length, b!.length);
    const aP = a!.padStart(len, a![0]); // already same width if from fn18
    const bP = b!.padStart(len, b![0]);

    // invert b
    const inv = bP.split("").map(ch => (ch === "0" ? "1" : "0")).join("");

    // add 1 (two's complement), **keep only len bits** (ignore extra carry)
    let carry = 1, out = "";
    for (let i = len - 1; i >= 0; i--) {
      const sum = (inv[i] === "1" ? 1 : 0) + carry;
      out = String(sum & 1) + out;
      carry = sum >> 1;
    }
    const twoComp = out; // extra carry discarded by fixed width

    return [aP, twoComp];
  }),
    // fn20: Interpret signed and add
 fn20: buildDynamicProcedure("fn20", (arr: unknown[]) => {
  if (!Array.isArray(arr) || arr.length !== 2) {
    return { success: false, error: `Expected binary array like ["010","101"], received ${JSON.stringify(arr)}` };
  }

  // Force string conversion
  const strArr = arr.map(x => String(x));

  // Now validate
  if (!strArr.every(s => /^[01]+$/.test(s))) {
    return { success: false, error: `Expected binary strings like ["010","101"], received ${JSON.stringify(arr)}` };
  }

  const [a, b] = strArr;
  const len = Math.max(a!.length, b!.length);

  const aP = a!.padStart(len, a![0]); // pad with sign bit
  const bP = b!.padStart(len, b![0]);

  const toSignedInt = (bin: string) => {
    const w = bin.length;
    const val = BigInt("0b" + bin);
    const msbOne = bin[0] === "1";
    return Number(msbOne ? val - (BigInt(1) << BigInt(w)) : val);
  };

  const aDec = toSignedInt(aP);
  const bDec = toSignedInt(bP);
  return aDec + bDec;
}),




  // Q8 // fn 21,22,1
  // fn21: Number -> [digits], with sign preserved in the first digit
  fn21: buildDynamicProcedure("fn21", (n: number) => {
    if (typeof n !== "number" || !Number.isInteger(n)) {
      return {
        success: false,
        error: `Expected an integer, received ${JSON.stringify(n)}`,
      };
    }

    const str = String(Math.abs(n)).split("").map(d => parseInt(d, 10));

    if (n < 0 && str.length > 0 && typeof str[0] === "number") {
      // attach sign to first digit
      str[0] = -str[0];
    }
    
    return str;
  }),
    // adds elements irrespective of number signs and keeps the first number sign

  fn22: buildDynamicProcedure("fn22", (arr: number[]) => {
  if (!Array.isArray(arr) || arr.length === 0 || !arr.every(n => Number.isInteger(n))) {
    throw new Error(`Expected an array of integers, received ${JSON.stringify(arr)}`);
  }

  // Take absolute sum
  const absSum = arr.reduce((a, b) => a + Math.abs(b), 0);

  // Preserve sign of first element
  const result = arr[0] !== undefined && arr[0] < 0 ? -absSum : absSum;

  return [result];
}),






  // Solution functions
  // Q004S: buildDynamicProcedure("Q004S", (x: number) => x ** 2),

  Q001S: buildDynamicProcedure("Q001S", (arr: number[]) => {
  if (!Array.isArray(arr) || arr.length < 1 || typeof arr[0] !== "number" || !Number.isInteger(arr[0])) {
    return {
      success: false,
      error: `Expected an array like [10] or [2, 1], received ${JSON.stringify(arr)}`,
    };
  }

  const firstInt = arr[0];
  if (firstInt <= 0) {
    return {
      success: false,
      error: `Log base 2 is undefined for non-positive numbers. Received ${firstInt}`,
    };
  }

  // ✅ This is equivalent to: fn3(fn2(fn1(arr)))
const log2 = parseFloat((Math.log(firstInt) / Math.log(2)).toFixed(4));
const result = Math.pow(5, log2);

  return Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
}),

  Q002S: buildDynamicProcedure("Q002S", (x: number) => {
    if (typeof x !== "number" || x < 0) {
      return {
        success: false,
        error: `Expected a positive number, received ${x}`,
      };
    }

    // Step 1: Bisect digits
    const str = String(Math.floor(x));
    const mid = Math.floor(str.length / 2);
    const first = parseInt(str.slice(0, mid), 10);
    const second = parseInt(str.slice(mid), 10);

    // Step 2: Sum of digits for each half
    const sumDigits = (num: number) =>
      String(Math.abs(num))
        .split("")
        .reduce((sum, d) => sum + Number(d), 0);

    const sums = [sumDigits(first), sumDigits(second)];

    // Step 3: Compare sums
    return sums[0] === sums[1] ? true : false;
  }),
  Q003S: buildDynamicProcedure("Q003S", (prefixSum: number[]) => {
    if (!Array.isArray(prefixSum) || !prefixSum.every(n => typeof n === "number")) {
      return {
        success: false,
        error: `Expected an array of numbers, received ${JSON.stringify(prefixSum)}`,
      };
    }

    const arr1: number[] = [...prefixSum];                 // Fn7
    const arr2: number[] = [0, ...prefixSum.slice(0, -1)]; // Fn8

    // Safe non-null assertion
    const original: number[] = arr1.map((val, i) => val - arr2[i]!); // Fn9
    return original;
  }),
  Q004S: buildDynamicProcedure("Q004S", (arr: number[]) => {
  if (!Array.isArray(arr) || !arr.every(n => typeof n === "number" && Number.isInteger(n))) {
    return {
      success: false,
      error: `Expected an array of integers, received ${JSON.stringify(arr)}`,
    };
  }

  // XOR of all elements
  return arr.reduce((acc, val) => acc ^ val, 0);
}),
  Q005S: buildDynamicProcedure("Q005S", (x:number) => {
  return x*50;
}),
  Q006S: buildDynamicProcedure("Q006S", (x:number) => {
    return ((x*10)-2);
  }),
  Q007S: buildDynamicProcedure("Q007S", (arr: number[]) => {
    if (
      !Array.isArray(arr) ||
      arr.length !== 2 ||
      !arr.every((n) => typeof n === "number" && Number.isInteger(n))
    ) {
      throw new Error(`Expected an array of two integers, received ${JSON.stringify(arr)}`);
    }

    const [a, b] = arr;
    return a! - b!; // plain integer result
  }),
  Q008S: buildDynamicProcedure("Q008S", (input: number ) => {
    // Accept either number or string
    if (
      typeof input !== "number"
    ) {
      return {
        success: false,
        error: `Expected an integer, received ${JSON.stringify(input)}`,
      };
    }

    const s = String(input).trim();

    // Detect sign
    const isNegative = s.startsWith("-");
    const digits = isNegative ? s.slice(1) : s;

    // Validate digits
    if (!/^\d+$/.test(digits)) {
      return {
        success: false,
        error: `Expected an integer or numeric string, received ${JSON.stringify(input)}`,
      };
    }

    // Sum digits
    let sum = 0;
    for (let i = 0; i < digits.length; i++) sum += digits.charCodeAt(i) - 48;

    const result = String(sum);
    return isNegative ? "-" + result : result;
  }),
  Q009S: buildDynamicProcedure("Q007S", (arr: number[]) => {
    if (
      !Array.isArray(arr) ||
      arr.length !== 2 ||
      !arr.every((n) => typeof n === "number" && Number.isInteger(n))
    ) {
      throw new Error(`Expected an array of two integers, received ${JSON.stringify(arr)}`);
    }

    const [a, b] = arr;
    return a! + b!; // plain integer result
  }),
});
