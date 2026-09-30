import {
    useState
} from "react";

import {
    FaFilter
} from "react-icons/fa6";


const recordTypes = [

    "All",

    "Articles",

    "Books",

    "Patents"

];


export default function SearchFilters() {


    const [
        selectedRecordType,
        setSelectedRecordType
    ] = useState("All");


    return (

        <aside className="filter-panel">


            <div className="filter-title">

                <span>

                    Filter results

                </span>


                <i>

                    <FaFilter />

                </i>

            </div>


            <label htmlFor="publication-year-from">

                Publication year

            </label>


            <div className="range-row">


                <input
                    id="publication-year-from"
                    type="number"
                    defaultValue={2018}
                />


                <span>

                    to

                </span>


                <input
                    id="publication-year-to"
                    type="number"
                    defaultValue={2026}
                />


            </div>


            <label htmlFor="scientific-journal">

                Scientific journal

            </label>


            <select
                id="scientific-journal"
                defaultValue="All journals"
            >

                <option>
                    All journals
                </option>

                <option>
                    Nature
                </option>

                <option>
                    Science
                </option>

                <option>
                    IEEE
                </option>

                <option>
                    Elsevier
                </option>

            </select>


            <label htmlFor="institution">

                Institution / University

            </label>


            <select
                id="institution"
                defaultValue="All institutions"
            >

                <option>
                    All institutions
                </option>

                <option>
                    University of Oxford
                </option>

                <option>
                    MIT
                </option>

                <option>
                    Stanford University
                </option>

                <option>
                    University of Toronto
                </option>

            </select>


            <label>

                Research area

            </label>


            <div className="check-list">


                <label>

                    <input
                        type="checkbox"
                        defaultChecked
                    />

                    Computer Science

                </label>


                <label>

                    <input
                        type="checkbox"
                    />

                    Engineering

                </label>


                <label>

                    <input
                        type="checkbox"
                    />

                    Medicine

                </label>


                <label>

                    <input
                        type="checkbox"
                    />

                    Natural Sciences

                </label>


            </div>


            <label>

                Record type

            </label>


            <div className="chips">


                {
                    recordTypes.map(
                        recordType => (

                            <button
                                type="button"
                                key={recordType}
                                className={
                                    selectedRecordType === recordType
                                        ? "chip active"
                                        : "chip"
                                }
                                onClick={() =>
                                    setSelectedRecordType(
                                        recordType
                                    )
                                }
                            >

                                {recordType}

                            </button>

                        )
                    )
                }


            </div>


        </aside>

    );

}