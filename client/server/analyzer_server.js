'use strict';
var spawn = require('child_process').spawn;
var which = require('which');
var fs = require('fs');
var message_1 = require('./message');
var AnalayzerServer = (function () {
    function AnalayzerServer(sdkPath, workspacePath, conn) {
        this._sdkPath = sdkPath;
        this._workspacePath = workspacePath;
        this.connection = conn;
    }
    AnalayzerServer.prototype.launch = function () {
        var _this = this;
        this._process = spawn('dart', this.buildArgs());
        this._process.stdout.on('data', function (data) {
            _this.connection.console.log("analyzer : " + data);
            var message = new message_1.Message(JSON.parse("" + data));
            if (message.id && _this._messageMap[message.id]) {
                _this._messageMap[message.id](message);
            }
        });
        this._process.stderr.on('data', function (data) {
        });
        this._process.on('close', function (code) {
            _this.connection.console.log("child process exited with code " + code);
        });
    };
    AnalayzerServer.prototype.send = function (message, cb) {
        this._messageMap[message.id] = cb;
        this._process.stdin.write(message.toJson());
    };
    AnalayzerServer.prototype.on = function (event, cb) {
    };
    AnalayzerServer.prototype.buildArgs = function () {
        var args = new Array();
        args.push(this.getSnapshotPath());
        args.push(this._workspacePath);
        args.push('--checked');
        args.push('--sdk=' + this._sdkPath);
        args.push('--client-id=vscode-dart');
        args.push('--client-version=0.2.0');
        return args;
    };
    AnalayzerServer.prototype._getSdkPath = function () {
        if (this._sdkPath === undefined || this._sdkPath.length === 0) {
            this.connection.console.log('search sdk ...');
            var resolved = which.sync('dart');
            this.connection.console.log(resolved);
            return fs.realpathSync(fs.realpathSync(resolved) + '/../../');
        }
        else {
            this.connection.console.log('use provided sdk');
            return this._sdkPath;
        }
    };
    AnalayzerServer.prototype.getSnapshotPath = function () {
        return this._getSdkPath() + '/bin/snapshots/analysis_server.dart.snapshot';
    };
    return AnalayzerServer;
}());
exports.AnalayzerServer = AnalayzerServer;
//# sourceMappingURL=analyzer_server.js.map