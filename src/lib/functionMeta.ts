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
};

export type SolutionFunctionMeta = FunctionMeta & { questionCode: string };

// ----------------- Main Function Metadata -----------------

export const FUNCTION_META: FunctionMeta[] = [
  { id: "fn1", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "number" },
  { id: "fn2", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "float" },
  { id: "fn3", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "float" },// for Q1
  { id: "fn4", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "array" },
  { id: "fn5", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { id: "fn6", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "boolean" },// for Q2
  { id: "fn7", category: "Logic", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { id: "fn8", category: "Logic", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { id: "fn9", category: "Logic", icon: Function, description: "", numInputs: 2, inputTypes: ["array","array"], outputType: "array" },// for Q3
  { id: "fn10", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["array"], outputType: "array" },// for Q4 + fn1
  { id: "fn11", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "fn12", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "fn13", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },// for Q5 fn(11+ 11 + 12) OR fn(13 + 11)

  
  { id: "fn14", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "fn15", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "fn16", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "fn17", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "fn18", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "fn19", category: "Math", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "fn20", category: "Logic", icon: Function, description: "", numInputs: 1, inputTypes: ["number"], outputType: "boolean" },

  
   // include solution function meta here too
  { id: "Q001S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "float" },
  { id: "Q002S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "boolean" },
  { id: "Q003S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { id: "Q004S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "number" },
  { id: "Q005S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },

  { id: "Q006S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q007S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q008S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q009S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q010S", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  
];

// ----------------- Solution Functions -----------------

export const SOLUTION_FUNCTIONS: SolutionFunctionMeta[] = [
  { id: "Q001S", questionCode: "Q001", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "float" },
  { id: "Q002S", questionCode: "Q002", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "boolean" },
  { id: "Q003S", questionCode: "Q003", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "array" },
  { id: "Q004S", questionCode: "Q004", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "number" },
  { id: "Q005S", questionCode: "Q005", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },

  { id: "Q006S", questionCode: "Q006", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q007S", questionCode: "Q007", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q008S", questionCode: "Q008", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q009S", questionCode: "Q009", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  { id: "Q010S", questionCode: "Q010", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
];

// ----------------- Category List -----------------

export const CATEGORIES: ("All" | Category)[] = ["All", "Math", "Logic"];



//-----------ROUND 1 FUNCTION METADATA-----------
export const R1_FUNCTION_META: FunctionMeta[] = [

   // include solution function meta here too
  { id: "R1Q1", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "string" },//done
  { id: "R1Q2", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },//done
  { id: "R1Q3", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["any"], outputType: "string" },//done
  { id: "R1Q4", category: "Math", icon: Function, description: "Final solution function", numInputs: 2, inputTypes: ["array","string"], outputType: "string" },//DONE
  { id: "R1Q5", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["array"], outputType: "number" },//DONE
  // { id: "R1Q6", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  // { id: "R1Q7", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  // { id: "R1Q8", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  // { id: "R1Q9", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
  // { id: "R1Q10", category: "Math", icon: Function, description: "Final solution function", numInputs: 1, inputTypes: ["number"], outputType: "number" },
];


