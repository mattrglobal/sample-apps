import { DomainManifest } from "../domainManifest";

export const isDomainManifest = (val: any): val is DomainManifest =>
  val.name &&
  typeof val.name === "string" &&
  (val.icons === undefined ||
    (Array.isArray(val.icons) && val.icons.every((item: any) => typeof item.src === "string")));
