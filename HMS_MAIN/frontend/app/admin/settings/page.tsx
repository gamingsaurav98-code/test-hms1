'use client';

import { useState, useEffect } from 'react';
import { useRuleParser } from '@/hooks/useRuleParser';
import { Check, X, Edit, Trash } from 'lucide-react';
import { studentCheckoutRuleApi, StudentCheckoutRule } from '@/lib/api/student-checkincheckout.api';

export default function SettingsPage() {
  const [rules, setRules] = useState<StudentCheckoutRule[]>([]);
  const [condition, setCondition] = useState('');
  const [percentage, setPercentage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [universalRule, setUniversalRule] = useState('');
  const [universalRuleError, setUniversalRuleError] = useState('');

  const parsed = useRuleParser(condition);
  const universalParsed = useRuleParser(universalRule);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await studentCheckoutRuleApi.getCheckoutRules(1, { all: true });
      setRules(response.data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      setRules([]);
    }
  };

  const saveRule = async () => {
    if (!parsed.isValid || !percentage) return;

    try {
      const payload = {
        student_id: null, // Global rule
        name: condition,
        description: condition,
        is_active: true,
        deduction_type: 'percentage' as const,
        deduction_value: parseInt(percentage),
        min_days: parsed.days || undefined,
        max_days: undefined,
        priority: 1,
      };

      if (editingId) {
        await studentCheckoutRuleApi.updateCheckoutRule(editingId, payload);
      } else {
        await studentCheckoutRuleApi.createCheckoutRule(payload);
      }

      await fetchRules();
      setCondition('');
      setPercentage('');
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save rule:', error);
    }
  };

  const deleteRule = async (id: string) => {
    try {
      await studentCheckoutRuleApi.deleteCheckoutRule(id);
      await fetchRules();
    } catch (error) {
      console.error('Failed to delete rule:', error);
      setRules(rules.filter(rule => rule.id !== id));
    }
  };

  const editRule = (rule: StudentCheckoutRule) => {
    setCondition(rule.name || '');
    setPercentage(rule.deduction_value?.toString() || '');
    setEditingId(rule.id);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Universal Rule Architect</h1>
        <p className="text-gray-600">Configure natural language rules for student check-out deductions</p>
      </div>

      {/* Universal Rule Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Universal Prorate Rule</h2>
        <p className="text-gray-600 mb-4">Set a global rule for prorating (e.g., "checkout duration {'>'}= 15 days") and the deduction percentage. This will be used by the HostelRuleEngine.</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="universalRule" className="block text-sm font-medium text-gray-700 mb-2">
              Universal Rule
            </label>
            <input
              id="universalRule"
              value={universalRule}
              onChange={(e) => setUniversalRule(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., checkout duration >= fifteen days"
            />
          </div>
          <div>
            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-2">
              Deduction Percentage
            </label>
            <input
              id="percentage"
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., 10"
              min="0"
              max="100"
            />
          </div>

          {universalRuleError && <p className="text-red-500 text-sm">{universalRuleError}</p>}

          <div className="flex space-x-4">
            <button
              onClick={async () => {
                if (universalParsed.isValid && percentage) {
                  let min_days: number | undefined;
                  let max_days: number | undefined;
                  if (universalParsed.operator === '>=') {
                    min_days = universalParsed.days!;
                  } else if (universalParsed.operator === '<=') {
                    max_days = universalParsed.days!;
                  } else {
                    setUniversalRuleError('Only >= and <= operators are supported for universal rule');
                    return;
                  }
                  try {
                    await studentCheckoutRuleApi.createCheckoutRule({
                      student_id: null,
                      name: universalRule,
                      description: universalRule,
                      is_active: true,
                      deduction_type: 'percentage',
                      deduction_value: parseInt(percentage),
                      min_days,
                      max_days,
                      priority: 1,
                    });
                    await fetchRules();
                    setUniversalRule('');
                    setPercentage('');
                    setUniversalRuleError('');
                    alert('Universal rule saved as a deduction rule!');
                  } catch (error) {
                    console.error('Failed to save rule:', error);
                    setUniversalRuleError('Failed to save rule');
                  }
                } else if (!universalParsed.isValid) {
                  setUniversalRuleError('Invalid rule format');
                } else {
                  setUniversalRuleError('Please enter a percentage');
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Universal Rule
            </button>

          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Existing Rules</h2>

          {rules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No rules defined yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first rule using the form</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deduction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {rule.deduction_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rule.min_days ? `${rule.min_days} days` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rule.max_days ? `${rule.max_days} days` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                        {rule.deduction_type === 'percentage' ? `${rule.deduction_value}%` : `$${rule.deduction_value}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => editRule(rule)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          title="Edit Rule"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Rule"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Supported Keywords:</h4>
            <ul className="space-y-1">
              <li>• "at least X days" → days &gt;= X</li>
              <li>• "greater than X days" → days &gt; X</li>
              <li>• "less than X days" → days &lt; X</li>
              <li>• "at most X days" → days &lt;= X</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Examples:</h4>
            <ul className="space-y-1">
              <li>• "duration at least 15 days" (10% deduction)</li>
              <li>• "duration greater than 20 days" (15% deduction)</li>
              <li>• "duration less than 7 days" (5% deduction)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}