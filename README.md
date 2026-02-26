# populi-mcp

MCP (Model Context Protocol) server for the [Populi LMS](https://www.populiweb.com/) API. Exposes tools for querying people, course offerings, enrollments, and academic terms.

## Setup

1. **Environment variables**:
   - `POPULI_BASE_URL` — Your Populi instance URL (e.g. `https://yourschool.populiweb.com`) — required for Populi tools
   - `POPULI_API_KEY` — API key from Populi (Account & Settings → API → Keys) — required for Populi tools
   - `GITHUB_TOKEN` — GitHub token with `admin:org` scope — required for Classroom tools

2. **Install and build**:
   ```bash
   npm install
   npm run build
   ```

## Usage

### Run locally
```bash
POPULI_BASE_URL=https://yourschool.populiweb.com POPULI_API_KEY=sk_xxx npm start
```

### Cursor MCP

Add to `.cursor/mcp.json` (project or user):

```json
{
  "mcpServers": {
    "populi": {
      "command": "node",
      "args": ["/path/to/populi-mcp/dist/index.js"],
      "env": {
        "POPULI_BASE_URL": "https://yourschool.populiweb.com",
        "POPULI_API_KEY": "sk_your_api_key"
      }
    }
  }
}
```

Or use `npx`:
```json
{
  "mcpServers": {
    "populi": {
      "command": "npx",
      "args": ["-y", "populi-mcp"],
      "env": {
        "POPULI_BASE_URL": "https://yourschool.populiweb.com",
        "POPULI_API_KEY": "sk_your_api_key"
      }
    }
  }
}
```

## Tools

### Populi

| Tool | Description |
|------|-------------|
| `populi_list_academic_terms` | List academic terms |
| `populi_get_person` | Get a person by ID |
| `populi_list_people` | List/search people |
| `populi_get_course_offering` | Get a course offering by ID |
| `populi_list_course_offerings` | List course offerings for an academic term |
| `populi_list_enrollments` | List enrollments (roster) for a course in a term |

### GitHub Classroom linking

| Tool | Description |
|------|-------------|
| `populi_export_roster_for_classroom` | Export Populi roster as CSV/JSON for GitHub Classroom manual roster import |
| `classroom_list_classrooms` | List GitHub Classroom classrooms |
| `classroom_list_assignments` | List assignments for a classroom |
| `classroom_get_assignment` | Get assignment details (invite link, etc.) |
| `classroom_list_accepted_assignments` | List accepted assignments (student repos) |
| `classroom_get_grades` | Get grades with roster_identifier ↔ github_username mapping |

**Classroom tools** require `GITHUB_TOKEN` (token with `admin:org` scope). Use `roster_identifier` from grades to match Populi `visible_student_id` when syncing grades.

## Populi API

- [API Reference](https://populi.co/api/)
- Rate limits: 50 req/min (3AM–7PM PST), 100 req/min otherwise
