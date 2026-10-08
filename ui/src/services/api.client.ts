import {
    createApiError
} from "./error-handler";


type QueryPrimitive =
    | string
    | number
    | boolean;


export type QueryValue =
    | QueryPrimitive
    | null
    | undefined
    | readonly QueryPrimitive[];


export type QueryParams =
    Record<
        string,
        QueryValue
    >;


interface ApiRequestOptions {

    query?: QueryParams;

    signal?: AbortSignal;

    headers?: HeadersInit;

}


const configuredBaseUrl =
    import.meta.env
        .VITE_API_BASE_URL
        ?.trim();


if (
    !configuredBaseUrl
) {

    throw new Error(
        "VITE_API_BASE_URL is not configured."
    );

}


const apiBaseUrl =
    configuredBaseUrl
        .replace(
            /\/+$/,
            ""
        );


function buildUrl(
    path: string,
    query?: QueryParams
): string {

    const normalizedPath =
        path.startsWith("/")
            ? path
            : `/${path}`;


    const url =
        new URL(
            `${apiBaseUrl}${normalizedPath}`
        );


    if (
        !query
    ) {

        return url.toString();

    }


    Object.entries(
        query
    ).forEach(
        ([
            key,
            value
        ]) => {

            if (
                value === null
                ||
                value === undefined
                ||
                value === ""
            ) {

                return;

            }


            if (
                Array.isArray(
                    value
                )
            ) {

                value.forEach(
                    item => {

                        url.searchParams.append(
                            key,
                            String(item)
                        );

                    }
                );


                return;

            }


            url.searchParams.append(
                key,
                String(value)
            );

        }
    );


    return url.toString();

}


async function get<T>(
    path: string,
    options:
        ApiRequestOptions = {}
): Promise<T> {

    const url =
        buildUrl(
            path,
            options.query
        );


    const response =
        await fetch(
            url,
            {
                method:
                    "GET",

                signal:
                    options.signal,

                headers: {

                    Accept:
                        "application/json",

                    ...options.headers

                }

            }
        );


    if (
        !response.ok
    ) {

        throw await createApiError(
            response
        );

    }


    if (
        response.status
        ===
        204
    ) {

        return undefined as T;

    }


    const responseText =
        await response.text();


    if (
        !responseText
    ) {

        return undefined as T;

    }


    return JSON.parse(
        responseText
    ) as T;

}


export const apiClient = {

    get

};