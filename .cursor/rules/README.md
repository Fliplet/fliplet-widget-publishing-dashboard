# Cursor Rules Documentation

This directory contains AI assistant rules for automating development workflows. Each `.mdc` file defines specific instructions for generating and managing different types of development artifacts.

## Available Rules

### 📋 Project Planning & Requirements
- **`create-prd.mdc`** - Generates Product Requirements Documents from user prompts
- **`generate-tasks.mdc`** - Creates detailed task lists from PRDs for implementation
- **`process-task-list.mdc`** - Manages task execution with proper testing and commit protocols

### 🏗️ Middleware Development Workflow
- **`generate-middleware-plan.mdc`** - Creates comprehensive middleware architecture plans from API documentation
- **`generate-class-structure.mdc`** - Reference architecture for UI-agnostic middleware systems

## 🔄 Complete Middleware Development Workflow

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

## 📁 Generated File Structure

### Planning Phase Output
```
/tasks/
├── middleware-plan-[project-name].md    # Architecture plan
└── tasks-middleware-plan-[project-name].md  # Implementation tasks
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
