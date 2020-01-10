"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PluginManifest {
    constructor(name, type, aliases, commands, commandAliases, eventHandlers) {
        this.name = name;
        this.type = type;
        this.aliases = aliases;
        this.commands = commands;
        this.commandAliases = commandAliases;
        this.eventHandlers = eventHandlers;
    }
}
exports.PluginManifest = PluginManifest;
//# sourceMappingURL=../../src/lib/domain/plugin-manifest.js.map