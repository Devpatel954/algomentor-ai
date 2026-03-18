export const problems = [
  {
    id: 1,
    name: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Map"],
    status: "Solved",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
    starterCode: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Your solution here\n  \n};`,
  },
  {
    id: 2,
    name: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    status: "Solved",
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    starterCode: `/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  // Your solution here\n  \n};`,
  },
  {
    id: 3,
    name: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Sliding Window", "Hash Map", "String"],
    status: "Attempted",
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1" },
    ],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    starterCode: `/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n  // Your solution here\n  \n};`,
  },
  {
    id: 4,
    name: "Merge Intervals",
    difficulty: "Medium",
    tags: ["Array", "Sorting"],
    status: "Not Started",
    description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
    ],
    constraints: ["1 <= intervals.length <= 10^4"],
    starterCode: `/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction merge(intervals) {\n  // Your solution here\n  \n};`,
  },
  {
    id: 5,
    name: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    tags: ["Tree", "BFS", "Graph"],
    status: "Not Started",
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).`,
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 2000]."],
    starterCode: `/**\n * @param {TreeNode} root\n * @return {number[][]}\n */\nfunction levelOrder(root) {\n  // Your solution here\n  \n};`,
  },
  {
    id: 6,
    name: "Coin Change",
    difficulty: "Medium",
    tags: ["DP", "Array"],
    status: "Attempted",
    description: `You are given an integer array coins representing coins of various denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.`,
    examples: [
      { input: "coins = [1,5,11], amount = 11", output: "1" },
      { input: "coins = [2], amount = 3", output: "-1" },
    ],
    constraints: ["1 <= coins.length <= 12", "0 <= amount <= 10^4"],
    starterCode: `/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nfunction coinChange(coins, amount) {\n  // Your solution here\n  \n};`,
  },
  {
    id: 7,
    name: "Word Ladder",
    difficulty: "Hard",
    tags: ["BFS", "Graph", "String"],
    status: "Not Started",
    description: `A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that every adjacent pair of words differs by a single letter.`,
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5" },
    ],
    constraints: ["1 <= beginWord.length <= 10", "endWord.length == beginWord.length"],
    starterCode: `/**\n * @param {string} beginWord\n * @param {string} endWord\n * @param {string[]} wordList\n * @return {number}\n */\nfunction ladderLength(beginWord, endWord, wordList) {\n  // Your solution here\n  \n};`,
  },
  {
    id: 8,
    name: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    tags: ["Array", "Binary Search", "DP"],
    status: "Not Started",
    description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).`,
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" },
    ],
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000"],
    starterCode: `/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nfunction findMedianSortedArrays(nums1, nums2) {\n  // Your solution here\n  \n};`,
  },
];

export const stats = {
  problemsSolved: 47,
  accuracy: 82,
  currentStreak: 7,
  totalAttempted: 63,
};

export const suggestedProblems = [
  { id: 3, name: "Longest Substring Without Repeating Characters", difficulty: "Medium", reason: "Based on your recent Sliding Window practice" },
  { id: 6, name: "Coin Change", difficulty: "Medium", reason: "Strengthen your DP skills" },
  { id: 5, name: "Binary Tree Level Order Traversal", difficulty: "Medium", reason: "You haven't tried Tree problems yet" },
];

export const recentActivity = [
  { problem: "Two Sum", status: "Solved", time: "2 hours ago", difficulty: "Easy" },
  { problem: "Valid Parentheses", status: "Solved", time: "Yesterday", difficulty: "Easy" },
  { problem: "Longest Substring...", status: "Attempted", time: "2 days ago", difficulty: "Medium" },
  { problem: "Coin Change", status: "Attempted", time: "3 days ago", difficulty: "Medium" },
];

export const progressData = [
  { date: "Mar 1", solved: 2 },
  { date: "Mar 3", solved: 5 },
  { date: "Mar 5", solved: 7 },
  { date: "Mar 7", solved: 10 },
  { date: "Mar 9", solved: 14 },
  { date: "Mar 11", solved: 18 },
  { date: "Mar 13", solved: 22 },
  { date: "Mar 15", solved: 28 },
  { date: "Mar 17", solved: 35 },
  { date: "Mar 18", solved: 47 },
];

export const topicPerformance = [
  { topic: "Array", solved: 12, total: 15, accuracy: 88 },
  { topic: "String", solved: 8, total: 10, accuracy: 90 },
  { topic: "DP", solved: 5, total: 12, accuracy: 55 },
  { topic: "Graph", solved: 3, total: 10, accuracy: 40 },
  { topic: "Tree", solved: 6, total: 9, accuracy: 72 },
  { topic: "Sliding Window", solved: 4, total: 6, accuracy: 78 },
  { topic: "Stack", solved: 7, total: 8, accuracy: 92 },
  { topic: "Binary Search", solved: 2, total: 7, accuracy: 38 },
];

export const weakAreas = [
  { topic: "Graph", accuracy: 40, suggestion: "Practice BFS/DFS fundamentals first" },
  { topic: "Binary Search", accuracy: 38, suggestion: "Review binary search template and edge cases" },
  { topic: "DP", accuracy: 55, suggestion: "Focus on 1D DP problems before 2D" },
];

export const aiConversations = [
  {
    id: 1,
    role: "user",
    content: "Give me a hint for Two Sum",
  },
  {
    id: 2,
    role: "ai",
    content: "Sure! Here's a step-by-step hint:\n\n**Step 1:** Think about the brute force approach — for each element, check if there's another element that adds up to the target. This is O(n²).\n\n**Step 2:** Can you do better? What data structure lets you check for a value in O(1)?\n\n**Step 3:** As you iterate, store each number in a Hash Map. For each new number, check if `target - currentNumber` already exists in the map.\n\nTry implementing this approach!",
  },
];
