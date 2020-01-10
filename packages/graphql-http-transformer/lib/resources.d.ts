import { HttpHeader } from './HttpTransformer';
import Template from 'cloudform-types/types/template';
export declare class ResourceFactory {
    makeParams(): {};
    /**
     * Creates the barebones template for an application.
     */
    initTemplate(): Template;
    makeHttpDataSource(baseURL: string): import("cloudform-types/types/appSync/dataSource").default;
    private referencesEnv;
    private replaceEnv;
    private makeVtlStringArray;
    private makeNonNullChecks;
    /**
     * Create a resolver that makes a GET request. It assumes the endpoint expects query parameters in the exact
     * shape of the input arguments to the http directive. Returns the result in JSON format, or an error if the status code
     * is not 200
     * @param type
     */
    makeGetResolver(baseURL: string, path: string, type: string, field: string, headers: HttpHeader[]): import("cloudform-types/types/appSync/resolver").default;
    /**
     * Create a resolver that makes a POST request. It allows the user to provide arguments as either query
     * parameters or in the body of the request.
     * request. Returns the result in JSON format, or an error if the status code is not 200.
     * Forwards the headers from the request, adding that the content type is JSON.
     * @param type
     */
    makePostResolver(baseURL: string, path: string, type: string, field: string, nonNullArgs: string[], headers: HttpHeader[]): import("cloudform-types/types/appSync/resolver").default;
    /**
     * Create a resolver that makes a PUT request. It allows the user to provide arguments as either query
     * parameters or in the body of the request.
     * Returns the result in JSON format, or an error if the status code is not 200.
     * Forwards the headers from the request, adding that the content type is JSON.
     * @param type
     */
    makePutResolver(baseURL: string, path: string, type: string, field: string, nonNullArgs: string[], headers: HttpHeader[]): import("cloudform-types/types/appSync/resolver").default;
    /**
     * Create a resolver that makes a DELETE request.
     * @param type
     */
    makeDeleteResolver(baseURL: string, path: string, type: string, field: string, headers: HttpHeader[]): import("cloudform-types/types/appSync/resolver").default;
    /**
     * Create a resolver that makes a PUT request. It allows the user to provide arguments as either query
     * parameters or in the body of the request.
     * Returns the result in JSON format, or an error if the status code is not 200.
     * Forwards the headers from the request, adding that the content type is JSON.
     * @param type
     */
    makePatchResolver(baseURL: string, path: string, type: string, field: string, nonNullArgs: string[], headers: HttpHeader[]): import("cloudform-types/types/appSync/resolver").default;
}
