module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "ignorePatterns": ["node_modules/", "dist/", "validate_assets.py", "*.md"],
    "extends": [
        "eslint:recommended",
        "prettier"
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        // Enforce Technical Constitution
        "no-var": "error", // No var, use let/const
        "prefer-const": "error", // Prefer const
        "eqeqeq": "error", // Strict equality
        "no-console": ["warn", { "allow": ["warn", "error"] }], // Minimize console noise
        "no-restricted-imports": ["error", {
            "patterns": [{
                "group": ["!.*", "!..*"], // Allow local imports (starts with . or ..)
                "message": "External libraries are strictly prohibited. Use Vanilla JS."
            }]
        }],

        // Code Style
        "camelcase": ["error", { "properties": "always" }],
        "new-cap": "error",
        "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Allow unused args starting with _
    }
};
