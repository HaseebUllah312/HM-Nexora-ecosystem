import next from "eslint-config-next";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/mobile app/**",
      "**/lms_app/**",
      "**/Nexora Bot/**",
      "**/extension/**",
      "**/build/**",
      "temp*.tsx",
      "*.json",
      "*.js",
    ],
  },
  ...next,
];
