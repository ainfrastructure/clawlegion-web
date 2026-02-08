# Common Components Library

A comprehensive UI component library for ClawLegion.

## Quick Start

```tsx
// Import individual components
import { Button, Input, Alert } from '@/components/common'

// Or import from specific files
import { Button } from '@/components/common/Button'
```

---

## Form Components

### Button
```tsx
<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `primary` \| `secondary` \| `ghost` \| `danger` | `primary` | Button style |
| size | `sm` \| `md` \| `lg` | `md` | Button size |
| loading | boolean | false | Shows spinner |
| disabled | boolean | false | Disables button |

### Input
```tsx
<Input 
  label="Email" 
  error="Invalid email" 
  placeholder="Enter email"
  type="email"
/>
```

### Select
```tsx
<Select 
  label="Status" 
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
  value={status}
  onChange={setStatus}
/>
```

### Checkbox
```tsx
<Checkbox 
  label="Remember me" 
  checked={remember}
  onChange={setRemember}
/>
```

### Switch
```tsx
<Switch 
  label="Enable notifications" 
  checked={enabled}
  onChange={setEnabled}
/>
```

### TextArea
```tsx
<TextArea 
  label="Description" 
  maxLength={500} 
  showCount
  rows={4}
/>
```

### RadioGroup
```tsx
<RadioGroup 
  name="plan" 
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' }
  ]} 
  value={selected}
  onChange={setSelected}
/>
```

### Label
```tsx
<Label required>Username</Label>
```

### SearchInput
```tsx
<SearchInput 
  value={query}
  onChange={setQuery}
  placeholder="Search..."
  onClear={() => setQuery('')}
/>
```

### TagInput
```tsx
<TagInput 
  tags={['react', 'typescript']}
  onAdd={(tag) => setTags([...tags, tag])}
  onRemove={(tag) => setTags(tags.filter(t => t !== tag))}
/>
```

---

## Feedback Components

### Alert
```tsx
<Alert variant="success" title="Success!">
  Operation completed.
</Alert>
```
| Variant | Use for |
|---------|---------|
| `info` | Informational messages |
| `success` | Success confirmations |
| `warning` | Caution notices |
| `error` | Error messages |

### Badge
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
```

### Toast
```tsx
import { useToast, ToastProvider } from '@/components/common'

// Wrap app with ToastProvider, then:
const { addToast } = useToast()
addToast({ message: 'Saved!', variant: 'success' })
```

### ProgressBar
```tsx
<ProgressBar value={75} max={100} showLabel />
```

### Spinner
```tsx
<Spinner size="md" label="Loading..." />
```

### LoadingSkeleton
```tsx
<Skeleton className="h-4 w-20" />
<CardSkeleton />
<ListSkeleton rows={5} />
<TableSkeleton rows={5} cols={4} />
<StatsSkeleton />
```

---

## Layout Components

### Card
```tsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Main content here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

### Modal
```tsx
<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm">
  <p>Are you sure you want to delete?</p>
  <div className="flex gap-2">
    <Button onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
  </div>
