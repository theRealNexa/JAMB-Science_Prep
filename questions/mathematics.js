// Mathematics — JAMB-style practice questions
// Format: { subject, topic, q, options[4], correct (index), explain }
// Empty for now — contribute questions here following the format above.
const MATHEMATICS_QUESTIONS = [

  // ─── ALGEBRA ───────────────────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Algebra",q:"Solve the simultaneous equations x/2 − y/5 = 1 and y − x/3 = 8.",options:["x = 10, y = −6","x = 10, y = 6","x = 6, y = 10","x = −6, y = 10"],correct:2,explain:"From y − x/3 = 8, y = 8 + x/3. Substitute: x/2 − (8 + x/3)/5 = 1. Multiply by 30: 15x − 48 − 2x = 30, so 13x = 78, x = 6 and y = 10."},
  {subject:"Mathematics",topic:"Algebra",q:"Solve the inequality 2x + 3 > 5x + 8.",options:["x > 1⅔","x > −1⅔","x < −1⅔","x < 1⅔"],correct:2,explain:"3 − 8 > 5x − 2x gives −5 > 3x, so x < −5/3 = −1⅔."},
  {subject:"Mathematics",topic:"Algebra",q:"Given that a * b = (a + b)/(ab) + (a − b), find the value of 3 * 2.",options:["−6","11/6","6/11","−1⅚"],correct:1,explain:"3 * 2 = (3 + 2)/(3 × 2) + (3 − 2) = 5/6 + 1 = 11/6."},
  {subject:"Mathematics",topic:"Algebra",q:"If A = (θ/360)πr², make θ the subject of the formula.",options:["θ = 360π/A","θ = 360A/(πθ)","θ = 360A/(πr²)","θ = 360r²/(πA)"],correct:2,explain:"Multiply both sides by 360: 360A = θπr². Divide by πr²: θ = 360A/(πr²)."},
  {subject:"Mathematics",topic:"Algebra",q:"What is the maximum value of y = 2 − 4x − 2x²?",options:["4","5","3","2"],correct:0,explain:"dy/dx = −4 − 4x = 0 gives x = −1. Then y = 2 + 4 − 2 = 4. The x² coefficient is negative, so this turning point is a maximum."},
  {subject:"Mathematics",topic:"Algebra",q:"Solve x² + 3x − 4 ≤ 0.",options:["−4 ≥ x ≥ 1","4 ≤ x ≤ −1","4 ≥ x ≥ 1","−4 ≤ x ≤ 1"],correct:3,explain:"Factorise: (x + 4)(x − 1) ≤ 0. The parabola opens upward, so it is below zero between the roots: −4 ≤ x ≤ 1."},
  {subject:"Mathematics",topic:"Algebra",q:"A binary operation * is defined on the set X = {1, 2, 3, 4, 5, 6} as a * b = ab + a + b. Compute 1 * 3.",options:["14","4","7","5"],correct:2,explain:"1 * 3 = (1)(3) + 1 + 3 = 7."},

  // ─── SETS ──────────────────────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Sets",q:"The set {1, 2, 3, 4, 5} is equivalent to which of the following?",options:["{2, 3, 1, 4}","{1, 2, 3, 4, 5, 6}","{1, 2, 3, 4}","{4, 3, 1, 5, 2}"],correct:3,explain:"Sets are equal when they contain exactly the same elements, regardless of order. {4, 3, 1, 5, 2} has the same five elements. The other options have 4 or 6 elements, so they are not equivalent."},

  // ─── VARIATION ─────────────────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Variation",q:"Y is partly constant and partly varies as x. When x = 3, y = 7 and when x = 5, y = 11. Find the constants of variation.",options:["2, 3","1, 2","3, 2","3, 4"],correct:1,explain:"Let y = a + kx. Then 7 = a + 3k and 11 = a + 5k. Subtract: 4 = 2k, so k = 2 and a = 1. The constants are 1 and 2."},
  {subject:"Mathematics",topic:"Variation",q:"A varies directly as b². When A = 4, b = 1. Find A when b = 2.",options:["12","14","16","11"],correct:2,explain:"A = kb². When A = 4 and b = 1, k = 4. When b = 2, A = 4 × 4 = 16."},
  {subject:"Mathematics",topic:"Variation",q:"P is partly constant and varies partly as Q. If P = 32 when Q = 16 and P = 20 when Q = 12, find P when Q = 28.",options:["68","64","66","62"],correct:0,explain:"Let P = a + kQ. Then 32 = a + 16k and 20 = a + 12k. Subtract: 12 = 4k, so k = 3 and a = −16. When Q = 28, P = −16 + 84 = 68."},

  // ─── MATRICES & DETERMINANTS ───────────────────────────────────────────────
  {subject:"Mathematics",topic:"Matrices & Determinants",q:"Find the sum of the entries in the inverse of the matrix [[1, 2], [3, 5]].",options:["1","−1","2","0.5"],correct:1,explain:"det = (1)(5) − (2)(3) = −1. Inverse = (1/−1)[[5, −2], [−3, 1]] = [[−5, 2], [3, −1]]. Sum of entries = −5 + 2 + 3 − 1 = −1."},
  {subject:"Mathematics",topic:"Matrices & Determinants",q:"If I is a 2 × 2 identity matrix, find the determinant of I.",options:["1","2","−1","0"],correct:0,explain:"I = [[1, 0], [0, 1]]. det = (1)(1) − (0)(0) = 1."},
  {subject:"Mathematics",topic:"Matrices & Determinants",q:"The determinant of the matrix A = [[−2, 3, 1], [p, 2, 1], [1, 4, 2]] is −5. Find the value of p.",options:["0","2","3","1"],correct:2,explain:"Expand along row 1: −2(4 − 4) − 3(2p − 1) + 1(4p − 2) = −6p + 3 + 4p − 2 = 1 − 2p. Set 1 − 2p = −5, so p = 3."},
  {subject:"Mathematics",topic:"Matrices & Determinants",q:"Given that P = [[1, 2], [3, −5]] and Q = [[3, 1], [−7, 2]], find P + 2Q.",options:["[[7, 4], [−11, −1]]","[[7, 4], [−11, −9]]","[[−7, −4], [11, −1]]","[[11, 4], [−7, −1]]"],correct:0,explain:"2Q = [[6, 2], [−14, 4]]. Adding P: [[1 + 6, 2 + 2], [3 − 14, −5 + 4]] = [[7, 4], [−11, −1]]."},

  // ─── NUMBER BASES ──────────────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Number Bases",q:"Convert 137 to base 5.",options:["1022₅","2102₅","2210₅","2201₅"],correct:0,explain:"137 ÷ 5 = 27 r 2; 27 ÷ 5 = 5 r 2; 5 ÷ 5 = 1 r 0; 1 ÷ 5 = 0 r 1. Read the remainders upward: 1022₅."},
  {subject:"Mathematics",topic:"Number Bases",q:"If 54₁₀ = X₄, find the value of X.",options:["132₄","312₄","123₄","321₄"],correct:1,explain:"54 ÷ 4 = 13 r 2; 13 ÷ 4 = 3 r 1; 3 ÷ 4 = 0 r 3. Read the remainders upward: 312₄."},

  // ─── INDICES, SURDS & LOGARITHMS ───────────────────────────────────────────
  {subject:"Mathematics",topic:"Indices, Surds & Logarithms",q:"Simplify (125)^(−1/3) × (49)^(−1/2).",options:["1/35","1/350","350","35"],correct:0,explain:"125^(−1/3) = 1/∛125 = 1/5. 49^(−1/2) = 1/√49 = 1/7. Product = 1/5 × 1/7 = 1/35."},
  {subject:"Mathematics",topic:"Indices, Surds & Logarithms",q:"Simplify −log₁₀ 0.00001.",options:["−5","−4","5","4"],correct:2,explain:"0.00001 = 10⁻⁵, so log₁₀ 0.00001 = −5. The leading minus sign gives 5."},
  {subject:"Mathematics",topic:"Indices, Surds & Logarithms",q:"Find the value of t for which (1/2)^(t−1) = 64.",options:["−6","−5","−7","−4"],correct:1,explain:"64 = 2⁶ and (1/2)^(t−1) = 2^(1−t). So 1 − t = 6 and t = −5."},
  {subject:"Mathematics",topic:"Indices, Surds & Logarithms",q:"Solve for y in √75 − √12 + √27 = y√3.",options:["4√3","5√3","3√3","6√3"],correct:3,explain:"√75 = 5√3, √12 = 2√3, √27 = 3√3. So 5√3 − 2√3 + 3√3 = 6√3 and y = 6."},
  {subject:"Mathematics",topic:"Indices, Surds & Logarithms",q:"Express ⁴√0.0016 in standard form.",options:["2 × 10⁻¹","2 × 10⁰","2 × 10⁻²","2 × 10¹"],correct:0,explain:"0.0016 = 16 × 10⁻⁴. Fourth root: ⁴√16 × ⁴√10⁻⁴ = 2 × 10⁻¹ = 0.2."},

  // ─── SEQUENCES & SERIES ────────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Sequences & Series",q:"Given the progression 3, 5, 7, 9, ..., find an expression for the (n − 2)th term of the progression.",options:["2n − 1","2n + 1","2n + 3","2n − 3"],correct:3,explain:"The nth term is 3 + (n − 1)2 = 2n + 1. Replace n with (n − 2): 2(n − 2) + 1 = 2n − 3."},
  {subject:"Mathematics",topic:"Sequences & Series",q:"The second and fifth terms of a G.P. are 1 and 1/8 respectively. Find the common ratio.",options:["1/4","1/5","1/2","1/3"],correct:2,explain:"ar = 1 and ar⁴ = 1/8. Divide: r³ = 1/8, so r = 1/2."},

  // ─── COORDINATE GEOMETRY ───────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Coordinate Geometry",q:"Find the coordinates of the midpoint of line PQ given P(−3, 4) and Q(5, 6).",options:["(1, 4)","(4, 1)","(5, 1)","(1, 5)"],correct:3,explain:"Midpoint = ((−3 + 5)/2, (4 + 6)/2) = (1, 5)."},
  {subject:"Mathematics",topic:"Coordinate Geometry",q:"Obtain the equation of a straight line passing through (3, 15) whose slope = 3⅕.",options:["5y + 16x + 27 = 0","5y − 16x + 27 = 0","5y − 16x − 27 = 0","5y + 16x − 27 = 0"],correct:2,explain:"Slope = 3⅕ = 16/5. y − 15 = (16/5)(x − 3). Multiply by 5: 5y − 75 = 16x − 48, so 5y − 16x − 27 = 0."},

  // ─── PLANE GEOMETRY ────────────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Plane Geometry",q:"Which of the following angles cannot be constructed using a protractor, a compass, and a sharpened pencil?",options:["135°","90°","145°","60°"],correct:2,explain:"With compass and straightedge, 60° and 90° are direct constructions, and 135° = 90° + 45° (45° is half of 90°). 145° cannot be built this way."},
  {subject:"Mathematics",topic:"Plane Geometry",q:"Calculate the interior angle of a 5-sided regular polygon.",options:["120°","90°","108°","180°"],correct:2,explain:"Interior angle = (n − 2) × 180°/n = 3 × 180°/5 = 108°."},
  {subject:"Mathematics",topic:"Plane Geometry",q:"The chord of a circle of radius 17 cm is 30 cm long. Calculate the distance of the chord from the centre of the circle.",options:["15 cm","47 cm","8 cm","169 cm"],correct:2,explain:"The perpendicular from the centre bisects the chord, so half-chord = 15 cm. Distance = √(17² − 15²) = √(289 − 225) = √64 = 8 cm."},

  // ─── TRIGONOMETRY ──────────────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Trigonometry",q:"Given that cos A = 12/13 for 0 ≤ A ≤ 90°, find tan A.",options:["5/12","12/13","5/13","13/12"],correct:0,explain:"Adjacent = 12, hypotenuse = 13, so opposite = √(169 − 144) = 5. tan A = opposite/adjacent = 5/12."},
  {subject:"Mathematics",topic:"Trigonometry",q:"If cos θ = x/y, find tan θ in terms of x and y.",options:["√(y² − x²)/x","√(y² + x²)/x","√(y² − x²)/y","√(x² − y²)/x"],correct:0,explain:"Adjacent = x, hypotenuse = y, so opposite = √(y² − x²). tan θ = opposite/adjacent = √(y² − x²)/x."},
  {subject:"Mathematics",topic:"Trigonometry",q:"A bird flies from a tree P on a bearing of N60°E to a building Q, a distance of 200 km. It then changes course and flies to another tree R on a bearing of S30°E. Tree R is directly east of tree P. Calculate the distance of the building to tree R.",options:["200√3/3 km","100√3/3 km","100 km","200√3 km"],correct:0,explain:"Q is 200 cos 60° = 100 km north of the east-west line through P and R. From Q, R lies on bearing S30°E, so the vertical drop of 100 km equals QR × cos 30°. QR = 100/cos 30° = 200/√3 = 200√3/3 km."},

  // ─── CALCULUS ──────────────────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Calculus",q:"Integrate y = 4x³ + 2x + cos x.",options:["x⁴ − x² − sin x + C","x⁴ + x² + sin x + C","x⁴ − x² + sin x + C","x⁴ + x² − sin x + C"],correct:1,explain:"∫4x³ dx = x⁴, ∫2x dx = x², ∫cos x dx = sin x. Result: x⁴ + x² + sin x + C."},
  {subject:"Mathematics",topic:"Calculus",q:"Find the limit of y = (x³ − 2x² + 6x − 12)/(x − 2) as x goes to 2.",options:["Infinity","10","0","12"],correct:1,explain:"Factorise the numerator: x²(x − 2) + 6(x − 2) = (x² + 6)(x − 2). Cancel (x − 2) to get x² + 6. At x = 2 this is 10."},
  {subject:"Mathematics",topic:"Calculus",q:"Find the derivative of y = sin 4x.",options:["−4 sin x","−4 cos x","4 sin 4x","4 cos 4x"],correct:3,explain:"Chain rule: d/dx (sin 4x) = cos 4x × 4 = 4 cos 4x."},
  {subject:"Mathematics",topic:"Calculus",q:"Integrate the function y = 3x² + 2x − 5 with respect to x.",options:["x³ + x² − 5x + C","x² + 2x² − 5x + C","x² + 2x − 5 + C","x³ + 2x − 5 + C"],correct:0,explain:"∫3x² dx = x³, ∫2x dx = x², ∫−5 dx = −5x. Result: x³ + x² − 5x + C."},

  // ─── PROBABILITY ───────────────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Probability",q:"In a basket of fruits, there are 6 grapes, 11 bananas, and 13 oranges. If one fruit is chosen at random, what is the probability that the fruit is either a grape or a banana?",options:["17/30","11/30","6/30","5/30"],correct:0,explain:"Total fruits = 6 + 11 + 13 = 30. Grapes or bananas = 6 + 11 = 17. Probability = 17/30."},
  {subject:"Mathematics",topic:"Probability",q:"Find the probability of getting an even number in a single throw of a six-sided die.",options:["1/4","1/5","1/2","1/3"],correct:2,explain:"Even numbers are 2, 4 and 6, which is 3 of 6 outcomes. Probability = 3/6 = 1/2."},
  {subject:"Mathematics",topic:"Probability",q:"If the probability of death is q and the probability of survival is p, find the probability of one death and one survival in an accident involving two persons.",options:["pq","2pq","p − q","p + q"],correct:1,explain:"There are two ways: first person dies and second survives (qp), or first survives and second dies (pq). Total = pq + pq = 2pq."},

  // ─── PERMUTATIONS & COMBINATIONS ───────────────────────────────────────────
  {subject:"Mathematics",topic:"Permutations & Combinations",q:"Find the number of permutations of the letters of the word SCHOOL.",options:["600","360","480","300"],correct:1,explain:"SCHOOL has 6 letters with O repeated twice. Permutations = 6!/2! = 720/2 = 360."},
  {subject:"Mathematics",topic:"Permutations & Combinations",q:"The word HANDIER can be arranged in how many ways?",options:["3080","2650","4050","5040"],correct:3,explain:"HANDIER has 7 distinct letters, so the number of arrangements is 7! = 5040."},

  // ─── STATISTICS ────────────────────────────────────────────────────────────
  {subject:"Mathematics",topic:"Statistics",q:"The average weight of 15 iron bars is 1000 kg. If the heaviest iron bar is removed, the average weight is reduced by 5 kg. Find the weight in kg of the heaviest iron bar.",options:["1170 kg","1270 kg","1070 kg","1370 kg"],correct:2,explain:"Total weight = 15 × 1000 = 15000 kg. The remaining 14 bars average 995 kg, so their total is 14 × 995 = 13930 kg. Heaviest bar = 15000 − 13930 = 1070 kg."},
  {subject:"Mathematics",topic:"Statistics",q:"The mean of the numbers 0, x + 2, 3x + 6, and 4x + 8 is 4. Find the value of x.",options:["2/5","2/9","0","4"],correct:2,explain:"The sum is 0 + (x + 2) + (3x + 6) + (4x + 8) = 8x + 16. The mean is (8x + 16)/4 = 4, so 8x + 16 = 16 and x = 0."},

  // ─── ARITHMETIC (FRACTIONS, PROFIT, INTEREST) ──────────────────────────────
  {subject:"Mathematics",topic:"Arithmetic",q:"Simplify (3/4 ÷ 2¼) of 1 7/11 × (3⅔ − 1⅚).",options:["7/11","11/7","1","5/11"],correct:2,explain:"3/4 ÷ 9/4 = 1/3. 1 7/11 = 18/11. 3⅔ − 1⅚ = 11/3 − 11/6 = 11/6. Product = 1/3 × 18/11 × 11/6 = 198/198 = 1."},
  {subject:"Mathematics",topic:"Arithmetic",q:"A car dealer bought a used car for ₦270,000 and spent ₦70,000 to refurbish it. He later sold the car for ₦490,000. What was the percentage profit (to 1 decimal place)?",options:["30%","35%","25%","44.1%"],correct:3,explain:"Total cost = 270,000 + 70,000 = ₦340,000. Profit = 490,000 − 340,000 = ₦150,000. Percentage profit = 150,000/340,000 × 100 = 44.1%."},
  {subject:"Mathematics",topic:"Arithmetic",q:"A banker spent 1/5 of his salary on shirts, 1/3 of the remainder on transport, and kept the rest for contingencies. What fraction was left?",options:["6/15","8/15","7/15","4/5"],correct:1,explain:"After shirts, 4/5 remains. Transport takes 1/3 of 4/5 = 4/15. Left = 4/5 − 4/15 = 12/15 − 4/15 = 8/15."},
  {subject:"Mathematics",topic:"Arithmetic",q:"An amount of ₦600,000.00 was realized when a principal y was saved at 5% simple interest for 4 years. Find the value of y.",options:["₦570,000","₦500,000","₦300,000","₦400,000"],correct:1,explain:"Amount = y + (y × 5 × 4)/100 = 1.2y. So 1.2y = 600,000 and y = ₦500,000."}
];
