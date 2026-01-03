'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { deleteApiKey, createApiKey, getApiKeys } from './actions'

interface ApiKey {
    id: string
    name: string
    key: string
    created_at: string
    last_used_at: string | null
    is_active: boolean
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [newKeyName, setNewKeyName] = useState('')
    const [generatedKey, setGeneratedKey] = useState<string | null>(null)
    const [origin, setOrigin] = useState('')
    const [copied, setCopied] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'problems' | 'categories' | 'tags'>('problems')
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    useEffect(() => {
        fetchKeys()
        setOrigin(window.location.origin)
    }, [])

    const fetchKeys = async () => {
        const result = await getApiKeys()
        if (result.success) {
            setKeys(result.data)
        }
        setLoading(false)
    }

    const generateKey = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newKeyName || isCreating) return

        setIsCreating(true)
        const result = await createApiKey(newKeyName)
        setIsCreating(false)

        if (result.success && result.data) {
            setKeys([result.data, ...keys])
            setGeneratedKey(result.data.key)
            setNewKeyName('')
        } else {
            alert(`Failed to create key: ${result.error}`)
        }
    }

    const handleDeleteKey = async (id: string) => {
        setIsDeleting(id)
        setConfirmDeleteId(null)
        const result = await deleteApiKey(id)
        setIsDeleting(null)

        if (result.success) {
            setKeys(keys.filter(k => k.id !== id))
        } else {
            alert(`Failed to revoke key: ${result.error}`)
        }
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    const CodeBlock = ({ code, method, id, title }: { code: string; method: 'POST' | 'GET' | 'PUT' | 'DELETE'; id: string; title?: string }) => {
        const methodBg = {
            GET: 'bg-blue-500 text-white',
            POST: 'bg-emerald-500 text-white',
            PUT: 'bg-amber-500 text-white',
            DELETE: 'bg-red-500 text-white'
        }
        const textColor = {
            GET: 'text-blue-300',
            POST: 'text-emerald-300',
            PUT: 'text-amber-300',
            DELETE: 'text-red-300'
        }

        return (
            <div className="rounded-lg overflow-hidden border border-gray-700">
                {/* Header */}
                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${methodBg[method]}`}>
                            {method}
                        </span>
                        {title && <span className="text-sm text-gray-300">{title}</span>}
                    </div>
                    <button
                        onClick={() => copyToClipboard(code, id)}
                        className="text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
                    >
                        {copied === id ? '✓ Copied!' : 'Copy'}
                    </button>
                </div>
                {/* Code */}
                <div className="bg-gray-900 p-4 overflow-x-auto">
                    <pre className={`text-xs font-mono ${textColor[method]} whitespace-pre`}>
                        <code>{code}</code>
                    </pre>
                </div>
            </div>
        )
    }

    // Complete example payloads
    const createProblemExample = `curl -X POST ${origin}/api/problems \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Two Sum",
    "slug": "two-sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "easy",
    "status": "published",
    "category_id": "uuid-of-arrays-category",
    "problem_statement": "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers</em> such that they add up to <code>target</code>.</p><p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>",
    "constraints": "<ul><li>2 <= nums.length <= 10<sup>4</sup></li><li>-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup></li><li>-10<sup>9</sup> <= target <= 10<sup>9</sup></li></ul>",
    "input_format": "<p>First line contains n (size of array). Second line contains n space-separated integers.</p>",
    "output_format": "<p>Return indices i and j where nums[i] + nums[j] = target.</p>",
    "approach": "<p>We use a hash map to store each number and its index. For each element, we check if (target - current) exists in the map.</p>",
    "examples": [
      {
        "input": "nums = [2, 7, 11, 15], target = 9",
        "output": "[0, 1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        "input": "nums = [3, 2, 4], target = 6",
        "output": "[1, 2]",
        "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    "solutions": {
      "python": {
        "code": "def twoSum(nums, target):\\n    seen = {}\\n    for i, num in enumerate(nums):\\n        complement = target - num\\n        if complement in seen:\\n            return [seen[complement], i]\\n        seen[num] = i\\n    return []",
        "explanation": "<p>We iterate through the array once, storing each number in a hash map. For each number, we check if its complement exists.</p>",
        "time_complexity": "O(n)",
        "space_complexity": "O(n)"
      },
      "javascript": {
        "code": "function twoSum(nums, target) {\\n    const seen = new Map();\\n    for (let i = 0; i < nums.length; i++) {\\n        const complement = target - nums[i];\\n        if (seen.has(complement)) {\\n            return [seen.get(complement), i];\\n        }\\n        seen.set(nums[i], i);\\n    }\\n    return [];\\n}",
        "explanation": "<p>Same approach using JavaScript Map for O(1) lookups.</p>",
        "time_complexity": "O(n)",
        "space_complexity": "O(n)"
      },
      "java": {
        "code": "public int[] twoSum(int[] nums, int target) {\\n    Map<Integer, Integer> map = new HashMap<>();\\n    for (int i = 0; i < nums.length; i++) {\\n        int complement = target - nums[i];\\n        if (map.containsKey(complement)) {\\n            return new int[] { map.get(complement), i };\\n        }\\n        map.put(nums[i], i);\\n    }\\n    return new int[] {};\\n}",
        "explanation": "<p>Java implementation using HashMap.</p>",
        "time_complexity": "O(n)",
        "space_complexity": "O(n)"
      }
    },
    "diagram": {
      "chart": "graph TD; A[Start] --> B[Create HashMap]; B --> C[For each num]; C --> D{complement in map?}; D -->|Yes| E[Return indices]; D -->|No| F[Add to map]; F --> C;",
      "title": "Two Sum Algorithm Flow",
      "explanation": "This flowchart shows how we iterate through the array and use a hash map for O(1) lookups."
    },
    "tags": ["uuid-of-hash-map-tag", "uuid-of-array-tag"]
  }'`

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <Link href="/admin" className="hover:text-gray-900">Admin</Link>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                <span className="text-gray-900 font-medium">API Keys</span>
                            </nav>
                            <h1 className="text-2xl font-bold text-gray-900">API Keys & Documentation</h1>
                        </div>
                        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Key Management */}
                <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                            </svg>
                            Manage API Keys
                        </h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={generateKey} className="flex gap-3 mb-6">
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="Key name (e.g., CI/CD Pipeline)"
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                required
                            />
                            <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                Generate Key
                            </button>
                        </form>

                        {generatedKey && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium mb-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    Key Generated Successfully
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-white px-3 py-2 rounded-lg border border-emerald-200 text-sm font-mono text-gray-900">
                                        {generatedKey}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(generatedKey, 'new-key')}
                                        className="px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
                                    >
                                        {copied === 'new-key' ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <p className="text-xs text-emerald-600 mt-2">⚠️ Save this key now! It won't be shown again.</p>
                            </div>
                        )}

                        {keys.length > 0 ? (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Name</th>
                                            <th className="px-4 py-3 text-left font-medium">Key</th>
                                            <th className="px-4 py-3 text-left font-medium">Created</th>
                                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {keys.map((key) => (
                                            <tr key={key.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{key.name}</td>
                                                <td className="px-4 py-3">
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{key.key.slice(0, 12)}...</code>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{new Date(key.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => setConfirmDeleteId(key.id)}
                                                        disabled={isDeleting === key.id}
                                                        className="text-red-600 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        {isDeleting === key.id ? 'Revoking...' : 'Revoke'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-300">
                                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                </svg>
                                <p className="text-sm">No API keys. Generate one to get started.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* API Reference */}
                <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                            </svg>
                            API Reference
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Base URL: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">{origin}</code>
                        </p>
                    </div>

                    {/* Authentication */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-blue-50">
                        <h3 className="font-medium text-blue-900 text-sm flex items-center gap-2 mb-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            Authentication Required
                        </h3>
                        <p className="text-sm text-blue-800 mb-3">All requests must include these headers:</p>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-xs font-mono text-gray-300 whitespace-pre">
                                {`x-api-key: YOUR_API_KEY
Content-Type: application/json`}
                            </pre>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 bg-gray-50">
                        <div className="flex">
                            {[
                                { id: 'problems', label: 'Problems', icon: '📝' },
                                { id: 'categories', label: 'Categories', icon: '📁' },
                                { id: 'tags', label: 'Tags', icon: '🏷️' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id
                                        ? 'bg-white text-gray-900 border-b-2 border-blue-500 -mb-px'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'problems' && (
                            <div className="space-y-8">
                                {/* Endpoints Summary */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoints</h3>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-blue-500 text-white mb-2">GET</span>
                                            <code className="block text-sm text-gray-700">/api/problems</code>
                                            <span className="text-xs text-gray-500">List all problems</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-emerald-500 text-white mb-2">POST</span>
                                            <code className="block text-sm text-gray-700">/api/problems</code>
                                            <span className="text-xs text-gray-500">Create problem</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-white mb-2">PUT</span>
                                            <code className="block text-sm text-gray-700">/api/problems/:slug</code>
                                            <span className="text-xs text-gray-500">Update by slug</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-red-500 text-white mb-2">DELETE</span>
                                            <code className="block text-sm text-gray-700">/api/problems/:slug</code>
                                            <span className="text-xs text-gray-500">Delete by slug</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Field Reference */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Reference</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Field</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Type</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Required</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr><td className="px-4 py-2 font-mono text-xs">title</td><td className="px-4 py-2">string</td><td className="px-4 py-2">✅</td><td className="px-4 py-2 text-gray-600">Problem title</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">slug</td><td className="px-4 py-2">string</td><td className="px-4 py-2">✅</td><td className="px-4 py-2 text-gray-600">URL-friendly identifier</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">difficulty</td><td className="px-4 py-2">enum</td><td className="px-4 py-2">✅</td><td className="px-4 py-2 text-gray-600">easy | medium | hard</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">status</td><td className="px-4 py-2">enum</td><td className="px-4 py-2">✅</td><td className="px-4 py-2 text-gray-600">draft | published</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">description</td><td className="px-4 py-2">string</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">Short description</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">category_id</td><td className="px-4 py-2">UUID</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">Category reference</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">problem_statement</td><td className="px-4 py-2">HTML</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">Full problem description (rich text)</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">constraints</td><td className="px-4 py-2">HTML</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">Input constraints (rich text)</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">input_format</td><td className="px-4 py-2">HTML</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">Input format description</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">output_format</td><td className="px-4 py-2">HTML</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">Output format description</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">approach</td><td className="px-4 py-2">HTML</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">Solution approach explanation</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">examples</td><td className="px-4 py-2">array</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">[{'{input, output, explanation}'}]</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">solutions</td><td className="px-4 py-2">object</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">Solutions by language (python, javascript, java, cpp)</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">diagram</td><td className="px-4 py-2">object</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">{'{chart (mermaid), title, explanation}'}</td></tr>
                                                <tr><td className="px-4 py-2 font-mono text-xs">tags</td><td className="px-4 py-2">array</td><td className="px-4 py-2">-</td><td className="px-4 py-2 text-gray-600">Array of tag UUIDs</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Solution Object Structure */}
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-3">Solution Object Structure</h4>
                                    <pre className="text-xs font-mono text-gray-700 bg-white p-3 rounded border overflow-x-auto whitespace-pre">
                                        {`"solutions": {
  "python": {
    "code": "def solution(): ...",         // The actual code
    "explanation": "<p>HTML explanation</p>", // How it works (rich text)
    "time_complexity": "O(n)",               // Big-O time
    "space_complexity": "O(1)"               // Big-O space
  },
  "javascript": { ... },
  "java": { ... },
  "cpp": { ... }
}`}
                                    </pre>
                                </div>

                                {/* Complete Example */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Example: Create Problem</h3>
                                    <CodeBlock
                                        id="create-problem-full"
                                        method="POST"
                                        title="Create a new problem with all fields"
                                        code={createProblemExample}
                                    />
                                </div>

                                {/* Update & Delete */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Update Problem</h4>
                                        <CodeBlock
                                            id="update-problem"
                                            method="PUT"
                                            code={`curl -X PUT ${origin}/api/problems/two-sum \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "difficulty": "medium",
    "status": "published"
  }'`}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Delete Problem</h4>
                                        <CodeBlock
                                            id="delete-problem"
                                            method="DELETE"
                                            code={`curl -X DELETE ${origin}/api/problems/two-sum \\
  -H "x-api-key: YOUR_API_KEY"`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div className="space-y-6">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-blue-500 text-white mb-2">GET</span>
                                        <code className="block text-sm text-gray-700">/api/categories</code>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-emerald-500 text-white mb-2">POST</span>
                                        <code className="block text-sm text-gray-700">/api/categories</code>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-white mb-2">PUT</span>
                                        <code className="block text-sm text-gray-700">/api/categories/:id</code>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-red-500 text-white mb-2">DELETE</span>
                                        <code className="block text-sm text-gray-700">/api/categories/:id</code>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Fields</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><code className="font-mono">name</code> <span className="text-gray-500">- string (required)</span></div>
                                        <div><code className="font-mono">slug</code> <span className="text-gray-500">- string (required)</span></div>
                                        <div><code className="font-mono">description</code> <span className="text-gray-500">- string</span></div>
                                        <div><code className="font-mono">icon</code> <span className="text-gray-500">- emoji</span></div>
                                        <div><code className="font-mono">display_order</code> <span className="text-gray-500">- integer</span></div>
                                    </div>
                                </div>

                                <CodeBlock
                                    id="create-category"
                                    method="POST"
                                    title="Create Category"
                                    code={`curl -X POST ${origin}/api/categories \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Arrays & Strings",
    "slug": "arrays-strings",
    "description": "Problems involving array manipulation and string processing",
    "icon": "📊",
    "display_order": 1
  }'`}
                                />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <CodeBlock
                                        id="update-category"
                                        method="PUT"
                                        code={`curl -X PUT ${origin}/api/categories/UUID \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"name": "Dynamic Programming"}'`}
                                    />
                                    <CodeBlock
                                        id="delete-category"
                                        method="DELETE"
                                        code={`curl -X DELETE ${origin}/api/categories/UUID \\
  -H "x-api-key: YOUR_API_KEY"`}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'tags' && (
                            <div className="space-y-6">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-blue-500 text-white mb-2">GET</span>
                                        <code className="block text-sm text-gray-700">/api/tags</code>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-emerald-500 text-white mb-2">POST</span>
                                        <code className="block text-sm text-gray-700">/api/tags</code>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-white mb-2">PUT</span>
                                        <code className="block text-sm text-gray-700">/api/tags/:id</code>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-red-500 text-white mb-2">DELETE</span>
                                        <code className="block text-sm text-gray-700">/api/tags/:id</code>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Fields</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><code className="font-mono">name</code> <span className="text-gray-500">- string (required)</span></div>
                                        <div><code className="font-mono">slug</code> <span className="text-gray-500">- string (required)</span></div>
                                    </div>
                                </div>

                                <CodeBlock
                                    id="create-tag"
                                    method="POST"
                                    title="Create Tag"
                                    code={`curl -X POST ${origin}/api/tags \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Hash Map",
    "slug": "hash-map"
  }'`}
                                />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <CodeBlock
                                        id="update-tag"
                                        method="PUT"
                                        code={`curl -X PUT ${origin}/api/tags/UUID \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"name": "HashTable"}'`}
                                    />
                                    <CodeBlock
                                        id="delete-tag"
                                        method="DELETE"
                                        code={`curl -X DELETE ${origin}/api/tags/UUID \\
  -H "x-api-key: YOUR_API_KEY"`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Confirmation Modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Revoke API Key?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                This action cannot be undone. Any applications using this key will lose access.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteKey(confirmDeleteId)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Revoke Key
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
