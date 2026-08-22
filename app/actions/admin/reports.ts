"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import { adminReportActionSchema } from "@/lib/schemas/admin";
import {
  AdminReportError,
  performAdminReportAction,
  type AdminReportAction,
} from "@/lib/services/admin/reports";

export type AdminReportActionState = {
  error?: string;
  success?: boolean;
};

export async function adminReportActionAction(
  _prev: AdminReportActionState,
  formData: FormData,
): Promise<AdminReportActionState> {
  const session = await requireAdmin();

  const parsed = adminReportActionSchema.safeParse({
    reportId: formData.get("reportId"),
    action: formData.get("action"),
    resolutionNotes: formData.get("resolutionNotes") || undefined,
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check the report action."),
    };
  }

  try {
    await performAdminReportAction({
      adminId: session.user.id,
      reportId: parsed.data.reportId,
      action: parsed.data.action as AdminReportAction,
      resolutionNotes: parsed.data.resolutionNotes,
    });
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.reports.action",
      serviceErrors: [AdminReportError],
    });
  }

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${parsed.data.reportId}`);

  return { success: true };
}
