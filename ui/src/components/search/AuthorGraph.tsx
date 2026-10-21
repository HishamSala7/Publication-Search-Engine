import {
    useMemo
} from "react";

import {
    FaChartColumn,
    FaChartLine
} from "react-icons/fa6";

import {
    OpenAlexGraphModes
} from "../../features/search/types/search-ui.types";

import type {
    OpenAlexAuthorGraphDto,
    OpenAlexAuthorGraphItemDto,
    OpenAlexGraphMode
} from "../../features/search/types/search-ui.types";

import "../../styles/graphs.css";


interface AuthorGraphProps {
    data: OpenAlexAuthorGraphDto[] | null;
    mode: OpenAlexGraphMode;
    onModeChange: (mode: OpenAlexGraphMode) => void;
    isLoading?: boolean;
    error?: string | null;
}


interface GraphCategory {
    key: string;
    displayName: string;
}


const YEAR_CHART_LIMIT = 15;
const CATEGORY_CHART_LIMIT = 12;


const modeOptions: {
    value: OpenAlexGraphMode;
    label: string;
}[] = [
        { value: OpenAlexGraphModes.Year, label: "Year" },
        { value: OpenAlexGraphModes.Institution, label: "Institution" },
        { value: OpenAlexGraphModes.Field, label: "Field" },
        { value: OpenAlexGraphModes.SubField, label: "Subfield" },
        { value: OpenAlexGraphModes.PublicationType, label: "Publication type" }
    ];


function parseGraphMode(value: string): OpenAlexGraphMode {
    const numericValue = Number(value);

    switch (numericValue) {
        case OpenAlexGraphModes.Year:
            return OpenAlexGraphModes.Year;
        case OpenAlexGraphModes.Institution:
            return OpenAlexGraphModes.Institution;
        case OpenAlexGraphModes.Field:
            return OpenAlexGraphModes.Field;
        case OpenAlexGraphModes.SubField:
            return OpenAlexGraphModes.SubField;
        case OpenAlexGraphModes.PublicationType:
            return OpenAlexGraphModes.PublicationType;
        default:
            return OpenAlexGraphModes.Year;
    }
}


function getModeTitle(mode: OpenAlexGraphMode): string {
    switch (mode) {
        case OpenAlexGraphModes.Year:
            return "Publications over time";
        case OpenAlexGraphModes.Institution:
            return "Publications by institution";
        case OpenAlexGraphModes.Field:
            return "Publications by field";
        case OpenAlexGraphModes.SubField:
            return "Publications by subfield";
        case OpenAlexGraphModes.PublicationType:
            return "Publications by type";
        default:
            return "Research activity";
    }
}


function getModeDescription(mode: OpenAlexGraphMode): string {
    switch (mode) {
        case OpenAlexGraphModes.Year:
            return "Track publication output across the selected period.";
        case OpenAlexGraphModes.Institution:
            return "Compare how matching works are distributed across institutions.";
        case OpenAlexGraphModes.Field:
            return "See the research fields represented in the selected works.";
        case OpenAlexGraphModes.SubField:
            return "Explore the distribution of works across research subfields.";
        case OpenAlexGraphModes.PublicationType:
            return "Compare the publication formats represented in the selected works.";
        default:
            return "Explore publication counts for the selected researcher.";
    }
}


function getItemCount(
    items: OpenAlexAuthorGraphItemDto[],
    key: string
): number {
    return items.find(item => item.key === key)?.count ?? 0;
}


function getShortLabel(
    value: string
): string {
    const words = value
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return (words[0] ?? "")
        .slice(0, 2)
        .toUpperCase();
}


function collectCategories(
    data: OpenAlexAuthorGraphDto[],
    mode: OpenAlexGraphMode
): GraphCategory[] {
    const categories = new Map<string, string>();

    data.forEach(author => {
        author.items.forEach(item => {
            if (!item.key) return;

            if (!categories.has(item.key)) {
                categories.set(item.key, item.displayName || item.key);
            }
        });
    });

    const result = Array.from(categories, ([key, displayName]) => ({
        key,
        displayName
    }));

    if (mode === OpenAlexGraphModes.Year) {
        return result.sort((first, second) => {
            const firstYear = Number(first.key);
            const secondYear = Number(second.key);

            if (Number.isFinite(firstYear) && Number.isFinite(secondYear)) {
                return firstYear - secondYear;
            }

            return first.displayName.localeCompare(second.displayName);
        });
    }

    return result.sort((first, second) => {
        const firstTotal = data.reduce(
            (total, author) => total + getItemCount(author.items, first.key),
            0
        );

        const secondTotal = data.reduce(
            (total, author) => total + getItemCount(author.items, second.key),
            0
        );

        if (firstTotal !== secondTotal) {
            return secondTotal - firstTotal;
        }

        return first.displayName.localeCompare(second.displayName);
    });
}


