import { ActivityIcon as Function } from "lucide-react";

// ----------------- Types -----------------

export const supportedTypes = ["number", "string", "char", "boolean", "array", "object" ,"float", "any"] as const;
export type SupportedType = (typeof supportedTypes)[number];
export type Category = "Math" | "Logic";

export type FunctionMeta = {
  id: string;
  category: Category;
  icon: typeof Function;
  description: string;
  numInputs: number;
  inputTypes: SupportedType[];
  outputType: SupportedType;
  fc: string; // NEW → points to router implementation
};
export type FunctionMeta2 = {
  id: string;
  category: Category;
  icon: typeof Function;
  description: string;
  numInputs: number;
  inputTypes: SupportedType[];
  outputType: SupportedType;
};


export type SolutionFunctionMeta = {
  id: string;
  category: Category;
  icon: typeof Function;
  description: string;
  numInputs: number;
  inputTypes: SupportedType[];
  outputType: SupportedType;
} & { questionCode: string };

// ----------------- Main Function Metadata -----------------

export const FUNCTION_META: FunctionMeta[] = [
  { fc:"fn1", id: "fn1", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "number" },
  { fc:"fn2", id: "fn2", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "float" },
  { fc:"fn3", id: "fn3", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "float" },// for Q1
  { fc:"fn4", id: "fn4", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "array" },
  { fc:"fn5", id: "fn5", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { fc:"fn6", id: "fn6", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "boolean" },// for Q2
  { fc:"fn7", id: "fn7", category: "Logic", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { fc:"fn8", id: "fn8", category: "Logic", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { fc:"fn9", id: "fn9", category: "Logic", icon: Function, description: "", numInputs: 2, inputTypes: ["array","array"], outputType: "array" },// for Q3
  { fc:"fn10", id: "fn10", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" },// for Q4 + fn1
  { fc:"fn11", id: "fn11", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { fc:"fn12", id: "fn12", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { fc:"fn13", id: "fn13", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },// for Q5 fn(11+ 11 + 12) OR fn(13 + 11)
  { fc:"fn14", id: "fn14", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { fc:"fn15", id: "fn15", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { fc:"fn16", id: "fn16", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { fc:"fn17", id: "fn17", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },//Q6 Sol Fn(13+14+15) OR Fn(13+16+17)
  { fc:"fn18", id: "fn18", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { fc:"fn19", id: "fn19", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { fc:"fn20", id: "fn20", category: "Logic", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "number" },// for Q7 + Q9
  { fc:"fn21", id: "fn21", category: "Logic", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "array" },
  { fc:"fn22", id: "fn22", category: "Logic", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" }, // for Q8

  
   // include solution function meta here too
  { fc:"Q001S", id: "Q001S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "float" },
  { fc:"Q002S", id: "Q002S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "boolean" },
  { fc:"Q003S", id: "Q003S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { fc:"Q004S", id: "Q004S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "number" },
  { fc:"Q005S", id: "Q005S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { fc:"Q006S", id: "Q006S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { fc:"Q007S", id: "Q007S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "number" },
  { fc:"Q008S", id: "Q008S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { fc:"Q009S", id: "Q009S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },

  { fc:"Q010S", id: "Q010S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },

];

// ----------------- Solution Functions -----------------

export const SOLUTION_FUNCTIONS: SolutionFunctionMeta[] = [
  { id: "Q001S", questionCode: "Q008", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "float" },
  { id: "Q002S", questionCode: "Q003", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "boolean" },
  { id: "Q003S", questionCode: "Q004", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { id: "Q004S", questionCode: "Q005", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "number" },
  { id: "Q005S", questionCode: "Q001", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q006S", questionCode: "Q002", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q007S", questionCode: "Q006",category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "number" },
  { id: "Q008S", questionCode: "Q007", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q009S", questionCode: "Q009", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },

  { id: "Q010S", questionCode: "Q010", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
];

// ----------------- Category List -----------------

export const CATEGORIES: ("All" | Category)[] = ["All", "Math", "Logic"];



//-----------ROUND 1 FUNCTION METADATA-----------
export const R1_FUNCTION_META: FunctionMeta2[] = [

   // include solution function meta here too
  { id: "R1Q1", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "string" },//done
  { id: "R1Q2", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },//done
  { id: "R1Q3", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["any"], outputType: "string" },//done
  { id: "R1Q4", category: "Math", icon: Function, description: "Final solution function", numInputs: 2, inputTypes: ["array","string"], outputType: "string" },//DONE
  { id: "R1Q5", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },//DONE
  // { id: "R1Q6", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  // { id: "R1Q7", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  // { id: "R1Q8", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  // { id: "R1Q9", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  // { id: "R1Q10", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
];


