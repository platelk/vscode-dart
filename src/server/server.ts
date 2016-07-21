'use strict';

import {
    IPCMessageReader, IPCMessageWriter,
    createConnection, IConnection,
    TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,  TextDocumentChangeEvent, TextDocumentSyncKind,
    InitializeParams, InitializeResult
} from 'vscode-languageserver';

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

documents.onDidOpen((e: TextDocumentChangeEvent) => {
    console.log("DOCUMENT OPEN");
});

documents.onDidChangeContent((e: TextDocumentChangeEvent) => {
    console.log("DOCUMENT Change");
});

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities. 
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
    workspaceRoot = params.rootPath;
    return {
        capabilities: {
                // Tell the client that the server works in FULL text document sync mode
                textDocumentSync: TextDocumentSyncKind.Incremental
            }
        }
});

// Listen on the connection
connection.listen();