import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Prevent debug statements from reaching production
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXText[value=/Debug:/i]",
          message: "Debug text found in JSX. Remove debug statements before committing.",
        },
        {
          selector: "Literal[value=/Debug:/i]",
          message: "Debug text found in code. Remove debug statements before committing.",
        },
        {
          selector: "TemplateLiteral > TemplateElement[value.raw=/Debug:/i]",
          message: "Debug text found in template literal. Remove debug statements before committing.",
        },
      ],
    },
  },
];

export default eslintConfig;
