# Cursor Rules Documentation

This directory contains AI assistant rules for automating development workflows. Each `.mdc` file defines specific instructions for generating and managing different types of development artifacts.

## Available Rules

### 📋 Product Planning & Requirements
- **`create-prd.mdc`** - Generates Product Requirements Documents from user prompts
- **`generate-ui-plan.mdc`** - Produces stakeholder-friendly UI/UX implementation plans ready for review and task generation
- **`generate-tasks.mdc`** - Creates detailed task lists from PRDs or UI plans for implementation
- **`process-task-list.mdc`** - Manages task execution with proper testing and commit protocols

### 🏗️ Middleware Development Workflow (CSD)
- **`generate-middleware-plan.mdc`** - Creates comprehensive middleware architecture plans from API documentation
- **`generate-class-structure.mdc`** - Reference architecture for UI-agnostic middleware systems

## 🔄 Complete Middleware Development Workflow (CSD)

The middleware development follows a structured 3-step process that ensures proper review and validation at each stage:

```mermaid
graph TB
    A[API Documentation<br/>@docs/API/] --> B[generate-middleware-plan.mdc]
    B --> C[middleware-plan-[name].md<br/>📄 Architecture Plan]
    C --> D{Human Review<br/>✅ Architecture}
    D --> E[generate-tasks.mdc]
    E --> F[tasks-middleware-plan-[name].md<br/>📋 Task List]
    F --> G{Human Review<br/>✅ Task Breakdown}
    G --> H[process-task-list.mdc]
    H --> I[Generated Middleware<br/>🎯 Implementation]

    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style F fill:#fff3e0
    style I fill:#e8f5e8
```

### Step 1: Architecture Planning

**Purpose:** Analyze API documentation and create a comprehensive middleware architecture plan.

```bash
# User Command: Reference generate-middleware-plan.mdc
# Input: @docs/API/ documentation files
# Output: /tasks/middleware-plan-[project-name].md
```

**What It Creates:**
- Complete architecture overview
- Class hierarchy design
- API service mapping
- Workflow identification
- State management strategy
- Error handling approach
- Integration patterns

**Review Point:** Human reviews the architecture plan for completeness and accuracy.

### Step 2: Task Generation

**Purpose:** Convert the architecture plan into actionable development tasks.

```bash
# User Command: Reference generate-tasks.mdc with middleware plan
# Input: @tasks/middleware-plan-[project-name].md
# Output: /tasks/tasks-middleware-plan-[project-name].md
```

**What It Creates:**
- Parent tasks for major components
- Detailed sub-tasks for implementation
- File creation/modification list
- Testing requirements
- Dependencies and sequence

**Review Point:** Human reviews the task breakdown before implementation begins.

### Step 3: Implementation Execution

**Purpose:** Execute tasks with proper protocols, testing, and version control.

```bash
# User Command: Reference process-task-list.mdc
# Input: /tasks/tasks-middleware-plan-[project-name].md
# Output: Complete middleware implementation
```

**What It Does:**
- Implements one sub-task at a time
- Runs tests after each completion
- Creates proper git commits
- Updates task list progress
- Maintains file documentation

**Review Points:** Human approval required before each sub-task execution.

## 🎨 Product UI Planning Workflow (Product Team)

The Product workflow ensures every experience is planned, validated, and brand-aligned before engineering begins. It produces a UI plan that non-developers can understand and review, while creating a clean handoff into the existing CSD task execution pipeline.

```mermaid
graph TB
    A[Product Brief or Prompt] --> B[generate-ui-plan.mdc]
    B --> C[ui-plan-[name].md<br/>🎨 UI/UX Plan]
    C --> D{AI + Human Review<br/>✅ Experience}
    D --> E[generate-tasks.mdc]
    E --> F[tasks-ui-plan-[name].md<br/>📋 Task List]
    F --> G{Human Review<br/>✅ Tasks}
    G --> H[process-task-list.mdc]
    H --> I[Implemented Experience<br/>🚀 Delivery]

    style A fill:#e1f5fe
    style C fill:#fce4ec
    style F fill:#fff3e0
    style I fill:#e8f5e8
```

### Step 1: UI Planning

**Purpose:** Translate product goals, branding guidelines, and middleware capabilities into a comprehensive UI/UX implementation plan that non-technical stakeholders can validate.

```bash
# User Command: Reference generate-ui-plan.mdc
# Input: Product brief, @tasks/prd-*.md (optional), @tasks/middleware-plan-*.md (optional)
# Output: /tasks/ui-plan-[project-or-feature-name].md
```

**What It Creates:**
- Screen inventory and responsive layout guidance
- Component usage and theming rules tied to Fliplet branding
- Accessibility, localization, and content requirements
- Review checklists for AI and human stakeholders

**Review Point:** Product and Design review the UI plan for completeness, usability, and brand alignment.

### Step 2: Task Generation

**Purpose:** Convert the approved UI plan into actionable tasks for engineering.

```bash
# User Command: Reference generate-tasks.mdc with UI plan
# Input: @tasks/ui-plan-[project-or-feature-name].md
# Output: /tasks/tasks-ui-plan-[project-or-feature-name].md
```

**What It Creates:**
- Parent and sub-task breakdown aligned with UI requirements
- Relevant file inventory, including tests and assets
- Sequencing and dependency notes for implementation

