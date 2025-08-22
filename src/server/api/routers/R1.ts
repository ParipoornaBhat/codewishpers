import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { R1_FUNCTION_META, type FunctionMeta } from "@/lib/functionMeta";

// ----------- ZOD SCHEMA TYPES (Optional, can be used in frontend too) -----------

export const supportedTypes = ["number", "string", "char", "boolean", "array", "object", "float", "any"] as const;
export type SupportedType = typeof supportedTypes[number];

// ----------- INPUT PARSER -----------
// --- parseInput (unchanged behavior for typed inputs) ---
function parseInput(value: string, type: SupportedType): any {
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

      default:
        throw new Error(`Unsupported input type "${type}"`);
    }
  } catch (err: any) {
    throw new Error(`Input error for type "${type}": ${err.message}`);
  }
}

// --- formatOutput (adds 'any' handling) ---
function formatOutput(value: any, type: SupportedType | "any"): string {
  try {
    if (type === "any") {
      // If it's an object/array return JSON, otherwise return raw string
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

// --- buildDynamicProcedure (special-case 'any' inputs) ---
function buildDynamicProcedure(
  funcId: string,
  logicFn: (...args: any[]) => any
) {
  const meta = R1_FUNCTION_META.find((f) => f.id === funcId) as FunctionMeta;
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

        // Parse inputs but SKIP parseInput for type === "any"
        const parsedInputs = meta.inputTypes.map((type, i) => {
          const raw = input[i] ?? "";

          if (type === "any") {
            // Edge-case: don't enforce a strict type. Try to JSON.parse, else return raw string.
            try {
              return JSON.parse(raw);
            } catch {
              // keep as string if not valid JSON
              return raw;
            }
          }

          // For all typed inputs use the existing parseInput validator/transformer
          return parseInput(raw, type as SupportedType);
        });

        const result = logicFn(...parsedInputs);

        // If the function returns an error-shaped object, pass it through
        if (result && typeof result === "object" && "success" in result && result.success === false) {
          return result;
        }

        // Use meta.outputType if present; if it's missing or 'any', format appropriately
        const outType = (meta.outputType as SupportedType | "any") ?? "any";
        return {
          success: true,
          result: formatOutput(result, outType),
        };
      } catch (err: any) {
        console.error(`[${funcId}] Function Error:`, err);

        return {
          success: false,
          error: err.message || "An unexpected error occurred.",
        };
      }
    });
}



// ----------- ROUTER EXPORT -----------

export const functionR1Router = createTRPCRouter({

 R1Q1: buildDynamicProcedure("R1Q1", (n: number) => {

   // Validate input
  if (!Number.isInteger(n) || n <= 0) {
    return {
      success: false,
      error: `Expected a positive integer, received ${n}`,
    };
  }

  let result: number[] = [n];
  while (n !== 1) {
    if (n % 2 === 0) {
      n = n / 2;
    } else {
      n = 3 * n + 1;
    }
    result.push(n);
  }

  // Join with arrows
  return result.join("->");
}),

 R1Q2: buildDynamicProcedure("R1Q2", (n: number) => {
  // Validate input
  if (!Number.isInteger(n) || n < 0) {
    return {
      success: false,
      error: `Expected a non-negative integer, received ${n}`,
    };
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

  return maxCount; // number output
}),

R1Q3: buildDynamicProcedure("R1Q3", (arr: any[]) => {
  if (!Array.isArray(arr) || arr.length !== 2) {
    return {
      success: false,
      error: `Expected [string, number], received ${JSON.stringify(arr)}`,
    };
  }

  const [str, k] = arr;

  if (typeof str !== "string" || !Number.isInteger(k) || k < 0) {
    return {
      success: false,
      error: `Invalid input. Expected [string, non-negative integer], received [${typeof str}, ${k}]`,
    };
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
}),

R1Q4: buildDynamicProcedure("R1Q4", (matrixInput: any, dirPattern: any) => {
  // ---- Input validation ----
  if (!Array.isArray(matrixInput) || !matrixInput.every(r => typeof r === "string")) {
    return {
      success: false,
      error: `Invalid matrix input (expected string[]): ${JSON.stringify(matrixInput)}`,
    };
  }
  if (typeof dirPattern !== "string") {
    return {
      success: false,
      error: `Invalid direction pattern (expected string): ${dirPattern}`,
    };
  }

  const matrix: string[] = matrixInput;
  const rows = matrix.length;
  if (rows === 0) {
    return { success: false, error: "Matrix is empty." };
  }
  const cols = matrix[0]!.length;

  // ---- Find initial position of 'i' ----
  let startRow = -1, startCol = -1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < matrix[r]!.length; c++) {
      if (matrix[r]![c] === "i") {
        startRow = r;
        startCol = c;
        break;
      }
    }
    if (startRow !== -1) break;
  }
  if (startRow === -1) {
    return { success: false, error: "No starting position 'i' found in matrix." };
  }

  // ---- Movement simulation ----
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
      matrix[nr]![nc] !== "#"
    ) {
      r = nr;
      c = nc;
    }
  }

  // ---- Build final maze ----
  const result: string[] = [];
  for (let i = 0; i < rows; i++) {
    let newRow = "";
    for (let j = 0; j < matrix[i]!.length; j++) {
      if (i === r && j === c) {
        newRow += "i";
      } else if (i === startRow && j === startCol) {
        newRow += ".";
      } else {
        newRow += matrix[i]![j];
      }
    }
    result.push(newRow);
  }

  return result.join("\n"); // ✅ single string with \n separator
}),

R1Q5: buildDynamicProcedure("R1Q5", (n: number) => {
  // ---- Input validation ----
  if (typeof n !== "number" || !Number.isInteger(n) || n < 0) {
    return {
      success: false,
      error: `Invalid input. Expected a non-negative integer, received: ${n}`,
    };
  }

  try {
    let a = 0, b = 1;
    for (let i = 0; i < n; i++) {
      const temp = a;
      a = b;
      b = temp + b;
    }

    return a; // ✅ Fibonacci(n)
  } catch (err) {
    return {
      success: false,
      error: "Calculation error.",
    };
  }
}),





  
});
