import { useState, useEffect } from 'react';

interface ParsedRule {
  operator: string | null;
  days: number | null;
  isValid: boolean;
  normalized: string;
}

export function useRuleParser(condition: string): ParsedRule {
  const [parsed, setParsed] = useState<ParsedRule>({ operator: null, days: null, isValid: false, normalized: '' });

  useEffect(() => {
    const normalizeRule = (rule: string): string => {
      let normalized = rule.toLowerCase().trim();

      // Mapping of operator phrases to symbols
      const operatorPhrases: Record<string, string> = {
        'less than': '<',
        'greater than': '>',
        'equal to': '==',
        'is equal to': '==',
        'is': '==',
        'equals': '==',
        'not equal to': '!=',
        'is not': '!=',
        'is not equal to': '!=',
        'less than or equal to': '<=',
        'greater than or equal to': '>=',
        'at least': '>=',
        'at most': '<=',
        'more than': '>',
        'fewer than': '<',
      };

      // Mapping of number words to integers
      const numberWords: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
        'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
        'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23, 'twenty-four': 24, 'twenty-five': 25,
        'twenty-six': 26, 'twenty-seven': 27, 'twenty-eight': 28, 'twenty-nine': 29, 'thirty': 30,
      };

      // Noise words to strip
      const noiseWords = [
        'the', 'student', 'total', 'days', 'day', 'checkout', 'checkin', 'stay', 'duration', 'checkoout',
      ];

      // Replace operator phrases
      for (const [phrase, symbol] of Object.entries(operatorPhrases)) {
        normalized = normalized.replace(new RegExp(phrase, 'g'), symbol);
      }

      // Convert number words to digits
      for (const [word, num] of Object.entries(numberWords)) {
        normalized = normalized.replace(new RegExp(`\\b${word}\\b`, 'g'), num.toString());
      }

      // Strip noise words
      for (const noise of noiseWords) {
        normalized = normalized.replace(new RegExp(`\\b${noise}\\b`, 'g'), '');
      }

      // Clean up extra spaces
      normalized = normalized.replace(/\s+/g, ' ').trim();

      return normalized;
    };

    const parseNormalizedRule = (normalized: string): { operator: string | null; days: number | null } => {
      // Regex to match: duration [operator] [number]      // If not starting with duration, prepend it
      if (!normalized.startsWith('duration')) {
        normalized = 'duration ' + normalized;
      }
      const pattern = /^duration\s*([<>=!]+)\s*(\d+)$/;
      const match = normalized.match(pattern);

      if (!match) {
        return { operator: null, days: null };
      }

      const operator = match[1];
      const days = parseInt(match[2], 10);

      // Validate operator
      const validOperators = ['<', '>', '==', '<=', '>=', '!='];
      if (!validOperators.includes(operator)) {
        return { operator: null, days: null };
      }

      return { operator, days };
    };

    const normalized = normalizeRule(condition);
    const { operator, days } = parseNormalizedRule(normalized);
    const isValid = operator !== null && days !== null;

    setParsed({ operator, days, isValid, normalized });
  }, [condition]);

  return parsed;
}