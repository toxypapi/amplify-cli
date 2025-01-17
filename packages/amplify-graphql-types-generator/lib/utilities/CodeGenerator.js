"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GeneratedFile {
    constructor() {
        this.scopeStack = [];
        this.indentWidth = 2;
        this.indentLevel = 0;
        this.startOfIndentLevel = false;
        this.output = '';
    }
    pushScope(scope) {
        this.scopeStack.push(scope);
    }
    popScope() {
        return this.scopeStack.pop();
    }
    get scope() {
        if (this.scopeStack.length < 1)
            throw new Error('No active scope');
        return this.scopeStack[this.scopeStack.length - 1];
    }
    print(string) {
        if (string) {
            this.output += string;
        }
    }
    printNewline() {
        if (this.output) {
            this.print('\n');
            this.startOfIndentLevel = false;
        }
    }
    printNewlineIfNeeded() {
        if (!this.startOfIndentLevel) {
            this.printNewline();
        }
    }
    printOnNewline(string) {
        if (string) {
            this.printNewline();
            this.printIndent();
            this.print(string);
        }
    }
    printIndent() {
        const indentation = ' '.repeat(this.indentLevel * this.indentWidth);
        this.output += indentation;
    }
    withIndent(closure) {
        if (!closure)
            return;
        this.indentLevel++;
        this.startOfIndentLevel = true;
        closure();
        this.indentLevel--;
    }
    withinBlock(closure, open = ' {', close = '}') {
        this.print(open);
        this.withIndent(closure);
        this.printOnNewline(close);
    }
}
exports.GeneratedFile = GeneratedFile;
class CodeGenerator {
    constructor(context) {
        this.context = context;
        this.generatedFiles = {};
        this.currentFile = new GeneratedFile();
    }
    withinFile(fileName, closure) {
        let file = this.generatedFiles[fileName];
        if (!file) {
            file = new GeneratedFile();
            this.generatedFiles[fileName] = file;
        }
        const oldCurrentFile = this.currentFile;
        this.currentFile = file;
        closure();
        this.currentFile = oldCurrentFile;
    }
    get output() {
        return this.currentFile.output;
    }
    pushScope(scope) {
        this.currentFile.pushScope(scope);
    }
    popScope() {
        this.currentFile.popScope();
    }
    get scope() {
        return this.currentFile.scope;
    }
    print(string) {
        this.currentFile.print(string);
    }
    printNewline() {
        this.currentFile.printNewline();
    }
    printNewlineIfNeeded() {
        this.currentFile.printNewlineIfNeeded();
    }
    printOnNewline(string) {
        this.currentFile.printOnNewline(string);
    }
    printIndent() {
        this.currentFile.printIndent();
    }
    withIndent(closure) {
        this.currentFile.withIndent(closure);
    }
    withinBlock(closure, open = ' {', close = '}') {
        this.currentFile.withinBlock(closure, open, close);
    }
}
exports.CodeGenerator = CodeGenerator;
//# sourceMappingURL=CodeGenerator.js.map