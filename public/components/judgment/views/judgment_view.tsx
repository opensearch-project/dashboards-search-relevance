/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiInMemoryTable,
  EuiCallOut,
  EuiFieldNumber,
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiBottomBar,
  EuiButton,
  EuiButtonEmpty,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { useJudgmentView } from '../hooks/use_judgment_view';
import { JudgmentService } from '../services/judgment_service';
import { extractUserMessageFromError } from '../../../../common';

interface JudgmentViewProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  id: string;
  dataSourceId?: string | null;
}

// Judgment types that store the editable ratings/failures structure.
const LLM_JUDGMENT_TYPE = 'LLM_JUDGMENT';
// Metadata key that records how an LLM judgment was scored.
const RATING_TYPE_RELEVANT_IRRELEVANT = 'RELEVANT_IRRELEVANT';

// Binary options for RELEVANT_IRRELEVANT judgments (stored numerically: 1.0 / 0.0).
const BINARY_OPTIONS = [
  { value: '1.0', text: 'Relevant (1.0)' },
  { value: '0.0', text: 'Irrelevant (0.0)' },
];

// A stable key for a single (query, docId) rating so edits can be tracked in a map.
const editKey = (query: string, docId: string) => `${query} ${docId}`;

// One pending rating edit; query/docId are carried alongside the value so they are never
// recovered by parsing the map key (query strings may contain spaces or other characters).
interface PendingEdit {
  query: string;
  docId: string;
  rating: string;
}

// Search config shared by the docs tables: an incremental filter box over query/docId.
const DOCS_TABLE_SEARCH = {
  box: { incremental: true, placeholder: 'Filter by query or doc ID...' },
};
const DOCS_TABLE_PAGINATION = { initialPageSize: 20, pageSizeOptions: [10, 20, 50, 100] };

/**
 * Generic table for a judgment's per-query document lists (ratings or failures).
 * Flattens:
 * [
 *   { query, [listField]: [{docId, ...}, ...] }
 * ]
 * into rows and hands them to EuiInMemoryTable, which owns search, sort and pagination.
 *
 * @param data      the judgmentRatings array
 * @param listField which per-query list to flatten ('ratings' or 'failures')
 * @param mapRow    maps a raw list item to a table row
 * @param columns   the table columns to display
 */
const JudgmentDocsTable = ({
  data,
  listField,
  mapRow,
  columns,
}: {
  data: any[];
  listField: string;
  mapRow: (query: string, item: any) => Record<string, any>;
  columns: Array<Record<string, any>>;
}) => {
  // Flatten JSON into table rows. Only depends on the source data + mapping, never on edit
  // state, so the item set stays referentially stable while editing - EuiInMemoryTable then
  // preserves the current page/sort/filter (and input focus) across keystrokes.
  const items = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.flatMap((item) =>
      (item[listField] || []).map((entry: any) => mapRow(item.query, entry))
    );
  }, [data, listField, mapRow]);

  return (
    <EuiInMemoryTable
      items={items}
      columns={columns as any}
      search={DOCS_TABLE_SEARCH}
      pagination={DOCS_TABLE_PAGINATION}
      sorting={{ sort: { field: 'query', direction: 'asc' } }}
    />
  );
};

// Module-scope row mappers so their identity is stable across renders; the `items` memo in
// JudgmentDocsTable depends on the mapper, so an inline arrow would re-flatten every render.
const mapRatingRow = (query: string, r: any) => ({
  query,
  // Keep the raw stored rating as a string so the editor can round-trip it.
  docId: r.docId,
  rating: String(r.rating),
});
// Failed docs are unrated, so the row opens with an empty rating for the editor to fill.
const mapFailureRow = (query: string, f: any) => ({ query, docId: f.docId, rating: '' });

interface EditableTableProps {
  judgmentRatings: any[];
  // True only in edit mode (the user clicked Edit). When false the Rating cell is plain text.
  editable: boolean;
  ratingType?: string;
  edits: Record<string, PendingEdit>;
  onRatingChange: (query: string, docId: string, value: string) => void;
}

// Shared rating cell used by both the Ratings and Failed Documents tables. In edit mode it is a
// single in-place editor (number box for SCORE0_1, dropdown for binary); otherwise plain text.
// A pending edit, if present, takes precedence over the stored value so the control reflects the
// user's uncommitted change. `stored` is '' for a failed/unrated doc.
const renderRatingCell = (
  row: any,
  {
    editable,
    isBinary,
    edits,
    onRatingChange,
  }: {
    editable: boolean;
    isBinary: boolean;
    edits: Record<string, PendingEdit>;
    onRatingChange: (query: string, docId: string, value: string) => void;
  }
) => {
  const query = String(row.query);
  const docId = String(row.docId);
  const key = editKey(query, docId);
  const isDirty = Object.prototype.hasOwnProperty.call(edits, key);
  const stored = row.rating == null ? '' : String(row.rating);
  const value = isDirty ? edits[key].rating : stored;

  if (!editable) {
    return <EuiText size="s">{value}</EuiText>;
  }

  if (isBinary) {
    return (
      <EuiSelect
        compressed
        style={{ maxWidth: 200 }}
        // A failed doc has no rating yet; offer an explicit unrated placeholder so the
        // dropdown doesn't silently default a value the user never chose.
        options={value === '' ? [{ value: '', text: 'Select...' }, ...BINARY_OPTIONS] : BINARY_OPTIONS}
        value={value}
        onChange={(e) => onRatingChange(query, docId, e.target.value)}
        aria-label={`Rating for query "${query}", doc ${docId}`}
        isInvalid={isDirty && value !== '1.0' && value !== '0.0'}
      />
    );
  }

  // SCORE0_1: a single in-place numeric editor.
  const invalid = value === '' || Number.isNaN(Number(value)) || Number(value) < 0 || Number(value) > 1;
  return (
    <EuiFieldNumber
      compressed
      style={{ maxWidth: 120 }}
      min={0}
      max={1}
      step={0.05}
      value={value}
      isInvalid={isDirty && invalid}
      onChange={(e) => onRatingChange(query, docId, e.target.value)}
      aria-label={`Rating for query "${query}", doc ${docId}`}
    />
  );
};

