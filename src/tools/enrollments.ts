import { z } from "zod";
import { populiGet } from "../client.js";

export const listEnrollmentsSchema = z.object({
  academic_term_id: z.number().describe("Academic term ID (enrollments are scoped by term)"),
  course_offering_id: z.number().describe("Course offering ID to filter roster (use filter)"),
  page: z.number().optional().describe("Page number (1-based)"),
});

export async function listEnrollments(
  args: z.infer<typeof listEnrollmentsSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const filter = {
    "0": {
      logic: "ALL",
      fields: [{ name: "course", value: args.course_offering_id, positive: 1 }],
    },
  };
  const params: Record<string, unknown> = { filter };
  if (args.page != null) params.page = args.page;
  const qs = `?parameters=${encodeURIComponent(JSON.stringify(params))}`;
  const data = await populiGet(
    `/academicterms/${args.academic_term_id}/enrollments${qs}`
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}
