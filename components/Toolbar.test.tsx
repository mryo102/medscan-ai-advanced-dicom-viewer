import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toolbar from './Toolbar';

describe('Toolbar Component', () => {
    const mockSetActiveTool = vi.fn();
    const mockOnReset = vi.fn();
    const mockOnToggleSidebar = vi.fn();

    const defaultProps = {
        activeTool: 'window' as const,
        setActiveTool: mockSetActiveTool,
        onReset: mockOnReset,
        onToggleSidebar: mockOnToggleSidebar,
        isSidebarOpen: true,
        fileName: 'test.dcm',
    };

    it('renders correctly with file name', () => {
        render(<Toolbar {...defaultProps} />);
        expect(screen.getByText('test.dcm')).toBeInTheDocument();
    });

    it('calls setActiveTool when a tool is clicked', () => {
        render(<Toolbar {...defaultProps} />);
        const panButton = screen.getByTitle('Pan');
        fireEvent.click(panButton);
        expect(mockSetActiveTool).toHaveBeenCalledWith('pan');
    });

    it('calls onReset when reset button is clicked', () => {
        render(<Toolbar {...defaultProps} />);
        const resetButton = screen.getByTitle('Reset View');
        fireEvent.click(resetButton);
        expect(mockOnReset).toHaveBeenCalled();
    });
});
