// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { DART_MODE } from "./dartMode";
import { Pub } from "./pubCmd";
import { DartFormat } from "./dartFormat";
import { DartAnalyzer } from "./dartAnalyzer";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) : void {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log("Congratulations, your extension 'dart' is now active!"); 

	init(context);
	setLanguageConfiguration();
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
				lineComment: "//",
				blockComment: ["/*", "*/"]
			},
			brackets: [
				["{", "}"],
				["[", "]"],
				["(", ")"],
			],
			__electricCharacterSupport: {
				brackets: [
					{ tokenType: "delimiter.curly.ts", open: "{", close: "}", isElectric: true },
					{ tokenType: "delimiter.square.ts", open: "[", close: "]", isElectric: true },
					{ tokenType: "delimiter.paren.ts", open: "(", close: ")", isElectric: true }
				]
			},
			__characterPairSupport: {
				autoClosingPairs: [
					{ open: "{", close: "}" },
					{ open: "[", close: "]" },
					{ open: "(", close: ")" },
					{ open: "'", close: "'", notIn: ["string"] },
					{ open: "\"", close: "\"", notIn: ["string", "comment"] }
				]
			}
    });
}