import { z } from "zod";
import { populiGet } from "../client.js";

export const listAcademicTermsSchema = z.object({
  page: z.number().optional().describe("Page number (1-based)"),
  limit: z.number().optional().describe("Max results per page"),
});

export async function listAcademicTerms(
  args: z.infer<typeof listAcademicTermsSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const params: Record<string, unknown> = {};
  if (args.page != null) params.page = args.page;
  if (args.limit != null) params.limit = args.limit;
  const qs =
    Object.keys(params).length > 0
      ? `?parameters=${encodeURIComponent(JSON.stringify(params))}`
      : "";
  const data = await populiGet(`/academicterms${qs}`);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}
