'use client';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

interface ReportTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  description?: string;
}

export function ReportTable({ columns, data, title, description }: ReportTableProps) {
  const formatValue = (value: any, format?: (value: any) => string): string => {
    if (format) return format(value);
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  const getAlignmentClass = (align?: 'left' | 'center' | 'right'): string => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--background)', borderWidth: '1px', borderColor: 'var(--color-sand)' }}>
      {(title || description) && (
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-sand)' }}>
          {title && (
            <h3 className="text-lg font-semibold font-serif" style={{ color: 'var(--foreground)' }}>{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>{description}</p>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ backgroundColor: 'var(--background-elevated)' }}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${getAlignmentClass(
                    column.align
                  )}`}
                  style={{ color: 'var(--foreground-muted)', borderBottom: '1px solid var(--color-sand)' }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--background)' }}>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="transition-all duration-200"
                  style={{ borderBottom: '1px solid var(--color-sand)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${getAlignmentClass(
                        column.align
                      )}`}
                      style={{ color: 'var(--foreground)' }}
                    >
                      {formatValue(row[column.key], column.format)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="px-6 py-3" style={{ backgroundColor: 'var(--background-elevated)', borderTop: '1px solid var(--color-sand)' }}>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Showing {data.length} {data.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      )}
    </div>
  );
}
