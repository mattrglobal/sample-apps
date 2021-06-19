/*
 * Copyright 2019 - MATTR Limited
 * All rights reserved
 * Confidential and proprietary
 */

export type DomainManifest = {
  readonly name: string;
  readonly icons: readonly {
    readonly src: string;
  }[];
};
