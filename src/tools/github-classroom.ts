/**
 * Tools for linking Populi rosters with GitHub Classroom.
 * - Export Populi roster in format for Classroom import
 * - Query GitHub Classroom API (requires GITHUB_TOKEN)
 */

import { z } from "zod";
import { populiGet } from "../client.js";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_API = "https://api.github.com";

function ensureGitHubToken(): void {
  if (!GITHUB_TOKEN) {
    throw new Error(
      "GitHub Classroom tools require GITHUB_TOKEN environment variable. " +
        "Create a token at https://github.com/settings/tokens with 'admin:org' scope."
    );
  }
}

async function githubFetch<T>(path: string): Promise<T> {
  ensureGitHubToken();
  const url = path.startsWith("http") ? path : `${GITHUB_API}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// --- Populi roster export for GitHub Classroom ---

export const exportRosterForClassroomSchema = z.object({
  academic_term_id: z.number().describe("Academic term ID"),
  course_offering_id: z.number().describe("Course offering ID"),
  identifier: z
    .enum(["visible_student_id", "person_id", "display_name"])
    .default("visible_student_id")
    .describe("Which Populi field to use as roster identifier (must match Classroom roster)"),
  format: z.enum(["csv", "json"]).default("csv").describe("Output format"),
});

export async function exportRosterForClassroom(
  args: z.infer<typeof exportRosterForClassroomSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const filter = {
    "0": {
      logic: "ALL",
      fields: [{ name: "course", value: args.course_offering_id, positive: 1 }],
    },
  };
  const params: Record<string, unknown> = { filter };
  const qs = `?parameters=${encodeURIComponent(JSON.stringify(params))}`;
  const data = (await populiGet(
    `/academicterms/${args.academic_term_id}/enrollments${qs}`
  )) as { data?: Array<Record<string, unknown>> };

  const rows = (data.data || []).map((row: Record<string, unknown>) => {
    const rd = (row.report_data as Record<string, unknown>) || {};
    const identifier =
      args.identifier === "visible_student_id"
        ? ((rd.visible_student_id as string) || String(row.id))
        : args.identifier === "person_id"
          ? String(row.id)
          : ((row.display_name as string) || `${row.first_name || ""} ${row.last_name || ""}`.trim());
    return {
      identifier: identifier || String(row.id),
      display_name: (row.display_name as string) ?? `${row.first_name} ${row.last_name}`.trim(),
      person_id: row.id,
      visible_student_id: rd.visible_student_id,
    };
  });

  let text: string;
  if (args.format === "csv") {
    const header = "identifier,display_name,person_id,visible_student_id";
    const lines = rows.map(
      (r) =>
        `"${String(r.identifier).replace(/"/g, '""')}","${String(r.display_name).replace(/"/g, '""')}",${r.person_id},"${r.visible_student_id ?? ""}"`
    );
    text = [header, ...lines].join("\n");
    text += `\n\n# Copy the identifier column for GitHub Classroom roster import.\n`;
    text += `# Or import this CSV and map 'identifier' to your chosen Classroom identifier type.`;
  } else {
    text = JSON.stringify(rows, null, 2);
  }

  return { content: [{ type: "text" as const, text }] };
}

// --- GitHub Classroom API tools ---

export const listClassroomsSchema = z.object({});

export async function listClassrooms(
  _args: z.infer<typeof listClassroomsSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const data = await githubFetch<Array<{ id: number; name: string; archived: boolean; url: string }>>(
    "/classrooms"
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export const listAssignmentsSchema = z.object({
  classroom_id: z.number().describe("GitHub Classroom ID"),
  page: z.number().optional().describe("Page number"),
});

export async function listAssignments(
  args: z.infer<typeof listAssignmentsSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const qs = args.page != null ? `?page=${args.page}` : "";
  const data = await githubFetch<Array<Record<string, unknown>>>(
    `/classrooms/${args.classroom_id}/assignments${qs}`
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export const getAssignmentSchema = z.object({
  assignment_id: z.number().describe("GitHub Classroom assignment ID"),
});

export async function getAssignment(
  args: z.infer<typeof getAssignmentSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const data = await githubFetch<Record<string, unknown>>(
    `/assignments/${args.assignment_id}`
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export const listAcceptedAssignmentsSchema = z.object({
  assignment_id: z.number().describe("GitHub Classroom assignment ID"),
});

export async function listAcceptedAssignments(
  args: z.infer<typeof listAcceptedAssignmentsSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const data = await githubFetch<Array<Record<string, unknown>>>(
    `/assignments/${args.assignment_id}/accepted_assignments`
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export const getAssignmentGradesSchema = z.object({
  assignment_id: z.number().describe("GitHub Classroom assignment ID"),
});

export async function getAssignmentGrades(
  args: z.infer<typeof getAssignmentGradesSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const data = await githubFetch<Array<Record<string, unknown>>>(
    `/assignments/${args.assignment_id}/grades`
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}
