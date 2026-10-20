import {
    type MutableRefObject,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    FaFilter,
    FaRotateLeft
} from "react-icons/fa6";

import SearchMultiSelect
    from "./SearchMultiSelect";

import useInstitutions
    from "../../features/search/hooks/useInstitutions";

import useSearchTaxonomy
    from "../../features/search/hooks/useSearchTaxonomy";

import useWorkTypes
    from "../../features/search/hooks/useWorkTypes";

import type {
    SearchInstitutionOption,
    SearchTaxonomyOption,
    WorkTypeOption
} from "../../features/search/types/search-ui.types";

import {
    createEmptyAuthorGraphFilterValues,
    type AuthorGraphFilterValues
} from "../../features/search/types/author-graph-ui.types";


interface AuthorGraphFiltersProps {
    value: AuthorGraphFilterValues;
    onApply: (value: AuthorGraphFilterValues) => void;
    onClear: () => void;
}


const DROPDOWN_PAGE_SIZE = 10;


function toggleOption<T>(
    selected: T[],
    option: T,
    getKey: (item: T) => string | number
): T[] {
    const optionKey = getKey(option);
    const exists = selected.some(item => getKey(item) === optionKey);

    return exists
        ? selected.filter(item => getKey(item) !== optionKey)
        : [...selected, option];
}


function getTaxonomyKey(option: SearchTaxonomyOption) {
    return option.id;
}


function getTaxonomyLabel(option: SearchTaxonomyOption) {
    return option.displayName;
}


function getInstitutionKey(option: SearchInstitutionOption) {
    return option.id;
}


function getInstitutionLabel(option: SearchInstitutionOption) {
    return option.displayName;
}


function getWorkTypeKey(option: WorkTypeOption) {
    return option.key;
}


function getWorkTypeLabel(option: WorkTypeOption) {
    return option.value;
}


