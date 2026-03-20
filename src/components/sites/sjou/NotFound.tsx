"use client";

import { SJOuPageLayout } from "@/components/pageLayout";
import NotFoundBody from "@/components/notFoundBody";

export default function SJOuNotFound() {
  return (
    <SJOuPageLayout
      BodyContentComponent={NotFoundBody}
      showInfoBlockOnMobile={true}
    />
  );
}
