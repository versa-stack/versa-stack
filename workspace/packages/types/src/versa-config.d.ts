export type RunConfig = {
    pipeline: string[];
    tags?: string[];
    configPath: string;
    env: Record<string, any>;
    hostinfo: Record<string, any>;
} & Record<string, any>;
export type RepositoryConfig = Record<string, any> & {
    workingDir: string;
};
export type VersaConfig = {
    runconfig: RunConfig;
    repository: RepositoryConfig;
};
export type VersaConfigBag = {
    configs: VersaConfig;
};
