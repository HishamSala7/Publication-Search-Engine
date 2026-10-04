import type {
    SearchMode
} from "../../features/search/types/search-ui.types";


interface SearchModeSelectorProps {

    value: SearchMode;

    onChange: (
        mode: SearchMode
    ) => void;

}


const searchModes: {
    value: SearchMode;
    label: string;
}[] = [

        {
            value: "author",
            label: "Researcher"
        },

        {
            value: "publications",
            label: "Publications"
        },

        {
            value: "orcid",
            label: "ORCID"
        },

        {
            value: "doi",
            label: "DOI"
        }

    ];


export default function SearchModeSelector({
    value,
    onChange
}: SearchModeSelectorProps) {

    return (

        <div
            className="search-mode-selector"
            role="tablist"
            aria-label="Search mode"
        >

            {
                searchModes.map(
                    searchMode => (

                        <button
                            key={
                                searchMode.value
                            }
                            type="button"
                            role="tab"
                            aria-selected={
                                value
                                ===
                                searchMode.value
                            }
                            className={
                                value
                                    ===
                                    searchMode.value
                                    ? "search-mode-button active"
                                    : "search-mode-button"
                            }
                            onClick={() =>
                                onChange(
                                    searchMode.value
                                )
                            }
                        >

                            {
                                searchMode.label
                            }

                        </button>

                    )
                )
            }

        </div>

    );

}