# ExportButton Component

A reusable dropdown button for exporting data in CSV or JSON formats.

## Usage

```tsx
import { ExportButton } from '@/components/ExportButton'

function MyPage() {
  const data = [
    { id: 1, name: 'Task 1', status: 'completed' },
    { id: 2, name: 'Task 2', status: 'pending' }
  ]

  return (
    <ExportButton
      data={data as Record<string, unknown>[]}
      filename="tasks"
      columns={['id', 'name', 'status']}
    />
  )
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `Record<string, unknown>[]` | Yes | - | Array of objects to export |
| `filename` | `string` | Yes | - | Base filename (date is appended automatically) |
| `columns` | `string[]` | No | All keys | Columns to include in CSV export |
| `flattenKeys` | `string[]` | No | `[]` | Keys with nested objects/arrays to flatten |
| `className` | `string` | No | `''` | Additional CSS classes |
| `disabled` | `boolean` | No | `false` | Disable the button |

## Features

- **Dropdown Menu**: Click to show CSV and JSON export options
- **Record Count**: Shows number of records to be exported
- **Auto-disable**: Disabled when data array is empty
- **Date Stamping**: Files are named `{filename}_{YYYY-MM-DD}.{ext}`
- **Nested Data Handling**: Use `flattenKeys` to flatten nested objects for CSV

## Examples

### Basic Export

```tsx
<ExportButton
  data={tasks}
  filename="tasks"
/>
```

### With Specific Columns

```tsx
<ExportButton
  data={tasks}
  filename="tasks"
  columns={['id', 'title', 'priority', 'status']}
/>
```

### Flattening Nested Data

If your data has nested objects:

```ts
const data = [{
  id: 1,
  name: 'Agent',
  stats: { completed: 10, failed: 2 },
  tags: ['ai', 'worker']
}]
```

Use `flattenKeys` to convert for CSV:

```tsx
<ExportButton
  data={data}
  filename="agents"
  flattenKeys={['stats', 'tags']}
/>
```

This produces CSV with columns: `id, name, stats_completed, stats_failed, tags`

### Custom Styling

```tsx
<ExportButton
  data={data}
  filename="report"
  className="bg-blue-600 hover:bg-blue-700"
/>
```

## Export Formats

### CSV
- Comma-separated values
- Proper escaping for commas, quotes, and newlines
- Header row with column names
- Compatible with Excel, Google Sheets, etc.

### JSON
- Pretty-printed with 2-space indentation
- Full data structure preserved
- Ideal for programmatic use or re-import

## Integration with Other Pages

The ExportButton is used on:
- `/tasks` - Export filtered task list
- `/analytics` - Export agent metrics
- `/agents` - Export agent data
- `/audit` - Export audit log entries

## Related

- `lib/export.ts` - Core export utilities
- `lib/export.test.ts` - Unit tests
- `e2e/export.spec.ts` - E2E tests
