/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILegacyClusterClient, IRouter } from '../../../../src/core/server';
import { registerDslRoute } from './dsl_route';

export function defineRoutes({ router }: { router: IRouter }) {
  registerDslRoute({ router });
}
