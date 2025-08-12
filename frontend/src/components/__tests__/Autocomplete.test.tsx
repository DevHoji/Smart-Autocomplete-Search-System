/**
 * Unit tests for Autocomplete component
 * Tests user interactions, keyboard navigation, and API integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Autocomplete from '../Autocomplete';
import { apiService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
};

const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => []),
  onvoiceschanged: null,
};

// @ts-ignore
global.SpeechRecognition = jest.fn(() => mockSpeechRecognition);
// @ts-ignore
global.webkitSpeechRecognition = jest.fn(() => mockSpeechRecognition);
// @ts-ignore
global.speechSynthesis = mockSpeechSynthesis;
// @ts-ignore
global.SpeechSynthesisUtterance = jest.fn();

describe('Autocomplete Component', () => {
  const mockOnSelect = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.getSuggestions.mockResolvedValue({
      suggestions: [
        { word: 'programming', freq: 85, category: 'technology', synonyms: ['coding'] },
        { word: 'program', freq: 70, category: 'technology', synonyms: [] },
        { word: 'progress', freq: 45, category: 'general', synonyms: ['advancement'] },
      ],
      prefix: 'prog',
      total: 3,
      fuzzy: false,
    });
  });

  const renderAutocomplete = (props = {}) => {
    return render(
      <Autocomplete
        placeholder="Search..."
        maxSuggestions={10}
        onSelect={mockOnSelect}
        onSearch={mockOnSearch}
        {...props}
      />
    );
  };

  describe('Basic Rendering', () => {
    test('renders search input with placeholder', () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    test('renders voice input button', () => {
      renderAutocomplete();
      
      const voiceButton = screen.getByLabelText(/voice input/i);
      expect(voiceButton).toBeInTheDocument();
    });

    test('renders image OCR button', () => {
      renderAutocomplete();
      
      const ocrButton = screen.getByLabelText(/extract text from image/i);
      expect(ocrButton).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('displays suggestions when typing', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'prog');
      });

      await waitFor(() => {
        expect(screen.getByText('programming')).toBeInTheDocument();
        expect(screen.getByText('program')).toBeInTheDocument();
        expect(screen.getByText('progress')).toBeInTheDocument();
      });
    });

    test('calls API service with correct parameters', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'prog');
      });

      await waitFor(() => {
        expect(mockApiService.getSuggestions).toHaveBeenCalledWith('prog', 10, undefined);
      });
    });

    test('debounces API calls', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'p');
        await userEvent.type(input, 'r');
        await userEvent.type(input, 'o');
        await userEvent.type(input, 'g');
      });

      // Should only call API once after debounce delay
      await waitFor(() => {
        expect(mockApiService.getSuggestions).toHaveBeenCalledTimes(1);
      });
    });

    test('handles empty search results', async () => {
      mockApiService.getSuggestions.mockResolvedValue({
        suggestions: [],
        prefix: 'xyz',
        total: 0,
        fuzzy: false,
      });

      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'xyz');
      });

      await waitFor(() => {
        expect(screen.getByText(/no suggestions found/i)).toBeInTheDocument();
      });
    });

    test('handles API errors gracefully', async () => {
      mockApiService.getSuggestions.mockRejectedValue(new Error('Network error'));

      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'test');
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    test('navigates suggestions with arrow keys', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'prog');
      });

      await waitFor(() => {
        expect(screen.getByText('programming')).toBeInTheDocument();
      });

      // Navigate down
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      const firstSuggestion = screen.getByText('programming').closest('[role="option"]');
      expect(firstSuggestion).toHaveAttribute('aria-selected', 'true');

      // Navigate down again
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      const secondSuggestion = screen.getByText('program').closest('[role="option"]');
      expect(secondSuggestion).toHaveAttribute('aria-selected', 'true');
    });

    test('selects suggestion with Enter key', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'prog');
      });

      await waitFor(() => {
        expect(screen.getByText('programming')).toBeInTheDocument();
      });

      // Navigate to first suggestion and select
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnSelect).toHaveBeenCalledWith({
        word: 'programming',
        freq: 85,
        category: 'technology',
        synonyms: ['coding'],
      });
    });

    test('closes suggestions with Escape key', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'prog');
      });

      await waitFor(() => {
        expect(screen.getByText('programming')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('programming')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mouse Interactions', () => {
    test('selects suggestion on click', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'prog');
      });

      await waitFor(() => {
        expect(screen.getByText('programming')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('programming'));

      expect(mockOnSelect).toHaveBeenCalledWith({
        word: 'programming',
        freq: 85,
        category: 'technology',
        synonyms: ['coding'],
      });
    });

    test('highlights suggestion on hover', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'prog');
      });

      await waitFor(() => {
        expect(screen.getByText('programming')).toBeInTheDocument();
      });

      const suggestion = screen.getByText('programming').closest('[role="option"]');
      
      await userEvent.hover(suggestion!);
      
      expect(suggestion).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Clear Functionality', () => {
    test('shows clear button when input has text', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'test');
      });

      expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument();
    });

    test('clears input when clear button is clicked', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'test');
      });

      const clearButton = screen.getByLabelText(/clear search/i);
      await userEvent.click(clearButton);

      expect(input).toHaveValue('');
    });
  });

  describe('Loading States', () => {
    test('shows loading indicator during API call', async () => {
      // Mock a delayed API response
      mockApiService.getSuggestions.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          suggestions: [],
          prefix: 'test',
          total: 0,
          fuzzy: false,
        }), 100))
      );

      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'test');
      });

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      expect(input).toHaveAttribute('role', 'combobox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    test('updates ARIA attributes when suggestions are shown', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'prog');
      });

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('suggestions have proper ARIA roles', async () => {
      renderAutocomplete();
      
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        await userEvent.type(input, 'prog');
      });

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();
        
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(3);
      });
    });
  });
});
