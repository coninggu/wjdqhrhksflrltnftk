# Sorting Algorithms (Bubble, Insertion, Quick Sort)

## 1. Overview

### A. Definition
> A **sorting algorithm** is a technique that rearranges a given set of data in order according to a criterion specified by the user (ascending/descending). It is the most fundamental algorithm that governs the efficiency of other operations such as search and merge.

The key to understanding sorting algorithms is the '**trade-off among time complexity, stability, and additional memory**'. Simple algorithms (bubble, insertion) are easy to understand and implement, but as data grows they slow down dramatically to O(n²), while divide-and-conquer-based ones (quick, merge) are much faster at an average of O(n log n) but complex to implement. Add to this 'whether the relative order of equal values is preserved (stability)' and 'how much additional memory is used', and the choice appropriate to the situation changes. For example, if the data is almost sorted, the simple insertion sort is actually faster, and for large-scale random data, quick sort is advantageous. As for why sorting matters, in sorted data searching becomes dramatically faster through techniques such as binary search.

### B. Stability and In-place Sorting
A **stable sort** preserves the original order of elements with equal values, which is important in multi-key sorting (first by name, then by age). An **in-place sort** uses almost no additional memory, which is advantageous in memory-constrained environments.

## 2. Bubble Sort

> A method that repeatedly compares two adjacent elements and swaps them if they are in the wrong order, so that large values float toward the back of the array like bubbles.

After sweeping the array from start to end once, the largest value is fixed at the very end, and this is repeated n-1 times. It is the simplest to implement, but it repeats adjacent comparisons and swaps every time, making it highly inefficient.
- **Complexity**: time O(n²), space O(1), **stable sort**
- Used mainly for educational purposes rather than in practice.

## 3. Insertion Sort

> A method that takes new elements one at a time from a sorted subarray and **inserts them into the correct position**, the same as sorting cards held in your hand.

Starting from the second element, it compares that element with the preceding sorted section and inserts it into the appropriate position. The worst case is O(n²), but **on data that is already almost sorted, comparisons rarely occur, so it approaches O(n)** and is very fast. Because of this characteristic, it is practical for small-scale data or partially sorted data.
- **Complexity**: time O(n²) (best O(n)), space O(1), **stable sort**

## 4. Quick Sort

> A **divide-and-conquer** algorithm that selects one **pivot**, partitions the array into values smaller and larger than it, and recursively sorts each part again.

When partitioning around the pivot, the pivot finds its place, and recursively sorting the left and right parts in the same way sorts the whole. It is widely used as the fastest sort on average, but **if the pivot is chosen poorly (such as selecting the first element as the pivot on already-sorted data), it worsens to O(n²)**.
- **Complexity**: average O(n log n), worst O(n²), space O(log n), **unstable sort**

## 5. Comparison

| Algorithm | Average | Worst | Space | Stability |
|---|---|---|---|---|
| **Bubble sort** | O(n²) | O(n²) | O(1) | Stable |
| **Insertion sort** | O(n²) | O(n²) (best O(n)) | O(1) | Stable |
| **Quick sort** | O(n log n) | O(n²) | O(log n) | Unstable |

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Bubble", "Insertion", "Quick"],
    "datasets": [{
      "label": "Average comparison operations (n=1000, relative)",
      "data": [1000000, 250000, 10000],
      "backgroundColor": ["#e11d48", "#f59e0b", "#2f6fed"]
    }]
  },
  "options": {
    "plugins": { "legend": { "display": false }, "title": { "display": true, "text": "Average operation count comparison (conceptual example)" } },
    "scales": { "y": { "title": { "display": true, "text": "Operation count (relative)" } } }
  }
}
```

The graph above shows how dramatic the difference in operation count is between the O(n²) family (bubble, insertion) and the O(n log n) family (quick) when n=1000. As the data grows, this gap widens exponentially.

## 6. Considerations and Implications

1. **Optimizations to avoid quick sort's worst case of O(n²)** are important. Choosing the pivot randomly or using the median-of-three can avoid the worst case.
2. **When stability is needed, use merge sort.** When order preservation matters in multi-key sorting, merge sort, a stable sort, is appropriate.
3. **Practical libraries use hybrids.** The standard sorts of Java and Python use Timsort (merge + insertion), and C++ STL uses Introsort (quick + heap + insertion); they switch algorithms depending on data size and state to secure optimal performance and stability.

---

> **In one line**: Bubble and insertion sort are *simple O(n²) sorts* (insertion being efficient on nearly sorted data), and quick sort is a *fast average-O(n log n) divide-and-conquer* but worst-case O(n²); depending on stability and data characteristics, merge sort or a hybrid (Timsort, Introsort) is chosen.
