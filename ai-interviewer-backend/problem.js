export const problems = {
  'two-sum': {
    id: 'two-sum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    timeLimit: '15 mins',
    description: [
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
      'You may assume that each input would have exactly one solution, and you may not use the same element twice.',
      'You can return the answer in any order.'
    ],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: null },
      { input: 'nums = [3,3], target = 6', output: '[0,1]', explanation: null }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: 'function twoSum(nums, target) {\n  // Write your code here\n  \n}',
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
      { input: { nums: [-1, -2, -3, -4, -5], target: -8 }, expected: [2, 4] } // Edge case: negatives
    ]
  },
  'fizz-buzz': {
    id: 'fizz-buzz',
    title: '412. Fizz Buzz',
    difficulty: 'Easy',
    timeLimit: '10 mins',
    description: [
      'Given an integer `n`, return a string array `answer` (1-indexed) where:',
      '• answer[i] == "FizzBuzz" if i is divisible by 3 and 5.',
      '• answer[i] == "Fizz" if i is divisible by 3.',
      '• answer[i] == "Buzz" if i is divisible by 5.',
      '• answer[i] == i (as a string) if none of the above conditions are true.'
    ],
    examples: [
      { input: 'n = 3', output: '["1","2","Fizz"]', explanation: null },
      { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]', explanation: null },
      { input: 'n = 15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', explanation: null }
    ],
    constraints: [
      '1 <= n <= 10^4'
    ],
    starterCode: 'function fizzBuzz(n) {\n  // Write your code here\n  \n}',
    testCases: [
      { input: { n: 3 }, expected: ["1", "2", "Fizz"] },
      { input: { n: 5 }, expected: ["1", "2", "Fizz", "4", "Buzz"] },
      { input: { n: 15 }, expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"] }
    ]
  },
  'valid-palindrome': {
    id: 'valid-palindrome',
    title: '125. Valid Palindrome',
    difficulty: 'Easy',
    timeLimit: '15 mins',
    description: [
      'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
      'Alphanumeric characters include letters and numbers.',
      'Given a string `s`, return true if it is a palindrome, or false otherwise.'
    ],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.' },
      { input: 's = " "', output: 'true', explanation: 's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.' }
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.'
    ],
    starterCode: 'function isPalindrome(s) {\n  // Write your code here\n  \n}',
    testCases: [
      { input: { s: "A man, a plan, a canal: Panama" }, expected: true },
      { input: { s: "race a car" }, expected: false },
      { input: { s: " " }, expected: true },
      { input: { s: "0P" }, expected: false } // Edge case: numbers vs letters
    ]
  }
};  