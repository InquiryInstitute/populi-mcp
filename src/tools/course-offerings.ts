import { z } from "zod";
import { populiGet, populiPost } from "../client.js";

export const getCourseOfferingSchema = z.object({
  course_offering_id: z.number().describe("Populi course offering ID"),
  expand: z
    .array(z.string())
    .optional()
    .describe("Optional expand fields (e.g. catalog_courses, subterms)"),
});

export async function getCourseOffering(
  args: z.infer<typeof getCourseOfferingSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const body: Record<string, unknown> = {};
  if (args.expand?.length) body.expand = args.expand;
  const data =
    Object.keys(body).length > 0
      ? await populiPost(`/courseofferings/${args.course_offering_id}`, body)
      : await populiGet(`/courseofferings/${args.course_offering_id}`);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export const listCourseOfferingsSchema = z.object({
  academic_term_id: z.number().describe("Academic term ID (required for list)"),
  page: z.number().optional().describe("Page number (1-based)"),
  limit: z.number().optional().describe("Max results per page (default 200)"),
});

export async function listCourseOfferings(
  args: z.infer<typeof listCourseOfferingsSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const params: Record<string, unknown> = {};
  if (args.page != null) params.page = args.page;
  if (args.limit != null) params.limit = args.limit;
  const qs =
    Object.keys(params).length > 0
      ? `?parameters=${encodeURIComponent(JSON.stringify(params))}`
      : "";
  const data = await populiGet(
    `/academicterms/${args.academic_term_id}/courseofferings${qs}`
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}
