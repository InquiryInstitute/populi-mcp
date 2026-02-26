import { z } from "zod";
import { populiGet, populiPost } from "../client.js";

export const getPersonSchema = z.object({
  person_id: z.number().describe("Populi person ID"),
  expand: z
    .array(z.string())
    .optional()
    .describe("Optional expand fields (e.g. addresses, phone_numbers, tags)"),
});

export async function getPerson(
  args: z.infer<typeof getPersonSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const body: Record<string, unknown> = {};
  if (args.expand?.length) body.expand = args.expand;
  const data =
    Object.keys(body).length > 0
      ? await populiPost(`/people/${args.person_id}`, body)
      : await populiGet(`/people/${args.person_id}`);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export const listPeopleSchema = z.object({
  query: z.string().optional().describe("Search query (name, email, etc.)"),
  page: z.number().optional().describe("Page number (1-based)"),
  limit: z.number().optional().describe("Max results per page (default 200)"),
});

export async function listPeople(
  args: z.infer<typeof listPeopleSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const body: Record<string, unknown> = {};
  if (args.query) body.query = args.query;
  if (args.page != null) body.page = args.page;
  if (args.limit != null) body.limit = args.limit;
  const data =
    Object.keys(body).length > 0
      ? await populiPost("/people", body)
      : await populiGet("/people");
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}
