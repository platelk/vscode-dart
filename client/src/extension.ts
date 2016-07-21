'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import { DART_MODE } from './dartMode';
import { Pub } from './pubCmd';
import { DartFormat } from './dartFormat';
import { DartAnalyzer } from './dartAnalyzer';

import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind } from 'vscode-languageclient';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) : void {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension \'dart\' is now active!');

	initLanguageServer(context);
	init(context);
	setLanguageConfiguration();
}

function initLanguageServer(context: vscode.ExtensionContext): void {
	// The server is implemented in node
	let serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
	// The debug options for the server
	let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run : { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: ['dart'],
		synchronize: {
			// Synchronize the setting section 'languageServerExample' to the server
			configurationSection: 'dartLanguageServer'
		}
	};

	// Create the language client and start the client.
	let disposable = new LanguageClient('Dart Language Server', serverOptions, clientOptions).start();

	// Push the disposable to the context's subscriptions so that the 
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
}

function init(context: vscode.ExtensionContext) : void {
	let pub = new Pub();
	let fmt = new DartFormat();
	let analyzer = new DartAnalyzer();

	pub.setPubCmd(context);
	fmt.setDartFmt(context);
	analyzer.setDartAnalyzer(context);
}

function setLanguageConfiguration() {
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
					{ open: '\'', close: '\'', notIn: ['string'] },
					{ open: '\"', close: '\"', notIn: ['string', 'comment'] }
				]
			}
	});
}