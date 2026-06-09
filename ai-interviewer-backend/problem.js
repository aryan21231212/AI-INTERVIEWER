// This acts as our temporary database for LeetCode-style questions.
export const problems = {
    'two-sum': {
      id: 'two-sum',
      title: 'Two Sum',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
      starterCode: 'function twoSum(nums, target) {\n  // Write your code here\n  \n}',
      testCases: [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] }
      ]
    },
    'fizz-buzz': {
      id: 'fizz-buzz',
      title: 'Fizz Buzz',
      description: 'Given an integer `n`, return a string array `answer` (1-indexed) where:\n- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.\n- answer[i] == "Fizz" if i is divisible by 3.\n- answer[i] == "Buzz" if i is divisible by 5.\n- answer[i] == i (as a string) if none of the above conditions are true.',
      starterCode: 'function fizzBuzz(n) {\n  // Write your code here\n  \n}',
      testCases: [
        { input: { n: 3 }, expected: ["1", "2", "Fizz"] },
        { input: { n: 5 }, expected: ["1", "2", "Fizz", "4", "Buzz"] }
      ]
    },
    'valid-palindrome': {
      id: 'valid-palindrome',
      title: 'Valid Palindrome',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return true if it is a palindrome, or false otherwise.',
      starterCode: 'function isPalindrome(s) {\n  // Write your code here\n  \n}',
      testCases: [
        { input: { s: "A man, a plan, a canal: Panama" }, expected: true },
        { input: { s: "race a car" }, expected: false }
      ]
    }
  };