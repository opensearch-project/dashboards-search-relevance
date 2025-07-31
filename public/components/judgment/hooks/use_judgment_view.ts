/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';

export interface JudgmentData {
  id: string;
  name: string;
  type: string;
  status: string;
  metadata: Record<string, any>;
  judgmentRatings: any;
  timestamp: string;
}

export const useJudgmentView = (http: CoreStart['http'], id: string) => {
  const [judgment, setJudgment] = useState<JudgmentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJudgment = async () => {
      try {
        setLoading(true);
        const response = await http.get(`${ServiceEndpoints.Judgments}/${id}`);

        if (response && response.hits && response.hits.hits && response.hits.hits.length > 0) {
          setJudgment(response.hits.hits[0]._source);
        } else {
          setError('No matching judgment found');
        }
      } catch (err) {
        console.error('Failed to load judgment', err);
        setError('Error loading judgment data');
      } finally {
        setLoading(false);
      }
    };

    fetchJudgment();
  }, [http, id]);

  const formatJson = (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  return {
    judgment,
    loading,
    error,
    formatJson,
  };
};
