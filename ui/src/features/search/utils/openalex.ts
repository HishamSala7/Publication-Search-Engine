import type {
    OpenAlexWork
} from "../types/search-ui.types";


export function rebuildAbstract(
    invertedIndex:
        Record<string, number[]> | null | undefined
): string {

    if (!invertedIndex) {

        return "";

    }


    const positionedWords:
        {
            position: number;
            word: string;
        }[] = [];


    Object.entries(
        invertedIndex
    ).forEach(
        ([
            word,
            positions
        ]) => {

            positions.forEach(
                position => {

                    positionedWords.push({

                        position,

                        word

                    });

                }
            );

        }
    );


    return positionedWords
        .sort(
            (
                first,
                second
            ) =>
                first.position
                -
                second.position
        )
        .map(
            item =>
                item.word
        )
        .join(" ");

}


export function getWorkAuthorNames(
    work: OpenAlexWork
): string[] {

    return (
        work.authorships
            ?.map(
                authorship =>
                    authorship
                        .author
                        ?.display_name
            )
            .filter(
                (
                    name
                ): name is string =>
                    Boolean(name)
            )
        ??
        []
    );

}


export function normalizeDoi(
    doi:
        string | null | undefined
): string {

    if (!doi) {

        return "";

    }


    return doi
        .replace(
            /^https?:\/\/doi\.org\//i,
            ""
        )
        .trim();

}


export function getDoiUrl(
    doi:
        string | null | undefined
): string | null {

    const normalized =
        normalizeDoi(
            doi
        );


    if (!normalized) {

        return null;

    }


    return (
        `https://doi.org/${normalized}`
    );

}