export type TableColumn<T extends Record<string, unknown> = Record<string, unknown>> =
   {
    titleString: string;
    accessor: string;
    sortable?: boolean;
    renderCell?: (row: Record<string, unknown> & T) => JSX.Element | null;
    columns?: Record<string, unknown>[];
  };

export type TableRow = Record<string, unknown>;

export type TableOptions<T extends Record<string, unknown> = Record<string, unknown>> = Partial<{
  withPagination: boolean;
  colRenderers: ((col: Partial<TableColumn>) => void)[];
  hiddenColumns: string[];
  onRowClick: onRowClick<T>;
  onRowHover: OnRowHover<T>;
  onCellClick: ()=> void;
}>;

export type TableConfig<T extends Record<string, unknown> = Record<string, unknown>> = TableProps &
  Partial<{
    options: TableOptions<T>;
  }>;

type TableProps = {tableId: string};

type TableResponseSubHeader = {
  columns: {
    value: string;
  }[];
  description: string;
  sort: number;
}[];

export type TableResponse<FIELDS extends Record<string, unknown> = Record<string, unknown>> = {
  data: FIELDS[];
  amountperpage: number;
  header: Record<
    keyof FIELDS,
    [
      {
        hidden?: boolean;
        width: number | null;
        description: string;
        filters: [
          {
            data: { value: string | number }[];
            sort: number;
            type: 'none' | 'search' | 'select' | 'range';
          },
        ];
        sort: number;
        type: 'number' | 'string' | 'datetime' | 'checkbox' | DefaultRenderTypes;
        columns?: {
          accessor: string;
          title: string;
          align?: 'left' | 'center' | 'right';
        }[];
      },
    ]
  >[];
  page: number;
  subtitle?: string;
  title?: string;
  amountfull: number;
  hash?: string;
  info?: [Types.Info.Popover];
  subheader?: TableResponseSubHeader;
};

export type DefaultRenderTypes = 'statvalcolor' | 'hlightval';

export type TableErrorResponse = {
  error: string;
  message: string;
  status: number;
};

export type SelectedFilter = Record<string, { filtertype: TableFilterType; data: string }[]>;

export type TableFilterType = 'search' | 'select' | 'range' | 'sort' | 'none';

type onRowClick<T extends Record<string, unknown> = Record<string, unknown>> = ({
  id,
  e,
}: {
  id: string;
  e: React.MouseEvent;
  rowDatum: T;
}) => void;

type OnRowHover<T extends Record<string, unknown> = Record<string, unknown>> = ({
  id,
  e,
}: {
  id: string | undefined;
  e: React.MouseEvent;
  rowDatum: T;
}) => void;

export type TableErrorResponse = {
  error: string;
  message: string;
  status: number;
};
