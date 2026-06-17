import {createEffect, createEvent, createStore, sample} from 'effector';
import axios from "axios";
import {isTableErrorResponse} from '../lib/is-table-error-response';
import {mapTableColumn} from '../lib/map-column';
import {mapTableRow} from '../lib/map-row';
import type {
    SelectedFilter,
    TableColumn,
    TableErrorResponse,
    TableOptions,
    TableResponse,
    TableRow,
} from '../types';

export const AMOUNT_PER_PAGE = 20;
export const PAGE = '1';
export const PAGE_SIZES = [20, 50, 100];
export const TABLE_OPTIONS = {withPagination: true};

export const mount = createEvent<{
    tableId: string;
    payload?: Partial<Record<string, unknown>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: TableOptions<any>;
}>();

const changeTableColumns = createEvent<ChangeTableColumns>();
export const changeTableRows = createEvent<ChangeTableRows>();
const changeFetchedOnce = createEvent<ChangeFetchedOnce>();
const changeTableLoading = createEvent<ChangeTableLoading>();
export const changeTableError = createEvent<ChangeTableError>();
const changeTableErrorMessage = createEvent<ChangeTableErrorMessage>();
export const changeTablePage = createEvent<ChangeTablePage>();
export const changeTableAmountPerPage = createEvent<ChangeTableAmountPerPage>();
const changeTableSelectedFilters = createEvent<ChangeTableSelectedFilters>();
export const changeTableOptions = createEvent<ChangeTableOptions>();
const resetTableRows = createEvent<ResetTableRows>();
export const reset = createEvent<ResetTable>();

export const fetchTableFx = createEffect(
    async ({url, body = {}}: { url: string; tableId: string; body?: Record<string, unknown> }) => {
        const [data] = await axios.get(url, body);

        return data;
    },
);


/**
 * Номер текущей страницы
 */
export const $page = createStore<TablePage>({} as TablePage)
    .on(changeTablePage, (currentEntities, {filterKey, value}) => ({
        ...currentEntities,
        [filterKey]: value,
    }))
    .on(mount, (currentEntities, {tableId}) => ({
        ...currentEntities,
        [tableId]: PAGE,
    }));

/**
 * Количество записей на одной странице
 */
export const $amountPerPage = createStore<TableAmountPerPage>({} as TableAmountPerPage).on(
    changeTableAmountPerPage,
    (currentEntities, {filterKey, value}) => ({
        ...currentEntities,
        [filterKey]: value,
    }),
);


/**
 * Состояние загрузки таблицы
 */
export const $isLoading = createStore<TableLoading>({} as TableLoading)
    .on(changeTableLoading, (currentEntities, {filterKey, value}) => ({
        ...currentEntities,
        [filterKey]: value,
    }))
    .on(mount, (currentEntities, {tableId}) => ({
        ...currentEntities,
        [tableId]: true,
    }));

/**
 * Ошибка при загрузке таблицы
 */
export const $isError = createStore<TableError>({} as TableError).on(
    changeTableError,
    (currentEntities, {filterKey, value}) => ({
        ...currentEntities,
        [filterKey]: value,
    }),
);

/**
 * Сообщение об ошибке от бэка (когда приходит [{error: "..."}] с 200 OK)
 */
export const $errorMessage = createStore<TableErrorMessage>({} as TableErrorMessage).on(
    changeTableErrorMessage,
    (currentEntities, {filterKey, value}) => ({
        ...currentEntities,
        [filterKey]: value,
    }),
);


/**
 * Строки таблицы
 */
export const $rows = createStore<TableRows>({} as TableRows)
    .on(changeTableRows, (currentEntities, {filterKey, value}) => ({
        ...currentEntities,
        [filterKey]: value,
    }))
    .on(resetTableRows, (currentEntities, {filterKey}) => ({
        ...currentEntities,
        [filterKey]: [],
    }))
    .on(reset, (currentEntities, {filterKey}) => ({
        ...currentEntities,
        [filterKey]: [],
    }));
/**
 * Столбцы таблицы
 */
export const $columns = createStore<TableColumns>({} as TableColumns)
    .on(changeTableColumns, (currentEntities, {filterKey, value}) => ({
        ...currentEntities,
        [filterKey]: value,
    }));


/**
 * Флаг, что таблица была загружена хотя бы один раз
 */
export const $hasTableBeenFetchedOnce = createStore<FetchedOnce>({} as FetchedOnce)
    .on(changeFetchedOnce, (currentEntities, {filterKey, value}) => ({
        ...currentEntities,
        [filterKey]: value,
    }))
    .on(reset, (currentEntities, {filterKey}) => ({
        ...currentEntities,
        [filterKey]: false,
    }));

/**
 * Опции таблицы
 */
export const $options = createStore<Record<string, TableOptions>>({}).on(
    changeTableOptions,
    (currentEntities, {filterKey, value}) => ({
        ...currentEntities,
        [filterKey]: value,
    }),
);


/**
 * Флаг, что таблица была загружена хотя бы один раз
 */