**Review Point:** Product/Design and Engineering confirm the task breakdown before handoff to CSD execution.

### Step 3: Implementation Execution (CSD)

**Purpose:** Follow the existing CSD process (`process-task-list.mdc`) to implement the UI, middleware, and supporting workstreams defined by the Product plan.

```bash
# User Command: Reference process-task-list.mdc
# Input: /tasks/tasks-ui-plan-[project-or-feature-name].md
# Output: Completed UI aligned with Product plan
```

**What It Does:**
- Executes one sub-task at a time with testing and commits
- Keeps Product stakeholders informed via task status updates
- Ensures alignment with middleware and branding requirements documented in the UI plan

**Review Points:** Product and CSD collaborate on acceptance testing and feedback loops at each sub-task milestone.

## 📁 Generated File Structure

### Planning Phase Output
```
/tasks/
├── ui-plan-[project-or-feature-name].md         # Product UI/UX plan
├── tasks-ui-plan-[project-or-feature-name].md   # Task list generated from UI plan
├── middleware-plan-[project-name].md            # Middleware architecture plan
└── tasks-middleware-plan-[project-name].md      # Implementation tasks from middleware plan
```

### Implementation Phase Output
```
/src/middleware/
├── core/
│   ├── BaseMiddleware.js
│   ├── StateManager.js
│   ├── ValidationEngine.js
│   ├── ErrorHandler.js
│   └── DataMapper.js
├── api/
│   ├── ApiClient.js
│   ├── [Domain]ApiService.js
│   └── ...
├── controllers/
│   ├── WorkflowManager.js
│   ├── [Process]Controller.js
│   └── ...
├── config/
│   ├── endpoints.js
│   ├── validation-rules.js
│   ├── error-messages.js
│   └── workflows.js
└── middleware.js
```

## 🎯 Key Benefits

### **Incremental Validation**
- Review architecture before implementation
- Validate task breakdown before coding
- Approve each implementation step

### **Quality Assurance**
- Comprehensive testing at each step
- Proper version control protocols
- Documentation maintenance

### **Risk Mitigation**
- Early detection of architecture issues
- Clear dependencies and sequencing
- Rollback capabilities at each stage

### **Reusability**
- Consistent patterns across projects
- Proven workflow templates
- Modular rule system

## 🚀 Usage Examples

### Planning a Publishing Dashboard UI Experience

1. **Generate UI Plan:**
   ```
   Reference: @.cursor/rules/generate-ui-plan.mdc
   Context: Product brief + @tasks/middleware-plan-publishing-dashboard.md
   Output: /tasks/ui-plan-publishing-dashboard.md
   ```

2. **Generate Tasks:**
   ```
   Reference: @.cursor/rules/generate-tasks.mdc
   Input: @tasks/ui-plan-publishing-dashboard.md
   Output: /tasks/tasks-ui-plan-publishing-dashboard.md
   ```

3. **Execute Implementation:**
   ```
   Reference: @.cursor/rules/process-task-list.mdc
   Input: @tasks/tasks-ui-plan-publishing-dashboard.md
   Output: Live UI aligned with Product plan
   ```

### Creating a Publishing Dashboard Middleware

1. **Generate Plan:**
   ```
   Reference: @.cursor/rules/generate-middleware-plan.mdc
   Context: Analyze @docs/API/ for publishing dashboard
   Output: /tasks/middleware-plan-publishing-dashboard.md
   ```

2. **Generate Tasks:**
   ```
   Reference: @.cursor/rules/generate-tasks.mdc
   Input: @tasks/middleware-plan-publishing-dashboard.md
   Output: /tasks/tasks-middleware-plan-publishing-dashboard.md
   ```

3. **Execute Implementation:**
   ```
   Reference: @.cursor/rules/process-task-list.mdc
   Input: @tasks/tasks-middleware-plan-publishing-dashboard.md
   Output: Complete middleware system
   ```

### Creating a User Management Middleware

1. **Generate Plan:**
   ```
   Reference: @.cursor/rules/generate-middleware-plan.mdc
   Context: Analyze user management API docs
   Output: /tasks/middleware-plan-user-management.md
   ```

2. **Follow same 3-step process...**

## 📝 Rule File Conventions

### File Naming
- Use kebab-case: `generate-middleware-plan.mdc`
- Include action verb: `generate`, `create`, `process`
- Be descriptive: `middleware-plan` vs `plan`

### File Structure
```markdown
---
description: Brief description of what the rule does
globs:
alwaysApply: false
---
# Rule: Descriptive Title

## Goal
[Clear statement of what this rule achieves]

## Process
[Step-by-step instructions for the AI]

## Output
[Description of generated artifacts]

## Standards
[Coding/documentation standards to follow]
```

### Documentation Standards
- Include comprehensive examples
- Specify input/output formats
- Define error handling approaches
- Provide integration patterns

## 🔧 Maintenance

### Adding New Rules
1. Follow the established file structure
2. Include comprehensive documentation
3. Provide clear examples
4. Test with real scenarios

### Updating Existing Rules
1. Maintain backward compatibility
2. Update this README if workflow changes
3. Test updated rules thoroughly
4. Document breaking changes

### Best Practices
- Keep rules focused and single-purpose
- Leverage existing rules when possible
- Include proper error handling
- Maintain clear documentation
