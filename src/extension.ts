// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'; 
import { DART_MODE } from './dartMode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) : void {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dart" is now active!'); 

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	//var disposable = vscode.commands.registerCommand('extension.sayHello', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World!');
	//});
	
	//context.subscriptions.push(disposable);

	vscode.languages.setLanguageConfiguration(DART_MODE.language, {
			indentationRules: {
				// ^(.*\*/)?\s*\}.*$
				decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
				// ^.*\{[^}"']*$
				increaseIndentPattern: /^.*\{[^}"']*$/
			},
			wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
			comments: {
				lineComment: '//',
				blockComment: ['/*', '*/']
			},
			brackets: [
				['{', '}'],
				['[', ']'],
				['(', ')'],
			],
	
			__electricCharacterSupport: {
				brackets: [
					{ tokenType: 'delimiter.curly.ts', open: '{', close: '}', isElectric: true },
					{ tokenType: 'delimiter.square.ts', open: '[', close: ']', isElectric: true },
					{ tokenType: 'delimiter.paren.ts', open: '(', close: ')', isElectric: true }
				]
			},
	
			__characterPairSupport: {
				autoClosingPairs: [
					{ open: '{', close: '}' },
					{ open: '[', close: ']' },
					{ open: '(', close: ')' },
					{ open: '"', close: '"', notIn: ['string'] },
					{ open: '\'', close: '\'', notIn: ['string', 'comment'] }
				]
			}
    });

}