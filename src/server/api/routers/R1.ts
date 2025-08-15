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
        return Number(value).toFixed(4); // Keep consistency

      case "float":
        return parseFloat(Number(value).toFixed(4)).toString();

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

export const functionR1Router = createTRPCRouter({

  R1Q1: buildDynamicProcedure("Q001S", (arr: number[]) => {
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
  R1Q2: buildDynamicProcedure("Q002S", (x: number) => {
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
    return sums[0] === sums[1];
  }),
  R1Q3: buildDynamicProcedure("Q003S", (prefixSum: number[]) => {
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
  R1Q4: buildDynamicProcedure("Q004S", (arr: number[]) => {
  if (!Array.isArray(arr) || !arr.every(n => typeof n === "number" && Number.isInteger(n))) {
    return {
      success: false,
      error: `Expected an array of integers, received ${JSON.stringify(arr)}`,
    };
  }

  // XOR of all elements
  return arr.reduce((acc, val) => acc ^ val, 0);
}),
  R1Q5: buildDynamicProcedure("Q005S", (x:number) => {
  return x*50;
}),
  
});
