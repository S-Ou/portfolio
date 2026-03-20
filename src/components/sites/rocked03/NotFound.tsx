"use client";

import { Rocked03PageLayout } from "@/components/pageLayout";
import NotFoundBody from "@/components/notFoundBody";

export default function Rocked03NotFound() {
  return (
    <Rocked03PageLayout
      BodyContentComponent={NotFoundBody}
      showInfoBlockOnMobile={true}
    />
  );
}
