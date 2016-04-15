"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import cp = require("child_process");

export class Pub {
	private pubCmd: string;

	constructor() {
		this.pubCmd = vscode.workspace.getConfiguration("dart")["pubPath"];
		console.log(vscode.workspace.rootPath);
		console.log("PubPath: " + this.pubCmd);
	}

	private _runRun(filePath : string) {
		cp.exec(
			"pub run " + filePath,
			{"cwd": vscode.workspace.rootPath},
			(err, stdout, stderr) => {
				let outputWindow = vscode.window.createOutputChannel("pub run");
				console.log(vscode.window.visibleTextEditors);
				outputWindow.hide();
				//vscode.commands.executeCommand("workbench.action.splitEditor");
				outputWindow.show();
				outputWindow.clear();

				console.log(stdout.toString());
				outputWindow.append(stderr.toString());
				outputWindow.append(stdout.toString());
			}
		);
	}

	runRun() {
		this._runRun(vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.fileName).substr(1));
	}

	runGet() {
		vscode.window.showInformationMessage("Pub get starting...");
		cp.exec(
			this.pubCmd + " get",
			{"cwd": vscode.workspace.rootPath},
			(err, stdout: string, stderr: string) => {
			console.log(err);
			if (err != null) {
				let error = stderr.toString();
				console.log(error);
				if (error.includes("file named \"pubspec.yaml\"")) {
					vscode.window.showErrorMessage("Could not find a file named 'pubspec.yaml'");
				} else {
					vscode.window.showErrorMessage("Pub get : " + error);
				}
			} else {
				vscode.window.showInformationMessage("Pub get finish.");
			}
		});
	}

	runBuild(mode: string) {
		cp.exec(
			this.pubCmd + " build" + " --mode " + mode,
			{"cwd": vscode.workspace.rootPath},
			(err: Error, stdout: string, stderr: string) => {
			console.log(stdout.toString());
			console.log(err);
			let outputWindow = vscode.window.createOutputChannel("pub build");

			outputWindow.clear();

			if (err != null) {
				let error = stderr.toString();
				if (error.includes("file named \"pubspec.yaml\"")) {
					vscode.window.showErrorMessage("Could not find a file named 'pubspec.yaml'");
				} else {
					vscode.window.showErrorMessage("Error during the build process in mode " + mode + "\n" + error);
					outputWindow.append(stdout.toString());
					outputWindow.append(error);
					outputWindow.show();
				}
			} else {
				vscode.window.showInformationMessage("Pub build in " + mode + " mode finish.");
			}
		});
	}

	setPubCmd(context: vscode.ExtensionContext) {
		console.log("Set pub cmd");
		context.subscriptions.push(vscode.commands.registerCommand("dart.pubGet", 			 () => this.runGet()));
		context.subscriptions.push(vscode.commands.registerCommand("dart.pubBuild", 		 () => this.runBuild("release")));
		context.subscriptions.push(vscode.commands.registerCommand("dart.pubBuildDebug", () => this.runBuild("debug")));
		context.subscriptions.push(vscode.commands.registerCommand("dart.pubRun", 			 () => this.runRun()));
	}
}