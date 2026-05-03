import { createRequire } from "node:module";

const requireFromCommitlint = createRequire(process.argv[1] ?? import.meta.url);
const conventionalConfigPath = requireFromCommitlint.resolve(
  "@commitlint/config-conventional",
);
const conventionalConfig = (await import(conventionalConfigPath)).default;
const conventionalTypes = conventionalConfig.rules["type-enum"][2];

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-case": [2, "always", ["lower-case", "upper-case"]],
    "type-enum": [
      2,
      "always",
      [
        ...conventionalTypes,
        ...conventionalTypes.map((type) => type.toUpperCase()),
      ],
    ],
  },
};