export default function AuthorGraphFilters({
    value,
    onApply,
    onClear
}: AuthorGraphFiltersProps) {
    const [draftFilters, setDraftFilters] = useState<AuthorGraphFilterValues>(value);

    const [shouldLoadInstitutions, setShouldLoadInstitutions] = useState(false);
    const [shouldLoadFields, setShouldLoadFields] = useState(false);
    const [shouldLoadSubFields, setShouldLoadSubFields] = useState(false);
    const [shouldLoadWorkTypes, setShouldLoadWorkTypes] = useState(false);

    const [institutionSearch, setInstitutionSearch] = useState("");
    const [fieldSearch, setFieldSearch] = useState("");
    const [subFieldSearch, setSubFieldSearch] = useState("");
    const [workTypeSearch, setWorkTypeSearch] = useState("");

    const [institutionBackendSearch, setInstitutionBackendSearch] = useState("");
    const [fieldBackendSearch, setFieldBackendSearch] = useState("");
    const [subFieldBackendSearch, setSubFieldBackendSearch] = useState("");

    const [institutionSkip, setInstitutionSkip] = useState(0);
    const [fieldSkip, setFieldSkip] = useState(0);
    const [subFieldSkip, setSubFieldSkip] = useState(0);

    const institutionTimer = useRef<number | null>(null);
    const fieldTimer = useRef<number | null>(null);
    const subFieldTimer = useRef<number | null>(null);

    useEffect(() => {
        setDraftFilters(value);
    }, [value]);

    useEffect(() => {
        return () => {
            [institutionTimer, fieldTimer, subFieldTimer].forEach(timer => {
                if (timer.current !== null) {
                    window.clearTimeout(timer.current);
                }
            });
        };
    }, []);

    const fieldIds = useMemo(
        () => draftFilters.fields.map(field => field.id),
        [draftFilters.fields]
    );

    const {
        fields,
        subFields,
        fieldsTotalCount,
        subFieldsTotalCount,
        isFieldsLoading,
        isSubFieldsLoading,
        fieldsError,
        subFieldsError
    } = useSearchTaxonomy({
        fieldIds,
        subFieldIds: [],
        topicIds: [],
        fieldFilter: fieldBackendSearch,
        subFieldFilter: subFieldBackendSearch,
        topicFilter: "",
        keywordFilter: "",
        fieldSkip,
        subFieldSkip,
        topicSkip: 0,
        keywordSkip: 0,
        loadFields: shouldLoadFields,
        loadSubFields: shouldLoadSubFields,
        loadTopics: false,
        loadKeywords: false,
        pageSize: DROPDOWN_PAGE_SIZE
    });

    const {
        institutions,
        totalCount: institutionsTotalCount,
        isLoading: isInstitutionsLoading,
        error: institutionsError
    } = useInstitutions({
        filter: institutionBackendSearch,
        skip: institutionSkip,
        load: shouldLoadInstitutions,
        pageSize: DROPDOWN_PAGE_SIZE
    });

    const {
        workTypes,
        isLoading: isWorkTypesLoading,
        error: workTypesError
    } = useWorkTypes({
        load: shouldLoadWorkTypes
    });

    const displayedWorkTypes = useMemo(() => {
        const search = workTypeSearch.trim().toLowerCase();
        if (!search) return workTypes;

        return workTypes.filter(type =>
            type.value.toLowerCase().includes(search)
        );
    }, [workTypes, workTypeSearch]);

    function updateBackendSearch(
        searchValue: string,
        timer: MutableRefObject<number | null>,
        resetSkip: () => void,
        setBackendValue: (value: string) => void
    ) {
        if (timer.current !== null) {
            window.clearTimeout(timer.current);
        }

        timer.current = window.setTimeout(() => {
            resetSkip();
            setBackendValue(searchValue.trim());
        }, 350);
    }

    function handleInstitutionSearch(searchValue: string) {
        setInstitutionSearch(searchValue);
        updateBackendSearch(
            searchValue,
            institutionTimer,
            () => setInstitutionSkip(0),
            setInstitutionBackendSearch
        );
    }

    function handleFieldSearch(searchValue: string) {
        setFieldSearch(searchValue);
        updateBackendSearch(
            searchValue,
            fieldTimer,
            () => setFieldSkip(0),
            setFieldBackendSearch
        );
    }

    function handleSubFieldSearch(searchValue: string) {
        setSubFieldSearch(searchValue);
        updateBackendSearch(
            searchValue,
            subFieldTimer,
            () => setSubFieldSkip(0),
            setSubFieldBackendSearch
        );
    }

    function handleInstitutionToggle(option: SearchInstitutionOption) {
        setDraftFilters(current => ({
            ...current,
            institutions: toggleOption(
                current.institutions,
                option,
                getInstitutionKey
            )
        }));
    }

    function handleFieldToggle(option: SearchTaxonomyOption) {
        setDraftFilters(current => ({
            ...current,
            fields: toggleOption(current.fields, option, getTaxonomyKey),
            subFields: []
        }));

        setSubFieldSearch("");
        setSubFieldBackendSearch("");
        setSubFieldSkip(0);
    }

    function handleSubFieldToggle(option: SearchTaxonomyOption) {
        setDraftFilters(current => ({
            ...current,
            subFields: toggleOption(
                current.subFields,
                option,
                getTaxonomyKey
            )
        }));
    }

    function handleWorkTypeToggle(option: WorkTypeOption) {
        setDraftFilters(current => ({
            ...current,
            types: toggleOption(current.types, option, getWorkTypeKey)
        }));
    }

    function loadMoreInstitutions() {
        if (
            isInstitutionsLoading
            || institutions.length >= institutionsTotalCount
        ) return;

        setInstitutionSkip(current => current + DROPDOWN_PAGE_SIZE);
    }

    function loadMoreFields() {
        if (isFieldsLoading || fields.length >= fieldsTotalCount) return;
        setFieldSkip(current => current + DROPDOWN_PAGE_SIZE);
    }

    function loadMoreSubFields() {
        if (isSubFieldsLoading || subFields.length >= subFieldsTotalCount) return;
        setSubFieldSkip(current => current + DROPDOWN_PAGE_SIZE);
    }

    function handleClear() {
        const empty = createEmptyAuthorGraphFilterValues();

        setDraftFilters(empty);
        setInstitutionSearch("");
        setFieldSearch("");
        setSubFieldSearch("");
        setWorkTypeSearch("");
        setInstitutionBackendSearch("");
        setFieldBackendSearch("");
        setSubFieldBackendSearch("");
        setInstitutionSkip(0);
        setFieldSkip(0);
        setSubFieldSkip(0);
        onClear();
    }

    return (
        <div className="author-graph-filters">
            <div className="author-graph-filters-heading">
                <div>
                    <FaFilter />

                    <div>
                        <strong>Graph filters</strong>
                        <span>Analytics only — publication results stay unchanged.</span>
                    </div>
                </div>

                <button
                    type="button"
                    className="author-graph-clear-button"
                    onClick={handleClear}
                >
                    <FaRotateLeft />
                    Clear
                </button>
            </div>

            <div className="author-graph-filter-grid">
                <div className="author-graph-date-filter">
                    <label>Publication date</label>

                    <div>
                        <span>From</span>
                        <input
                            type="date"
                            value={draftFilters.startDate}
                            onChange={event =>
                                setDraftFilters(current => ({
                                    ...current,
                                    startDate: event.target.value
                                }))
                            }
                        />
                    </div>

                    <div>
                        <span>To</span>
                        <input
                            type="date"
                            value={draftFilters.endDate}
                            onChange={event =>
                                setDraftFilters(current => ({
                                    ...current,
                                    endDate: event.target.value
                                }))
                            }
                        />
                    </div>
                </div>

                <SearchMultiSelect
                    label="Institution"
                    placeholder="Institutions..."
                    options={institutions}
                    selected={draftFilters.institutions}
                    searchValue={institutionSearch}
                    isLoading={isInstitutionsLoading}
                    error={institutionsError}
                    totalCount={institutionsTotalCount}
                    getOptionKey={getInstitutionKey}
                    getOptionLabel={getInstitutionLabel}
                    onSearchChange={handleInstitutionSearch}
                    onToggle={handleInstitutionToggle}
                    onLoadMore={loadMoreInstitutions}
                    onOpen={() => setShouldLoadInstitutions(true)}
                />

                <SearchMultiSelect
                    label="Field"
                    placeholder="Fields..."
                    options={fields}
                    selected={draftFilters.fields}
                    searchValue={fieldSearch}
                    isLoading={isFieldsLoading}
                    error={fieldsError}
                    totalCount={fieldsTotalCount}
                    getOptionKey={getTaxonomyKey}
                    getOptionLabel={getTaxonomyLabel}
                    onSearchChange={handleFieldSearch}
                    onToggle={handleFieldToggle}
                    onLoadMore={loadMoreFields}
                    onOpen={() => setShouldLoadFields(true)}
                />

                <SearchMultiSelect
                    label="Subfield"
                    placeholder="Subfields..."
                    options={subFields}
                    selected={draftFilters.subFields}
                    searchValue={subFieldSearch}
                    isLoading={isSubFieldsLoading}
                    error={subFieldsError}
                    totalCount={subFieldsTotalCount}
                    getOptionKey={getTaxonomyKey}
                    getOptionLabel={getTaxonomyLabel}
                    onSearchChange={handleSubFieldSearch}
                    onToggle={handleSubFieldToggle}
                    onLoadMore={loadMoreSubFields}
                    onOpen={() => setShouldLoadSubFields(true)}
                />

                <SearchMultiSelect
                    label="Publication type"
                    placeholder="Types..."
                    options={displayedWorkTypes}
                    selected={draftFilters.types}
                    searchValue={workTypeSearch}
                    isLoading={isWorkTypesLoading}
                    error={workTypesError}
                    totalCount={displayedWorkTypes.length}
                    getOptionKey={getWorkTypeKey}
                    getOptionLabel={getWorkTypeLabel}
                    onSearchChange={setWorkTypeSearch}
                    onToggle={handleWorkTypeToggle}
                    onLoadMore={() => undefined}
                    onOpen={() => setShouldLoadWorkTypes(true)}
                />
            </div>

            <div className="author-graph-filter-actions">
                <button
                    type="button"
                    onClick={() => onApply(draftFilters)}
                >
                    Apply filters
                </button>
            </div>
        </div>
    );
}
