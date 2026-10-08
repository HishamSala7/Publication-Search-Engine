export interface ApiErrorResponse {

    error?: string;

    detail?: string;

    message?: string;

    title?: string;

    errors?: unknown;

    [key: string]: unknown;

}


export class ApiError extends Error {

    statusCode: number;

    payload?: unknown;


    constructor(
        message: string,
        statusCode: number,
        payload?: unknown
    ) {

        super(message);


        this.name =
            "ApiError";


        this.statusCode =
            statusCode;


        this.payload =
            payload;

    }

}


function isObject(
    value: unknown
): value is Record<string, unknown> {

    return (
        typeof value === "object"
        &&
        value !== null
    );

}


function getStringProperty(
    payload: unknown,
    property: string
): string | null {

    if (
        !isObject(payload)
    ) {

        return null;

    }


    const value =
        payload[property];


    return typeof value === "string"
        ? value
        : null;

}


function resolveApiMessage(
    payload: unknown,
    fallback: string
): string {

    /*
        Your Authors/candidates endpoint returns:

        {
            error: "name is required.",
            detail: "..."
        }

        Prefer detail because it is more useful
        to the end user.
    */

    return (
        getStringProperty(
            payload,
            "detail"
        )
        ??
        getStringProperty(
            payload,
            "message"
        )
        ??
        getStringProperty(
            payload,
            "error"
        )
        ??
        getStringProperty(
            payload,
            "title"
        )
        ??
        fallback
    );

}


export async function createApiError(
    response: Response
): Promise<ApiError> {

    const fallbackMessage =
        `Request failed with status ${response.status}.`;


    let payload:
        unknown = null;


    try {

        const responseText =
            await response.text();


        if (
            responseText
        ) {

            try {

                payload =
                    JSON.parse(
                        responseText
                    );

            }
            catch {

                payload =
                    responseText;

            }

        }

    }
    catch {

        payload =
            null;

    }


    const message =
        typeof payload === "string"
            ? payload
            : resolveApiMessage(
                payload,
                fallbackMessage
            );


    return new ApiError(
        message,
        response.status,
        payload
    );

}


export function isAbortError(
    error: unknown
): boolean {

    return (
        error instanceof DOMException
        &&
        error.name === "AbortError"
    );

}


export function getErrorMessage(
    error: unknown
): string {

    if (
        error instanceof ApiError
    ) {

        return error.message;

    }


    if (
        error instanceof Error
    ) {

        return error.message;

    }


    return (
        "An unexpected error occurred."
    );

}