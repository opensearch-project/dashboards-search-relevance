/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
    EuiButton,
    EuiFlexGroup,
    EuiFlexItem,
    EuiFieldSearch,
} from '@elastic/eui';

interface PreviewSearchToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
}

export const PreviewSearchToolbar: React.FC<PreviewSearchToolbarProps> = ({
    search,
    onSearchChange,
    onExpandAll,
    onCollapseAll,
}) => {
    return (
        <EuiFlexGroup gutterSize="s" alignItems="center" justifyContent="spaceBetween">
            <EuiFlexItem grow={true}>
                <EuiFieldSearch
                    fullWidth
                    compressed
                    placeholder="Search query, doc ID, or rating (Ctrl+F also works)"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="s">
                    <EuiFlexItem grow={false}>
                        <EuiButton size="s" onClick={onExpandAll}>
                            Expand All
                        </EuiButton>
                    </EuiFlexItem>

                    <EuiFlexItem grow={false}>
                        <EuiButton size="s" onClick={onCollapseAll}>
                            Collapse All
                        </EuiButton>
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiFlexItem>
        </EuiFlexGroup>
    );
};
