/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiFormRow,
  EuiSuperSelect,
  EuiText,
  EuiCallOut,
} from '@elastic/eui';
import {
  OutputSchema,
  OUTPUT_SCHEMA_LABELS,
  OUTPUT_SCHEMA_DESCRIPTIONS,
} from '../../types/prompt_template_types';
import { validatePromptTemplate } from '../../utils/validation';

interface PromptPanelProps {
  outputSchema: OutputSchema;
  onOutputSchemaChange: (schema: OutputSchema) => void;
  userInstructions: string;
  onUserInstructionsChange: (instructions: string) => void;
  placeholders: string[];
  disabled?: boolean;
}

const MAX_CHARS = 10000;
const SEARCH_TEXT_TAG = '{{searchText}}';
const HITS_TAG = '{{hits}}';

// Marker characters used inside contentEditable to represent locked tags
const SEARCH_TEXT_MARKER = '\uFFF0';
const HITS_MARKER = '\uFFF1';

const TAG_STYLE: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 8px',
  margin: '0 2px',
  borderRadius: '4px',
  backgroundColor: '#006BB4',
  color: '#fff',
  fontSize: '12px',
  fontFamily: 'monospace',
  fontWeight: 600,
  lineHeight: '20px',
  verticalAlign: 'baseline',
  cursor: 'grab',
  userSelect: 'none',
};

const EDITOR_STYLE: React.CSSProperties = {
  minHeight: '120px',
  padding: '8px 12px',
  border: '1px solid #D3DAE6',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '14px',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  outline: 'none',
  backgroundColor: '#fff',
  overflowY: 'auto',
  maxHeight: '300px',
};

const DEFAULT_TEMPLATE = `SearchText: ${SEARCH_TEXT_TAG}; Hits: ${HITS_TAG}`;

/**
 * Extract plain text from the contentEditable div, converting tag spans back to placeholder strings.
 */
function extractTemplate(container: HTMLElement): string {
  let result = '';
  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagType = el.getAttribute('data-tag');
      if (tagType === 'searchText') {
        result += SEARCH_TEXT_TAG;
      } else if (tagType === 'hits') {
        result += HITS_TAG;
      } else {
        // Recurse for other elements (e.g., <br> → newline)
        if (el.tagName === 'BR') {
          result += '\n';
        } else {
          result += extractTemplate(el);
        }
      }
    }
  });
  return result;
}

/**
 * Check if the editor content contains both required tags.
 */
function hasRequiredTags(container: HTMLElement): { hasSearchText: boolean; hasHits: boolean } {
  const tags = container.querySelectorAll('[data-tag]');
  let hasSearchText = false;
  let hasHits = false;
  tags.forEach((tag) => {
    const type = tag.getAttribute('data-tag');
    if (type === 'searchText') hasSearchText = true;
    if (type === 'hits') hasHits = true;
  });
  return { hasSearchText, hasHits };
}

/**
 * Create a tag span element for use in the contentEditable editor.
 */
function createTagElement(type: 'searchText' | 'hits'): HTMLSpanElement {
  const span = document.createElement('span');
  span.setAttribute('data-tag', type);
  span.setAttribute('contenteditable', 'false');
  span.setAttribute('draggable', 'true');
  span.textContent = type === 'searchText' ? SEARCH_TEXT_TAG : HITS_TAG;
  Object.assign(span.style, TAG_STYLE);
  return span;
}

/**
 * Build the initial HTML content for the editor from a template string.
 */
function templateToHtml(template: string): string {
  return template
    .replace(
      /\{\{searchText\}\}/g,
      `<span data-tag="searchText" contenteditable="false" draggable="true" style="display:inline-block;padding:1px 8px;margin:0 2px;border-radius:4px;background-color:#006BB4;color:#fff;font-size:12px;font-family:monospace;font-weight:600;line-height:20px;vertical-align:baseline;cursor:grab;user-select:none">${SEARCH_TEXT_TAG}</span>`
    )
    .replace(
      /\{\{hits\}\}/g,
      `<span data-tag="hits" contenteditable="false" draggable="true" style="display:inline-block;padding:1px 8px;margin:0 2px;border-radius:4px;background-color:#006BB4;color:#fff;font-size:12px;font-family:monospace;font-weight:600;line-height:20px;vertical-align:baseline;cursor:grab;user-select:none">${HITS_TAG}</span>`
    )
    .replace(/\n/g, '<br>');
}