// Ratings: query + docId + rating. In edit mode the Rating cell is an inline editor whose
// pending edits are surfaced to the parent so they can all be saved together.
const JudgmentRatingsTable = ({
  judgmentRatings,
  editable,
  ratingType,
  edits,
  onRatingChange,
}: EditableTableProps) => {
  const isBinary = ratingType === RATING_TYPE_RELEVANT_IRRELEVANT;

  const columns: Array<Record<string, any>> = [
    { field: 'query', name: 'Query', sortable: true },
    { field: 'docId', name: 'Doc ID', sortable: true },
    {
      field: 'rating',
      name: 'Rating',
      sortable: true,
      width: editable ? '220px' : undefined,
      render: (_rating: any, row: any) =>
        renderRatingCell(row, { editable, isBinary, edits, onRatingChange }),
    },
  ];

  return (
    <JudgmentDocsTable
      data={judgmentRatings}
      listField="ratings"
      mapRow={mapRatingRow}
      columns={columns}
    />
  );
};

// Failures: query + docId for docs the judgment could not rate. In edit mode a Rating cell
// lets a user assign a rating; saving moves the doc out of failures into ratings on the backend.
const JudgmentFailuresTable = ({
  judgmentRatings,
  editable,
  ratingType,
  edits,
  onRatingChange,
}: EditableTableProps) => {
  const isBinary = ratingType === RATING_TYPE_RELEVANT_IRRELEVANT;

  const columns: Array<Record<string, any>> = [
    { field: 'query', name: 'Query', sortable: true },
    { field: 'docId', name: 'Doc ID', sortable: true },
    ...(editable
      ? [
          {
            field: 'rating',
            name: 'Rating',
            width: '220px',
            // Failed docs are unrated, so the editor opens empty until the user assigns a value.
            render: (_rating: any, row: any) =>
              renderRatingCell(row, { editable, isBinary, edits, onRatingChange }),
          },
        ]
      : []),
  ];

  return (
    <JudgmentDocsTable
      data={judgmentRatings}
      listField="failures"
      mapRow={mapFailureRow}
      columns={columns}
    />
  );
};

