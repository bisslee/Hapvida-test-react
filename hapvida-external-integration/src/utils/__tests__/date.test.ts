import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatRelativeTime, formatTime } from '../date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('deve formatar objeto Date para formato brasileiro', () => {
      const date = new Date('2024-12-25T10:00:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/); // DD/MM/YYYY format
    });

    it('deve formatar string ISO para formato brasileiro', () => {
      const result = formatDate('2024-12-25T10:00:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('formatDateTime', () => {
    it('deve formatar data e hora para formato brasileiro', () => {
      const date = new Date('2024-12-25T14:30:00Z');
      const result = formatDateTime(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}/);
    });

    it('deve formatar string ISO com data e hora', () => {
      const result = formatDateTime('2024-12-25T14:30:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}/);
    });
  });

  describe('formatRelativeTime', () => {
    it('deve formatar timestamp relativo', () => {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const result = formatRelativeTime(oneMinuteAgo);
      expect(result).toContain('há');
    });

    it('deve formatar timestamp futuro como relativo', () => {
      const now = Date.now();
      const oneMinuteLater = now + 60 * 1000;
      const result = formatRelativeTime(oneMinuteLater);
      expect(result).toBeTruthy();
    });
  });

  describe('formatTime', () => {
    it('deve formatar apenas a hora', () => {
      const date = new Date('2024-12-25T14:30:00Z');
      const result = formatTime(date);
      expect(result).toMatch(/\d{2}:\d{2}/); // HH:mm format
    });

    it('deve formatar string ISO para hora', () => {
      const result = formatTime('2024-12-25T14:30:00Z');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });
});

