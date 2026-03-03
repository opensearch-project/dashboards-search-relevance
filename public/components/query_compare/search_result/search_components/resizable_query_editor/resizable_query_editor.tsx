/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCodeEditor } from '@elastic/eui';
import React, { useState, useCallback, useRef, useEffect } from 'react';

import './resizable_query_editor.scss';

/** Minimum height in pixels for the query editor (matches original 10rem) */
export const MIN_EDITOR_HEIGHT = 160;
/** Maximum height in pixels for the query editor */
export const MAX_EDITOR_HEIGHT = 600;
/** Default height in pixels for the query editor */
export const DEFAULT_EDITOR_HEIGHT = 160;

export interface ResizableQueryEditorProps {
  /** The current value of the code editor */
  value: string;
  /** Callback when the value changes */
  onChange: (value: string) => void;
  /** Callback when the editor loses focus */
  onBlur?: () => void;
  /** Aria label for accessibility */
  'aria-label'?: string;
  /** 
   * Controlled height of the editor in pixels. 
   * If provided, the component becomes controlled.
   */
  height?: number;
  /**
   * Callback when the height changes during resize.
   * Required when using controlled height.
   */
  onHeightChange?: (newHeight: number) => void;
  /** Data test subject for testing */
  'data-test-subj'?: string;
}

/**
 * A resizable query editor component that wraps EuiCodeEditor
 * and allows users to drag a handle to resize the editor vertically.
 * 
 * Can be used in controlled mode (with height + onHeightChange props)
 * or uncontrolled mode (using internal state).
 */
export const ResizableQueryEditor: React.FC<ResizableQueryEditorProps> = ({
  value,
  onChange,
  onBlur,
  'aria-label': ariaLabel = 'Code Editor',
  height: controlledHeight,
  onHeightChange,
  'data-test-subj': dataTestSubj,
}) => {
  // Use internal state only when not controlled
  const [internalHeight, setInternalHeight] = useState<number>(DEFAULT_EDITOR_HEIGHT);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  // Determine if we're in controlled mode
  const isControlled = controlledHeight !== undefined;
  const currentHeight = isControlled ? controlledHeight : internalHeight;

  /**
   * Updates the height, calling the appropriate handler based on controlled/uncontrolled mode
   */
  const updateHeight = useCallback(
    (newHeight: number) => {
      if (isControlled && onHeightChange) {
        onHeightChange(newHeight);
      } else {
        setInternalHeight(newHeight);
      }
    },
    [isControlled, onHeightChange]
  );

  /**
   * Clamps a height value between MIN_EDITOR_HEIGHT and MAX_EDITOR_HEIGHT
   */
  const clampHeight = useCallback((newHeight: number): number => {
    return Math.min(Math.max(newHeight, MIN_EDITOR_HEIGHT), MAX_EDITOR_HEIGHT);
  }, []);

  /**
   * Handles the start of a resize operation via mouse
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startYRef.current = e.clientY;
      startHeightRef.current = currentHeight;
    },
    [currentHeight]
  );

  /**
   * Handles the start of a resize operation via touch
   */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      setIsResizing(true);
      startYRef.current = e.touches[0].clientY;
      startHeightRef.current = currentHeight;
    },
    [currentHeight]
  );

  /**
   * Handles keyboard-based resizing for accessibility
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const RESIZE_STEP = 20;
      let newHeight = currentHeight;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newHeight = currentHeight - RESIZE_STEP;
          break;
        case 'ArrowDown':
          e.preventDefault();
          newHeight = currentHeight + RESIZE_STEP;
          break;
        case 'Home':
          e.preventDefault();
          newHeight = MIN_EDITOR_HEIGHT;
          break;
        case 'End':
          e.preventDefault();
          newHeight = MAX_EDITOR_HEIGHT;
          break;
        default:
          return;
      }

      updateHeight(clampHeight(newHeight));
    },
    [currentHeight, clampHeight, updateHeight]
  );

  // Handle mouse/touch move and end events
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startYRef.current;
      const newHeight = startHeightRef.current + deltaY;
      updateHeight(clampHeight(newHeight));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const deltaY = e.touches[0].clientY - startYRef.current;
      const newHeight = startHeightRef.current + deltaY;
      updateHeight(clampHeight(newHeight));
    };

    const handleEnd = () => {
      setIsResizing(false);
    };

    // Add listeners to document to capture events outside the component
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [isResizing, clampHeight, updateHeight]);

  // Prevent text selection during resize
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  return (
    <div
      className="resizableQueryEditor"
      data-test-subj={dataTestSubj}
    >
      <div className="resizableQueryEditor__editorWrapper">
        <EuiCodeEditor
          mode="json"
          theme="textmate"
          width="100%"
          height={`${currentHeight}px`}
          value={value}
          onChange={onChange}
          showPrintMargin={false}
          setOptions={{
            fontSize: '14px',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
          }}
          aria-label={ariaLabel}
          onBlur={onBlur}
          tabSize={2}
        />
      </div>
      <div
        className={`resizableQueryEditor__resizeHandle ${
          isResizing ? 'resizableQueryEditor__resizeHandle--active' : ''
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Resize query editor"
        aria-valuenow={currentHeight}
        aria-valuemin={MIN_EDITOR_HEIGHT}
        aria-valuemax={MAX_EDITOR_HEIGHT}
        aria-orientation="vertical"
        tabIndex={0}
        data-test-subj={dataTestSubj ? `${dataTestSubj}-resizeHandle` : 'queryEditorResizeHandle'}
      >
        <div className="resizableQueryEditor__resizeHandleBar" />
      </div>
    </div>
  );
};