export const JudgmentView: React.FC<JudgmentViewProps> = ({
  http,
  notifications,
  id,
  dataSourceId,
}) => {
  const { judgment, loading, error, refresh } = useJudgmentView(http, id, dataSourceId);

  // Pending rating edits keyed by (query, docId); empty when nothing is unsaved.
  const [edits, setEdits] = useState<Record<string, PendingEdit>>({});
  const [isSaving, setIsSaving] = useState(false);
  // Edit mode: ratings are read-only until the user clicks Edit. Only then do the inline
  // editors appear, and Save/Cancel exits edit mode.
  const [isEditing, setIsEditing] = useState(false);

  const service = useMemo(() => new JudgmentService(http), [http]);

  const isLlm = judgment?.type === LLM_JUDGMENT_TYPE;
  const ratingType = judgment?.metadata?.llmJudgmentRatingType as string | undefined;
  // Editing is only allowed for a COMPLETED LLM judgment; `editable` gates the inline editors.
  const canEdit = Boolean(isLlm) && judgment?.status === 'COMPLETED';
  const editable = canEdit && isEditing;

  const handleRatingChange = (query: string, docId: string, value: string) => {
    setEdits((prev) => ({ ...prev, [editKey(query, docId)]: { query, docId, rating: value } }));
  };

  const dirtyCount = Object.keys(edits).length;

  const startEditing = () => setIsEditing(true);

  // Leave edit mode and drop any unsaved edits.
  const cancelEditing = () => {
    setEdits({});
    setIsEditing(false);
  };

  const save = async () => {
    // The tracked edits already carry their own query/docId, so no key parsing is needed.
    const editList = Object.values(edits).map((e) => ({
      query: e.query,
      docId: e.docId,
      rating: String(e.rating),
    }));

    // Guard: reject out-of-range SCORE0_1 values before hitting the backend.
    const invalid = editList.find(
      (e) =>
        e.rating === '' || Number.isNaN(Number(e.rating)) || Number(e.rating) < 0 || Number(e.rating) > 1
    );
    if (invalid) {
      notifications.toasts.addDanger({
        title: 'Invalid rating',
        text: `Rating for doc ${invalid.docId} must be a number between 0 and 1.`,
      });
      return;
    }

    setIsSaving(true);
    try {
      await service.updateRatings(id, editList, dataSourceId);
      notifications.toasts.addSuccess({
        title: `Updated ${editList.length} rating${editList.length === 1 ? '' : 's'}.`,
      });
      setEdits({});
      setIsEditing(false);
      // Refetch so the recomputed summary counts and failure moves are reflected.
      await refresh();
    } catch (err: any) {
      const status = err?.body?.statusCode || err?.response?.status;
      if (status === 409) {
        notifications.toasts.addWarning({
          title: 'Could not save - the judgment changed',
          text:
            'This judgment is being processed or was edited elsewhere. Reload to see the latest ratings, then reapply your changes.',
        });
      } else {
        notifications.toasts.addDanger({
          title: 'Failed to update ratings',
          text: extractUserMessageFromError(err) || err?.message || 'Unknown error',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Rendered as plain JSX (not <JudgmentViewPane />): defining a component inside the render
  // body gives it a fresh identity every render, so React would unmount/remount the whole
  // subtree on each keystroke - dropping input focus and resetting scroll while editing.
  const renderPane = () => {
    if (!judgment) return null;

    return (
      <EuiForm>
        <EuiFormRow label="Judgment Name" fullWidth>
          <EuiText>{judgment.name}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Type" fullWidth>
          <EuiText>{judgment.type}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Status" fullWidth>
          <EuiText>{judgment.status}</EuiText>
        </EuiFormRow>

        {judgment.status === 'PROCESSING' && (
          <>
            <EuiSpacer size="m" />
            <EuiCallOut
              title="Judgment processing"
              color="primary"
              iconType="clock"
              data-test-subj="judgmentProcessingCallOut"
            >
              <p>Judgment ratings are being generated. This page will update automatically.</p>
            </EuiCallOut>
          </>
        )}

        <EuiFormRow label="Metadata" fullWidth>
          <EuiText>
            {Object.entries(judgment.metadata).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </p>
            ))}
          </EuiText>
        </EuiFormRow>

        <EuiSpacer size="m" />
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>Judgment Ratings</h3>
            </EuiTitle>
          </EuiFlexItem>
          {canEdit && !isEditing && (
            <EuiFlexItem grow={false}>
              <EuiButton
                size="s"
                iconType="pencil"
                onClick={startEditing}
                data-test-subj="editJudgmentRatingsButton"
              >
                Edit
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        {editable && (
          <>
            <EuiSpacer size="xs" />
            <EuiText size="s" color="subdued">
              Update ratings in place, then use the bar at the bottom to save all changes at once.
            </EuiText>
          </>
        )}
        <EuiSpacer size="s" />
        <EuiPanel paddingSize="m" hasShadow={false}>
          <JudgmentRatingsTable
            judgmentRatings={judgment?.judgmentRatings || []}
            editable={editable}
            ratingType={ratingType}
            edits={edits}
            onRatingChange={handleRatingChange}
          />
        </EuiPanel>

        {/* Only show the failed-documents table when the judgment actually has failures. */}
        {Array.isArray(judgment?.judgmentRatings) &&
          judgment.judgmentRatings.some(
            (item: any) => Array.isArray(item.failures) && item.failures.length > 0
          ) && (
            <EuiFormRow
              label="Failed Documents"
              fullWidth
              helpText={
                editable
                  ? 'Assign a rating to a failed document to include it; it moves into the ratings above when saved.'
                  : undefined
              }
            >
              <EuiPanel paddingSize="m" hasShadow={false}>
                <JudgmentFailuresTable
                  judgmentRatings={judgment?.judgmentRatings || []}
                  editable={editable}
                  ratingType={ratingType}
                  edits={edits}
                  onRatingChange={handleRatingChange}
                />
              </EuiPanel>
            </EuiFormRow>
          )}
      </EuiForm>
    );
  };

  if (loading) {
    return <div>Loading judgment data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader pageTitle="Judgment Details" description="View the details of your judgment" />
      <EuiSpacer size="l" />
      <EuiPanel hasBorder={true}>{renderPane()}</EuiPanel>

      {editable && (
        <EuiBottomBar paddingSize="s">
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiText size="s" color="ghost">
                {dirtyCount > 0
                  ? `${dirtyCount} unsaved change${dirtyCount === 1 ? '' : 's'}`
                  : 'Editing ratings'}
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="s" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty
                    color="ghost"
                    size="s"
                    onClick={cancelEditing}
                    isDisabled={isSaving}
                  >
                    Cancel
                  </EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    color="primary"
                    fill
                    size="s"
                    onClick={save}
                    isLoading={isSaving}
                    isDisabled={dirtyCount === 0}
                    data-test-subj="updateJudgmentRatingsButton"
                  >
                    Update ratings
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiBottomBar>
      )}
    </EuiPageTemplate>
  );
};

export default JudgmentView;
