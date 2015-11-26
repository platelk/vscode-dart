"use strict";

import vscode = require("vscode");
import cp = require("child_process");

import { DART_MODE } from "./dartMode";

export class DartFormat implements vscode.DocumentFormattingEditProvider {
	private dartFmtCmd : string;

	constructor() {
		this.dartFmtCmd = vscode.workspace.getConfiguration("dart")["dartFmtPath"];
	}

	public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Thenable<vscode.TextEdit[]> {
		return document.save().then(() => {
			return this.doFormatDocument(document, options, token);
		});
	}

	private doFormatDocument(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Thenable<vscode.TextEdit[]> {
		return new Promise((resolve, reject) => {
			var filename = document.fileName;

			cp.exec(this.dartFmtCmd + " " + filename, {}, (err, stdout, stderr) => {
				try {
					if (err && (<any>err).code == "ENOENT") {
						vscode.window.showInformationMessage("The '" + this.dartFmtCmd + "' command is not available.  Please check your dartfmt user setting and ensure it is installed.");
						return resolve(null);
					}
					if (err) {
						return reject("Cannot format due to syntax errors.");
					}
					var text = stdout.toString();
					// TODO: Should use `-d` option to get a diff and then compute the
					// specific edits instead of replace whole buffer
					var lastLine = document.lineCount;
					var lastLineLastCol = document.lineAt(lastLine - 1).range.end.character;
					var range = new vscode.Range(0, 0, lastLine - 1, lastLineLastCol);
					console.log("File formatted");
					return resolve([new vscode.TextEdit(range, text)]);
				} catch (e) {
					reject(e);
				}
			});
		});
	}

	runFmtOnFile(filePath : string) {
		cp.exec(
			this.dartFmtCmd + " " + filePath,
			{"cwd": vscode.workspace.rootPath},
			(err, stdout, stderr) => {
				console.log("Fomart on " + filePath);
			}
		);
	}

	runFmt() {
		this.runFmtOnFile(vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.fileName).substr(1));
	}

	setDartFmt(context: vscode.ExtensionContext) {
		context.subscriptions.push(vscode.commands.registerCommand("dart.fmt", () => this.runFmt()));

		context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(DART_MODE, this));
	}
}