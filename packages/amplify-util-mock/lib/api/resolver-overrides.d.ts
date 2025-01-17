export declare class ResolverOverrides {
    private _rootFolder;
    private _foldersToWatch;
    private fileExtensions;
    private overrides;
    private contentMap;
    constructor(_rootFolder: string, _foldersToWatch?: string[], fileExtensions?: string[]);
    start(): void;
    onFileChange(filePath: string): boolean;
    sync(transformerResolvers: {
        path: string;
        content: string;
    }[]): {
        path: string;
        content: string;
    }[];
    /**
     * Stop synchronizing resolver content. This will delete all the resolvers except for
     * the ones which are not overridden
     */
    stop(): void;
    isTemplateFile(filePath: string, isDelete?: boolean): boolean;
    private updateContentMap;
    private getRelativePath;
    private getAbsPath;
    onAdd(path: string): boolean;
    onChange(path: string): boolean;
    onUnlink(path: string): boolean;
    readonly resolverTemplateRoot: string;
}
