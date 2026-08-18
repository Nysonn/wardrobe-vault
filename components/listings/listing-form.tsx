"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  createListingAction,
  submitListingAction,
  updateListingAction,
  type ListingActionState,
} from "@/app/actions/listings";
import { DocumentUploader } from "@/components/listings/document-uploader";
import { ImageUploader } from "@/components/listings/image-uploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LISTING_CONDITION_LABELS,
  type ListingDocumentInput,
  type ListingImageInput,
} from "@/lib/schemas/listing";

type Category = { id: string; name: string };

type ListingFormDefaultValues = {
  title?: string;
  categoryId?: string;
  brand?: string;
  designer?: string;
  price?: number;
  size?: string;
  color?: string;
  material?: string;
  condition?: string;
  wornByName?: string;
  wornBySeller?: boolean;
  wornWhere?: string;
  eventName?: string;
  timesWorn?: number;
  storyDetails?: string;
  authenticityNotes?: string;
  images?: ListingImageInput[];
  documents?: ListingDocumentInput[];
};

type ListingFormProps = {
  mode: "create" | "edit";
  listingId?: string;
  categories: Category[];
  defaultValues?: ListingFormDefaultValues;
};

const initialState: ListingActionState = {};

export function ListingForm({
  mode,
  listingId,
  categories,
  defaultValues = {},
}: ListingFormProps) {
  const [saveState, saveAction, savePending] = useActionState(
    mode === "create" ? createListingAction : updateListingAction,
    initialState,
  );
  const [submitState, submitAction, submitPending] = useActionState(
    submitListingAction,
    initialState,
  );

  const [images, setImages] = useState<ListingImageInput[]>(
    defaultValues.images ?? [],
  );
  const [documents, setDocuments] = useState<ListingDocumentInput[]>(
    defaultValues.documents ?? [],
  );

  const errorMessage = saveState.error ?? submitState.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create a listing" : "Edit listing"}
        </CardTitle>
        <CardDescription>
          Save a draft at any time. Submit for review once your story, imagery,
          and details are complete.
        </CardDescription>
      </CardHeader>

      <form action={saveAction}>
        {listingId ? (
          <input type="hidden" name="listingId" value={listingId} />
        ) : null}
        {/* Serialize image/document state as JSON hidden fields */}
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <input
          type="hidden"
          name="documents"
          value={JSON.stringify(documents)}
        />

        <CardContent className="space-y-6">
          {errorMessage ? (
            <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {errorMessage}
            </p>
          ) : null}

          {/* Photographs */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Photographs *
            </legend>
            <ImageUploader value={images} onChange={setImages} />
          </fieldset>

          {/* Basic info */}
          <fieldset className="space-y-4 border-t border-border pt-6">
            <legend className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              The piece
            </legend>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Ivory silk Valentino gown"
                defaultValue={defaultValues.title}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="Chanel"
                  defaultValue={defaultValues.brand}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designer">Designer</Label>
                <Input
                  id="designer"
                  name="designer"
                  placeholder="Virgil Abloh"
                  defaultValue={defaultValues.designer}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (UGX) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="2500000"
                  defaultValue={defaultValues.price}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={defaultValues.categoryId ?? ""}
                  required
                  className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    Choose a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  name="size"
                  placeholder="UK 10 / EU 38"
                  defaultValue={defaultValues.size}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Colour</Label>
                <Input
                  id="color"
                  name="color"
                  placeholder="Ivory"
                  defaultValue={defaultValues.color}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  name="material"
                  placeholder="Silk"
                  defaultValue={defaultValues.material}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <select
                id="condition"
                name="condition"
                defaultValue={defaultValues.condition ?? ""}
                required
                className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  Choose a condition
                </option>
                {Object.entries(LISTING_CONDITION_LABELS).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>
          </fieldset>

          {/* Provenance */}
          <fieldset className="space-y-4 border-t border-border pt-6">
            <legend className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Provenance
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wornByName">Worn by</Label>
                <Input
                  id="wornByName"
                  name="wornByName"
                  placeholder="Name of the person"
                  defaultValue={defaultValues.wornByName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wornWhere">Occasion or context</Label>
                <Input
                  id="wornWhere"
                  name="wornWhere"
                  placeholder="Met Gala 2019"
                  defaultValue={defaultValues.wornWhere}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event name</Label>
                <Input
                  id="eventName"
                  name="eventName"
                  placeholder="Cannes Film Festival"
                  defaultValue={defaultValues.eventName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timesWorn">Times worn</Label>
                <Input
                  id="timesWorn"
                  name="timesWorn"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="1"
                  defaultValue={defaultValues.timesWorn}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="wornBySeller"
                name="wornBySeller"
                type="checkbox"
                defaultChecked={defaultValues.wornBySeller}
                className="h-4 w-4 rounded-sm border-input"
              />
              <Label htmlFor="wornBySeller">
                I am the person who wore this piece
              </Label>
            </div>
          </fieldset>

          {/* Story */}
          <fieldset className="space-y-4 border-t border-border pt-6">
            <legend className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Story
            </legend>
            <div className="space-y-2">
              <Label htmlFor="storyDetails">
                The story behind this piece *
              </Label>
              <Textarea
                id="storyDetails"
                name="storyDetails"
                rows={5}
                placeholder="Share the history of this piece — how it came to you, the occasion it marked, and why it belongs in someone's wardrobe."
                defaultValue={defaultValues.storyDetails}
              />
              <p className="text-xs text-muted-foreground">
                Required for submission. At least 40 characters.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="authenticityNotes">Authenticity notes</Label>
              <Textarea
                id="authenticityNotes"
                name="authenticityNotes"
                rows={3}
                placeholder="Describe any provenance documentation, certificates, or evidence you hold."
                defaultValue={defaultValues.authenticityNotes}
              />
            </div>
          </fieldset>

          {/* Supporting documents */}
          <fieldset className="space-y-3 border-t border-border pt-6">
            <legend className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Supporting documents
            </legend>
            <p className="text-sm text-muted-foreground">
              Upload proof of purchase, certificates, event photographs, or
              other evidence of provenance. Optional but strengthens your
              listing.
            </p>
            <DocumentUploader value={documents} onChange={setDocuments} />
          </fieldset>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 border-t pt-6">
          <Button type="submit" disabled={savePending}>
            {savePending ? "Saving…" : "Save draft"}
          </Button>
          {mode === "edit" && listingId ? (
            <Button
              type="submit"
              variant="outline"
              formAction={submitAction}
              disabled={submitPending}
            >
              {submitPending ? "Submitting…" : "Submit for review"}
            </Button>
          ) : null}
          <Button render={<Link href="/sell" />} variant="ghost">
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

