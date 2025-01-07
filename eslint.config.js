import globals from 'globals'
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginSvelte from 'eslint-plugin-svelte'

export default [
	js.configs.recommended,
	eslintConfigPrettier,
	...eslintPluginSvelte.configs['flat/prettier'],
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser
				// 	__DEV__: 'readonly'
			}
		}
	}
	// ,
	// {
	// 	ignores: ['**/node_modules/**/*', '**/.svelte-kit/**/*']
	// }
]
