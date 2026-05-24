export interface TestCase {
    id: number;
    inputDisplay: string;
    expectedOutput: string;
  }
  
  export interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeLimit: string;
    description: string[];
    examples: { input: string; output: string; explanation?: string }[];
    constraints: string[];
    boilerplates: Record<string, string>;
    testCases: TestCase[];
  }
  
  export const problemDatabase: Record<string, Problem> = {
    'two-sum': {
      id: 'two-sum',
      title: '1. Two Sum',
      difficulty: 'Easy',
      timeLimit: '45 mins',
      description: [
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        "You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "You can return the answer in any order."
      ],
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
      ],
      constraints: [
        "2 ≤ nums.length ≤ 10^4",
        "-10^9 ≤ nums[i] ≤ 10^9",
        "Only one valid answer exists."
      ],
      boilerplates: {
        javascript: 'function twoSum(nums, target) {\n  // Write your code here\n\n}',
        python: 'def two_sum(nums, target):\n    # Write your Python code here\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};',
        java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}'
      },
      testCases: [
        { id: 0, inputDisplay: "nums: [2, 7, 11, 15], target: 9", expectedOutput: "[0,1]" },
        { id: 1, inputDisplay: "nums: [3, 2, 4], target: 6", expectedOutput: "[1,2]" }
      ]
    },
  
    'fizz-buzz': {
      id: 'fizz-buzz',
      title: '2. Fizz Buzz',
      difficulty: 'Easy',
      timeLimit: '20 mins',
      description: [
        "Given an integer n, return a string array answer (1-indexed) where:",
        "answer[i] == 'FizzBuzz' if i is divisible by 3 and 5.",
        "answer[i] == 'Fizz' if i is divisible by 3.",
        "answer[i] == 'Buzz' if i is divisible by 5.",
        "answer[i] == i (as a string) if none of the above conditions are true."
      ],
      examples: [
        { input: "n = 3", output: '["1","2","Fizz"]' },
        { input: "n = 5", output: '["1","2","Fizz","4","Buzz"]' }
      ],
      constraints: [
        "1 ≤ n ≤ 10^4"
      ],
      boilerplates: {
        javascript: 'function fizzBuzz(n) {\n  \n}',
        python: 'def fizz_buzz(n):\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        \n    }\n};',
        java: 'class Solution {\n    public List<String> fizzBuzz(int n) {\n        \n    }\n}'
      },
      testCases: [
        { id: 0, inputDisplay: "n: 3", expectedOutput: '["1","2","Fizz"]' },
        { id: 1, inputDisplay: "n: 5", expectedOutput: '["1","2","Fizz","4","Buzz"]' }
      ]
    },
  
    'valid-palindrome': {
      id: 'valid-palindrome',
      title: '3. Valid Palindrome',
      difficulty: 'Easy',
      timeLimit: '30 mins',
      description: [
        "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
        "Alphanumeric characters include letters and numbers.",
        "Given a string s, return true if it is a palindrome, or false otherwise."
      ],
      examples: [
        { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
        { input: 's = "race a car"', output: "false", explanation: '"raceacar" is not a palindrome.' }
      ],
      constraints: [
        "1 ≤ s.length ≤ 2 * 10^5",
        "s consists only of printable ASCII characters."
      ],
      boilerplates: {
        javascript: 'function isPalindrome(s) {\n  \n}',
        python: 'def is_palindrome(s):\n    pass',
        cpp: 'class Solution {\npublic:\n    bool isPalindrome(string s) {\n        \n    }\n};',
        java: 'class Solution {\n    public boolean isPalindrome(String s) {\n        \n    }\n}'
      },
      testCases: [
        { id: 0, inputDisplay: 's: "A man, a plan, a canal: Panama"', expectedOutput: "true" },
        { id: 1, inputDisplay: 's: "race a car"', expectedOutput: "false" }
      ]
    },
  
    'binary-search': {
      id: 'binary-search',
      title: '4. Binary Search',
      difficulty: 'Easy',
      timeLimit: '30 mins',
      description: [
        "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.",
        "If target exists, then return its index. Otherwise, return -1.",
        "You must write an algorithm with O(log n) runtime complexity."
      ],
      examples: [
        { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists in nums and its index is 4" },
        { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist in nums so return -1" }
      ],
      constraints: [
        "1 ≤ nums.length ≤ 10^4",
        "-10^4 < nums[i], target < 10^4",
        "All the integers in nums are unique.",
        "nums is sorted in ascending order."
      ],
      boilerplates: {
        javascript: 'function search(nums, target) {\n  \n}',
        python: 'def search(nums, target):\n    pass',
        cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};',
        java: 'class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}'
      },
      testCases: [
        { id: 0, inputDisplay: "nums: [-1,0,3,5,9,12], target: 9", expectedOutput: "4" },
        { id: 1, inputDisplay: "nums: [-1,0,3,5,9,12], target: 2", expectedOutput: "-1" }
      ]
    },
  
    'contains-duplicate': {
      id: 'contains-duplicate',
      title: '5. Contains Duplicate',
      difficulty: 'Easy',
      timeLimit: '20 mins',
      description: [
        "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct."
      ],
      examples: [
        { input: "nums = [1,2,3,1]", output: "true" },
        { input: "nums = [1,2,3,4]", output: "false" }
      ],
      constraints: [
        "1 ≤ nums.length ≤ 10^5",
        "-10^9 ≤ nums[i] ≤ 10^9"
      ],
      boilerplates: {
        javascript: 'function containsDuplicate(nums) {\n  \n}',
        python: 'def contains_duplicate(nums):\n    pass',
        cpp: 'class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};',
        java: 'class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}'
      },
      testCases: [
        { id: 0, inputDisplay: "nums: [1,2,3,1]", expectedOutput: "true" },
        { id: 1, inputDisplay: "nums: [1,2,3,4]", expectedOutput: "false" }
      ]
    }
  };