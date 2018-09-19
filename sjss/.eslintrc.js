module.exports = {
	"env": {
		"node": true
	},
	"parserOptions": {
		"ecmaVersion": 6,
		"sourceType": "module"
	},
	"parser": "typescript-eslint-parser",
	"extends": "eslint:recommended",
	"plugins": [
        "typescript"
    ],
	"rules": {

		//spaces
		"indent": ["error", 4],
		"no-multi-spaces": "error",
		"array-bracket-spacing": "error",
		"object-curly-spacing": "error",
		"keyword-spacing": "error",
		"semi-spacing": "error",
		"spaced-comment": "error",
		"space-unary-ops": "error",
		"space-infix-ops": "error",
		"space-in-parens": ["error", "never"],
		"space-before-function-paren": ["error", "never"],
		"space-before-blocks": "error",
		"no-whitespace-before-property": "error",
		"no-trailing-spaces": "error",
		"block-spacing": "error",

		"no-undef": 0,
		"typescript/no-unused-vars": "error",
		"linebreak-style": ["error", "unix"],
		"quotes": ["error", "single", { "avoidEscape": true }],
		"semi": ["error", "always"]
	}
};