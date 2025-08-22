const startTime = new Date("2025-08-20T18:15:00+05:30");
const endTime = new Date("2025-08-23T04:00:00+05:30");

// const startTime = new Date("2025-08-23T10:45:00+05:30");
// const endTime = new Date("2025-08-23T11:45:00+05:30");

export const QuestionCode =["Q001", "Q002", "Q003", "Q004", "Q005","Q006","Q007","Q008","Q009"];


export const QuestionMeta = [
  {
    title: "Question",//O5 (x*50)
    description: `In the Merchant's Maze, three ancient coins lie hidden.
 One is marked with two blades,
 one with five stars,
 and one with a wheel that turns both together.
The scroll says:
“Choose your coins wisely and join them with X.
 When their combined value matches the half-century mark,
 the vault shall open.”`,
    difficulty: "Easy",
    startTime,
    endTime,
    winner: 30,
    runnerUp: 20,
    secondRunnerUp: 10,
    participant: 5,
    testCases: [
  { input: "0", expected: "0", isVisible: true },
  { input: "1", expected: "50", isVisible: true },
  { input: "2", expected: "100", isVisible: true },
  { input: "5", expected: "250", isVisible: true },
  { input: "10", expected: "500", isVisible: true },
  { input: "20", expected: "1000", isVisible: true },
  { input: "7", expected: "350", isVisible: true },
  { input: "15", expected: "750", isVisible: true },
  { input: "-3", expected: "-150", isVisible: true },
  { input: "100", expected: "5000", isVisible: true }
],

  },
    {
    title: "Question",//Q6 ((x*10)-2)
    description: `In the Scholar's Ledger, every number undergoes a peculiar ritual.
    First, it is multiplied by ten,
    then a portion of five is taken away,
    yet a gift of three is returned.

    The scroll says:
    “Follow this sequence faithfully, and the true value shall emerge.”`,    
    
    
    difficulty: "Easy",
    startTime,
    endTime,
    winner: 30,
    runnerUp: 20,
    secondRunnerUp: 10,
    participant: 5,
    testCases: [
  { input: "1", expected: "8", isVisible: true },
  { input: "2", expected: "18", isVisible: true },
  { input: "3", expected: "28", isVisible: true },
  { input: "-7", expected: "-72", isVisible: true },
  { input: "5", expected: "48", isVisible: true },
  { input: "6", expected: "58", isVisible: true },
  { input: "7", expected: "68", isVisible: true },
  { input: "9", expected: "88", isVisible: true },
  { input: "-4", expected: "-42", isVisible: true },
   { input: "0", expected: "-2", isVisible: true },
  { input: "-6", expected: "-62", isVisible: true },
],

  },
  {
    title: "Question",//Q2 3663-->[36,63]-->TRUE/FALSE
    description: `Long ago, the great mathematician Aryabhata enchanted certain numbers with a secret property to test the worthiness of his students.
 It is said that a true balanced number carries equal weight in its first half and its second half — like a heart beating in perfect symmetry.
Your task is to reveal whether the given number holds this sacred balance.
`,
    difficulty: "Medium",
    startTime,
    endTime,
    winner: 0,
    runnerUp: 0,
    secondRunnerUp: 0,
    participant: 0,
   testCases: [
  { input: "3663", expected: "true", isVisible: true },
  { input: "211", expected: "true", isVisible: true },
  { input: "1230", expected: "true", isVisible: true },
  { input: "1234", expected: "false", isVisible: true },
  { input: "5050", expected: "true", isVisible: true },
  { input: "9090", expected: "true", isVisible: true },
  { input: "123321", expected: "true", isVisible: true },
  { input: "111112", expected: "false", isVisible: true },
  { input: "876512", expected: "false", isVisible: true },
  { input: "451154", expected: "true", isVisible: true },
    { input: "700007", expected: "true", isVisible: true },
  { input: "561056", expected: "false", isVisible: true },
    { input: "1212", expected: "true", isVisible: true },
    { input: "345654", expected: "false", isVisible: true },

  { input: "820028", expected: "true", isVisible: true },
  { input: "1001", expected: "true", isVisible: true },
  { input: "987789", expected: "true", isVisible: true },
  { input: "654456", expected: "true", isVisible: true },
  { input: "456123", expected: "false", isVisible: true },
  { input: "9099", expected: "false", isVisible: true }
],

  },
  {
    title: "Question",//Q3 //PREFIX SUM
    description: `The accountant of Aryabhata's temple encoded numbers into their 
    prefix sums to guard secret scrolls. You must decode them to get the original numbers.
Encoded: Prefix Sum Array
Goal: Recover the original numbers
`,
    difficulty: "Medium",
    startTime,
    endTime,
    winner: 0,
    runnerUp: 0,
    secondRunnerUp: 0,
    participant: 0,
   testCases: [
  { input: "[6,9,15,21,28]", expected: "[6,3,6,6,7]", isVisible: true },
  { input: "[4,10,13,19,20]", expected: "[4,6,3,6,1]", isVisible: true },
  { input: "[0,5,5,10,20]", expected: "[0,5,0,5,10]", isVisible: true },
  { input: "[10,15,25,30,45]", expected: "[10,5,10,5,15]", isVisible: true },
  { input: "[9,18,27,36,45]", expected: "[9,9,9,9,9]", isVisible: true },

  { input: "[5,8,12,12,15]", expected: "[5,3,4,0,3]", isVisible: true },
  { input: "[7,7,14,14,21]", expected: "[7,0,7,0,7]", isVisible: true },
  { input: "[1,4,8,9,15]", expected: "[1,3,4,1,6]", isVisible: true },
  { input: "[2,7,9,14,20]", expected: "[2,5,2,5,6]", isVisible: true },
  { input: "[3,5,10,10,13]", expected: "[3,2,5,0,3]", isVisible: true },
],

  },
  {
    title: "Question",//Q4 //[X,Y,Z]-->[XORresult]-->ANS
    description: `In the Bitcrypt, every spirit appears twice — except one lost soul.
“Find the one who walks alone… or be lost forever.”
`,
    difficulty: "Medium",
    startTime,
    endTime,
    winner: 0,
    runnerUp: 0,
    secondRunnerUp: 0,
    participant: 0,
 testCases: [
  { input: "[1]", expected: "1", isVisible: true },
  { input: "[2,2,3]", expected: "3", isVisible: true },
  { input: "[4,5,4]", expected: "5", isVisible: true },
  { input: "[1024,512,512]", expected: "1024", isVisible: true },
  { input: "[2147483647,2147483647,123456]", expected: "123456", isVisible: true },
  { input: "[100,200,300,200,100]", expected: "300", isVisible: true },
  { input: "[102,103,104,103,102]", expected: "104", isVisible: true },
  { input: "[555,666,777,666,555]", expected: "777", isVisible: true },
  { input: "[42,42,43,84,84]", expected: "43", isVisible: true },
  { input: "[999,1,2,1,2]", expected: "999", isVisible: true },

  { input: "[0,0,7]", expected: "7", isVisible: true },
  { input: "[99999,1,1,99999,42]", expected: "42", isVisible: true },
  { input: "[10,20,20,10,30]", expected: "30", isVisible: true },
  { input: "[6,7,7,6,5]", expected: "5", isVisible: true },
  { input: "[11,11,22,33,22]", expected: "33", isVisible: true },
  { input: "[50,60,70,60,50]", expected: "70", isVisible: true },
  { input: "[-7,-7,-3]", expected: "-3", isVisible: true },
  { input: "[0,255,255]", expected: "0", isVisible: true },
  { input: "[8,16,8,32,32]", expected: "16", isVisible: true },
  { input: "[13,13,26]", expected: "26", isVisible: true },
],


  },
    {
    title: "Question",//Q7 //BINARY SUBSTRACTION
    description: `In the Hall of Bits two numbers climb an old scale. One is turned 
    inside-out and bound to the other; when they meet the remainder whispers a 
    string of zeros and ones — prefixed by a sorrowful - if the balance tips the other way.
    Speak the final bit-song.`,
    difficulty: "Easy",
    startTime,
    endTime,
    winner: 30,
    runnerUp: 20,
    secondRunnerUp: 10,
    participant: 5,
    testCases: [
  { input: "[2,2]", expected: "0", isVisible: true },
  { input: "[5,3]", expected: "2", isVisible: true },
  { input: "[10,4]", expected: "6", isVisible: true },
  { input: "[7,7]", expected: "0", isVisible: true },
  { input: "[15,1]", expected: "14", isVisible: true },
  { input: "[8,2]", expected: "6", isVisible: true },
  { input: "[20,5]", expected: "15", isVisible: true },
  { input: "[6,9]", expected: "-3", isVisible: true },
  { input: "[0,13]", expected: "-13", isVisible: true },
  { input: "[100,50]", expected: "50", isVisible: true },
],

  },
    {
  title: "Question", // Q8 //555-->[5,5,5]--->[15]-->15
  description: `A number steps into the Chamber of Tokens and returns as a 
  small tally — sometimes bearing a leading '-' if the original carried sorrow.
  Report the tally.`,
  difficulty: "Easy",
  startTime,
  endTime,
  winner: 30,
  runnerUp: 20,
  secondRunnerUp: 10,
  participant: 5,

  testCases: [
    { input: "1", expected: "1", isVisible: true },
    { input: "12", expected: "3", isVisible: true },
    { input: "123", expected: "6", isVisible: true },
    { input: "999", expected: "27", isVisible: true },
    { input: "1001", expected: "2", isVisible: true },
    { input: "0", expected: "0", isVisible: true },
    { input: "-7", expected: "-7", isVisible: true },
    { input: "-123", expected: "-6", isVisible: true },
    { input: "305", expected: "8", isVisible: true },
    { input: "2147483647", expected: "46", isVisible: true },
    { input: "1000000000", expected: "1", isVisible: true },
    { input: "9876543210", expected: "45", isVisible: true }
  ]
},
    {
    title: "Question",//Q1 /HARDEST
    description: `Ancient Mystery Spell has locked the sacred number X in a mathematical cage. You remember you are the disciple of RD Sharma. Use your abilities to free X and get blessed.

CAGE: [2^(log5 X)]
`,
    difficulty: "Easy",
    startTime,
    endTime,
    winner: 0,
    runnerUp: 0,
    secondRunnerUp: 0,
    participant: 0,
testCases: [
  { input: "[1]", expected: "1.0000", isVisible: true },
  { input: "[2]", expected: "5.0000", isVisible: true },
  { input: "[3]", expected: "12.8186", isVisible: true },
  { input: "[15]", expected: "538.0211", isVisible: true },
  { input: "[16]", expected: "625.0000", isVisible: true },
  { input: "[4]", expected: "25.0000", isVisible: true },
  { input: "[5]", expected: "41.9718", isVisible: true },
  { input: "[7]", expected: "91.6763", isVisible: true },
  { input: "[8]", expected: "125.0000", isVisible: true },
  { input: "[9]", expected: "164.3170", isVisible: true },
  { input: "[10]", expected: "209.8592", isVisible: true },
  { input: "[12]", expected: "320.4655", isVisible: true },
  { input: "[6]", expected: "64.0931", isVisible: true },
  { input: "[20]", expected: "1049.2962", isVisible: true },
  { input: "[25]", expected: "1761.6360", isVisible: true },
],

  },
 {
  title: "Question", // Q9 // BINARY ADDITION 
  description: `Two numbers step into the Chamber of Bits and merge their voices into a single chorus of ones and zeros. If the chorus leans the other way, a sorrowful '-' sighs before it. Speak the final chorus.`,

  difficulty: "Easy",
  startTime,
  endTime,
  winner: 0,
  runnerUp: 0,
  secondRunnerUp: 0,
  participant: 0,

testCases: [
  { input: "[0,0]", expected: "0", isVisible: true },
  { input: "[1,1]", expected: "2", isVisible: true },
  { input: "[2,3]", expected: "5", isVisible: true },
  { input: "[5,3]", expected: "8", isVisible: true },
  { input: "[10,6]", expected: "16", isVisible: true },
  { input: "[7,9]", expected: "16", isVisible: true },
  { input: "[100,50]", expected: "150", isVisible: true },
  { input: "[255,1]", expected: "256", isVisible: true },
  { input: "[1024,512]", expected: "1536", isVisible: true },
  { input: "[-3,1]", expected: "-2", isVisible: true },
  { input: "[-5,-11]", expected: "-16", isVisible: true },
  { input: "[999,1]", expected: "1000", isVisible: true }
]
},
];

