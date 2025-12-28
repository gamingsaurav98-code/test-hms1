<?php

namespace App\Services;

use Exception;

/**
 * Custom exception for invalid rules
 */
class InvalidRuleException extends Exception
{
    public function __construct($message = "Invalid rule format")
    {
        parent::__construct($message);
    }
}

/**
 * HostelRuleEngine - Interprets human-style rules for student check-in/out prorating
 *
 * This class provides safe, regex-based parsing of natural language rules
 * without using eval() for security and performance.
 */
class HostelRuleEngine
{
    /**
     * Mapping of number words to integers
     */
    private const NUMBER_WORDS = [
        'one' => 1, 'two' => 2, 'three' => 3, 'four' => 4, 'five' => 5,
        'six' => 6, 'seven' => 7, 'eight' => 8, 'nine' => 9, 'ten' => 10,
        'eleven' => 11, 'twelve' => 12, 'thirteen' => 13, 'fourteen' => 14, 'fifteen' => 15,
        'sixteen' => 16, 'seventeen' => 17, 'eighteen' => 18, 'nineteen' => 19, 'twenty' => 20,
        'twenty-one' => 21, 'twenty-two' => 22, 'twenty-three' => 23, 'twenty-four' => 24, 'twenty-five' => 25,
        'twenty-six' => 26, 'twenty-seven' => 27, 'twenty-eight' => 28, 'twenty-nine' => 29, 'thirty' => 30,
    ];

    /**
     * Noise words to strip from the rule string
     */
    private const NOISE_WORDS = [
        'the', 'student', 'total', 'days', 'day', 'checkout', 'checkin', 'stay', 'duration',
    ];

    /**
     * Mapping of operator phrases to symbols
     */
    private const OPERATOR_PHRASES = [
        'less than' => '<',
        'greater than' => '>',
        'equal to' => '==',
        'is equal to' => '==',
        'is' => '==',
        'equals' => '==',
        'not equal to' => '!=',
        'is not' => '!=',
        'is not equal to' => '!=',
        'less than or equal to' => '<=',
        'greater than or equal to' => '>=',
        'at least' => '>=',
        'at most' => '<=',
        'more than' => '>',
        'fewer than' => '<',
    ];

    /**
     * Normalize the rule string: convert to lowercase, replace phrases, convert numbers, strip noise
     */
    private function normalizeRule(string $rule): string
    {
        $rule = strtolower(trim($rule));

        // Replace operator phrases with symbols
        foreach (self::OPERATOR_PHRASES as $phrase => $symbol) {
            $rule = str_replace($phrase, $symbol, $rule);
        }

        // Convert number words to digits
        foreach (self::NUMBER_WORDS as $word => $number) {
            $rule = str_replace($word, (string)$number, $rule);
        }

        // Strip noise words
        foreach (self::NOISE_WORDS as $noise) {
            $rule = str_replace(' ' . $noise . ' ', ' ', $rule);
            $rule = str_replace($noise . ' ', '', $rule);
            $rule = str_replace(' ' . $noise, '', $rule);
        }

        // Clean up extra spaces
        $rule = preg_replace('/\s+/', ' ', $rule);
        $rule = trim($rule);

        return $rule;
    }

    /**
     * Parse the normalized rule using regex
     * Expected format: duration [operator] [number]
     *
     * Regex pattern explanation:
     * ^duration\s*([<>=!]+)\s*(\d+)$
     * - ^ : Start of string
     * - duration : Literal word 'duration'
     * - \s* : Zero or more whitespace
     * - ([<>=!]+) : Capture group for operator (one or more of < > = !)
     * - \s* : Zero or more whitespace
     * - (\d+) : Capture group for one or more digits
     * - $ : End of string
     *
     * This ensures strict format: only 'duration' as variable, valid operators, numeric value
     */
    private function parseRule(string $normalizedRule): array
    {
        $pattern = '/^duration\s*([<>=!]+)\s*(\d+)$/';

        if (!preg_match($pattern, $normalizedRule, $matches)) {
            throw new InvalidRuleException("Rule must be in format 'duration [operator] [number]', e.g., 'duration >= 15'");
        }

        $operator = $matches[1];
        $value = (int)$matches[2];

        // Validate operator
        $validOperators = ['<', '>', '==', '<=', '>=', '!='];
        if (!in_array($operator, $validOperators)) {
            throw new InvalidRuleException("Invalid operator: {$operator}");
        }

        return [
            'variable' => 'duration',
            'operator' => $operator,
            'value' => $value,
        ];
    }

    /**
     * Evaluate if the actual days match the rule
     */
    public function evaluate(int $actualDays, string $ruleString): bool
    {
        $normalized = $this->normalizeRule($ruleString);
        $parsed = $this->parseRule($normalized);

        $operator = $parsed['operator'];
        $value = $parsed['value'];

        // Use switch for safe comparison
        switch ($operator) {
            case '<':
                return $actualDays < $value;
            case '>':
                return $actualDays > $value;
            case '==':
                return $actualDays == $value;
            case '<=':
                return $actualDays <= $value;
            case '>=':
                return $actualDays >= $value;
            case '!=':
                return $actualDays != $value;
            default:
                throw new InvalidRuleException("Unsupported operator: {$operator}");
        }
    }

    /**
     * Example usage in a Laravel chunk loop for memory efficiency
     *
     * This demonstrates how to apply the rule engine to a large dataset
     * without loading everything into memory at once.
     */
    public static function exampleUsageInChunk()
    {
        // Assuming you have a model like StudentCheckout with a 'duration_days' field
        // and you want to apply prorating based on a rule

        $ruleString = 'checkout duration >= 15 days';
        $engine = new self();

        // Use chunk for memory efficiency
        \App\Models\StudentCheckout::chunk(100, function ($checkouts) use ($engine, $ruleString) {
            foreach ($checkouts as $checkout) {
                $actualDays = $checkout->duration_days; // Assuming this field exists

                if ($engine->evaluate($actualDays, $ruleString)) {
                    // Apply prorating logic here
                    // e.g., $checkout->prorated_amount = calculateProrate($checkout);
                    // $checkout->save();
                    echo "Applying prorate to checkout ID: {$checkout->id}\n";
                }
            }
        });

        // Alternative: use cursor() for even larger datasets (Laravel 8+)
        // \App\Models\StudentCheckout::cursor()->each(function ($checkout) use ($engine, $ruleString) {
        //     if ($engine->evaluate($checkout->duration_days, $ruleString)) {
        //         // Apply logic
        //     }
        // });
    }
}