export const PromptPanel: React.FC<PromptPanelProps> = ({
  outputSchema,
  onOutputSchemaChange,
  userInstructions,
  onUserInstructionsChange,
  placeholders,
  disabled = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = templateToHtml(DEFAULT_TEMPLATE);
      isInitialized.current = true;
      // Trigger initial change
      onUserInstructionsChange(DEFAULT_TEMPLATE);
    }
  }, []);

  // Extract template from editor and notify parent
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    // Ensure required tags still exist — re-insert if removed
    const { hasSearchText, hasHits } = hasRequiredTags(editorRef.current);
    if (!hasSearchText) {
      editorRef.current.appendChild(document.createTextNode(' '));
      editorRef.current.appendChild(createTagElement('searchText'));
    }
    if (!hasHits) {
      editorRef.current.appendChild(document.createTextNode(' '));
      editorRef.current.appendChild(createTagElement('hits'));
    }

    const template = extractTemplate(editorRef.current);
    onUserInstructionsChange(template);
  }, [onUserInstructionsChange]);

  // Prevent deleting tag elements via keyboard
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    if (e.key === 'Backspace') {
      // Check if the character before cursor is a tag
      const node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
        const prev = node.previousSibling as HTMLElement;
        if (prev && prev.getAttribute?.('data-tag')) {
          e.preventDefault();
          return;
        }
      }
      // Check if selection is right after a tag element
      if (node.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from((node as HTMLElement).childNodes);
        const idx = range.startOffset - 1;
        if (idx >= 0 && children[idx]) {
          const prevChild = children[idx] as HTMLElement;
          if (prevChild.getAttribute?.('data-tag')) {
            e.preventDefault();
            return;
          }
        }
      }
    }

    if (e.key === 'Delete') {
      const node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE && range.startOffset === (node.textContent?.length || 0)) {
        const next = node.nextSibling as HTMLElement;
        if (next && next.getAttribute?.('data-tag')) {
          e.preventDefault();
          return;
        }
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from((node as HTMLElement).childNodes);
        const nextChild = children[range.startOffset] as HTMLElement;
        if (nextChild && nextChild.getAttribute?.('data-tag')) {
          e.preventDefault();
          return;
        }
      }
    }
  }, [disabled]);

  // Handle drag and drop of tags
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const tagType = target.getAttribute('data-tag');
    if (tagType) {
      e.dataTransfer.setData('text/plain', tagType);
      e.dataTransfer.effectAllowed = 'move';
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const tagType = e.dataTransfer.getData('text/plain') as 'searchText' | 'hits';
    if (tagType !== 'searchText' && tagType !== 'hits') return;
    if (!editorRef.current) return;

    // Remove the old tag
    const oldTag = editorRef.current.querySelector(`[data-tag="${tagType}"]`);
    if (oldTag) oldTag.remove();

    // Insert at drop position
    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (range) {
      range.insertNode(createTagElement(tagType));
    } else {
      editorRef.current.appendChild(createTagElement(tagType));
    }

    handleInput();
  }, [handleInput]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Prevent paste of HTML — only allow plain text
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // Compute template for validation
  const currentTemplate = useMemo(() => {
    if (editorRef.current) {
      return extractTemplate(editorRef.current);
    }
    return DEFAULT_TEMPLATE;
  }, [userInstructions]); // Re-compute when parent state changes

  // Validate the template
  const validationWarnings = useMemo(
    () => validatePromptTemplate(currentTemplate),
    [currentTemplate]
  );

  // Character count
  const charCount = currentTemplate.length;
  const isOverLimit = charCount > MAX_CHARS;

  // Check for duplicate placeholders in user-typed text (excluding locked tags)
  const getDuplicatePlaceholders = (): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    // Remove the locked tags from the template before checking
    const userText = currentTemplate
      .replace(/\{\{searchText\}\}/g, '')
      .replace(/\{\{hits\}\}/g, '');
    const matches = userText.matchAll(regex);
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const match of matches) {
      const placeholder = match[1].trim();
      if (seen.has(placeholder)) duplicates.add(placeholder);
      else seen.add(placeholder);
    }
    return Array.from(duplicates);
  };

  const duplicatePlaceholders = getDuplicatePlaceholders();
  const hasDuplicates = duplicatePlaceholders.length > 0;

  const outputSchemaOptions = Object.values(OutputSchema).map((schema) => ({
    value: schema,
    inputDisplay: OUTPUT_SCHEMA_LABELS[schema],
    dropdownDisplay: (
      <>
        <strong>{OUTPUT_SCHEMA_LABELS[schema]}</strong>
        <EuiText size="s" color="subdued">
          <p>{OUTPUT_SCHEMA_DESCRIPTIONS[schema]}</p>
        </EuiText>
      </>
    ),
  }));

  return (
    <EuiPanel paddingSize="l">
      <EuiTitle size="s">
        <h3>Prompt Configuration</h3>
      </EuiTitle>
      <EuiSpacer size="m" />

      <EuiFormRow
        label="Output Schema"
        helpText="Select the rating format for LLM judgment output"
        fullWidth
      >
        <EuiSuperSelect
          options={outputSchemaOptions}
          valueOfSelected={outputSchema}
          onChange={onOutputSchemaChange}
          disabled={disabled}
          fullWidth
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFormRow
        label="Prompt Template"
        helpText="Edit the template around the locked tags. Drag tags to reposition them."
        fullWidth
      >
        <div
          ref={editorRef}
          data-test-subj="promptTemplateEditor"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onPaste={handlePaste}
          style={{
            ...EDITOR_STYLE,
            ...(disabled ? { backgroundColor: '#F5F7FA', cursor: 'not-allowed' } : {}),
          }}
          role="textbox"
          aria-label="Prompt template editor"
          aria-multiline="true"
        />
      </EuiFormRow>

      <EuiSpacer size="s" />

      {/* Character count */}
      <EuiText size="xs" color={isOverLimit ? 'danger' : 'subdued'}>
        <p>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
        </p>
      </EuiText>

      <EuiSpacer size="m" />

      {/* Validation warnings */}
      {validationWarnings.map((warning, index) => (
        <React.Fragment key={index}>
          <EuiCallOut title={warning} color="warning" iconType="alert" size="s" />
          <EuiSpacer size="s" />
        </React.Fragment>
      ))}

      {/* Duplicate placeholder warning */}
      {hasDuplicates && (
        <>
          <EuiCallOut
            title="Duplicate placeholders detected"
            color="warning"
            iconType="alert"
            size="s"
          >
            <p>
              The following placeholders appear multiple times:{' '}
              {duplicatePlaceholders.map((p, i) => (
                <React.Fragment key={p}>
                  <strong>{`{{${p}}}`}</strong>
                  {i < duplicatePlaceholders.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
              . Each placeholder should only be used once to avoid confusion.
            </p>
          </EuiCallOut>
          <EuiSpacer size="s" />
        </>
      )}

      {/* Available Variables Reference */}
      <EuiSpacer size="m" />
      <EuiTitle size="xxs">
        <h5>Available Variables</h5>
      </EuiTitle>
      <EuiSpacer size="xs" />
      <EuiText size="xs">
        <p>
          <strong>Built-in Variables:</strong>
        </p>
        <ul>
          <li><code>{'{{searchText}}'}</code> — The search query (required, locked in editor)</li>
          <li><code>{'{{hits}}'}</code> — The search results as JSON (required, locked in editor)</li>
        </ul>
        <p>
          <strong>Custom Query Set Fields:</strong>
        </p>
        <p>
          Any column defined in your query set automatically becomes a <code>{'{{columnName}}'}</code> placeholder.
          For example, if your query set has columns named <code>category</code>, <code>targetAudience</code>,
          or <code>referenceAnswer</code>, you can use <code>{'{{category}}'}</code>, <code>{'{{targetAudience}}'}</code>,
          and <code>{'{{referenceAnswer}}'}</code> in your template.
        </p>
        <p>
          To use a placeholder, the corresponding column must exist in your query set.
          If a field is not present for a given query, it resolves to an empty string.
        </p>
        <p>
          <strong>Example</strong> — template with custom fields:
        </p>
        <pre style={{ fontSize: '12px', padding: '8px', backgroundColor: '#F5F7FA', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
{`Given the query: {{searchText}}
Category: {{category}}
Reference: {{referenceAnswer}}

Rate relevance from 0.0 to 1.0.

Documents: {{hits}}`}
        </pre>
      </EuiText>
    </EuiPanel>
  );
};
