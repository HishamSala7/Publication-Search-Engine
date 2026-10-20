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
    FaMagnifyingGlass,
    FaXmark
} from "react-icons/fa6";


interface SearchSingleSelectProps<T> {

    label:
    string;

    placeholder:
    string;

    options:
    T[];

    value:
    T | null;

    searchValue:
    string;

    isLoading:
    boolean;

    error:
    string | null;

    totalCount:
    number;

    getOptionKey: (
        option:
            T
    ) => string | number;

    getOptionLabel: (
        option:
            T
    ) => string;

    onSearchChange: (
        value:
            string
    ) => void;

    onSelect: (
        option:
            T
    ) => void;

    onClear:
    () => void;

    onLoadMore:
    () => void;

    onOpen:
    () => void;

}


export default function SearchSingleSelect<T>({
    label,
    placeholder,
    options,
    value,
    searchValue,
    isLoading,
    error,
    totalCount,
    getOptionKey,
    getOptionLabel,
    onSearchChange,
    onSelect,
    onClear,
    onLoadMore,
    onOpen
}: SearchSingleSelectProps<T>) {

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


    const searchInputRef =
        useRef<HTMLInputElement | null>(
            null
        );


    const hasMore =
        options.length
        <
        totalCount;


    const selectedKey =
        value
            ? getOptionKey(
                value
            )
            : null;


    const selectedLabel =
        value
            ? getOptionLabel(
                value
            )
            : "";


    useEffect(
        () => {

            function handleOutsideClick(
                event:
                    globalThis.MouseEvent
            ) {

                if (
                    !wrapperRef.current
                ) {

                    return;

                }


                if (
                    event.target
                    instanceof
                    Node
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


    useEffect(
        () => {

            if (
                !isOpen
            ) {

                return;

            }


            const focusTimer =
                window.setTimeout(
                    () => {

                        searchInputRef
                            .current
                            ?.focus();

                    },
                    0
                );


            return () =>
                window.clearTimeout(
                    focusTimer
                );

        },
        [
            isOpen
        ]
    );


    function openDropdown() {

        if (
            !isOpen
        ) {

            setIsOpen(
                true
            );


            onOpen();

        }

    }


    function closeDropdown() {

        setIsOpen(
            false
        );

    }


    function handleControlKeyDown(
        event:
            KeyboardEvent<HTMLButtonElement>
    ) {

        if (
            event.key
            ===
            "Enter"
            ||
            event.key
            ===
            " "
            ||
            event.key
            ===
            "ArrowDown"
        ) {

            event.preventDefault();

            openDropdown();

            return;

        }


        if (
            event.key
            ===
            "Escape"
        ) {

            closeDropdown();

        }

    }


    function handleSearchKeyDown(
        event:
            KeyboardEvent<HTMLInputElement>
    ) {

        if (
            event.key
            ===
            "Escape"
        ) {

            closeDropdown();

        }

    }


    function handleClear(
        event:
            MouseEvent<HTMLButtonElement>
    ) {

        event.stopPropagation();

        onClear();

        onSearchChange(
            ""
        );

    }


    function handleSelect(
        option:
            T
    ) {

        onSelect(
            option
        );

        onSearchChange(
            ""
        );

        closeDropdown();

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
            distanceFromBottom
            <=
            30
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
            className="search-single-select"
            ref={
                wrapperRef
            }
        >

            <label className="search-single-select-label">

                {
                    label
                }

            </label>


            <div className="search-single-select-control">

                <button
                    type="button"
                    className="search-single-select-trigger"
                    aria-haspopup="listbox"
                    aria-expanded={
                        isOpen
                    }
                    onClick={
                        openDropdown
                    }
                    onKeyDown={
                        handleControlKeyDown
                    }
                >

                    <span
                        className={
                            value
                                ? "search-single-select-value"
                                : "search-single-select-placeholder"
                        }
                    >

                        {
                            selectedLabel
                            ||
                            placeholder
                        }

                    </span>


                    <FaChevronDown
                        className={
                            isOpen
                                ? "search-single-select-chevron open"
                                : "search-single-select-chevron"
                        }
                    />

                </button>


                {
                    value
                    &&
                    <button
                        type="button"
                        className="search-single-select-clear"
                        aria-label={
                            `Clear ${selectedLabel}`
                        }
                        title="Clear selection"
                        onClick={
                            handleClear
                        }
                    >

                        <FaXmark />

                    </button>
                }

            </div>


            {
                isOpen
                &&
                <div className="search-single-select-dropdown">

                    <div className="search-single-select-search">

                        <FaMagnifyingGlass />


                        <input
                            ref={
                                searchInputRef
                            }
                            type="search"
                            value={
                                searchValue
                            }
                            placeholder="Search..."
                            autoComplete="off"
                            onChange={
                                event =>
                                    onSearchChange(
                                        event.target.value
                                    )
                            }
                            onKeyDown={
                                handleSearchKeyDown
                            }
                        />

                    </div>


                    {
                        error
                        &&
                        <div className="search-single-select-message error">

                            {
                                error
                            }

                        </div>
                    }


                    {
                        !error
                        &&
                        options.length
                        ===
                        0
                        &&
                        !isLoading
                        &&
                        <div className="search-single-select-message">

                            No results found.

                        </div>
                    }


                    {
                        !error
                        &&
                        options.length
                        >
                        0
                        &&
                        <div
                            className="search-single-select-options"
                            role="listbox"
                            onScroll={
                                handleOptionsScroll
                            }
                        >

                            {
                                options.map(
                                    option => {

                                        const optionKey =
                                            getOptionKey(
                                                option
                                            );


                                        const optionLabel =
                                            getOptionLabel(
                                                option
                                            );


                                        const isSelected =
                                            selectedKey
                                            ===
                                            optionKey;


                                        return (

                                            <button
                                                key={
                                                    optionKey
                                                }
                                                type="button"
                                                role="option"
                                                aria-selected={
                                                    isSelected
                                                }
                                                className={
                                                    isSelected
                                                        ? "search-single-select-option selected"
                                                        : "search-single-select-option"
                                                }
                                                onClick={() =>
                                                    handleSelect(
                                                        option
                                                    )
                                                }
                                            >

                                                <span>

                                                    {
                                                        optionLabel
                                                    }

                                                </span>


                                                {
                                                    isSelected
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
                                <div className="search-single-select-loading">

                                    Loading...

                                </div>
                            }


                            {
                                !isLoading
                                &&
                                hasMore
                                &&
                                <div className="search-single-select-hint">

                                    Scroll for more

                                </div>
                            }

                        </div>
                    }


                    {
                        !error
                        &&
                        options.length
                        ===
                        0
                        &&
                        isLoading
                        &&
                        <div className="search-single-select-message">

                            Loading...

                        </div>
                    }

                </div>
            }

        </div>

    );

}
