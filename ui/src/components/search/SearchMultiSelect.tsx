import {
    type KeyboardEvent,
    type MouseEvent,
    type UIEvent,
    useEffect,
    useRef,
    useState
} from "react";

import {
    FaCheck,
    FaChevronDown,
    FaXmark
} from "react-icons/fa6";

import type {
    SearchTaxonomyOption
} from "../../features/search/types/search-ui.types";


interface SearchMultiSelectProps {

    label: string;

    placeholder: string;

    options:
    SearchTaxonomyOption[];

    selected:
    SearchTaxonomyOption[];

    searchValue: string;

    isLoading: boolean;

    error:
    string | null;

    totalCount: number;

    onSearchChange: (
        value: string
    ) => void;

    onToggle: (
        option: SearchTaxonomyOption
    ) => void;

    onLoadMore: () => void;

    onOpen: () => void;

}


export default function SearchMultiSelect({
    label,
    placeholder,
    options,
    selected,
    searchValue,
    isLoading,
    error,
    totalCount,
    onSearchChange,
    onToggle,
    onLoadMore,
    onOpen
}: SearchMultiSelectProps) {

    const [
        isOpen,
        setIsOpen
    ] = useState(
        false
    );


    const wrapperRef =
        useRef<HTMLDivElement | null>(
            null
        );


    const inputRef =
        useRef<HTMLInputElement | null>(
            null
        );


    const hasMore =
        options.length
        <
        totalCount;


    useEffect(
        () => {

            function handleOutsideClick(
                event: globalThis.MouseEvent
            ) {

                if (
                    !wrapperRef.current
                ) {

                    return;

                }


                if (
                    event.target instanceof Node
                    &&
                    !wrapperRef.current.contains(
                        event.target
                    )
                ) {

                    setIsOpen(
                        false
                    );

                }

            }


            document.addEventListener(
                "mousedown",
                handleOutsideClick
            );


            return () => {

                document.removeEventListener(
                    "mousedown",
                    handleOutsideClick
                );

            };

        },
        []
    );


    function openDropdown() {

        if (
            !isOpen
        ) {

            setIsOpen(
                true
            );


            /*
                The parent decides whether data
                needs to be loaded.

                Merely rendering this component no
                longer causes an API request.
            */
            onOpen();

        }


        inputRef
            .current
            ?.focus();

    }


    function isSelected(
        option:
            SearchTaxonomyOption
    ) {

        return selected.some(
            selectedItem =>
                selectedItem.id
                ===
                option.id
        );

    }


    function handleRemove(
        event:
            MouseEvent<HTMLButtonElement>,
        option:
            SearchTaxonomyOption
    ) {

        event.stopPropagation();


        onToggle(
            option
        );

    }


    function handleKeyDown(
        event:
            KeyboardEvent<HTMLInputElement>
    ) {

        if (
            event.key === "Escape"
        ) {

            setIsOpen(
                false
            );

            return;

        }


        if (
            event.key === "ArrowDown"
        ) {

            openDropdown();

            return;

        }


        if (
            event.key === "Backspace"
            &&
            !searchValue
            &&
            selected.length > 0
        ) {

            const lastItem =
                selected[
                selected.length - 1
                ];


            onToggle(
                lastItem
            );

        }

    }


    function handleOptionsScroll(
        event:
            UIEvent<HTMLDivElement>
    ) {

        const element =
            event.currentTarget;


        const distanceFromBottom =
            element.scrollHeight
            -
            element.scrollTop
            -
            element.clientHeight;


        if (
            distanceFromBottom <= 30
            &&
            hasMore
            &&
            !isLoading
        ) {

            onLoadMore();

        }

    }


    return (

        <div
            className="taxonomy-multi-select"
            ref={
                wrapperRef
            }
        >

            <label className="taxonomy-multi-select-label">

                {label}

            </label>


            <div
                className={
                    isOpen
                        ? "taxonomy-multi-select-control open"
                        : "taxonomy-multi-select-control"
                }
                onClick={
                    openDropdown
                }
            >

                <div className="taxonomy-multi-select-values">

                    {
                        selected.map(
                            option => (

                                <span
                                    className="taxonomy-selected-chip"
                                    key={
                                        option.id
                                    }
                                >

                                    <span>

                                        {
                                            option.displayName
                                        }

                                    </span>


                                    <button
                                        type="button"
                                        aria-label={
                                            `Remove ${option.displayName}`
                                        }
                                        onClick={
                                            event =>
                                                handleRemove(
                                                    event,
                                                    option
                                                )
                                        }
                                    >

                                        <FaXmark />

                                    </button>

                                </span>

                            )
                        )
                    }


                    <input
                        ref={
                            inputRef
                        }
                        type="search"
                        value={
                            searchValue
                        }
                        placeholder={
                            selected.length === 0
                                ? placeholder
                                : "Search..."
                        }
                        onFocus={
                            openDropdown
                        }
                        onChange={
                            event =>
                                onSearchChange(
                                    event.target.value
                                )
                        }
                        onKeyDown={
                            handleKeyDown
                        }
                    />

                </div>


                <FaChevronDown
                    className={
                        isOpen
                            ? "taxonomy-chevron open"
                            : "taxonomy-chevron"
                    }
                />

            </div>


            {
                isOpen
                &&
                <div className="taxonomy-options-dropdown">

                    {
                        error
                        &&
                        <div className="taxonomy-dropdown-message error">

                            {error}

                        </div>
                    }


                    {
                        !error
                        &&
                        options.length === 0
                        &&
                        !isLoading
                        &&
                        <div className="taxonomy-dropdown-message">

                            No results found.

                        </div>
                    }


                    {
                        !error
                        &&
                        options.length > 0
                        &&
                        <div
                            className="taxonomy-options-list"
                            onScroll={
                                handleOptionsScroll
                            }
                        >

                            {
                                options.map(
                                    option => {

                                        const selectedOption =
                                            isSelected(
                                                option
                                            );


                                        return (

                                            <button
                                                key={
                                                    option.id
                                                }
                                                type="button"
                                                className={
                                                    selectedOption
                                                        ? "taxonomy-option selected"
                                                        : "taxonomy-option"
                                                }
                                                onClick={() =>
                                                    onToggle(
                                                        option
                                                    )
                                                }
                                            >

                                                <span>

                                                    {
                                                        option.displayName
                                                    }

                                                </span>


                                                {
                                                    selectedOption
                                                    &&
                                                    <FaCheck />
                                                }

                                            </button>

                                        );

                                    }
                                )
                            }


                            {
                                isLoading
                                &&
                                <div className="taxonomy-dropdown-loading">

                                    Loading...

                                </div>
                            }


                            {
                                !isLoading
                                &&
                                hasMore
                                &&
                                <div className="taxonomy-scroll-hint">

                                    Scroll for more

                                </div>
                            }

                        </div>
                    }


                    {
                        !error
                        &&
                        options.length === 0
                        &&
                        isLoading
                        &&
                        <div className="taxonomy-dropdown-message">

                            Loading...

                        </div>
                    }

                </div>
            }

        </div>

    );

}