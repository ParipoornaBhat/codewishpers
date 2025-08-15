import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { FUNCTION_META, type FunctionMeta } from "@/lib/functionMeta";

// ----------- ZOD SCHEMA TYPES (Optional, can be used in frontend too) -----------

export const supportedTypes = ["number", "string", "char", "boolean", "array", "object", "float"] as const;
export type SupportedType = typeof supportedTypes[number];

// ----------- INPUT PARSER -----------

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

  //Q1
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

  
  //Q2
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

  //Q3 Fn7, Fn8, Fn9
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


  fn14: buildDynamicProcedure("fn14", (x: number) => x - 1),
  fn15: buildDynamicProcedure("fn15", (x: number) => x * 0.1),
  fn16: buildDynamicProcedure("fn16", (x: number) => x ** 4),
  fn17: buildDynamicProcedure("fn17", (x: number) => Math.log10(x)),
  fn18: buildDynamicProcedure("fn18", (x: number) => Math.round(x)),
  fn19: buildDynamicProcedure("fn19", (x: number) => Math.floor(x)),
  fn20: buildDynamicProcedure("fn20", (x: number) => x < 0),

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
    const result = Math.pow(5, Math.log(firstInt) / Math.log(2));
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
  
});
