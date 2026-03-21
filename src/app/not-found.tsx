import NotFoundBody from "@/components/notFoundBody";
import SharedPage from "@/components/sites/sharedPage";

export default async function NotFound() {
  return <SharedPage BodyContentComponent={NotFoundBody} />;
}
