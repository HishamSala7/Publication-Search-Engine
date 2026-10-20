import {
    type MutableRefObject,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    FaBuildingColumns,
    FaChartColumn,
    FaFilter,
    FaRotateLeft
} from "react-icons/fa6";

import SearchMultiSelect
    from "./SearchMultiSelect";

import useInstitutionsGraph
    from "../../features/search/hooks/useInstitutionsGraph";

import useSearchTaxonomy
    from "../../features/search/hooks/useSearchTaxonomy";

import useWorkTypes
    from "../../features/search/hooks/useWorkTypes";

import type {
    OpenAlexInstitutionFieldDto,
    SearchInstitutionOption,
    SearchTaxonomyOption,
    WorkTypeOption
} from "../../features/search/types/search-ui.types";

import {
    createEmptyInstitutionGraphFilterValues,
    type InstitutionGraphFilterValues
} from "../../features/search/types/institution-graph-ui.types";

import "../../styles/graphs.css";


interface InstitutionGraphSectionProps {
    institution: SearchInstitutionOption;
}


const DROPDOWN_PAGE_SIZE = 10;
const CHART_ITEM_LIMIT = 12;


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


function getWorkTypeKey(option: WorkTypeOption) {
    return option.key;
}


function getWorkTypeLabel(option: WorkTypeOption) {
    return option.value;
}


function getShortLabel(value: string): string {
    const words = value
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length >= 2) {
        return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
    }

    return value
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 2)
        .toUpperCase();
}


