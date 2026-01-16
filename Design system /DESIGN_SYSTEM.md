# Design System Documentation

**Last Updated:** January 8, 2026

This is the complete design system reference for the project. It covers design philosophy, tokens, rules, and component specifications.

---

## Table of Contents

1. [Responsive Breakpoints](#responsive-breakpoints)
2. [Z-Index Scale](#z-index-scale)
3. [Layout Composition Patterns](#layout-composition-patterns)
4. [Design Philosophy](#design-philosophy)
5. [Design Tokens](#design-tokens)
6. [Icon System](#icon-system)
7. [Component Library](#component-library)
8. [Design Rules](#design-rules)
9. [Exact Spacing Rules](#exact-spacing-rules)
10. [Empty States](#empty-states)
11. [Loading Skeleton Patterns](#loading-skeleton-patterns)
12. [Button System](#button-system)

---

## Responsive Breakpoints

All layouts must adapt to these standard breakpoints:

| Breakpoint | Width | Tailwind Prefix | Usage |
|------------|-------|-----------------|-------|
| **Mobile** | 0–639px | (default) | Single column, stacked layouts |
| **Tablet** | 640–1023px | `sm:` | Two columns, sidebar collapses |
| **Desktop** | 1024px+ | `lg:` | Full layouts, sidebar visible |
| **Wide** | 1280px+ | `xl:` | Optional wider content areas |

### Breakpoint Rules

**Mobile (default):**
- Single column layout
- Full-width cards
- Hamburger menu (sidebar hidden)
- Touch targets minimum 44px
- Content padding: 16px

**Tablet (sm: 640px+):**
- Two column grids for cards
- Collapsible sidebar (overlay)
- Content padding: 24px

**Desktop (lg: 1024px+):**
- Three column grids for cards
- Persistent sidebar (256px width)
- Maximum content width: 1200px centered
- Content padding: 32px

### Tailwind Usage

```tsx
// Grid that adapts across breakpoints
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-large">

// Sidebar that shows/hides
<aside className="hidden lg:block w-64">

// Padding that scales
<main className="p-medium sm:p-large lg:p-xl">
```

---

## Z-Index Scale

Use these z-index values consistently for layered elements:

| Level | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| **Base** | 0 | `z-0` | Default page content |
| **Raised** | 10 | `z-10` | Sticky headers, floating elements |
| **Dropdown** | 20 | `z-20` | Dropdowns, popovers, menus |
| **Sticky** | 30 | `z-30` | Sticky sidebar, fixed headers |
| **Modal Backdrop** | 40 | `z-40` | Modal/drawer overlay |
| **Modal Content** | 50 | `z-50` | Modal/drawer content |
| **Toast** | 60 | `z-[60]` | Toast notifications |
| **Tooltip** | 70 | `z-[70]` | Tooltips (always on top) |

### Rules

- Never use arbitrary z-index values outside this scale
- Modals should trap focus and prevent interaction with z-30 and below
- Toasts should appear above modals
- Tooltips should appear above everything

---

## Layout Composition Patterns

These are the standard page layouts. AI should use these patterns when generating new pages.

### Dashboard Layout

```tsx
<div className="min-h-screen bg-slate-50">
  {/* Fixed sidebar on desktop */}
  <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-slate-200">
    <Sidebar />
  </aside>

  {/* Main content area */}
  <main className="lg:pl-64">
    {/* Top header */}
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-large py-medium">
      <h1 className="text-heading-1">Page Title</h1>
    </header>

    {/* Page content */}
    <div className="p-large">
      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-large mb-2xl">
        <StatCard />
      </div>

      {/* Main content section */}
      <Card>
        <CardHeader title="Section Title" />
        {/* Content */}
      </Card>
    </div>
  </main>
</div>
```

### Settings Page Layout

```tsx
<div className="max-w-3xl mx-auto p-large">
  {/* Page header */}
  <div className="mb-2xl">
    <h1 className="text-heading-1">Settings</h1>
    <p className="text-body-1 text-slate-600 mt-small">Manage your account preferences</p>
  </div>

  {/* Settings sections */}
  <div className="space-y-2xl">
    {/* Each section */}
    <section>
      <h2 className="text-heading-2 mb-large">Profile</h2>
      <Card>
        <div className="space-y-medium">
          <Input label="Name" />
          <Input label="Email" type="email" />
        </div>
        <CardFooter>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </CardFooter>
      </Card>
    </section>
  </div>
</div>
```

### List/Table Page Layout

```tsx
<div className="p-large">
  {/* Page header with actions */}
  <div className="flex items-center justify-between mb-large">
    <div>
      <h1 className="text-heading-1">Users</h1>
      <p className="text-body-1 text-slate-600 mt-tiny">Manage team members</p>
    </div>
    <Button variant="primary">Add User</Button>
  </div>

  {/* Filters row */}
  <div className="flex items-center gap-medium mb-large">
    <SearchInput placeholder="Search users..." />
    <Select options={statusOptions} />
  </div>

  {/* Table */}
  <Card>
    <Table columns={columns} data={data} />
  </Card>
</div>
```

### Detail Page Layout

```tsx
<div className="max-w-4xl mx-auto p-large">
  {/* Breadcrumb */}
  <nav className="text-caption text-slate-500 mb-large">
    <a href="/users" className="hover:text-primary-500">Users</a>
    <span className="mx-small">/</span>
    <span>John Doe</span>
  </nav>

  {/* Header with actions */}
  <div className="flex items-start justify-between mb-2xl">
    <div className="flex items-center gap-large">
      <Avatar size="lg" />
      <div>
        <h1 className="text-heading-1">John Doe</h1>
        <p className="text-body-1 text-slate-600">john@example.com</p>
      </div>
    </div>
    <div className="flex gap-small">
      <Button variant="secondary">Edit</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  </div>

  {/* Tabs for sections */}
  <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

  {/* Tab content */}
  <div className="mt-large">
    <Card>
      {/* Content based on active tab */}
    </Card>
  </div>
</div>
```

### Form Page Layout

```tsx
<div className="max-w-2xl mx-auto p-large">
  <div className="mb-2xl">
    <h1 className="text-heading-1">Create New Project</h1>
    <p className="text-body-1 text-slate-600 mt-small">Fill in the details below</p>
  </div>

  <Card>
    <form className="space-y-large">
      {/* Form section */}
      <div className="space-y-medium">
        <Input label="Project Name" required />
        <Textarea label="Description" rows={4} />
      </div>

      {/* Another section with divider */}
      <Divider />

      <div className="space-y-medium">
        <h3 className="text-heading-3">Settings</h3>
        <Checkbox label="Make project public" />
        <Checkbox label="Enable notifications" />
      </div>

      {/* Form actions - always at bottom */}
      <div className="flex justify-end gap-small pt-large border-t border-slate-200">
        <Button variant="secondary" type="button">Cancel</Button>
        <Button variant="primary" type="submit">Create Project</Button>
      </div>
    </form>
  </Card>
</div>
```

### Modal Confirmation Flow

Standard pattern for delete/destructive actions:

```tsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  size="sm"
>
  {/* Destructive modal header */}
  <div className="flex items-center gap-medium mb-large">
    <div className="w-10 h-10 rounded-full bg-error-50 flex items-center justify-center">
      <AlertTriangleIcon className="w-icon-md h-icon-md text-error-500" />
    </div>
    <div>
      <h2 className="text-heading-3 text-slate-900">Delete Project</h2>
      <p className="text-caption text-slate-500">This action cannot be undone</p>
    </div>
  </div>

  {/* Modal content */}
  <p className="text-body-1 text-slate-600 mb-large">
    Are you sure you want to delete <strong>"{projectName}"</strong>?
    All associated data will be permanently removed.
  </p>

  {/* Confirmation input (for extra safety) */}
  <div className="mb-large">
    <Input
      label={`Type "${projectName}" to confirm`}
      value={confirmText}
      onChange={(e) => setConfirmText(e.target.value)}
    />
  </div>

  {/* Modal actions */}
  <div className="flex justify-end gap-small">
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={confirmText !== projectName}
      loading={isDeleting}
    >
      Delete Project
    </Button>
  </div>
</Modal>
```

### Multi-Step Form (Wizard)

Pattern for complex forms broken into steps:

```tsx
const [currentStep, setCurrentStep] = useState(0);
const steps = ['Account', 'Profile', 'Preferences', 'Review'];

<div className="max-w-2xl mx-auto p-large">
  {/* Progress indicator */}
  <div className="mb-2xl">
    <div className="flex items-center justify-between mb-medium">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          {/* Step circle */}
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-caption font-medium
            ${index < currentStep
              ? 'bg-primary-500 text-white'
              : index === currentStep
                ? 'bg-primary-500 text-white'
                : 'bg-slate-200 text-slate-500'
            }
          `}>
            {index < currentStep ? <CheckIcon className="w-4 h-4" /> : index + 1}
          </div>

          {/* Step label */}
          <span className={`ml-small text-caption ${
            index <= currentStep ? 'text-slate-900' : 'text-slate-400'
          }`}>
            {step}
          </span>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-medium ${
              index < currentStep ? 'bg-primary-500' : 'bg-slate-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  </div>

  {/* Step content */}
  <Card>
    <div className="min-h-[300px]">
      {currentStep === 0 && <AccountStep data={formData} onChange={setFormData} />}
      {currentStep === 1 && <ProfileStep data={formData} onChange={setFormData} />}
      {currentStep === 2 && <PreferencesStep data={formData} onChange={setFormData} />}
      {currentStep === 3 && <ReviewStep data={formData} />}
    </div>

    {/* Navigation */}
    <div className="flex justify-between pt-large border-t border-slate-200 mt-large">
      <Button
        variant="secondary"
        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
        disabled={currentStep === 0}
      >
        Back
      </Button>

      {currentStep < steps.length - 1 ? (
        <Button
          variant="primary"
          onClick={() => setCurrentStep(currentStep + 1)}
        >
          Continue
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          Submit
        </Button>
      )}
    </div>
  </Card>
</div>
```

### Drawer Form Pattern

For quick edit operations without leaving context:

```tsx
<Drawer
  open={isOpen}
  onClose={() => setIsOpen(false)}
  position="right"
  size="md"
  title="Edit User"
>
  <form className="flex flex-col h-full">
    {/* Scrollable form content */}
    <div className="flex-1 overflow-y-auto p-large space-y-medium">
      <Input label="Name" value={name} onChange={setName} />
      <Input label="Email" type="email" value={email} onChange={setEmail} />
      <Select label="Role" value={role} onChange={setRole} options={roleOptions} />
      <ToggleSwitch label="Active" checked={isActive} onChange={setIsActive} />
    </div>

    {/* Fixed footer */}
    <DrawerFooter>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" loading={isSaving}>
        Save Changes
      </Button>
    </DrawerFooter>
  </form>
</Drawer>
```

---

## Design Philosophy

### Core Principles

**Clarity Over Cleverness**
Every interface element should have a clear purpose. We prioritize immediate understanding over visual flourish. Users should never wonder what something does or where to find it.

**Consistency Builds Trust**
Repeated patterns create familiarity. When buttons look and behave the same across the platform, users build confidence. Consistency applies to colors, spacing, typography, and interaction patterns.

**Progressive Disclosure**
Show only what's needed when it's needed. Complex features are revealed progressively as users need them. This keeps interfaces clean while maintaining power for advanced users.

**Accessible by Default**
Every design decision considers users with different abilities. Color contrast, keyboard navigation, screen reader support, and touch target sizes are non-negotiable requirements, not afterthoughts.

### Visual Aesthetic: Clean, Modern, Airy, SaaS

**Inspiration:** Cal.com, Hashnode, Typeform, Notion, Linear

**Primary Color:** #25AACE (modern cyan/teal)
**Interaction Style:** Shadow-based elevation (not color darkening)

**Spacing Philosophy:**
- Generous whitespace - don't cram elements together
- 12px minimum between interactive elements
- 48px between major sections (use `space-2xl` or `mb-2xl`)
- Light backgrounds (slate-50 or white)

**Clean & Minimal:**
- Remove visual noise
- Use shadows instead of borders for depth
- Subtle slate color system (slate-50 → slate-900)
- Clear typography hierarchy

---

## Design Tokens

All design tokens are defined here. Reference these by name in your code, never use hard-coded values.

### Color Tokens

#### Primary Colors (Cyan/Blue)

| Name | Hex Value | Usage |
|------|-----------|--------|
| **color-primary-1** | #E5F7FC | Very light backgrounds, hover states, selections |
| **color-primary-3** | #25AACE | Main brand color, CTAs, active states, highlights |
| **color-primary-4** | #2BB6DB | Disabled button state |
| **color-primary-5** | #1E8BA8 | Hover states on primary buttons |
| **color-primary-6** | #166B82 | Pressed states, dark accents |

#### Neutral Colors (Slate System)

| Name | Hex Value | Usage |
|------|-----------|--------|
| **color-neutral-1** | #F8F9FA | Table headers, secondary backgrounds |
| **color-neutral-2** | #F1F3F5 | Tertiary backgrounds, disabled states |
| **color-neutral-3** | #E9ECEF | Default borders, dividers |
| **color-neutral-4** | #DEE2E6 | Hover borders, input borders |
| **color-neutral-5** | #ADB5BD | Icons, placeholder text |
| **color-neutral-6** | #868E96 | Helper text, secondary text |
| **color-neutral-7** | #495057 | Body text, descriptions |
| **color-neutral-8** | #343A40 | Labels, form text |
| **color-neutral-9** | #212529 | Badge text |
| **color-neutral-10** | #0D1117 | Headings, primary text |
| **color-white** | #FFFFFF | Primary backgrounds, button text |

#### Status Colors

| Name | Hex Value | Usage |
|------|-----------|--------|
| **color-success-1** | #E8F5E9 | Success badge backgrounds |
| **color-success-3** | #4CAF50 | Success icons, indicators |
| **color-success-4** | #388E3C | Success buttons |
| **color-success-text** | #1B5E20 | Badge text on light backgrounds |
| **color-warning-1** | #FFF8E1 | Warning badge backgrounds |
| **color-warning-3** | #FFC107 | Warning icons, indicators |
| **color-warning-text** | #F57C00 | Badge text on light backgrounds |
| **color-error-1** | #FFEBEE | Error background tints |
| **color-error-3** | #F44336 | Error text, icons |
| **color-error-4** | #D32F2F | Destructive buttons |
| **color-error-text** | #B71C1C | Text on light backgrounds |

### Typography Tokens

#### Font Families

| Name | Font Stack |
|------|------------|
| **font-primary** | 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif |
| **font-mono** | ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace |

#### Text Styles

| Name | Size | Weight | Usage |
|------|------|--------|--------|
| **text-heading-1** | 24px | Semibold (600) | Main page headings |
| **text-heading-2** | 20px | Semibold (600) | Section headings |
| **text-heading-3** | 18px | Medium (500) | Card titles, subsections |
| **text-body-1** | 14px | Regular (400) | Primary body text |
| **text-body-2** | 14px | Medium (500) | Emphasized body text |
| **text-caption** | 12px | Regular (400) | Helper text, captions |
| **text-button** | 14px | Medium (500) | Button labels |

### Spacing Tokens

| Name | Size | Usage |
|------|------|--------|
| **space-tiny** | 4px | Minimal spacing, badge padding |
| **space-small** | 8px | Icon spacing, tight gaps |
| **space-medium** | 16px | Form fields, card internal spacing |
| **space-large** | 24px | Card padding, section spacing |
| **space-xl** | 32px | Form sections, large spacing |
| **space-2xl** | 48px | Major section separation |

### Border & Shadow Tokens

#### Border Radius

| Name | Size | Usage |
|------|------|--------|
| **radius-small** | 4px | Badges, small elements |
| **radius-medium** | 8px | Buttons, inputs, most UI elements |
| **radius-large** | 12px | Cards, modals, containers |
| **radius-full** | 9999px | Badges, avatars, pills |

#### Shadows

| Name | Value | Usage |
|------|-------|--------|
| **shadow-subtle** | 0 1px 3px rgba(0,0,0,0.08) | Card hover states, default elevation |
| **shadow-medium** | 0 4px 12px rgba(0,0,0,0.12) | Dropdowns, popovers |
| **shadow-large** | 0 8px 24px rgba(0,0,0,0.15) | Modals, toasts |
| **shadow-button-hover** | 0 4px 12px rgba(6,182,212,0.3) | Primary button hover (brand glow) |

### Icon Size Tokens

| Name | Tailwind Class | Size | Usage |
|------|----------------|------|--------|
| **icon-xs** | `w-icon-xs h-icon-xs` | 12px | Badges, inline indicators |
| **icon-sm** | `w-icon-sm h-icon-sm` | 16px | Small buttons, inline with text |
| **icon-md** | `w-icon-md h-icon-md` | 20px | Standard buttons, navigation |
| **icon-lg** | `w-icon-lg h-icon-lg` | 24px | Headers, prominent actions |
| **icon-xl** | `w-icon-xl h-icon-xl` | 32px | Hero sections, large cards |

### Transition Tokens

| Name | Duration | Usage |
|------|----------|--------|
| **transition-fast** | 150ms | Quick feedback |
| **transition-base** | 200ms | Default transitions |
| **transition-slow** | 300ms | Complex animations |

---

## Icon System

### Icon Library

This design system uses **Lucide React** as the official icon library.

- **Package:** `lucide-react` (v0.263.1+)
- **License:** ISC (permissive, similar to MIT)
- **Documentation:** https://lucide.dev/
- **Total Icons:** 1000+ icons available

### Installation

```bash
npm install lucide-react
```

### Basic Usage

```tsx
import { Settings, Trash2, Send } from 'lucide-react';

// Standard icon with semantic sizing
<Settings className="w-icon-md h-icon-md text-slate-600" />

// Icon button
<button className="p-small rounded-medium hover:bg-slate-100">
  <Trash2 className="w-icon-sm h-icon-sm text-red-600" />
</button>
```

### Icon Sizes

Use semantic size tokens for consistency:

| Token | Size | Usage |
|-------|------|-------|
| `w-icon-xs h-icon-xs` | 12px | Badges, inline indicators |
| `w-icon-sm h-icon-sm` | 16px | Small buttons, inline with text |
| `w-icon-md h-icon-md` | 20px | Standard buttons, navigation |
| `w-icon-lg h-icon-lg` | 24px | Headers, prominent actions |
| `w-icon-xl h-icon-xl` | 32px | Hero sections, large cards |

### Accessibility

Always provide accessible labels for icon-only buttons:

```tsx
// ✅ Good - Accessible
<button aria-label="Delete item">
  <Trash2 className="w-icon-sm h-icon-sm" />
</button>

<IconButton variant="ghost" title="Settings">
  <Settings className="w-icon-md h-icon-md" />
</IconButton>

// ❌ Bad - No accessible label
<button>
  <Trash2 className="w-icon-sm h-icon-sm" />
</button>
```

### Color Guidelines

Icons inherit text color by default. Use semantic color tokens:

```tsx
// Default state
<Icon className="w-icon-md h-icon-md text-slate-600" />

// Interactive state
<Icon className="w-icon-md h-icon-md text-primary-500" />

// Destructive action
<Icon className="w-icon-md h-icon-md text-red-600" />

// Success state
<Icon className="w-icon-md h-icon-md text-green-600" />
```

### Standard Icon Mapping

For consistency across the design system, use these standard icons for common actions:

#### Actions

| Action | Icon | Usage |
|--------|------|-------|
| Edit | `Edit2`, `Edit3` | Modify content, update settings |
| Delete | `Trash2` | Remove items, delete content |
| Remove | `X` | Close, dismiss, remove from list |
| Save | `Check`, `Save` | Confirm, save changes |
| Cancel | `X` | Close dialogs, cancel actions |
| Copy | `Copy` | Duplicate content, copy to clipboard |
| Download | `Download` | Export, download files |
| Upload | `Upload` | Import, upload files |
| Settings | `Settings` | Configuration, preferences |
| Search | `Search` | Search functionality |
| Filter | `Filter` | Filter results, advanced search |
| Sort | `ArrowUpDown` | Sort data |
| Refresh | `RefreshCw` | Reload, refresh data |

#### Navigation

| Action | Icon | Usage |
|--------|------|-------|
| Back | `ChevronLeft`, `ArrowLeft` | Go back, previous page |
| Forward | `ChevronRight`, `ArrowRight` | Go forward, next page |
| Expand | `ChevronDown` | Open dropdown, show more |
| Collapse | `ChevronUp` | Close dropdown, show less |
| Close | `X` | Close modal, dismiss notification |
| Menu | `Menu` | Open navigation menu |
| External Link | `ExternalLink` | Opens in new tab/window |

#### Status & Feedback

| Status | Icon | Usage |
|--------|------|-------|
| Success | `CheckCircle`, `Check` | Successful operations |
| Error | `XCircle`, `AlertCircle` | Error states, failed operations |
| Warning | `AlertTriangle`, `AlertCircle` | Warning messages, caution |
| Info | `Info`, `HelpCircle` | Information, help text |
| Loading | `Loader2` | In progress, loading states |

#### Communication

| Action | Icon | Usage |
|--------|------|-------|
| Send | `Send` | Send message, submit form |
| Attach | `Paperclip` | Attach file, add attachment |
| Enhance/AI | `Sparkles`, `Wand2` | AI features, magic actions |
| Reply | `Reply` | Reply to message |
| Forward | `Forward` | Forward message |

#### User & Account

| Element | Icon | Usage |
|---------|------|-------|
| User | `User` | User profile, account |
| Users | `Users` | Multiple users, team |
| Login | `LogIn` | Sign in |
| Logout | `LogOut` | Sign out |
| Lock | `Lock` | Security, private |
| Unlock | `Unlock` | Public, unlocked |

#### Content & Media

| Element | Icon | Usage |
|---------|------|-------|
| Image | `Image` | Photos, images |
| File | `File`, `FileText` | Documents, files |
| Folder | `Folder` | Directories, collections |
| Link | `Link` | URLs, hyperlinks |
| Calendar | `Calendar` | Dates, scheduling |
| Clock | `Clock` | Time, timestamps |

### Best Practices

**Do's:**

✅ Use semantic size tokens
```tsx
<Icon className="w-icon-md h-icon-md" /> // Good
```

✅ Use standard icons for common actions
```tsx
<Trash2 /> // Good - Standard delete icon
```

✅ Provide accessible labels for icon-only buttons
```tsx
<button aria-label="Delete">
  <Trash2 className="w-icon-sm h-icon-sm" />
</button>
```

✅ Keep icon size consistent with surrounding text
```tsx
<p className="text-body-1 flex items-center gap-small">
  <Check className="w-icon-sm h-icon-sm" /> Completed
</p>
```

✅ Use semantic colors from the design system
```tsx
<Icon className="text-primary-500" /> // Good
```

**Don'ts:**

❌ Don't use hardcoded pixel values
```tsx
<Icon className="w-5 h-5" /> // Avoid - Use w-icon-md instead
```

❌ Don't use random icons for standard actions
```tsx
<MinusCircle /> // Bad - Use Trash2 for delete
```

❌ Don't forget accessibility labels
```tsx
<button>
  <Settings />
</button> // Bad - No aria-label
```

❌ Don't mix icon sizes inconsistently
```tsx
<Settings className="w-4 h-4" />
<Trash2 className="w-6 h-6" /> // Bad - Inconsistent sizes
```

❌ Don't use arbitrary colors
```tsx
<Icon className="text-[#3B82F6]" /> // Bad - Use text-blue-600 instead
```

### License

Lucide React uses the ISC License (permissive, similar to MIT). No attribution required for UI usage. License text included in [LICENSE-LUCIDE.txt](./LICENSE-LUCIDE.txt).

**What the ISC license allows:**
- Use in commercial and non-commercial projects
- Modify icons as needed
- Redistribute as part of your application
- No need to display credits on-screen

**Attribution only required if:**
- Redistributing the source SVG files
- Redistributing the icon library code itself

Since we use Lucide as React components (not redistributing SVG source), no on-screen attribution is required.

---

## Component Library

### Philosophy

This design system uses **primitive components** as building blocks. Each component uses design tokens exclusively from the section above.

**Benefits:**
- **Token Cascade:** Changing a token updates ALL components using it
- **Reusability:** Same components used across entire product
- **Maintainability:** Each primitive has clear validation rules
- **Consistency:** Single source of truth

### Core Components

#### Button

**Description:** Primary interactive element for user actions with text labels.

**Variants:**
- `primary` - Main brand cyan (#25AACE), for primary actions
- `secondary` - White with border, for secondary actions
- `destructive` - Red background, for delete/destructive actions
- `ghost` - Minimal styling, for tertiary actions

**Sizes:**

| Size | Height | Padding | Font | Icon | Use Case |
|------|--------|---------|------|------|----------|
| **sm** | ~36px | 8px × 12px | 14px | 16px | Compact UI, toolbars |
| **md** | ~40px | 10px × 16px | 14px | 20px | Standard buttons, forms |
| **lg** | ~48px | 12px × 20px | 16px | 24px | Hero CTAs, prominent actions |

**States:**
- Default: Variant-specific colors with subtle shadow
- Hover: Shadow elevation (shadow-button-hover for primary)
- Disabled: color-primary-4 background, opacity 50%
- Focus: color-primary-3 focus ring

**Design Tokens Used:**
```json
{
  "colors": {
    "primary-bg": "color-primary-3",
    "primary-bg-hover": "color-primary-5",
    "primary-bg-disabled": "color-primary-4",
    "primary-text": "color-white",
    "destructive-bg": "color-error-4"
  },
  "spacing": { "padding": "space-medium" },
  "borders": { "radius": "radius-medium" },
  "shadows": { "hover": "shadow-button-hover" }
}
```

**Text Length Guidelines:**
- **sm:** 1-2 words (max ~15 chars) - "Save", "Cancel", "Edit"
- **md:** 2-4 words (max ~25 chars) - "Save Changes", "Create Account"
- **lg:** 2-5 words (max ~30 chars) - "Get Started Free", "Schedule a Demo"

#### IconButton

**Description:** Button containing only an icon, used for compact actions.

**Variants:**
- `ghost` (default) - Transparent background, icon color changes on hover
- `primary` - Primary brand color background
- `destructive` - Error color background for delete actions

**States:**
- Default: color-neutral-5 icon
- Hover: color-primary-3 icon
- Disabled: color-neutral-3 icon, opacity 50%

**Accessibility:** Always requires `ariaLabel` prop for screen readers.

#### Input Field

**Description:** Text input for forms.

**States:**
- Default: color-neutral-4 border, white background
- Focus: color-primary-3 border with focus ring
- Error: color-error-3 border, color-error-1 background
- Disabled: color-neutral-2 background

**Design Tokens:**
- Padding: space-medium (8px vertical, 12px horizontal)
- Radius: radius-medium (8px)
- Height: 40px minimum

#### Card

**Description:** Container for grouped content.

**Structure:**
- Background: color-white
- Border: 1px solid color-neutral-3
- Radius: radius-large (12px)
- Padding: space-large (24px)
- Shadow: shadow-subtle on hover

#### Modal

**Description:** Dialog overlay for confirmations and focused interactions.

**Variants:**
- `default` - Standard modal
- `destructive` - For destructive actions (uses error color scheme)

**Structure:**
- Backdrop: color-black with 50% opacity
- Container: color-white background, radius-large, shadow-large
- Padding: space-large (24px)

#### Badge

**Description:** Small status indicator or label.

**Variants:**
- `success` - color-success-1 background, color-success-text text
- `error` - color-error-1 background, color-error-text text
- `warning` - color-warning-1 background, color-warning-text text
- `info` - color-primary-1 background, color-primary-6 text
- `neutral` - color-neutral-2 background, color-neutral-9 text

#### Card

**Description:** Container for grouped content with optional header and footer.

**Variants:**
- `default` - White background with subtle border
- `elevated` - White background with shadow elevation
- `outlined` - Thicker border for emphasis

**Sections:**
- `header` - Optional header (use CardHeader component for standard layout)
- `children` - Main content area
- `footer` - Optional footer (use CardFooter component for standard layout)

**Design Tokens:**
```json
{
  "background": "bg-white",
  "border": "border-slate-200",
  "padding": "p-large (24px)",
  "radius": "rounded-large (12px)",
  "shadow": "shadow-subtle"
}
```

**Props:**
```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined'
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  onClick?: () => void // Makes card interactive
  className?: string
}
```

**Usage:**
```tsx
<Card
  variant="elevated"
  header={<CardHeader title="Settings" subtitle="Manage your preferences" />}
  footer={<CardFooter rightContent={<Button>Save</Button>} />}
>
  <p>Card content here...</p>
</Card>
```

#### Tabs

**Description:** Navigation component for switching between views.

**Variants:**
- `underline` - Mercury style with bottom border (default)
- `pills` - Button-style tabs with background fill
- `vertical` - For sidebar navigation

**Design Tokens:**
```json
{
  "active-border": "border-primary-500",
  "active-text": "text-primary-500",
  "inactive-text": "text-slate-600",
  "hover-bg": "hover:bg-slate-50"
}
```

**Props:**
```tsx
interface TabsProps {
  variant?: 'underline' | 'pills' | 'vertical'
  tabs: Array<{ value: string; label: string; icon?: ReactNode; disabled?: boolean }>
  activeTab: string
  onChange: (value: string) => void
}
```

**Usage:**
```tsx
<Tabs
  variant="underline"
  tabs={[
    { value: 'overview', label: 'Overview' },
    { value: 'settings', label: 'Settings' },
    { value: 'activity', label: 'Activity' }
  ]}
  activeTab={currentTab}
  onChange={setCurrentTab}
/>
```

#### Divider

**Description:** Visual separator for sections.

**Variants:**
- `horizontal` - Default horizontal line
- `vertical` - Vertical separator for inline content
- With label - Divider with centered text

**Design Tokens:**
```json
{
  "border-color": "border-slate-200",
  "label-text": "text-caption text-slate-500"
}
```

**Usage:**
```tsx
<Divider />
<Divider orientation="vertical" />
<Divider label="OR" />
```

#### Spinner

**Description:** Loading indicator for async operations.

**Sizes:**
- `inline` - 16px for buttons
- `default` - 32px for page sections
- `page` - 48px for full-page loading

**Design Tokens:**
```json
{
  "color": "text-primary-500",
  "animation": "animate-spin"
}
```

**Usage:**
```tsx
<Spinner size="default" text="Loading..." />
```

#### Input

**Description:** Enhanced text input with variants, states, icons, and validation.

**Types:** `text`, `password`, `email`, `search`, `number`, `tel`, `url`

**Sizes:** `sm`, `md`, `lg`

**States:**
- Default: color-neutral-4 border
- Focus: color-primary-3 border
- Error: color-error-3 border with error icon
- Success: color-success-3 border with checkmark
- Disabled: color-neutral-2 background

**Props:**
```tsx
interface InputProps {
  type?: 'text' | 'password' | 'email' | 'search' | 'number' | 'tel' | 'url'
  label?: string
  helperText?: string
  error?: string
  success?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
}
```

**Features:**
- Auto-adds type-specific icons (search, email, tel, url)
- Password toggle (show/hide) with eye icon
- Error/success icons and messages
- Label and helper text support

**Usage:**
```tsx
<Input
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  error="Invalid email format"
/>

<Input
  type="password"
  label="Password"
  helperText="Must be at least 8 characters"
/>
```

#### Checkbox

**Description:** Custom checkbox with consistent styling and checkmark icon.

**States:**
- Unchecked: white background, color-neutral-4 border
- Checked: color-primary-3 background with white checkmark
- Disabled: color-neutral-2 background, 50% opacity

**Design Tokens:**
```json
{
  "sizing": { "box": "20px", "checkmark": "12px" },
  "borders": { "radius": "4px", "width": "2px" },
  "colors": {
    "checked-bg": "color-primary-3",
    "checkmark": "color-white"
  }
}
```

**Props:**
```tsx
interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
}
```

**Usage:**
```tsx
<Checkbox
  checked={agreed}
  onChange={setAgreed}
  label="I agree to the terms"
/>
```

#### Radio

**Description:** Custom radio button with inner circle indicator.

**States:**
- Unselected: white background, color-neutral-4 border
- Selected: white background, color-primary-3 border with inner dot
- Disabled: color-neutral-2 background, 50% opacity

**Design Tokens:**
```json
{
  "sizing": { "outer": "20px", "inner": "10px" },
  "borders": { "width": "2px" },
  "colors": {
    "border-selected": "color-primary-3",
    "indicator": "color-primary-3"
  }
}
```

**Props:**
```tsx
interface RadioProps {
  name: string
  value: string
  checked?: boolean
  onChange?: (value: string) => void
  label?: string
  disabled?: boolean
}
```

**Usage:**
```tsx
<Radio
  name="plan"
  value="pro"
  checked={selectedPlan === 'pro'}
  onChange={setSelectedPlan}
  label="Pro Plan"
/>
```

#### Toggle/Switch

**Description:** Binary on/off toggle for settings.

**Sizes:** `sm`, `md`, `lg`

**Features:**
- Accessible switch role with keyboard support
- Optional label and description text
- Three size variants

**Props:**
```tsx
interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}
```

**Usage:**
```tsx
<Toggle
  checked={notifications}
  onChange={setNotifications}
  label="Email notifications"
  description="Receive updates about your account"
/>
```

#### DatePicker

**Description:** Calendar-based date selection.

**Features:**
- Month/year navigation
- Min/max date constraints
- Today shortcut
- Keyboard accessible

**Props:**
```tsx
interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  label?: string
  placeholder?: string
  helperText?: string
  error?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}
```

**Usage:**
```tsx
<DatePicker
  value={startDate}
  onChange={setStartDate}
  label="Start Date"
  minDate={new Date()}
  placeholder="Select a date"
/>
```

#### TimePicker

**Description:** Time selection dropdown.

**Features:**
- 12-hour or 24-hour format
- Configurable minute intervals (1, 5, 10, 15, 30)
- Min/max time constraints

**Props:**
```tsx
interface TimePickerProps {
  value?: string // "HH:mm" or "hh:mm AM/PM"
  onChange?: (time: string) => void
  label?: string
  placeholder?: string
  helperText?: string
  error?: string
  disabled?: boolean
  use24Hour?: boolean
  minuteStep?: 1 | 5 | 10 | 15 | 30
  minTime?: string
  maxTime?: string
}
```

**Usage:**
```tsx
<TimePicker
  value={meetingTime}
  onChange={setMeetingTime}
  label="Meeting Time"
  minuteStep={15}
  use24Hour={false}
/>
```

#### MultiSelect

**Description:** Multi-selection dropdown with search and tags.

**Features:**
- Search/filter options
- Selected items as removable tags
- Optional max selection limit
- Keyboard navigation

**Props:**
```tsx
interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value?: string[]
  onChange?: (values: string[]) => void
  label?: string
  placeholder?: string
  helperText?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
  maxItems?: number
}
```

**Usage:**
```tsx
<MultiSelect
  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
  ]}
  value={selectedFrameworks}
  onChange={setSelectedFrameworks}
  label="Frameworks"
  placeholder="Select frameworks..."
  maxItems={3}
  searchable
/>
```

#### SearchInput

**Description:** Search input with clear button and loading state. Pill-shaped design with rounded-full border radius.

**Features:**
- Search icon on left (auto-sized based on variant)
- Clear button (X icon) appears when text is entered
- Loading spinner replaces clear button when loading
- Size variants (sm, md, lg) with appropriate padding and typography
- Pill shape (rounded-full) for all sizes
- Extends standard HTML input attributes

**Props:**
```tsx
interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  value: string                           // Current search value
  onValueChange: (value: string) => void  // Callback when value changes
  onClear?: () => void                    // Callback when clear button is clicked
  placeholder?: string                    // Placeholder text (default: "Search...")
  size?: 'sm' | 'md' | 'lg'              // Input size
  fullWidth?: boolean                     // Full width mode
  loading?: boolean                       // Show loading spinner
  disabled?: boolean                      // Disabled state
  className?: string                      // Additional CSS classes
}
```

**Size Variants:**
| Size | Padding | Typography | Icon Size |
|------|---------|------------|-----------|
| sm | `px-small py-tiny` | `text-caption` | `w-icon-xs h-icon-xs` |
| md | `px-medium py-small` | `text-body-1` | `w-icon-sm h-icon-sm` |
| lg | `px-large py-medium` | `text-body-1` | `w-icon-sm h-icon-sm` |

**Usage:**
```tsx
<SearchInput
  value={search}
  onValueChange={setSearch}
  placeholder="Search components..."
  fullWidth
/>

// With loading state
<SearchInput
  value={search}
  onValueChange={setSearch}
  loading={isSearching}
/>

// Small size variant
<SearchInput
  value={filter}
  onValueChange={setFilter}
  size="sm"
  placeholder="Filter..."
/>
```

#### Table

**Description:** Data table with sorting, filtering, pagination, and selection.

**Features:**
- Column sorting (click headers)
- Row selection with checkboxes
- Pagination with page controls
- Search/filter toolbar
- Loading skeleton state
- Empty state message
- Custom cell rendering

**Props:**
```tsx
interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  selectable?: boolean
  selectedRows?: Set<string>
  onSelectionChange?: (selectedRows: Set<string>) => void
  getRowKey: (row: T) => string
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
  searchable?: boolean
  paginated?: boolean
  rowsPerPage?: number
  filters?: TableFilter[]
  sortOptions?: TableSort[]
}
```

**Usage:**
```tsx
<TableContainer>
  <Table
    columns={[
      { key: 'name', header: 'Name', sortable: true },
      { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    ]}
    data={users}
    getRowKey={(row) => row.id}
    selectable
    searchable
    paginated
  />
</TableContainer>
```

#### StatCard

**Description:** Dashboard metric card with value, label, and trend indicator.

**Variants:** `default`, `primary`, `success`, `warning`, `error`

**Features:**
- Large metric value display
- Optional icon
- Trend indicator (up/down/neutral)
- Loading skeleton state

**Props:**
```tsx
interface StatCardProps {
  value: string | number
  label: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  trendLabel?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  loading?: boolean
}
```

**Usage:**
```tsx
<StatCardGrid columns={3}>
  <StatCard
    value="$12,450"
    label="Total Revenue"
    icon={<DollarSign />}
    trend="up"
    trendValue="+12.5%"
    variant="success"
  />
  <StatCard
    value="1,234"
    label="Active Users"
    icon={<Users />}
    trend="up"
    trendValue="+8%"
  />
</StatCardGrid>
```

#### SplitButton

**Description:** Button with primary action and dropdown for secondary actions.

**Variants:** `primary`, `secondary`

**Props:**
```tsx
interface SplitButtonProps {
  label: string
  onClick: () => void
  options: Array<{
    label: string
    onClick: () => void
    icon?: ReactNode
  }>
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}
```

**Usage:**
```tsx
<SplitButton
  label="Save"
  onClick={handleSave}
  options={[
    { label: 'Save as Draft', onClick: handleSaveDraft },
    { label: 'Save & Publish', onClick: handleSavePublish },
  ]}
/>
```

#### DropdownMenu

**Description:** Context menu with action items and optional icons.

**Features:**
- Trigger element (button or custom)
- Menu items with optional icons
- Destructive item styling
- Divider support
- Keyboard navigation

**Props:**
```tsx
interface DropdownMenuProps {
  trigger: ReactNode
  items: Array<{
    label: string
    onClick: () => void
    icon?: ReactNode
    destructive?: boolean
    divider?: boolean
  }>
  align?: 'left' | 'right'
}
```

**Usage:**
```tsx
<DropdownMenu
  trigger={<IconButton><MoreHorizontal /></IconButton>}
  items={[
    { label: 'Edit', onClick: handleEdit, icon: <Edit /> },
    { label: 'Duplicate', onClick: handleDuplicate, icon: <Copy /> },
    { divider: true },
    { label: 'Delete', onClick: handleDelete, icon: <Trash />, destructive: true },
  ]}
/>
```

#### List

**Description:** List container with item components for structured content.

**Variants:** `unordered`, `ordered`

**Props:**
```tsx
interface ListProps {
  variant?: 'unordered' | 'ordered'
  children: ReactNode
}

interface ListItemProps {
  icon?: ReactNode
  children: ReactNode
  onClick?: () => void
}
```

**Usage:**
```tsx
<ListContainer>
  <List>
    <ListItem icon={<Check />}>Feature one</ListItem>
    <ListItem icon={<Check />}>Feature two</ListItem>
    <ListItem icon={<Check />}>Feature three</ListItem>
  </List>
</ListContainer>
```

#### Toast/Notification

**Description:** Feedback component for user actions.

**Variants:**
- `success` - Green with checkmark icon
- `error` - Red with X icon
- `warning` - Yellow with alert icon
- `info` - Blue with info icon

**Features:**
- Auto-dismiss after 5 seconds (configurable)
- Manual dismiss with X button
- Stacks multiple toasts
- Appears from top-right corner

**Design Tokens:**
```json
{
  "success-bg": "bg-success-50",
  "success-text": "text-success-800",
  "shadow": "shadow-lg",
  "radius": "rounded-medium"
}
```

**Usage:**
```tsx
// In your app root, add ToastProvider:
<ToastProvider>
  <App />
</ToastProvider>

// In components, use the hook:
const { showToast } = useToast();

showToast({
  variant: 'success',
  message: 'Settings saved successfully!',
  duration: 5000
});
```

---

## Design Rules

### Layout and Spacing

**Container Widths:**
- Maximum container: 1200px with centered alignment
- Content padding: 24px on desktop, 16px on mobile

**Grid Systems:**
- 3 columns on desktop
- 2 columns on tablet
- 1 column on mobile
- Gap between grid items: 24px

**Spacing Scale:** Use the spacing tokens consistently
- Between related elements: space-medium (16px)
- Between component groups: space-large (24px)
- Between sections: space-2xl (48px)

### Typography Rules

**Text Hierarchy:**
- Page titles: text-heading-1
- Section headings: text-heading-2
- Card titles: text-heading-3
- Body text: text-body-1
- Helper text: text-caption

**Line Height:**
- Body text: 1.5
- Headings: 1.2

### Color Usage

**Primary Color (#25AACE):**
- Primary action buttons
- Active states (selected tabs, focused inputs)
- Links and interactive elements
- Checkboxes and radio buttons

**Neutral Slate System:**
- slate-900: Headings, primary content
- slate-700: Body text
- slate-600: Secondary text
- slate-400: Disabled, placeholder text

**Backgrounds:**
- white: Cards, modals, primary surfaces
- slate-50: Subtle background, hover states
- slate-100: Input backgrounds, disabled states

### Button Rules

**Modern Shadow-Based Interactions:**
- Default: subtle shadow (shadow-subtle)
- Hover: elevated shadow (shadow-button-hover for primary)
- Press: reduced shadow for pressed effect
- **Never use color darkening on hover** - use shadow elevation instead

**Button Sizing:**
- Always provide adequate touch targets (40px+ height)
- Use consistent padding from spacing tokens
- Icon spacing: space-small (8px) gap between icon and text

**Button Text:**
- Always use sentence case (not ALL CAPS or Title Case)
- Keep text concise per size guidelines
- Primary actions should be visually prominent

### Accessibility Requirements

**Focus States:**
- Visible focus ring on all interactive elements
- Focus ring: 1px ring with color-primary-3
- Never remove focus indicators

**Color Contrast:**
- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text (18px+)
- Test all color combinations

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Logical tab order
- Escape key closes modals/dropdowns
- Enter key submits forms

**Screen Reader Support:**
- Semantic HTML elements
- ARIA labels for icon-only buttons
- Alt text for meaningful images

### Animation and Transitions

**Timing:**
- Fast: 150ms for small changes
- Standard: 200ms for most interactions
- Slow: 300ms for complex animations

**Easing:** ease-in-out for smooth feeling

**Hover Transitions:**
- Apply to color, background-color, border-color, shadow
- Use transition-base (200ms)

---

## Exact Spacing Rules

Use these exact values. Do not improvise spacing.

### Page-Level Spacing

| Element | Spacing | Token |
|---------|---------|-------|
| Between major sections | 48px | `mb-2xl` or `space-y-2xl` |
| Page content padding (desktop) | 32px | `p-xl` |
| Page content padding (tablet) | 24px | `p-large` |
| Page content padding (mobile) | 16px | `p-medium` |
| Page header to content | 24px | `mb-large` |
| Page title to subtitle | 4px | `mt-tiny` |

### Card Spacing

| Element | Spacing | Token |
|---------|---------|-------|
| Card internal padding | 24px | `p-large` |
| Between cards in grid | 24px | `gap-large` |
| Card header to content | 16px | `mb-medium` |
| Card content to footer | 24px | `mt-large` |

### Form Spacing

| Element | Spacing | Token |
|---------|---------|-------|
| Between form fields | 16px | `space-y-medium` |
| Label to input | 6px | `mb-1.5` (Tailwind default) |
| Input to helper text | 4px | `mt-tiny` |
| Between form sections | 24px | `space-y-large` |
| Form actions (button gap) | 8px | `gap-small` |

### Modal Spacing

| Element | Spacing | Token |
|---------|---------|-------|
| Modal padding | 24px | `p-large` |
| Modal title to content | 16px | `mb-medium` |
| Modal content to actions | 24px | `mt-large` |
| Modal max-width (small) | 400px | `max-w-sm` |
| Modal max-width (medium) | 512px | `max-w-lg` |
| Modal max-width (large) | 768px | `max-w-3xl` |

### Table Spacing

| Element | Spacing | Token |
|---------|---------|-------|
| Table cell padding | 12px 16px | `px-medium py-3` |
| Table header cell padding | 12px 16px | `px-medium py-3` |
| Between table and filters | 16px | `mb-medium` |

### Button Spacing

| Element | Spacing | Token |
|---------|---------|-------|
| Between buttons | 8px | `gap-small` |
| Icon to button text | 8px | `gap-small` |
| Button group margin | 16px | `mt-medium` |

---

## Empty States

Always provide feedback when content is empty. Use these patterns:

### Standard Empty State

```tsx
<div className="flex flex-col items-center justify-center py-2xl text-center">
  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-large">
    <InboxIcon className="w-icon-lg h-icon-lg text-slate-400" />
  </div>
  <h3 className="text-heading-3 text-slate-900 mb-small">No items yet</h3>
  <p className="text-body-1 text-slate-500 max-w-sm mb-large">
    Get started by creating your first item.
  </p>
  <Button variant="primary">Create Item</Button>
</div>
```

### Table Empty State

```tsx
<tr>
  <td colSpan={columns.length} className="py-2xl text-center">
    <p className="text-body-1 text-slate-500">No results found</p>
    <p className="text-caption text-slate-400 mt-tiny">Try adjusting your filters</p>
  </td>
</tr>
```

### Search Empty State

```tsx
<div className="py-xl text-center">
  <SearchIcon className="w-icon-lg h-icon-lg text-slate-300 mx-auto mb-medium" />
  <p className="text-body-1 text-slate-600">No results for "{query}"</p>
  <p className="text-caption text-slate-400 mt-tiny">Try different keywords</p>
</div>
```

---

## Loading Skeleton Patterns

Use skeletons instead of spinners for content loading:

### Text Skeleton

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-slate-200 rounded w-3/4 mb-small"></div>
  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
</div>
```

### Card Skeleton

```tsx
<Card>
  <div className="animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-medium"></div>
    <div className="space-y-small">
      <div className="h-4 bg-slate-200 rounded"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  </div>
</Card>
```

### Table Row Skeleton

```tsx
<tr className="animate-pulse">
  <td className="px-medium py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
  <td className="px-medium py-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
  <td className="px-medium py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
</tr>
```

### Avatar Skeleton

```tsx
<div className="animate-pulse flex items-center gap-medium">
  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
  <div>
    <div className="h-4 bg-slate-200 rounded w-24 mb-tiny"></div>
    <div className="h-3 bg-slate-200 rounded w-32"></div>
  </div>
</div>
```

### Rules for Loading States

1. **Use skeletons** for content that has a known structure
2. **Use Spinner** for actions (button loading, form submission)
3. **Match skeleton shapes** to actual content (text height, avatar circles)
4. **Use `animate-pulse`** for the shimmer effect
5. **Skeleton color:** `bg-slate-200` on white, `bg-slate-300` on gray

---

## Button System

### Recent Updates (January 2026)

The button system was completely redesigned based on modern SaaS design patterns:

✅ **Primary Color:** #25AACE (modern cyan/teal)
✅ **Shadow-Based Interactions:** Buttons elevate on hover instead of color darkening
✅ **Consistent Sizing:** Clear sm/md/lg system with text length guidelines
✅ **Better Accessibility:** 40px touch targets, WCAG AA contrast ratios

### Why Shadow-Based Interactions

Traditional web design uses color darkening on hover (e.g., blue-500 → blue-700). Modern SaaS apps use shadow elevation instead:

**Benefits:**
- Creates perceived elevation like physical buttons
- Maintains brand color consistently (no darkening)
- More sophisticated visual feedback
- Guides user attention naturally

### Button State Specifications

#### Primary Button States

| State | Background | Text | Shadow |
|-------|------------|------|--------|
| Default | color-primary-3 | color-white | shadow-subtle |
| Hover | color-primary-3 (same) | color-white | shadow-button-hover (elevated) |
| Active | color-primary-3 | color-white | shadow-subtle (reduced) |
| Disabled | color-primary-4 | color-white | none (opacity 50%) |

#### Secondary Button States

| State | Background | Text | Border | Shadow |
|-------|------------|------|--------|--------|
| Default | color-white | color-neutral-8 | color-neutral-3 | shadow-subtle |
| Hover | color-neutral-1 | color-neutral-8 | color-neutral-4 | shadow-subtle |
| Disabled | color-white | color-neutral-5 | color-neutral-3 | none (opacity 50%) |

#### Destructive Button States

| State | Background | Text | Shadow |
|-------|------------|------|--------|
| Default | color-error-4 | color-white | shadow-subtle |
| Hover | color-error-4 (same) | color-white | 0 4px 12px rgba(244,67,54,0.3) |
| Disabled | color-error-4 | color-white | none (opacity 50%) |

### Button Usage Examples

**Primary Actions (Most Important):**
- "Save Changes"
- "Create Account"
- "Send Message"
- "Publish"

**Secondary Actions (Less Important):**
- "Cancel"
- "Go Back"
- "Skip"
- "Learn More"

**Destructive Actions (Dangerous):**
- "Delete Account"
- "Remove File"
- "Clear All"

**Icon-Only Actions (Compact):**
- Attach file button
- Close/dismiss button
- Edit/delete in tables
- Toolbar actions

---

## Phase 2: Composition Components

These components compose multiple primitives into complete UI patterns, primarily for chat interfaces.

### ChatInput

Complete chat input area with file attachments, model selector, plan/edit toggle, and action buttons.

**Props:**
```tsx
interface ChatInputProps {
  message: string                              // Current message value
  onMessageChange: (value: string) => void     // Callback when message changes
  onSend: () => void                           // Callback when send is clicked
  onAttach?: () => void                        // Callback for file attachment dropdown
  onSelect?: () => void                        // Callback for enhance/select button
  onPlan?: () => void                          // Callback for plan/edit mode toggle
  selectedModel?: string                       // Currently selected AI model (default: 'sonnet-4.5')
  onModelChange?: (value: string) => void      // Callback when model changes
  modelOptions?: Array<{value: string, label: string}>  // Available models
  attachedFiles?: AttachedFile[]               // Array of attached files
  onRemoveFile?: (id: string) => void          // Callback when file is removed
  placeholder?: string                         // Placeholder text (default: "Let's create something!")
  disabled?: boolean                           // Disabled state
  loading?: boolean                            // Loading state (shows spinner on send button)
  onClearHistory?: () => void                  // Callback for clear history (opens confirmation modal)
  className?: string                           // Additional CSS classes
}

interface AttachedFile {
  id: string
  name: string
  size?: number
  imageUrl?: string  // Optional image URL for thumbnails
}
```

**Default Model Options:**
```tsx
[
  { value: 'sonnet-4.5', label: 'Sonnet 4.5' },
  { value: 'opus-4', label: 'Opus 4' },
  { value: 'haiku-3.5', label: 'Haiku 3.5' },
]
```

**Example:**
```tsx
<ChatInput
  message={message}
  onMessageChange={setMessage}
  onSend={handleSend}
  onAttach={handleAttach}
  onSelect={handleEnhance}
  onPlan={handlePlanToggle}
  selectedModel={model}
  onModelChange={setModel}
  modelOptions={[
    { value: 'sonnet-4.5', label: 'Sonnet 4.5' },
    { value: 'opus-4', label: 'Opus 4' },
    { value: 'haiku-3.5', label: 'Haiku 3.5' },
  ]}
  attachedFiles={files}
  onRemoveFile={handleRemoveFile}
  onClearHistory={handleClear}
  placeholder="Let's create something!"
/>
```

**Features:**
- **File attachment dropdown** - Plus button opens menu with "Attach file", "Upload image", "Upload document" options
- **Model selector dropdown** - Shows current model with chevron, dropdown shows all options with checkmark on selected
- **Plan/Edit toggle** - Button toggles between Plan and Edit modes with Edit2 icon
- **Enhance button** - Sparkles icon button for prompt enhancement (via `onSelect`)
- **Dynamic textarea** - Starts at 3 rows, expands to 6 rows based on content, then scrolls
- **Send on Enter** - Enter sends message, Shift+Enter for new line
- **Round send button** - Circular primary button, disabled state when empty
- **Loading spinner** - Send button shows spinner when loading
- **AI disclaimer** - "AI can make mistakes. Please verify important information." text below input
- **Clear history modal** - Confirmation modal with Cancel/Clear history buttons
- **File chips** - Attached files display as FileChip components with remove button

---

### ChatHeader

Chat interface header with model selector, mode switcher, and action buttons.

**Props:**
- `models` - Array of available models
- `selectedModel` - Currently selected model
- `onModelChange` - Callback when model changes
- `modes` - Array of available modes
- `selectedMode` - Currently selected mode
- `onModeChange` - Callback when mode changes
- `onSettings` - Optional callback for settings button
- `onClear` - Optional callback for clear button

**Example:**
```tsx
<ChatHeader
  models={[
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'claude-3', label: 'Claude 3' },
  ]}
  selectedModel={model}
  onModelChange={setModel}
  modes={[
    { value: 'chat', label: 'Chat' },
    { value: 'code', label: 'Code' },
  ]}
  selectedMode={mode}
  onModeChange={setMode}
  onSettings={openSettings}
  onClear={clearConversation}
/>
```

---

### AIMessage & UserMessage

Message components for chat interfaces with code blocks and expandable sections.

**AIMessage Props:**
- `content` - Message content (text)
- `codeSnippets` - Optional array of code blocks
- `accordionSections` - Optional expandable sections
- `timestamp` - Optional timestamp string

**UserMessage Props:**
- `content` - Message content
- `timestamp` - Optional timestamp

**Example:**
```tsx
<AIMessage
  content="Here's how to implement that feature:"
  codeSnippets={[
    {
      language: 'typescript',
      code: 'const example = () => { ... }',
      filename: 'example.ts'
    }
  ]}
  accordionSections={[
    {
      id: 'details',
      title: 'Implementation Details',
      content: <div>Additional content...</div>,
      defaultOpen: false
    }
  ]}
  timestamp="2:30 PM"
/>

<UserMessage
  content="How do I implement this feature?"
  timestamp="2:28 PM"
/>
```

**Features:**
- Avatar with bot icon for AI
- Copy message button
- Syntax-highlighted code blocks
- Expandable accordion sections for file diffs/actions
- Timestamp display
- User messages appear on right with primary color background

---

## Using Design Tokens in Code

### How to Use Semantic Tokens

All design tokens are now available as Tailwind utility classes. Use semantic names instead of Tailwind defaults for consistency and maintainability.

**Typography:**
```tsx
// ✅ Good - semantic token names
<h1 className="text-heading-1">Page Title</h1>
<h2 className="text-heading-2">Section Title</h2>
<p className="text-body-1">Body text content</p>
<button className="text-button">Click Me</button>
<span className="text-caption">Helper text</span>

// ❌ Bad - hardcoded Tailwind defaults
<h1 className="text-2xl font-semibold">Page Title</h1>
<p className="text-sm">Body text</p>
```

**Spacing:**
```tsx
// ✅ Good - semantic spacing tokens
<div className="p-large gap-medium">
<button className="px-medium py-small">Save</button>
<div className="mb-2xl">Large section gap</div>

// ❌ Bad - hardcoded pixel values
<div className="p-6 gap-4">
<button className="px-4 py-2">Save</button>
```

**Border Radius:**
```tsx
// ✅ Good - semantic radius tokens
<button className="rounded-medium">Button</button>
<div className="rounded-large">Card</div>
<span className="rounded-full">Badge</span>

// ❌ Bad - hardcoded radius
<button className="rounded-md">Button</button>
<div className="rounded-lg">Card</div>
```

**Transitions:**
```tsx
// ✅ Good - semantic duration tokens
<button className="transition-all duration-fast hover:shadow-button-hover">
<div className="transition-opacity duration-base">

// ❌ Bad - hardcoded durations
<button className="transition-all duration-150">
<div className="transition-opacity duration-200">
```

### Available Token Classes

**Typography Scale:**
- `text-heading-1` - 24px, semibold, line-height 1.2 (page titles)
- `text-heading-2` - 20px, semibold, line-height 1.2 (section headings)
- `text-heading-3` - 18px, medium, line-height 1.2 (card titles)
- `text-body-1` - 14px, regular, line-height 1.5 (body text)
- `text-body-2` - 14px, medium, line-height 1.5 (emphasized text)
- `text-caption` - 12px, regular, line-height 1.5 (helper text)
- `text-button` - 14px, medium, line-height 1 (button labels)

**Spacing Scale:**
- `p-tiny`, `m-tiny`, `gap-tiny` - 4px
- `p-small`, `m-small`, `gap-small` - 8px
- `p-medium`, `m-medium`, `gap-medium` - 16px
- `p-large`, `m-large`, `gap-large` - 24px
- `p-xl`, `m-xl`, `gap-xl` - 32px
- `p-2xl`, `m-2xl`, `gap-2xl` - 48px

**Border Radius:**
- `rounded-small` - 4px (badges, small elements)
- `rounded-medium` - 8px (buttons, inputs)
- `rounded-large` - 12px (cards, modals)
- `rounded-full` - 9999px (circular badges, avatars)

**Transition Durations:**
- `duration-fast` - 150ms (quick feedback)
- `duration-base` - 200ms (default transitions)
- `duration-slow` - 300ms (complex animations)

### Complete Component Example

Here's a properly tokenized button component:

```tsx
<button className="
  px-medium py-small gap-small
  text-button
  bg-primary-500 text-white
  rounded-medium
  shadow-subtle hover:shadow-button-hover
  transition-shadow duration-fast
  disabled:opacity-50
">
  <SendIcon className="w-4 h-4" />
  Send Message
</button>
```

## Implementation Notes

### Source of Truth

The definitive source of truth for components is:
- `/apps/backend/data/components.json` - Complete component library with code and metadata

### Token Implementation

Design tokens are implemented in:
- `DESIGN_TOKENS.md` - Human-readable reference (this file)
- `/apps/web-app/tailwind.config.js` - Tailwind configuration
- `/apps/web-app/src/data/designTokens.ts` - TypeScript implementation

### Component Files

Components are implemented in:
- `/apps/web-app/src/components/ui/` - Component implementations
- `/apps/web-app/src/components/ComponentPreview.tsx` - Visual previews
- `/apps/web-app/src/data/componentRegistry.ts` - Component metadata

### Making Changes

When updating the design system:

1. **Update this file** - Design rules, tokens, or component specs
2. **Update tailwind.config.js** - If tokens changed
3. **Update component implementations** - If behavior changed
4. **Update ComponentPreview.tsx** - If visual changes need demonstration
5. **Update README.md** - If it's a major change worth highlighting

---

## Quick Reference

### Common Patterns

**Primary Button:**
```tsx
<button className="bg-primary-500 text-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow-button-hover transition-shadow duration-150">
  Save Changes
</button>
```

**Input Field:**
```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
  placeholder="Enter text..."
/>
```

**Card:**
```tsx
<div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="text-lg font-semibold text-slate-900">Card Title</h3>
  <p className="text-slate-600 mt-2">Card content...</p>
</div>
```

**Badge:**
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
  Approved
</span>
```

---

**For development guidelines and best practices, see [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)**
