#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as academicTerms from "./tools/academic-terms.js";
import * as people from "./tools/people.js";
import * as courseOfferings from "./tools/course-offerings.js";
import * as enrollments from "./tools/enrollments.js";
import * as githubClassroom from "./tools/github-classroom.js";

const server = new McpServer(
  { name: "populi-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.registerTool(
  "populi_list_academic_terms",
  {
    description: "List academic terms (needed for course offerings and enrollments).",
    inputSchema: academicTerms.listAcademicTermsSchema,
  },
  academicTerms.listAcademicTerms
);

server.registerTool(
  "populi_get_person",
  {
    description: "Get a person by ID from Populi.",
    inputSchema: people.getPersonSchema,
  },
  people.getPerson
);

server.registerTool(
  "populi_list_people",
  {
    description: "List people in Populi with optional search. Supports paging.",
    inputSchema: people.listPeopleSchema,
  },
  people.listPeople
);

server.registerTool(
  "populi_get_course_offering",
  {
    description: "Get a course offering by ID.",
    inputSchema: courseOfferings.getCourseOfferingSchema,
  },
  courseOfferings.getCourseOffering
);

server.registerTool(
  "populi_list_course_offerings",
  {
    description: "List course offerings, optionally filtered by academic term.",
    inputSchema: courseOfferings.listCourseOfferingsSchema,
  },
  courseOfferings.listCourseOfferings
);

server.registerTool(
  "populi_list_enrollments",
  {
    description: "List enrollments for a course offering (roster).",
    inputSchema: enrollments.listEnrollmentsSchema,
  },
  enrollments.listEnrollments
);

// GitHub Classroom linking tools
server.registerTool(
  "populi_export_roster_for_classroom",
  {
    description:
      "Export Populi course roster in CSV/JSON format for GitHub Classroom manual roster import. Use visible_student_id, person_id, or display_name as identifier.",
    inputSchema: githubClassroom.exportRosterForClassroomSchema,
  },
  githubClassroom.exportRosterForClassroom
);

server.registerTool(
  "classroom_list_classrooms",
  {
    description: "List GitHub Classroom classrooms. Requires GITHUB_TOKEN.",
    inputSchema: githubClassroom.listClassroomsSchema,
  },
  githubClassroom.listClassrooms
);

server.registerTool(
  "classroom_list_assignments",
  {
    description: "List assignments for a GitHub Classroom. Requires GITHUB_TOKEN.",
    inputSchema: githubClassroom.listAssignmentsSchema,
  },
  githubClassroom.listAssignments
);

server.registerTool(
  "classroom_get_assignment",
  {
    description: "Get a GitHub Classroom assignment by ID. Requires GITHUB_TOKEN.",
    inputSchema: githubClassroom.getAssignmentSchema,
  },
  githubClassroom.getAssignment
);

server.registerTool(
  "classroom_list_accepted_assignments",
  {
    description: "List accepted assignments (student repos) for a GitHub Classroom assignment. Requires GITHUB_TOKEN.",
    inputSchema: githubClassroom.listAcceptedAssignmentsSchema,
  },
  githubClassroom.listAcceptedAssignments
);

server.registerTool(
  "classroom_get_grades",
  {
    description:
      "Get grades for a GitHub Classroom assignment. Returns roster_identifier and github_username for mapping to Populi. Requires GITHUB_TOKEN.",
    inputSchema: githubClassroom.getAssignmentGradesSchema,
  },
  githubClassroom.getAssignmentGrades
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
