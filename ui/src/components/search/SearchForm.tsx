import {
    type FormEvent,
    useEffect,
    useState
} from "react";

import {
    FaArrowRight,
    FaMagnifyingGlass
} from "react-icons/fa6";

import {
    emptySearchFormValues,
    type SearchFormValues,
    type SearchMode
} from "../../features/search/types/search-ui.types";


interface SearchFormProps {

    mode: SearchMode;

    initialValues?:
    Partial<SearchFormValues>;

    onSubmit: (
        values: SearchFormValues
    ) => void;

}


export default function SearchForm({
    mode,
    initialValues,
    onSubmit
}: SearchFormProps) {

    const [
        values,
        setValues
    ] = useState<SearchFormValues>({
        ...emptySearchFormValues,
        ...initialValues
    });


    const [
        error,
        setError
    ] = useState(
        ""
    );


    useEffect(
        () => {

            setValues({

                name:
                    initialValues?.name
                    ??
                    "",

                email:
                    initialValues?.email
                    ??
                    "",

                publicationQuery:
                    initialValues?.publicationQuery
                    ??
                    "",

                orcid:
                    initialValues?.orcid
                    ??
                    "",

                doi:
                    initialValues?.doi
                    ??
                    ""

            });


            setError(
                ""
            );

        },
        [
            mode,
            initialValues?.name,
            initialValues?.email,
            initialValues?.publicationQuery,
            initialValues?.orcid,
            initialValues?.doi
        ]
    );


    function updateField(
        field:
            keyof SearchFormValues,
        value:
            string
    ) {

        setValues(
            currentValues => ({

                ...currentValues,

                [field]:
                    value

            })
        );


        if (
            error
        ) {

            setError(
                ""
            );

        }

    }


    function handleSubmit(
        event:
            FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        const normalizedValues:
            SearchFormValues = {

            name:
                values.name.trim(),

            email:
                values.email.trim(),

            publicationQuery:
                values
                    .publicationQuery
                    .trim(),

            orcid:
                values.orcid.trim(),

            doi:
                values.doi.trim()

        };


        if (
            mode === "author"
            &&
            !normalizedValues.name
        ) {

            setError(
                "Researcher name is required."
            );

            return;

        }


        if (
            mode === "orcid"
            &&
            !normalizedValues.orcid
        ) {

            setError(
                "ORCID is required."
            );

            return;

        }


        if (
            mode === "doi"
            &&
            !normalizedValues.doi
        ) {

            setError(
                "DOI is required."
            );

            return;

        }


        setError(
            ""
        );


        onSubmit(
            normalizedValues
        );

    }


    function getSubmitLabel() {

        if (
            mode === "author"
        ) {

            return "Find researcher";

        }


        if (
            mode === "publications"
        ) {

            return "Search publications";

        }


        if (
            mode === "doi"
        ) {

            return "Find publication";

        }


        return "Search";

    }


    return (

        <form
            className={
                `search-form search-form--${mode}`
            }
            onSubmit={
                handleSubmit
            }
            noValidate
        >

            <div className="search-form-fields">


                {
                    mode === "author"
                    &&
                    <>

                        <div className="search-form-field">

                            <label
                                htmlFor="researcher-name"
                            >

                                Researcher name

                                <span>
                                    *
                                </span>

                            </label>


                            <div className="search-input-wrap">

                                <FaMagnifyingGlass />


                                <input
                                    id="researcher-name"
                                    type="search"
                                    value={
                                        values.name
                                    }
                                    placeholder="e.g. John Smith"
                                    autoComplete="off"
                                    required
                                    onChange={
                                        event =>
                                            updateField(
                                                "name",
                                                event.target.value
                                            )
                                    }
                                />

                            </div>

                        </div>


                        <div className="search-form-field">

                            <label
                                htmlFor="researcher-email"
                            >

                                Email

                                <small>

                                    Optional

                                </small>

                            </label>


                            <div className="search-input-wrap">

                                <input
                                    id="researcher-email"
                                    type="email"
                                    value={
                                        values.email
                                    }
                                    placeholder="john@university.edu"
                                    autoComplete="email"
                                    onChange={
                                        event =>
                                            updateField(
                                                "email",
                                                event.target.value
                                            )
                                    }
                                />

                            </div>

                        </div>

                    </>
                }


                {
                    mode === "publications"
                    &&
                    <div
                        className="
                            search-form-field
                            search-form-field-full
                        "
                    >

                        <label
                            htmlFor="publication-search"
                        >

                            Publication search

                            <small>

                                Optional

                            </small>

                        </label>


                        <div className="search-input-wrap">

                            <FaMagnifyingGlass />


                            <input
                                id="publication-search"
                                type="search"
                                value={
                                    values.publicationQuery
                                }
                                placeholder="e.g. machine learning, medical imaging..."
                                autoComplete="off"
                                onChange={
                                    event =>
                                        updateField(
                                            "publicationQuery",
                                            event.target.value
                                        )
                                }
                            />

                        </div>

                    </div>
                }


                {
                    mode === "orcid"
                    &&
                    <div
                        className="
                            search-form-field
                            search-form-field-full
                        "
                    >

                        <label
                            htmlFor="researcher-orcid"
                        >

                            ORCID

                            <span>
                                *
                            </span>

                        </label>


                        <div className="search-input-wrap">

                            <FaMagnifyingGlass />


                            <input
                                id="researcher-orcid"
                                type="search"
                                value={
                                    values.orcid
                                }
                                placeholder="e.g. 0000-0002-1825-0097"
                                autoComplete="off"
                                required
                                onChange={
                                    event =>
                                        updateField(
                                            "orcid",
                                            event.target.value
                                        )
                                }
                            />

                        </div>

                    </div>
                }


                {
                    mode === "doi"
                    &&
                    <div
                        className="
                            search-form-field
                            search-form-field-full
                        "
                    >

                        <label
                            htmlFor="publication-doi"
                        >

                            DOI

                            <span>
                                *
                            </span>

                        </label>


                        <div className="search-input-wrap">

                            <FaMagnifyingGlass />


                            <input
                                id="publication-doi"
                                type="search"
                                value={
                                    values.doi
                                }
                                placeholder="e.g. 10.1038/s41586-026-xxxxx"
                                autoComplete="off"
                                required
                                onChange={
                                    event =>
                                        updateField(
                                            "doi",
                                            event.target.value
                                        )
                                }
                            />

                        </div>

                    </div>
                }


            </div>


            {
                error
                &&
                <p
                    className="search-form-error"
                    role="alert"
                >

                    {error}

                </p>
            }


            <button
                type="submit"
                className="search-form-submit"
            >

                {
                    getSubmitLabel()
                }

                <FaArrowRight />

            </button>

        </form>

    );

}