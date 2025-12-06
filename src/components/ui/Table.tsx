import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-xl border border-[#E8E0D5]">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('bg-[#FAF7F2] [&_tr]:border-b [&_tr]:border-[#E8E0D5]', className)}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-[#E8E0D5] bg-[#FAF7F2] font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-[#E8E0D5] transition-colors',
        'hover:bg-[#FAF7F2]/50',
        'data-[state=selected]:bg-[#C4A484]/5',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle',
        'text-xs font-semibold tracking-[0.08em] uppercase text-[#8B8B8B]',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'p-4 align-middle text-[#2C2C2C]',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

// Empty state for tables
interface TableEmptyProps {
  colSpan: number;
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

const TableEmpty = ({ colSpan, icon, title, description }: TableEmptyProps) => (
  <TableRow className="hover:bg-transparent">
    <TableCell colSpan={colSpan} className="h-48">
      <div className="flex flex-col items-center justify-center text-center">
        {icon && (
          <div className="mb-4 p-3 rounded-full bg-[#F0EBE3] text-[#C4A484]">
            {icon}
          </div>
        )}
        <p className="font-['Cormorant_Garamond',Georgia,serif] text-lg font-medium text-[#2C2C2C]">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm text-[#8B8B8B]">{description}</p>
        )}
      </div>
    </TableCell>
  </TableRow>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
};
