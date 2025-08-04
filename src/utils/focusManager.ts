import { Platform } from 'react-native';

export interface FocusState {
  currentRow: number;
  currentColumn: number;
  focusedElement: string | null;
  isNavigating: boolean;
}

export class FocusManager {
  private static instance: FocusManager;
  private focusState: FocusState = {
    currentRow: 0,
    currentColumn: 0,
    focusedElement: null,
    isNavigating: false,
  };

  private listeners: Set<(state: FocusState) => void> = new Set();

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  // Subscribe to focus state changes
  subscribe(listener: (state: FocusState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Update focus state
  updateFocus(newState: Partial<FocusState>): void {
    this.focusState = { ...this.focusState, ...newState };
    this.notifyListeners();
  }

  // Get current focus state
  getFocusState(): FocusState {
    return { ...this.focusState };
  }

  // Move focus in a specific direction
  moveFocus(direction: 'up' | 'down' | 'left' | 'right', gridSize: { rows: number; columns: number }): void {
    const { currentRow, currentColumn } = this.focusState;
    let newRow = currentRow;
    let newColumn = currentColumn;

    switch (direction) {
      case 'up':
        newRow = Math.max(0, currentRow - 1);
        break;
      case 'down':
        newRow = Math.min(gridSize.rows - 1, currentRow + 1);
        break;
      case 'left':
        newColumn = Math.max(0, currentColumn - 1);
        break;
      case 'right':
        newColumn = Math.min(gridSize.columns - 1, currentColumn + 1);
        break;
    }

    this.updateFocus({
      currentRow: newRow,
      currentColumn: newColumn,
      focusedElement: `grid-${newRow}-${newColumn}`,
    });
  }

  // Set focus to a specific element
  setFocus(elementId: string, row?: number, column?: number): void {
    this.updateFocus({
      focusedElement: elementId,
      currentRow: row ?? this.focusState.currentRow,
      currentColumn: column ?? this.focusState.currentColumn,
    });
  }

  // Reset focus state
  resetFocus(): void {
    this.updateFocus({
      currentRow: 0,
      currentColumn: 0,
      focusedElement: null,
      isNavigating: false,
    });
  }

  // Check if TV platform
  isTV(): boolean {
    return Platform.isTV;
  }

  // Get platform-specific focus properties
  getFocusProps(elementId: string, isFocused: boolean = false) {
    if (!this.isTV()) {
      return {};
    }

    return {
      focusable: true,
      hasTVPreferredFocus: isFocused,
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: elementId,
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.focusState);
    });
  }
}

// Hook to use focus manager
export const useFocusManager = () => {
  const focusManager = FocusManager.getInstance();
  
  return {
    focusManager,
    getFocusState: () => focusManager.getFocusState(),
    updateFocus: (newState: Partial<FocusState>) => focusManager.updateFocus(newState),
    moveFocus: (direction: 'up' | 'down' | 'left' | 'right', gridSize: { rows: number; columns: number }) => 
      focusManager.moveFocus(direction, gridSize),
    setFocus: (elementId: string, row?: number, column?: number) => 
      focusManager.setFocus(elementId, row, column),
    resetFocus: () => focusManager.resetFocus(),
    getFocusProps: (elementId: string, isFocused: boolean = false) => 
      focusManager.getFocusProps(elementId, isFocused),
    isTV: () => focusManager.isTV(),
  };
}; 