function getDisplayedCategories(
    categories: GraphCategory[],
    mode: OpenAlexGraphMode
): GraphCategory[] {
    if (mode === OpenAlexGraphModes.Year) {
        return categories.slice(-YEAR_CHART_LIMIT);
    }

    return categories.slice(0, CATEGORY_CHART_LIMIT);
}


function getMaximumCount(data: OpenAlexAuthorGraphDto[]): number {
    const maximum = Math.max(
        0,
        ...data.flatMap(author => author.items.map(item => item.count))
    );

    return maximum > 0 ? maximum : 1;
}


function formatCount(value: number): string {
    return new Intl.NumberFormat("en", {
        notation: value >= 1000 ? "compact" : "standard",
        maximumFractionDigits: 1
    }).format(value);
}


function AuthorGraphLegend({
    data
}: {
    data: OpenAlexAuthorGraphDto[];
}) {
    if (data.length <= 1) return null;

    return (
        <div className="research-graph-legend">
            {data.map((author, index) => (
                <span key={author.openAlexAuthorId}>
                    <i
                        className={
                            `research-graph-series-marker series-${index % 4}`
                        }
                    />

                    {author.authorDisplayName || author.openAlexAuthorId}
                </span>
            ))}
        </div>
    );
}


function AuthorYearLineChart({
    data,
    categories
}: {
    data: OpenAlexAuthorGraphDto[];
    categories: GraphCategory[];
}) {
    const width = 920;
    const height = 330;
    const padding = {
        top: 24,
        right: 28,
        bottom: 58,
        left: 64
    };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maximumCount = getMaximumCount(data);
    const yTickCount = 4;

    function getX(index: number): number {
        if (categories.length <= 1) {
            return padding.left + chartWidth / 2;
        }

        return padding.left
            + chartWidth * index / (categories.length - 1);
    }

    function getY(count: number): number {
        return padding.top
            + chartHeight
            - chartHeight * count / maximumCount;
    }

    return (
        <div className="research-line-chart-wrap">
            <svg
                className="research-line-chart"
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label="Publication counts by year"
            >
                {Array.from({ length: yTickCount + 1 }, (_, index) => {
                    const ratio = index / yTickCount;
                    const value = maximumCount * (1 - ratio);
                    const y = padding.top + chartHeight * ratio;

                    return (
                        <g key={`y-${index}`}>
                            <line
                                className="research-graph-grid-line"
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                            />

                            <text
                                className="research-graph-axis-label"
                                x={padding.left - 12}
                                y={y + 4}
                                textAnchor="end"
                            >
                                {formatCount(Math.round(value))}
                            </text>
                        </g>
                    );
                })}

                {categories.map((category, index) => (
                    <text
                        className="research-graph-axis-label research-graph-year-label"
                        key={category.key}
                        x={getX(index)}
                        y={height - 24}
                        textAnchor="middle"
                    >
                        {category.displayName}
                    </text>
                ))}

                {data.map((author, authorIndex) => {
                    const points = categories.map((category, index) => {
                        const count = getItemCount(author.items, category.key);

                        return {
                            x: getX(index),
                            y: getY(count),
                            count,
                            category
                        };
                    });

                    const path = points
                        .map((point, index) =>
                            `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
                        )
                        .join(" ");

                    return (
                        <g
                            key={author.openAlexAuthorId}
                            className={
                                `research-graph-series series-${authorIndex % 4}`
                            }
                        >
                            <path
                                className="research-graph-line"
                                d={path}
                            />

                            {points.map(point => (
                                <g
                                    key={
                                        `${author.openAlexAuthorId}-${point.category.key}`
                                    }
                                >
                                    <circle
                                        className="research-graph-point"
                                        cx={point.x}
                                        cy={point.y}
                                        r="5"
                                    />

                                    <title>
                                        {`${author.authorDisplayName || author.openAlexAuthorId}: ${point.category.displayName} — ${point.count.toLocaleString()} works`}
                                    </title>
                                </g>
                            ))}
                        </g>
                    );
                })}

                <text
                    className="research-graph-axis-title"
                    x="18"
                    y={padding.top + chartHeight / 2}
                    textAnchor="middle"
                    transform={
                        `rotate(-90 18 ${padding.top + chartHeight / 2})`
                    }
                >
                    Works
                </text>
            </svg>
        </div>
    );
}


function AuthorCategoryColumnChart({
    data,
    categories
}: {
    data: OpenAlexAuthorGraphDto[];
    categories: GraphCategory[];
}) {
    const maximumCount = getMaximumCount(data);

    return (
        <div className="research-column-chart-wrap">
            <div className="research-column-chart">
                {categories.map(category => (
                    <div
                        className="research-column-group"
                        key={category.key}
                    >
                        <div className="research-column-bars">
                            {data.map((author, authorIndex) => {
                                const count = getItemCount(
                                    author.items,
                                    category.key
                                );

                                const height = count > 0
                                    ? Math.max(
                                        4,
                                        count / maximumCount * 100
                                    )
                                    : 0;

                                return (
                                    <div
                                        className="research-column-slot"
                                        key={
                                            `${author.openAlexAuthorId}-${category.key}`
                                        }
                                    >
                                        <div
                                            className={
                                                `research-column series-${authorIndex % 4}`
                                            }
                                            style={{
                                                height: `${height}%`
                                            }}
                                            title={
                                                `${author.authorDisplayName || "Author"} · ${category.displayName}: ${count.toLocaleString()} works`
                                            }
                                        />

                                        <span className="research-column-count">
                                            {count.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div
                            className="research-column-label"
                            title={category.displayName}
                        >
                            {getShortLabel(category.displayName)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


function AuthorGraphDetails({
    data,
    categories,
    mode
}: {
    data: OpenAlexAuthorGraphDto[];
    categories: GraphCategory[];
    mode: OpenAlexGraphMode;
}) {
    return (
        <section className="research-graph-details">
            <div className="research-graph-details-heading">
                <div>
                    <span>GRAPH DETAILS</span>
                    <h3>
                        {mode === OpenAlexGraphModes.Year
                            ? "Complete yearly breakdown"
                            : "Complete category breakdown"}
                    </h3>
                </div>

                <small>
                    All {categories.length.toLocaleString()}{" "}
                    {mode === OpenAlexGraphModes.Year
                        ? "years"
                        : "categories"} are included below.
                </small>
            </div>

            <div className="research-detail-table">
                <div className="research-detail-table-row research-detail-table-row--head">
                    <strong>
                        {mode === OpenAlexGraphModes.Year
                            ? "Year"
                            : "Category"}
                    </strong>

                    {data.map(author => (
                        <strong
                            key={author.openAlexAuthorId}
                            title={author.authorDisplayName}
                        >
                            {author.authorDisplayName || "Author"}
                        </strong>
                    ))}
                </div>

                {categories.map(category => (
                    <div
                        className="research-detail-table-row"
                        key={category.key}
                    >
                        <span>{category.displayName}</span>

                        {data.map(author => (
                            <span
                                key={
                                    `${author.openAlexAuthorId}-${category.key}-detail`
                                }
                            >
                                {getItemCount(
                                    author.items,
                                    category.key
                                ).toLocaleString()}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}


export default function AuthorGraph({
    data,
    mode,
    onModeChange,
    isLoading = false,
    error = null
}: AuthorGraphProps) {
    const graphData = useMemo(() => data ?? [], [data]);

    const allCategories = useMemo(
        () => collectCategories(graphData, mode),
        [graphData, mode]
    );

    const displayedCategories = useMemo(
        () => getDisplayedCategories(allCategories, mode),
        [allCategories, mode]
    );

    const hasData = graphData.some(author => author.items.length > 0);
    const isYearMode = mode === OpenAlexGraphModes.Year;
    const hiddenCount = Math.max(
        0,
        allCategories.length - displayedCategories.length
    );

    return (
        <section className="research-graph-card">
            <div className="research-graph-header">
                <div>
                    <span className="section-kicker">RESEARCH ANALYTICS</span>
                    <h2>{getModeTitle(mode)}</h2>
                    <p>{getModeDescription(mode)}</p>
                </div>

                <label className="research-graph-mode-select">
                    <span>View by</span>

                    <div>
                        {isYearMode ? <FaChartLine /> : <FaChartColumn />}

                        <select
                            value={mode}
                            onChange={event =>
                                onModeChange(
                                    parseGraphMode(event.target.value)
                                )
                            }
                        >
                            {modeOptions.map(option => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </label>
            </div>

            {isLoading ? (
                <div className="research-graph-state">
                    <div className="research-graph-loader" />
                    <strong>Loading research analytics...</strong>
                    <span>Aggregating matching publication data.</span>
                </div>
            ) : error ? (
                <div className="research-graph-state research-graph-state--error">
                    <strong>Graph could not be loaded.</strong>
                    <span>{error}</span>
                </div>
            ) : !hasData ? (
                <div className="research-graph-state">
                    <strong>No graph data found.</strong>
                    <span>
                        Change the graph filters or selected view and try again.
                    </span>
                </div>
            ) : (
                <>
                    <AuthorGraphLegend data={graphData} />

                    {isYearMode ? (
                        <AuthorYearLineChart
                            data={graphData}
                            categories={displayedCategories}
                        />
                    ) : (
                        <AuthorCategoryColumnChart
                            data={graphData}
                            categories={displayedCategories}
                        />
                    )}

                    {hiddenCount > 0 && (
                        <div className="research-graph-more-note">
                            Showing {displayedCategories.length} of {allCategories.length} items.
                            {" "}
                            {hiddenCount} more {hiddenCount === 1 ? "item is" : "items are"} available in Graph details below.
                        </div>
                    )}

                    <AuthorGraphDetails
                        data={graphData}
                        categories={allCategories}
                        mode={mode}
                    />
                </>
            )}
        </section>
    );
}
