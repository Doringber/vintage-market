import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/admin/auth";
import { saveAdminProductRecord } from "../../../../lib/catalog/admin-save";
import { revalidateStorefront } from "../../../../lib/catalog/admin-save-paths";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "צריך להתחבר לאדמין." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const result = await saveAdminProductRecord(formData);
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }

    revalidateStorefront(result.slug);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "לא הצלחנו לשמור את המוצר.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