</Modal>
```

### Tabs
```tsx
<Tabs 
  tabs={[
    { id: 'overview', label: 'Overview', content: <Overview /> },
    { id: 'settings', label: 'Settings', content: <Settings /> }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Dropdown
```tsx
<Dropdown 
  trigger={<Button>Actions</Button>}
  items={[
    { id: 'edit', label: 'Edit', onClick: handleEdit },
    { id: 'delete', label: 'Delete', onClick: handleDelete, danger: true }
  ]}
/>
```

### Accordion
```tsx
<Accordion 
  items={[
    { id: 'faq1', title: 'How to...?', content: <p>Answer here</p> },
    { id: 'faq2', title: 'What is...?', content: <p>Explanation</p> }
  ]}
  allowMultiple={false}
/>
```

### Divider
```tsx
<Divider />                       {/* Horizontal line */}
<Divider label="OR" />            {/* With centered text */}
<Divider orientation="vertical" /> {/* Vertical line */}
```

### Table
```tsx
<Table 
  columns={[
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' }
  ]}
  data={[
    { name: 'Task 1', status: 'Active' }
  ]}
/>
```

### Pagination
```tsx
<Pagination 
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
/>
```

---

## Display Components

### Avatar
```tsx
<Avatar name="John Doe" size="md" />      {/* Shows initials */}
<Avatar src="/avatar.jpg" alt="John" />   {/* Shows image */}
```
| Size | Dimensions |
|------|------------|
| `sm` | 32x32px |
| `md` | 40x40px |
| `lg` | 56x56px |

### Tooltip
```tsx
<Tooltip content="More information here" position="top">
  <span>Hover me</span>
</Tooltip>
```
Positions: `top`, `right`, `bottom`, `left`

### EmptyState
```tsx
<EmptyState 
  icon={<SearchIcon />}
  title="No results found" 
  description="Try adjusting your search terms"
  action={{ label: 'Clear filters', onClick: handleClear }}
/>
```

### StatCard
```tsx
<StatCard 
  icon={<UsersIcon />}
  label="Active Users"
  value={1234}
  trend={{ value: 12, direction: 'up' }}
/>
```

### Breadcrumb
```tsx
<Breadcrumb 
  items={[
    { label: 'Home', href: '/' },
    { label: 'Tasks', href: '/tasks' },
    { label: 'Details' } // No href = current page
  ]}
/>
```

### TimeAgo
```tsx
<TimeAgo date="2026-01-31T09:00:00Z" />
{/* Outputs: "5 minutes ago" */}
```

---

## Utility Components

### ErrorBoundary
```tsx
<ErrorBoundary 
  fallback={<div>Something went wrong</div>}
  onError={(error) => console.error(error)}
>
  <YourComponent />
</ErrorBoundary>
```

### CodeBlock
```tsx
<CodeBlock 
  code="const x = 1;"
  language="typescript"
  showLineNumbers
/>
```

### CopyButton
```tsx
<CopyButton text="copy this text" />
{/* Shows "Copied!" on success */}
```

### Link
```tsx
<Link href="/about">Internal link</Link>
<Link href="https://example.com" external>External link</Link>
{/* External links show icon and open in new tab */}
```

### IconButton
```tsx
<IconButton 
  icon={<TrashIcon />} 
  onClick={handleDelete}
  label="Delete"  // For accessibility
/>
```

---

## Component Index

| Component | Category | Description |
|-----------|----------|-------------|
| Accordion | Layout | Collapsible content sections |
| Alert | Feedback | Contextual messages |
| Avatar | Display | User/entity images |
| Badge | Feedback | Status indicators |
| Breadcrumb | Navigation | Path navigation |
| Button | Form | Clickable actions |
| Card | Layout | Content container |
| Checkbox | Form | Boolean input |
| CodeBlock | Display | Code with syntax highlighting |
| CopyButton | Utility | Copy to clipboard |
| Divider | Layout | Visual separator |
| Dropdown | Layout | Menu overlay |
| EmptyState | Display | No-content placeholder |
| ErrorBoundary | Utility | Error catcher |
| IconButton | Form | Icon-only button |
| Input | Form | Text input |
| Label | Form | Input labels |
| Link | Navigation | Styled anchor |
| LoadingSkeleton | Feedback | Loading placeholders |
| Modal | Layout | Dialog overlay |
| Pagination | Navigation | Page controls |
| ProgressBar | Feedback | Progress indicator |
| RadioGroup | Form | Single selection |
| SearchInput | Form | Search with clear |
| Select | Form | Dropdown selection |
| Spinner | Feedback | Loading indicator |
| StatCard | Display | Metric display |
| Switch | Form | Toggle input |
| Table | Layout | Data table |
| Tabs | Layout | Tabbed content |
| TagInput | Form | Multi-tag input |
| TextArea | Form | Multi-line input |
| TimeAgo | Display | Relative timestamps |
| Toast | Feedback | Transient notifications |
| Tooltip | Display | Hover information |

---

## Design Tokens

All components use Tailwind's slate color palette for dark mode:
- Background: `slate-800`, `slate-900`
- Text: `white`, `slate-300`, `slate-400`
- Borders: `slate-700`
- Accent: `amber-400`, `amber-500`

---

Built with 💜 by SousChef