sample({
    source: $hasTableBeenFetchedOnce,
    clock: [fetchTableFx.done, fetchTableFx.fail],
    filter: (hasTableBeenFetchedOnce, {params}) => !hasTableBeenFetchedOnce[params.tableId],
    fn: (_, {params}) => ({
        filterKey: params.tableId,
        value: true,
    }),
    target: changeFetchedOnce,
});


/**
 * Загрузка
 */
sample({
    source: {
        page: $page,
        amountPerPage: $amountPerPage,
    },
    clock: mount,
    fn: ({page, amountPerPage}, {payload, tableId, options}) => {
        const baseUrl = `/get${tableId}`;
        const baseParams = {url: baseUrl, tableId};

        const pageByFilterKey = parseInt(page[tableId]);
        const amountPerPageByFilterKey = amountPerPage[tableId] || AMOUNT_PER_PAGE;

        const isPaginated = options?.withPagination;

        const body = isPaginated
            ? {
                ...payload,
                page: pageByFilterKey,
                amount: amountPerPageByFilterKey,
            }
            : payload;

        return {
            ...baseParams,
            body,
        };
    },
    target: fetchTableFx,
});


/**
 * При монтировании таблицы сбрасываем строки таблицы
 */
sample({
    clock: [mount],
    fn: ({tableId}) => ({filterKey: tableId}),
    target: resetTableRows,
});

/**
 * При изменении страницы, кол-ва элементов на странице или выбранных фильтров сбрасываем строки таблицы
 */
sample({
    clock: [changeTablePage, changeTableAmountPerPage, changeTableSelectedFilters],
    fn: ({filterKey}) => ({filterKey}),
    target: resetTableRows,
});

/**
 * Обработка конфига таблицы
 */
sample({
    clock: mount,
    fn: ({tableId, options}) => ({
        filterKey: tableId,
        value: options || TABLE_OPTIONS,
    }),
    target: changeTableOptions,
});


/**
 * Маппинг столбцов таблицы
 */
sample({
    source: {
        options: $options,
    },
    clock: fetchTableFx.done,
    filter: (_, {result}) => {
        return !isTableErrorResponse(result);
    },
    fn: ({options}, {params, result}) => {
        const optionsByFilterKey = options[params.tableId];

        const columns = mapTableColumn({
            table: result as unknown as TableResponse,
            options: optionsByFilterKey,
            filterKey: params.tableId,
        });

        return {
            filterKey: params.tableId,
            value: columns,
        };
    },
    target: changeTableColumns,
});

/**
 * Проверка на [{error: "..."}]
 */
sample({
    clock: [fetchTableFx.done],
    filter: ({result}) => isTableErrorResponse(result),
    fn: ({params, result}) => ({
        filterKey: params.tableId,
        value: result as unknown as TableErrorResponse,
    }),
    target: changeTableErrorMessage,
});

/**
 * Очистка errorMessage перед новым запросом
 */
sample({
    clock: [fetchTableFx],
    fn: ({tableId}) => ({
        filterKey: tableId,
        value: null,
    }),
    target: changeTableErrorMessage,
});

/**
 * Маппинг строк таблицы
 */
sample({
    clock: [fetchTableFx.done],
    filter: ({result}) => {
        return !isTableErrorResponse(result);
    },
    fn: ({params, result}) => {
        const table = result as unknown as TableResponse;

        const rows = mapTableRow({table});
        return {
            filterKey: params.tableId,
            value: rows,
        };
    },
    target: changeTableRows,
});


/**
 * Обработка ошибки при запросах
 */
sample({
    clock: [fetchTableFx.fail],
    fn: ({params}) => ({
        filterKey: params.tableId,
        value: true,
    }),
    target: changeTableError,
});

sample({
    clock: [fetchTableFx.done],
    fn: ({params}) => ({
        filterKey: params.tableId,
        value: false,
    }),
    target: changeTableError,
});


/**
 * Обработка состояния загрузки данных в таблице
 */
sample({
    clock: [fetchTableFx.done, fetchTableFx.fail],
    fn: ({params}) => ({
        filterKey: params.tableId,
        value: false,
    }),
    target: changeTableLoading,
});


export type TableColumns = Record<string, TableColumn[]>;
export type TableRows = Record<string, TableRow[]>;


type FetchedOnce = Record<string, boolean>;
type TableLoading = Record<string, boolean>;
type TableError = Record<string, boolean>;
type TableErrorMessage = Record<string, TableErrorResponse | null>;
type TablePage = Record<string, string>;
type TableAmountPerPage = Record<string, number>;
type ChangeTableColumns = { filterKey: string; value: TableColumn[] };
type ChangeTableRows = { filterKey: string; value: TableRow[] };
type ChangeFetchedOnce = { filterKey: string; value: boolean };
type ChangeTableLoading = { filterKey: string; value: boolean };
type ChangeTableError = { filterKey: string; value: boolean };
type ChangeTableErrorMessage = { filterKey: string; value: TableErrorResponse | null };
type ChangeTablePage = { filterKey: string; value: string };
type ChangeTableAmountPerPage = { filterKey: string; value: number };
type ChangeTableSelectedFilters = { filterKey: string; value: SelectedFilter };
type ChangeTableOptions = { filterKey: string; value: TableOptions };
type ResetTable = { filterKey: string };
type ResetTableRows = { filterKey: string };
