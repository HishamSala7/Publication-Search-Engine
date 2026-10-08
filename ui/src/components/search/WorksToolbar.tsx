import {
    FaMagnifyingGlass
} from "react-icons/fa6";

import type {
    WorksSortMode
} from "../../features/search/types/search-ui.types";


interface WorksToolbarProps {

    totalCount: number;

    filter: string;

    sortMode: WorksSortMode;

    onFilterChange: (
        value: string
    ) => void;

    onSortChange: (
        value: WorksSortMode
    ) => void;

}


export default function WorksToolbar({
    totalCount,
    filter,
    sortMode,
    onFilterChange,
    onSortChange
}: WorksToolbarProps) {

    function handleSortChange(
        value: string
    ) {

        if (
            value === "default"
            ||
            value === "latest"
            ||
            value === "mostCited"
        ) {

            onSortChange(
                value
            );

        }

    }


    return (

        <div className="works-toolbar">

            <div className="works-toolbar-count">

                <span>

                    Publications

                </span>


                <strong>

                    {
                        totalCount
                            .toLocaleString()
                    }

                </strong>


                <small>

                    {
                        totalCount === 1
                            ? "result"
                            : "results"
                    }

                </small>

            </div>


            <div className="works-toolbar-controls">

                <div className="works-search-input">

                    <FaMagnifyingGlass />


                    <input
                        type="search"
                        value={
                            filter
                        }
                        placeholder="Search publications..."
                        aria-label="Search publications"
                        onChange={
                            event =>
                                onFilterChange(
                                    event.target.value
                                )
                        }
                    />

                </div>


                <select
                    value={
                        sortMode
                    }
                    aria-label="Sort publications"
                    onChange={
                        event =>
                            handleSortChange(
                                event.target.value
                            )
                    }
                >

                    <option value="default">

                        Default

                    </option>


                    <option value="latest">

                        Latest

                    </option>


                    <option value="mostCited">

                        Most cited

                    </option>

                </select>

            </div>

        </div>

    );

}