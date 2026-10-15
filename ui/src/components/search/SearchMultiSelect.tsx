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


interface SearchMultiSelectProps<T> {

    label: string;

    placeholder: string;

    options:
    T[];

    selected:
    T[];

    searchValue:
    string;

    isLoading:
    boolean;

    error:
    string | null;

    totalCount:
    number;

    getOptionKey: (
        option: T
    ) => string | number;

    getOptionLabel: (
        option: T
    ) => string;

    onSearchChange: (
        value: string
    ) => void;

    onToggle: (
        option: T
    ) => void;

    onLoadMore:
    () => void;

    onOpen:
    () => void;

}


export default function SearchMultiSelect<T>({
    label,
    placeholder,
    options,
    selected,
    searchValue,
    isLoading,
    error,
    totalCount,
    getOptionKey,
    getOptionLabel,
    onSearchChange,
    onToggle,
    onLoadMore,
    onOpen
}: SearchMultiSelectProps<T>) {

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


    function openDropdown() {

        if (
            !isOpen
        ) {

            setIsOpen(
                true
            );


            onOpen();

        }


        inputRef
            .current
            ?.focus();

    }


    function isSelected(
        option:
            T
    ) {

        const optionKey =
            getOptionKey(
                option
            );


        return selected.some(
            selectedItem =>
                getOptionKey(
                    selectedItem
                )
                ===
                optionKey
        );

    }


    function handleRemove(
        event:
            MouseEvent<HTMLButtonElement>,
        option:
            T
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
            event.key
            ===
            "Escape"
        ) {

            setIsOpen(
                false
            );

            return;

        }


        if (
            event.key
            ===
            "ArrowDown"
        ) {

            openDropdown();

            return;

        }


        if (
            event.key
            ===
            "Backspace"
            &&
            !searchValue
            &&
            selected.length
            >
            0
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
                            option => {

                                const optionKey =
                                    getOptionKey(
                                        option
                                    );


                                const optionLabel =
                                    getOptionLabel(
                                        option
                                    );


                                return (

                                    <span
                                        className="taxonomy-selected-chip"
                                        key={
                                            optionKey
                                        }
                                    >

                                        <span>

                                            {
                                                optionLabel
                                            }

                                        </span>


                                        <button
                                            type="button"
                                            aria-label={
                                                `Remove ${optionLabel}`
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

                                );

                            }
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
                            selected.length
                                ===
                                0
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
                        options.length
                        ===
                        0
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
                        options.length
                        >
                        0
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

                                        const optionKey =
                                            getOptionKey(
                                                option
                                            );


                                        const optionLabel =
                                            getOptionLabel(
                                                option
                                            );


                                        const selectedOption =
                                            isSelected(
                                                option
                                            );


                                        return (

                                            <button
                                                key={
                                                    optionKey
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
                                                        optionLabel
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
                        options.length
                        ===
                        0
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