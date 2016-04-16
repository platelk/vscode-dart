"use strict";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import cp = require("child_process");

import { DART_MODE } from "./dartMode";

export class DartFormat implements vscode.DocumentFormattingEditProvider {
	private dartFmtCmd: string;
	private haveRunFormatOnSave: boolean = false;

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
      console.log("==>> " + filename);
      if (!filename.match(/.*\.dart/))
        return;
			cp.exec(this.dartFmtCmd + " " + filename, {}, (err, stdout, stderr) => {
				try {
					if (err && (<any>err).code == "ENOENT") {
						vscode.window.showInformationMessage("The '" + this.dartFmtCmd + "' command is not available.  Please check your dartfmt user setting and ensure it is installed.");
						return resolve(null);
					}
          console.log("ERROR : " + err);
					if (err) {
						console.log("Cannot format");
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

	runFmtOnFile(filePath: string, onComplete) {
    console.log("FilePATH ==::: " + filePath);
    // Check if the file is a dart file
    if (!filePath.match(/.*\.dart/)) {
			console.log("File isn't a dart file");
      return;
		}
		cp.exec(
			this.dartFmtCmd + " " + filePath,
			{},
			(err, stdout, stderr) => {
        var errStr = stderr.toString();
				console.log(`stdout: ${stdout}`);
				console.log(`stderr: ${stderr}`);
				console.log(err);
        if (err || errStr) {
          console.log("Error during formatting");
          return;
        }
				let document = vscode.window.activeTextEditor.document;
				let text = stdout.toString();
				let previousText = document.getText();
				console.log("Export : " + stdout.toString() + "\n============\n" + previousText);
				vscode.window.activeTextEditor.edit((editBuild) => {
					var lastLine = document.lineCount;
					var lastLineLastCol = document.lineAt(lastLine - 1).range.end.character;
					var range = new vscode.Range(0, 0, lastLine - 1, lastLineLastCol);
					editBuild.replace(range, stdout.toString());
				});
				if (onComplete != null) {
					onComplete()
				}
				console.log("Format on " + filePath);
			}
		);
	}

	runFmt() {
		this.runFmtOnFile(vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.fileName).substr(1), null);
	}

	setDartFmt(context: vscode.ExtensionContext) {
		var self = this;
		context.subscriptions.push(vscode.commands.registerCommand("dart.fmt", () => this.runFmt()));

		context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(DART_MODE, this));
		if (vscode.workspace.getConfiguration("dart")["formatOnSave"]) {
			vscode.workspace.onDidSaveTextDocument((e) => {
				if (!self.haveRunFormatOnSave) {
					self.runFmtOnFile(e.fileName, () => {
						console.log("On saved call");
						self.haveRunFormatOnSave = true;
						vscode.window.activeTextEditor.document.save()
					});
				} else {
					self.haveRunFormatOnSave = false;
				}
			});
		}
	}
}