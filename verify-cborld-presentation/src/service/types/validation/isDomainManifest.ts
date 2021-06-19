/*
 * Copyright 2019 - MATTR Limited
 * All rights reserved
 * Confidential and proprietary
 */

import { DomainManifest } from "../domainManifest";

export const isDomainManifest = (val: any): val is DomainManifest =>
  (val.name && typeof val.name === "string") ||
  Array.isArray(val.icons) ||
  val.icons.every((item: any) => typeof item.src === "string");
