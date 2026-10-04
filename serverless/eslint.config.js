import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
	{ ignores: ['.serverless/**', '.esbuild/**', 'node_modules/**'] },
	js.configs.recommended,
	ts.configs.recommended,
	{
		languageOptions: { globals: globals.node },
		rules: {
			'no-undef': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }]
		}
	}
);
