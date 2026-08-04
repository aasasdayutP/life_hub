import SwaggerUIWrapper from "./SwaggerUI";
import { getApiDocs } from "@/lib/swagger";

export default async function ApiDocsPage() {
  const spec = getApiDocs();

  return <SwaggerUIWrapper spec={spec} />;
}