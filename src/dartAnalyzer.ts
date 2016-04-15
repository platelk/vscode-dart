"use strict";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import cp = require("child_process");

import { LinterResult } from "./dartLintResult";

export class DartAnalyzer {
	private _dartAnalyzer;
	private _severity : Map<string, vscode.DiagnosticSeverity> = new Map();

	constructor() {
		this._dartAnalyzer = vscode.workspace.getConfiguration("dart")["dartAnalyzerPath"];
		this._severity["error"] = vscode.DiagnosticSeverity.Error;
		this._severity["hint"] = vscode.DiagnosticSeverity.Hint;
		this._severity["warning"] = vscode.DiagnosticSeverity.Warning;
		this._severity["information"] = vscode.DiagnosticSeverity.Information;
	}

	lintFile(fileName : string) : Promise<vscode.Diagnostic[]> {
		var self = this;
		var promise = new Promise<vscode.Diagnostic[]>((resolve, reject) => {
			cp.exec(
				this._dartAnalyzer + " --lints " + fileName,
				{"cwd": vscode.workspace.rootPath},
				(err, stdout, stderr) => {
					let result = stdout.toString().split("\n");
					let diagnostics = [];

					result.shift();
					result.pop();
					result.pop();

					for (let i = 0; i < result.length; ++i) {
						let res = new LinterResult(result[i]);
						let range = new vscode.Range(new vscode.Position(res.line-1, res.column), new vscode.Position(res.line-1, Number.MAX_VALUE));
						let diagnostic = new vscode.Diagnostic(range, res.message, self._severity[res.type]);
						console.log(diagnostic);
						diagnostics.push(diagnostic);
					}
					console.log(diagnostics);
					resolve(diagnostics);
			});
		});
		return promise;
	}

	lint() {
		this.lintFile(vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.fileName).substr(1));
	}

	setDartAnalyzer(context: vscode.ExtensionContext) {
		var self = this;

		context.subscriptions.push(vscode.commands.registerCommand("dart.lint", () => this.lint()));

		if (vscode.workspace.getConfiguration("dart")["lintOnSave"]) {
			vscode.workspace.onDidSaveTextDocument((e) => {
			self.lintFile(e.fileName).then((result) => {
				vscode.languages.createDiagnosticCollection("dart").clear();
				vscode.languages.createDiagnosticCollection("dart").set(vscode.Uri.file(e.fileName), result);
			});
		});
		}
	}
}