function InstitutionColumnChart({
    fields
}: {
    fields: OpenAlexInstitutionFieldDto[];
}) {
    const maximumCount = Math.max(
        1,
        ...fields.map(field => field.count)
    );

    return (
        <div className="institution-column-chart-wrap">
            <div className="institution-column-chart">
                {fields.map(field => {
                    const height = Math.max(
                        4,
                        field.count / maximumCount * 100
                    );

                    return (
                        <div
                            className="institution-column-item"
                            key={field.fieldDisplayName}
                            title={
                                `${field.fieldDisplayName}: ${field.count.toLocaleString()} works`
                            }
                        >
                            <div className="institution-column-value">
                                {field.count.toLocaleString()}
                            </div>

                            <div className="institution-column-track">
                                <div
                                    className="institution-column-bar"
                                    style={{ height: `${height}%` }}
                                />
                            </div>

                            <span className="institution-column-label">
                                {getShortLabel(field.fieldDisplayName)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


export default function InstitutionGraphSection({
    institution
}: InstitutionGraphSectionProps) {
    const [appliedFilters, setAppliedFilters] = useState<InstitutionGraphFilterValues>(
        createEmptyInstitutionGraphFilterValues()
    );

    const [draftFilters, setDraftFilters] = useState<InstitutionGraphFilterValues>(
        createEmptyInstitutionGraphFilterValues()
    );

    const [shouldLoadFields, setShouldLoadFields] = useState(false);
    const [shouldLoadWorkTypes, setShouldLoadWorkTypes] = useState(false);

    const [fieldSearch, setFieldSearch] = useState("");
    const [fieldBackendSearch, setFieldBackendSearch] = useState("");
    const [workTypeSearch, setWorkTypeSearch] = useState("");
    const [fieldSkip, setFieldSkip] = useState(0);

    const fieldSearchTimer = useRef<number | null>(null);


    const activeInstitutionIdRef =
        useRef(
            institution.openAlexId.trim()
        );


    const institutionId =
        institution.openAlexId.trim();

    const {
        data,
        isLoading,
        error,
        loadInstitutionsGraph,
        resetInstitutionsGraph
    } = useInstitutionsGraph();

    const {
        fields,
        fieldsTotalCount,
        isFieldsLoading,
        fieldsError
    } = useSearchTaxonomy({
        fieldIds: [],
        subFieldIds: [],
        topicIds: [],
        fieldFilter: fieldBackendSearch,
        subFieldFilter: "",
        topicFilter: "",
        keywordFilter: "",
        fieldSkip,
        subFieldSkip: 0,
        topicSkip: 0,
        keywordSkip: 0,
        loadFields: shouldLoadFields,
        loadSubFields: false,
        loadTopics: false,
        loadKeywords: false,
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

    useEffect(() => {
        return () => {
            if (fieldSearchTimer.current !== null) {
                window.clearTimeout(fieldSearchTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        const institutionChanged =
            activeInstitutionIdRef.current
            !==
            institutionId;

        if (institutionChanged) {
            activeInstitutionIdRef.current =
                institutionId;

            const empty =
                createEmptyInstitutionGraphFilterValues();

            setAppliedFilters(
                empty
            );

            setDraftFilters(
                empty
            );

            setFieldSearch(
                ""
            );

            setFieldBackendSearch(
                ""
            );

            setWorkTypeSearch(
                ""
            );

            setFieldSkip(
                0
            );

            resetInstitutionsGraph();

            return;
        }

        if (!institutionId) {
            resetInstitutionsGraph();
            return;
        }

        void loadInstitutionsGraph({
            openAlexInstitutionIds: [institutionId],
            startDate: appliedFilters.startDate || undefined,
            endDate: appliedFilters.endDate || undefined,
            openAlexFieldIds: appliedFilters.fields.map(
                field => field.openAlexId
            ),
            types: appliedFilters.types.map(type => type.key)
        });
    }, [
        institutionId,
        appliedFilters,
        loadInstitutionsGraph,
        resetInstitutionsGraph
    ]);

    const graph = data?.find(
        item =>
            item.openAlexInstitutionId
            ===
            institutionId
    ) ?? data?.[0] ?? null;

    const fieldsData = useMemo(
        () => [...(graph?.fields ?? [])]
            .sort((first, second) => second.count - first.count),
        [graph]
    );

    const chartFields = useMemo(
        () => fieldsData.slice(0, CHART_ITEM_LIMIT),
        [fieldsData]
    );

    const hiddenFieldCount = Math.max(
        0,
        fieldsData.length - chartFields.length
    );

    const leadingField = fieldsData[0] ?? null;

    const groupedCount = useMemo(
        () => fieldsData.reduce((total, field) => total + field.count, 0),
        [fieldsData]
    );

    function updateBackendSearch(
        value: string,
        timer: MutableRefObject<number | null>,
        resetSkip: () => void,
        setBackendValue: (value: string) => void
    ) {
        if (timer.current !== null) {
            window.clearTimeout(timer.current);
        }

        timer.current = window.setTimeout(() => {
            resetSkip();
            setBackendValue(value.trim());
        }, 350);
    }

    function handleFieldSearch(value: string) {
        setFieldSearch(value);
        updateBackendSearch(
            value,
            fieldSearchTimer,
            () => setFieldSkip(0),
            setFieldBackendSearch
        );
    }

    function handleFieldToggle(option: SearchTaxonomyOption) {
        setDraftFilters(current => ({
            ...current,
            fields: toggleOption(current.fields, option, getTaxonomyKey)
        }));
    }

    function handleWorkTypeToggle(option: WorkTypeOption) {
        setDraftFilters(current => ({
            ...current,
            types: toggleOption(current.types, option, getWorkTypeKey)
        }));
    }

    function loadMoreFields() {
        if (isFieldsLoading || fields.length >= fieldsTotalCount) return;
        setFieldSkip(current => current + DROPDOWN_PAGE_SIZE);
    }

    function handleApply() {
        setAppliedFilters({
            startDate: draftFilters.startDate,
            endDate: draftFilters.endDate,
            fields: [...draftFilters.fields],
            types: [...draftFilters.types]
        });
    }

    function handleClear() {
        const empty = createEmptyInstitutionGraphFilterValues();

        setDraftFilters(empty);
        setAppliedFilters(empty);
        setFieldSearch("");
        setFieldBackendSearch("");
        setWorkTypeSearch("");
        setFieldSkip(0);
    }

    return (
        <section className="author-graph-section">
            <div className="author-graph-section-heading">
                <div>
                    <span className="section-kicker">INSTITUTION ANALYTICS</span>
                    <h2>Research fields</h2>
                    <p>
                        Analyze publication activity for{" "}
                        <strong>{institution.displayName}</strong>{" "}
                        separately from the publication results below.
                    </p>
                </div>
            </div>

            <div className="author-graph-filters author-graph-filters--institution">
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

                <div className="author-graph-filter-grid author-graph-filter-grid--institution">
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
                        onClick={handleApply}
                    >
                        Apply filters
                    </button>
                </div>
            </div>

            <section className="research-graph-card">
                <div className="research-graph-header">
                    <div>
                        <span className="section-kicker">FIELD DISTRIBUTION</span>
                        <h2>Publications by field</h2>
                        <p>
                            Publication counts grouped by research field for the selected institution.
                        </p>
                    </div>

                    <div className="research-graph-header-actions">
                        <div className="research-graph-mode-static">
                            <span>View by</span>
                            <div>
                                <FaChartColumn />
                                <strong>Field</strong>
                            </div>
                        </div>

                        <div className="institution-graph-subject">
                            <FaBuildingColumns />

                            <div>
                                <span>Institution</span>
                                <strong>
                                    {graph?.institutionDisplayName || institution.displayName}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="research-graph-state">
                        <div className="research-graph-loader" />
                        <strong>Loading institution analytics...</strong>
                        <span>Aggregating publication fields.</span>
                    </div>
                ) : error ? (
                    <div className="research-graph-state research-graph-state--error">
                        <strong>Graph could not be loaded.</strong>
                        <span>{error}</span>
                    </div>
                ) : fieldsData.length === 0 ? (
                    <div className="research-graph-state">
                        <strong>No graph data found.</strong>
                        <span>Change the graph filters and try again.</span>
                    </div>
                ) : (
                    <>
                        <InstitutionColumnChart fields={chartFields} />

                        {hiddenFieldCount > 0 && (
                            <div className="research-graph-more-note">
                                Showing top {chartFields.length} of {fieldsData.length} fields.
                                {" "}
                                {hiddenFieldCount} more {hiddenFieldCount === 1 ? "field is" : "fields are"} available in Graph details below.
                            </div>
                        )}

                        <div className="research-graph-details">
                            <div className="research-graph-details-heading">
                                <div>
                                    <span>GRAPH DETAILS</span>
                                    <h3>Field breakdown</h3>
                                </div>

                                <small>
                                    {fieldsData.length.toLocaleString()} fields · grouped count {groupedCount.toLocaleString()}
                                </small>
                            </div>

                            {leadingField && (
                                <p className="research-graph-summary">
                                    {leadingField.fieldDisplayName} has the largest grouped count with {leadingField.count.toLocaleString()} works. The chart shows only the strongest {Math.min(CHART_ITEM_LIMIT, fieldsData.length)} fields; the complete field breakdown is listed below.
                                </p>
                            )}

                            <div className="research-graph-detail-grid">
                                {fieldsData.map(field => (
                                    <div
                                        className="research-graph-detail-row"
                                        key={field.fieldDisplayName}
                                    >
                                        <span>{field.fieldDisplayName}</span>
                                        <strong>{field.count.toLocaleString()}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </section>
        </section>
    );
}
