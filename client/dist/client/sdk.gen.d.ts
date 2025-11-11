import type { Options as ClientOptions, TDataShape, Client } from './client';
import type { PostCompileData, PostCompileResponses, PostCompileErrors, PostCompileHtmlData, PostCompileHtmlResponses, PostCompileHtmlErrors, GetHealthData, GetHealthResponses } from './types.gen';
export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: Record<string, unknown>;
};
/**
 * Compile LaTeX template
 * Compiles a LaTeX template and returns a PDF
 */
export declare const postCompile: <ThrowOnError extends boolean = false>(options: Options<PostCompileData, ThrowOnError>) => import("./client").RequestResult<PostCompileResponses, PostCompileErrors, ThrowOnError, "fields">;
/**
 * Compile HTML to PDF
 * Compiles an HTML document and returns a PDF using headless Chrome
 */
export declare const postCompileHtml: <ThrowOnError extends boolean = false>(options: Options<PostCompileHtmlData, ThrowOnError>) => import("./client").RequestResult<PostCompileHtmlResponses, PostCompileHtmlErrors, ThrowOnError, "fields">;
/**
 * Health check
 * Returns 200 OK
 */
export declare const getHealth: <ThrowOnError extends boolean = false>(options?: Options<GetHealthData, ThrowOnError>) => import("./client").RequestResult<GetHealthResponses, unknown, ThrowOnError, "fields">;
//# sourceMappingURL=sdk.gen.d.ts.map