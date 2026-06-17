import { useEffect } from 'react';
import { useStoreMap, } from '@lib/effector';
import * as model from '../model';
import { useReactTable, getCoreRowModel, flexRender} from '@tanstack/react-table';
import {Loader, Is500, NoData} from 'shared/ui;'

import styles from './styles.module.css';

export const Table = ({
  tableId,
  className,
  ...props
}: TableProps) => {

  const isLoading = useStoreMap({
    store: model.$isLoading,
    keys: [tableId],
    fn: (state, [tableId]) => state[tableId],
    defaultValue: false,
  });

  const isError = useStoreMap({
    store: model.$isError,
    keys: [tableId],
    fn: (state, [tableId]) => state[tableId],
    defaultValue: false,
  });

  const errorMessage = useStoreMap({
    store: model.$errorMessage,
    keys: [tableId],
    fn: (state, [tableId]) => state[tableId],
    defaultValue: null,
  });

  const rows = useStoreMap({
    store: model.$rows,
    keys: [tableId],
    fn: (state, [tableId]) => state[tableId],
    defaultValue: [],
  });

  const columns = useStoreMap({
    store: model.$columns,
    keys: [tableId],
    fn: (state, [tableId]) => state[tableId],
    defaultValue: [],
  });

  const options = useStoreMap({
    store: model.$options,
    keys: [tableId],
    fn: (state, [tableId]) => state[tableId],
  });

  useEffect(() => {
    model.mount(tableId);
  }, [tableId]);

  const cellRenderWrapper = (fn: any) => {
    return fn ? ({row}: {row: any}) => fn(row.original) : false
  }

  const TSTable = useReactTable({
    data: rows,
    columns: columns.map((i) => (i.hidden?null:{
      id: i.accessor,
      accessorKey: i.accessor,
      header: i.title,
      ...(i.renderCell && { cell: cellRenderWrapper(i.renderCell)}),
    })).filter(i=>i!=null) as [],
    getCoreRowModel: getCoreRowModel(),
  });


  if (!isLoading && errorMessage) {
    return (
      <div className={styles.placeholder}>
        <h3>
          {errorMessage.status} – {errorMessage.error}
        </h3>
        <h5>
          {errorMessage.message}
        </h5>
      </div>
    );
  }

  if (!isLoading && isError) {
    return (
      <div className={styles.placeholder}>
        <Is500 />
      </div>
    );
  }

  if (!isLoading && !columns.length) {
    return (
      <div className={styles.placeholder}>
        <NoData />
      </div>
    );
  }

  if (isLoading && !columns.length) {
    return (
      <div className={styles.loader}>
        <Loader />
      </div>
    );
  }

  return (
    <>
      <table className={[styles.table,styles.table_zebra,styles.table_selectable].join(' ')} {...props}>
        <thead>
          {TSTable.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} className="TableCell TableCell_isHeader text-left p-2xs cursor-pointer">
                  <div
                    onClick={header.column.getToggleSortingHandler()}
                    title={
                      header.column.getCanSort()
                        ? { asc: 'Sort ascending', desc: 'Sort descending', _: undefined }[
                            header.column.getIsSorted() || '_'
                          ]
                        : undefined
                    }
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: '↑',
                      desc: '↓',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {TSTable.getRowModel().rows.map((row, i) => (
            <tr
              key={row.id}
              {...(options.onRowClick && {
                onClick: () => {
                  options?.onRowClick({ id: i, rowDatum: rows[i] });
                },
              })}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="TableCell p-2xs"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

    </>
  );
};

export type TableProps = {
  tableId: string;
  className?: string;
};
