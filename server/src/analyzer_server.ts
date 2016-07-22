'use strict';

const spawn = require('child_process').spawn;
const which = require('which');

import fs = require('fs');
import { Message } from './message';

export class AnalayzerServer {
	private _sdkPath: string;
	private _workspacePath: string;
	private _process;
	private connection;

	private _messageMap: {[id: string]: any};

	constructor(sdkPath: string, workspacePath : string, conn) {
		this._sdkPath = sdkPath;
		this._workspacePath = workspacePath;
		this.connection = conn;
	}

	launch(): void {
		this._process = spawn('dart', this.buildArgs());
		this._process.stdout.on('data', (data) => {
			this.connection.console.log(`analyzer : ${data}`);
			let message = new Message(JSON.parse(`${data}`));
			if (message.id && this._messageMap[message.id]) {
				this._messageMap[message.id](message);
			}
		});

		this._process.stderr.on('data', (data) => {

		});

		this._process.on('close', (code) => {
			this.connection.console.log(`child process exited with code ${code}`);
		});
	}

	send(message: Message, cb: (m: Message) => void) {
		this._messageMap[message.id] = cb;
		this._process.stdin.write(message.toJson());
	}

	on(event, cb) {

	}

	private buildArgs(): Array<string> {
		let args  = new Array<string>();

		args.push(this.getSnapshotPath());
		args.push(this._workspacePath);
		args.push('--checked');
		args.push('--sdk=' + this._sdkPath);
		args.push('--client-id=vscode-dart');
		args.push('--client-version=0.2.0');

		return args;
	}

	private _getSdkPath() {
		if (this._sdkPath === undefined || this._sdkPath.length === 0) {
			this.connection.console.log('search sdk ...');
			let resolved = which.sync('dart');
			this.connection.console.log(resolved);
			return fs.realpathSync(fs.realpathSync(resolved) + '/../../');
		} else {
			this.connection.console.log('use provided sdk');
			return this._sdkPath;
		}
	}

	private getSnapshotPath(): string {
		return this._getSdkPath() + '/bin/snapshots/analysis_server.dart.snapshot';
	}
}