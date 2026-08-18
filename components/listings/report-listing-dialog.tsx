"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  reportListingAction,
  type ReportListingActionState,
} from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ReportReason } from "@/lib/generated/prisma/enums";
import { REPORT_REASON_LABELS } from "@/lib/schemas/report";

type ReportListingDialogProps = {
  listingId: string;
  listingTitle: string;
  isAuthenticated: boolean;
};

const initialState: ReportListingActionState = {};

const REPORT_REASONS = Object.values(ReportReason);

export function ReportListingDialog({
  listingId,
  listingTitle,
  isAuthenticated,
}: ReportListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [state, formAction, pending] = useActionState(
    reportListingAction,
    initialState,
  );

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setReason("");
    }
  }

  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="sm" render={<Link href="/login" />}>
        Report this listing
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-muted-foreground" />
        }
      >
        Report this listing
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {state.success ? (
          <>
            <DialogHeader>
              <DialogTitle>Report received</DialogTitle>
              <DialogDescription>
                Thank you. Our team will review your report for{" "}
                <span className="text-foreground">{listingTitle}</span> and
                take action if needed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form action={formAction}>
            <DialogHeader>
              <DialogTitle>Report this listing</DialogTitle>
              <DialogDescription>
                Tell us what concerns you. Reports are reviewed by our
                moderation team.
              </DialogDescription>
            </DialogHeader>

            <input type="hidden" name="listingId" value={listingId} />
            <input type="hidden" name="reason" value={reason} />

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="report-reason">Reason</Label>
                <Select
                  value={reason || null}
                  onValueChange={(value) => setReason(value as ReportReason)}
                >
                  <SelectTrigger id="report-reason" className="w-full">
                    <SelectValue placeholder="Choose a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_REASONS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {REPORT_REASON_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="report-details">
                  Additional details{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="report-details"
                  name="details"
                  rows={4}
                  placeholder="Share any context that would help our team investigate."
                  maxLength={2000}
                />
              </div>

              {state.error && (
                <p className="text-sm text-destructive" role="alert">
                  {state.error}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending || !reason}>
                {pending ? "Submitting…" : "Submit report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
