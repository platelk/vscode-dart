'use strict';
var spawn = require('child_process').spawn;
var which = require('which');
var vscode_languageserver_1 = require('vscode-languageserver');
var analyzer_server_1 = require('./analyzer_server');
var message_1 = require('./message');
// Create a connection for the server. The connection uses Node's IPC as a transport
var connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
// Create a simple text document manager. The text document manager
// supports full document sync only
var documents = new vscode_languageserver_1.TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites. 
var workspaceRoot;
// hold the maxNumberOfProblems setting
var maxNumberOfProblems;
// hold the maxNumberOfProblems setting
var sdkPath;
var analyzer;
connection.onInitialize(function (params) {
    workspaceRoot = params.rootPath;
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Incremental,
            // Tell the client that the server support code complete
            completionProvider: {
                resolveProvider: true
            }
        }
    };
});
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(function (change) {
    validateTextDocument(change.document);
});
// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration(function (change) {
    var settings = change.settings;
    sdkPath = settings.dartLanguageServer.sdk;
    connection.console.log('SDK Path : [' + sdkPath + ']');
    analyzer = new analyzer_server_1.AnalayzerServer(sdkPath, workspaceRoot, connection);
    analyzer.launch();
    analyzer.send(new message_1.Message({ 'method': 'server.getVersion' }), function (m) {
        connection.console.log("receive message from analyze : " + m.toJson());
    });
    // Revalidate any open text documents
    documents.all().forEach(validateTextDocument);
});
function validateTextDocument(textDocument) {
    connection.console.log("ValidateTextDoc");
    var diagnostics = [];
    var lines = textDocument.getText().split(/\r?\n/g);
    var problems = 0;
    for (var i = 0; i < lines.length && problems < maxNumberOfProblems; i++) {
        var line = lines[i];
        var index = line.indexOf('typescript');
        if (index >= 0) {
            problems++;
            diagnostics.push({
                severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
                range: {
                    start: { line: i, character: index },
                    end: { line: i, character: index + 10 }
                },
                message: line.substr(index, 10) + " should be spelled TypeScript",
                source: 'ex'
            });
        }
    }
    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: diagnostics });
}
connection.onDidChangeWatchedFiles(function (change) {
    // Monitored files have change in VSCode
    connection.console.log('We recevied an file change event');
});
// This handler provides the initial list of the completion items.
connection.onCompletion(function (textDocumentPosition) {
    // The pass parameter contains the position of the text document in 
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [
        {
            label: 'TypeScript',
            kind: vscode_languageserver_1.CompletionItemKind.Text,
            data: 1
        },
        {
            label: 'JavaScript',
            kind: vscode_languageserver_1.CompletionItemKind.Text,
            data: 2
        }
    ];
});
// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve(function (item) {
    if (item.data === 1) {
        item.detail = 'TypeScript details',
            item.documentation = 'TypeScript documentation';
    }
    else if (item.data === 2) {
        item.detail = 'JavaScript details',
            item.documentation = 'JavaScript documentation';
    }
    return item;
});
/*
connection.onDidOpenTextDocument((params) => {
    // A text document got opened in VSCode.
    // params.uri uniquely identifies the document. For documents store on disk this is a file URI.
    // params.text the initial full content of the document.
    connection.console.log(`${params.uri} opened.`);
});

connection.onDidChangeTextDocument((params) => {
    // The content of a text document did change in VSCode.
    // params.uri uniquely identifies the document.
    // params.contentChanges describe the content changes to the document.
    connection.console.log(`${params.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});

connection.onDidCloseTextDocument((params) => {
    // A text document got closed in VSCode.
    // params.uri uniquely identifies the document.
    connection.console.log(`${params.uri} closed.`);
});
*/
connection.onExit(function () {
    // TODO : Kill analyzer
});
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map