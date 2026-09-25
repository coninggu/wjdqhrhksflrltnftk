# Algorithm Complexity and O-Notation

## 1. Overview

### A. Definition
> **Algorithm complexity** is the amount of resources an algorithm consumes as a function of the input size (n). It is divided into **time complexity**, which measures the number of operations, and **space complexity**, which measures memory. **O-Notation (Big-O)** is a way of expressing the **growth rate (asymptotic upper bound)** as the input becomes sufficiently large.

The reason we measure complexity by the **growth rate in the number of operations** rather than the actual execution time (in seconds) is important. Execution time varies with CPU performance, language, and compiler, so it cannot determine the relative merits of an algorithm itself. But "if the input doubles, by how much does the number of operations grow?" is an **intrinsic property of the algorithm** that is independent of hardware. That is why O-Notation discards constant and lower-order terms and keeps only the **growth rate of the most dominant term** — for example, 3n²+5n+7 is written as O(n²) because the n² term dominates as n grows.

### B. Types of Asymptotic Notation
There is not just O; there are three symbols that respectively express the upper bound, the lower bound, and the exact bound. In practice, since **guaranteeing the worst case** is important for design safety, **O**, which represents the upper bound, is the most widely used.

| Notation | Meaning | Perspective |
|---|---|---|
| **O (Big-O)** | Asymptotic upper bound | Worst — performance guarantee |
| **Ω (Big-Omega)** | Asymptotic lower bound | Best |
| **Θ (Big-Theta)** | Upper and lower bounds coincide | Exact growth rate (average) |

## 2. O-Notation Types and Operation Counts

The graph below shows how the operation count of each complexity diverges as the input size n grows. When n is small, the differences are negligible, but as n grows, anything O(n²) or worse diverges sharply and becomes practically infeasible. It is precisely this **difference at large n** that governs the choice of algorithm.

```chart
{
  "type": "line",
  "data": {
    "labels": ["1","2","4","8","16","32","64"],
    "datasets": [
      { "label": "O(1)", "data": [1,1,1,1,1,1,1], "borderColor": "#0e9f6e", "tension": 0.2 },
      { "label": "O(log n)", "data": [0,1,2,3,4,5,6], "borderColor": "#2f6fed", "tension": 0.2 },
      { "label": "O(n)", "data": [1,2,4,8,16,32,64], "borderColor": "#f59e0b", "tension": 0.2 },
      { "label": "O(n log n)", "data": [0,2,8,24,64,160,384], "borderColor": "#8b5cf6", "tension": 0.2 },
      { "label": "O(n^2)", "data": [1,4,16,64,256,1024,4096], "borderColor": "#e11d48", "tension": 0.2 }
    ]
  },
  "options": {
    "plugins": { "legend": { "position": "bottom" }, "title": { "display": true, "text": "Operation Count Growth vs. Input Size (n)" } },
    "scales": { "y": { "title": { "display": true, "text": "Number of Operations" } } }
  }
}
```

Each type arises from the **operational structure** of the algorithm. Once you understand why a given complexity results, you can gauge complexity just by looking at the code.

- **O(1) constant**: A constant amount of work regardless of input size. This is the case when the location is **computed in one step**, as in hash lookups or array index access.
- **O(log n) logarithmic**: A structure that **halves the search range** at each step. Binary search is the classic example; even for a million elements it finishes in about 20 steps.
- **O(n) linear**: A structure that **scans the input once**. Sequential search and sum computation are examples.
- **O(n log n) linearithmic**: A structure that splits the data (log n steps) and scans the whole (n) at each step. It is the lower bound of **efficient sorting** such as merge sort and quicksort.
- **O(n²) quadratic**: A structure that compares all pairs with a **nested loop**. Bubble sort and insertion sort fall here, and they slow down sharply as n grows.
- **O(2ⁿ) exponential**: A structure that **branches into twice as many cases** at each step. Non-memoized recursive Fibonacci and subset enumeration are examples.
- **O(n!) factorial**: A structure that tries every **permutation**. Brute-force search of the Traveling Salesman Problem (TSP) is the representative case, and it becomes uncomputable even at n=20.

| Type | Name | Structural Principle | Example |
|---|---|---|---|
| **O(1)** | Constant | Direct access | Hash lookup, array index |
| **O(log n)** | Logarithmic | Halving the range | Binary search |
| **O(n)** | Linear | Single traversal | Sequential search |
| **O(n log n)** | Linearithmic | Divide + traverse | Merge sort, quicksort |
| **O(n²)** | Quadratic | Nested loop (all pairs) | Bubble sort, insertion sort |
| **O(2ⁿ)** | Exponential | Branching by a factor of 2 | Subsets, recursive Fibonacci |
| **O(n!)** | Factorial | All permutations | TSP brute force |

> Growth rate: **O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)**

## 3. Case Analysis

Even the same algorithm performs differently depending on the state of the input, so we analyze the best, average, and worst cases separately. For example, **quicksort** averages O(n log n) when the pivot is close to the median each time, but on an already-sorted array with a poorly chosen pivot the partitioning becomes lopsided, resulting in **worst-case O(n²)**. In design, the **worst case (O)** should generally serve as the baseline so that performance is guaranteed in production service.

| Case | Notation | Meaning |
|---|---|---|
| **Best** | Ω | Performance on the fastest input |
| **Average** | Θ | Expected performance |
| **Worst** | O | Guaranteed upper bound — the design baseline |

## 4. Considerations and Implications
- **At large n, complexity dominates performance**: For small data the constant-factor differences are large, so O(n²) can even be faster than O(n log n), but at large scale the asymptotic complexity is decisive. Choosing an algorithm suited to the data scale is key.
- **Time-space trade-off**: Complexity is traded between time and space. For example, **caching and memoization** use more memory (space) to reduce repeated computation (time) — memoizing recursive Fibonacci reduces O(2ⁿ) to O(n), a representative case.
- **Complementing the limits of asymptotic analysis**: Constant terms, hardware, cache locality, and constant multipliers are ignored, so during actual tuning you should complement it with profiling and real measurements.
- **Connections and outlook**: Whether a problem can be solved in polynomial time (P) is a core topic of **computational complexity theory such as P vs. NP**, and NP-hard problems that are O(n!) like TSP are solved practically with **approximation, heuristics, and dynamic programming**. Complexity analysis is the basic yardstick for algorithm selection and optimization.

---

> **In one line**: O-Notation expresses an algorithm's *worst-case growth rate (asymptotic upper bound)* with respect to input size in a hardware-independent way; performance degrades sharply in the order *O(1)→O(log n)→O(n)→O(n log n)→O(n²)→O(2ⁿ)→O(n!)*, and algorithms are chosen considering the time-space trade-off and dominance at large n.
