type OrbitProviderOptions = {
    url: string;
    workspace: string;
    fetch: any;
    entity: Record<string, any>;
    debug: boolean;
};
declare function OrbitProvider(this: any, options: OrbitProviderOptions): {
    exports: {
        makeUrl: (suffix: string, q: any) => string;
        makeConfig: (config?: any) => any;
        getJSON: (url: string, config?: any) => Promise<any>;
        postJSON: (url: string, config: any) => Promise<any>;
        putJSON: (url: string, config: any) => Promise<{
            Success: boolean;
        }>;
    };
};
export default OrbitProvider;
