const conventionalTypes = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
];

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
