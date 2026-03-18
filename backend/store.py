"""
In-memory data store shared across routers.

TODO (scalability): Replace submissions_db with an async SQLAlchemy session
(PostgreSQL/SQLite) and PROBLEMS with a database-backed repository so the
problem set can be managed without redeployment.
"""
from typing import List
from models.schemas import Problem, TestCase

# ─── Submissions ──────────────────────────────────────────────────────────────
# List of submission dicts — keyed by submission_id.
submissions_db: List[dict] = []

# ─── Problems ────────────────────────────────────────────────────────────────
PROBLEMS: List[Problem] = [
    Problem(
        id=1,
        title="Two Sum",
        description=(
            "Given an array of integers `nums` and an integer `target`, return indices of the "
            "two numbers such that they add up to target. You may assume that each input would "
            "have exactly one solution, and you may not use the same element twice."
        ),
        difficulty="Easy",
        tags=["Array", "Hash Map"],
        starter_code=(
            "function twoSum(nums, target) {\n"
            "  // Your solution here\n"
            "};"
        ),
        optimal_solution=(
            "function twoSum(nums, target) {\n"
            "  const map = new Map();\n"
            "  for (let i = 0; i < nums.length; i++) {\n"
            "    const complement = target - nums[i];\n"
            "    if (map.has(complement)) return [map.get(complement), i];\n"
            "    map.set(nums[i], i);\n"
            "  }\n"
            "};"
        ),
        test_cases=[
            TestCase(input="nums=[2,7,11,15], target=9", expected_output="[0,1]"),
            TestCase(input="nums=[3,2,4], target=6", expected_output="[1,2]"),
            TestCase(input="nums=[3,3], target=6", expected_output="[0,1]"),
        ],
    ),
    Problem(
        id=2,
        title="Valid Parentheses",
        description=(
            "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', "
            "determine if the input string is valid. An input string is valid if open brackets are "
            "closed by the same type and in the correct order."
        ),
        difficulty="Easy",
        tags=["Stack", "String"],
        starter_code=(
            "function isValid(s) {\n"
            "  // Your solution here\n"
            "};"
        ),
        optimal_solution=(
            "function isValid(s) {\n"
            "  const stack = [];\n"
            "  const map = { ')': '(', '}': '{', ']': '[' };\n"
            "  for (const ch of s) {\n"
            "    if ('({['.includes(ch)) { stack.push(ch); }\n"
            "    else if (stack.pop() !== map[ch]) return false;\n"
            "  }\n"
            "  return stack.length === 0;\n"
            "};"
        ),
        test_cases=[
            TestCase(input='s="()"', expected_output="true"),
            TestCase(input='s="()[]{}"', expected_output="true"),
            TestCase(input='s="(]"', expected_output="false"),
        ],
    ),
    Problem(
        id=3,
        title="Longest Substring Without Repeating Characters",
        description=(
            "Given a string `s`, find the length of the longest substring without repeating characters."
        ),
        difficulty="Medium",
        tags=["Sliding Window", "Hash Map", "String"],
        starter_code=(
            "function lengthOfLongestSubstring(s) {\n"
            "  // Your solution here\n"
            "};"
        ),
        optimal_solution=(
            "function lengthOfLongestSubstring(s) {\n"
            "  const map = new Map();\n"
            "  let max = 0, left = 0;\n"
            "  for (let right = 0; right < s.length; right++) {\n"
            "    if (map.has(s[right])) left = Math.max(left, map.get(s[right]) + 1);\n"
            "    map.set(s[right], right);\n"
            "    max = Math.max(max, right - left + 1);\n"
            "  }\n"
            "  return max;\n"
            "};"
        ),
        test_cases=[
            TestCase(input='s="abcabcbb"', expected_output="3"),
            TestCase(input='s="bbbbb"', expected_output="1"),
            TestCase(input='s="pwwkew"', expected_output="3"),
        ],
    ),
    Problem(
        id=4,
        title="Merge Intervals",
        description=(
            "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping "
            "intervals, and return an array of the non-overlapping intervals that cover all the intervals."
        ),
        difficulty="Medium",
        tags=["Array", "Sorting"],
        starter_code=(
            "function merge(intervals) {\n"
            "  // Your solution here\n"
            "};"
        ),
        optimal_solution=(
            "function merge(intervals) {\n"
            "  intervals.sort((a, b) => a[0] - b[0]);\n"
            "  const result = [intervals[0]];\n"
            "  for (const [start, end] of intervals.slice(1)) {\n"
            "    const last = result[result.length - 1];\n"
            "    if (start <= last[1]) last[1] = Math.max(last[1], end);\n"
            "    else result.push([start, end]);\n"
            "  }\n"
            "  return result;\n"
            "};"
        ),
        test_cases=[
            TestCase(input="intervals=[[1,3],[2,6],[8,10],[15,18]]", expected_output="[[1,6],[8,10],[15,18]]"),
            TestCase(input="intervals=[[1,4],[4,5]]", expected_output="[[1,5]]"),
        ],
    ),
    Problem(
        id=5,
        title="Coin Change",
        description=(
            "You are given an integer array coins representing coins of various denominations and an "
            "integer amount. Return the fewest number of coins needed to make up that amount. "
            "If that amount cannot be made up, return -1."
        ),
        difficulty="Medium",
        tags=["DP", "Array"],
        starter_code=(
            "function coinChange(coins, amount) {\n"
            "  // Your solution here\n"
            "};"
        ),
        optimal_solution=(
            "function coinChange(coins, amount) {\n"
            "  const dp = Array(amount + 1).fill(Infinity);\n"
            "  dp[0] = 0;\n"
            "  for (let i = 1; i <= amount; i++) {\n"
            "    for (const coin of coins) {\n"
            "      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n"
            "    }\n"
            "  }\n"
            "  return dp[amount] === Infinity ? -1 : dp[amount];\n"
            "};"
        ),
        test_cases=[
            TestCase(input="coins=[1,5,11], amount=11", expected_output="1"),
            TestCase(input="coins=[2], amount=3", expected_output="-1"),
            TestCase(input="coins=[1,2,5], amount=11", expected_output="3"),
        ],
    ),
]

PROBLEMS_MAP = {p.id: p for p in PROBLEMS}
