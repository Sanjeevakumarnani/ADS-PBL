# Comparison-Based Sorting Algorithm Analyzer
### ADS Mini-Project | Language: C

---

## Project Structure

```
SSK/
├── sorting_analyzer.c    ← Main source file (all algorithms + UI)
├── sorting_analyzer.exe  ← Compiled executable
├── Makefile              ← Build script
└── README.md             ← This file
```

---

## Algorithms Implemented

| # | Algorithm      | Best      | Average    | Worst      | Space  |
|---|----------------|-----------|------------|------------|--------|
| 1 | Bubble Sort    | O(n)      | O(n²)      | O(n²)      | O(1)   |
| 2 | Selection Sort | O(n²)     | O(n²)      | O(n²)      | O(1)   |
| 3 | Insertion Sort | O(n)      | O(n²)      | O(n²)      | O(1)   |
| 4 | Merge Sort     | O(n log n)| O(n log n) | O(n log n) | O(n)   |
| 5 | Quick Sort     | O(n log n)| O(n log n) | O(n²)      | O(log n)|
| 6 | Heap Sort      | O(n log n)| O(n log n) | O(n log n) | O(1)   |

---

## Features

- ✅ Manual array input (up to 10,000 elements)
- ✅ Random array generation with configurable size & range
- ✅ Run any single algorithm with full metric report
- ✅ Compare **all 6 algorithms** side-by-side on the same array
- ✅ Tracks **comparisons**, **swaps/movements**, and **execution time (ms)**
- ✅ Color-coded performance table (green = best in column)
- ✅ Optimized implementations (early-exit Bubble, median-of-3 Quick)

---

## How to Compile

### Using GCC (MinGW / MSYS2):
```bash
gcc -O2 -Wall -o sorting_analyzer.exe sorting_analyzer.c
```

### Using Clang:
```bash
clang -O2 -Wall -o sorting_analyzer.exe sorting_analyzer.c
```

### Using Makefile:
```bash
make
```

---

## How to Run

```
sorting_analyzer.exe
```

Then follow the interactive menu:

```
  ┌─────────────────────────────────────┐
  │           MAIN MENU                 │
  ├─────────────────────────────────────┤
  │  1. Enter / change input array      │
  │  2. Run a single sorting algorithm  │
  │  3. Compare ALL algorithms          │
  │  4. Display current array           │
  │  5. Generate random array           │
  │  6. Exit                            │
  └─────────────────────────────────────┘
```

---

## Sample Output (n = 1000 random elements)

```
╔══════════════╦══════════════╦══════════════╦══════════════╦════════════════════════════════╗
║  Algorithm   ║ Comparisons  ║  Swaps/Mvts  ║  Time (ms)   ║  Time Complexity               ║
╠══════════════╬══════════════╬══════════════╬══════════════╬════════════════════════════════╣
║ Bubble Sort  ║       498501 ║       251782 ║      12.4000 ║ O(n²)                          ║
║ Selection.. ║       499500 ║          999 ║       8.2000 ║ O(n²)                          ║
║ Insertion.. ║       252000 ║       251000 ║       5.1000 ║ O(n²)                          ║
║ Merge Sort  ║         8720 ║        9976  ║       0.5000 ║ O(n log n)                     ║
║ Quick Sort  ║         7840 ║        2341  ║       0.3000 ║ Avg O(n log n) | Worst O(n²)   ║
║ Heap Sort   ║        12430 ║        4812  ║       0.4000 ║ O(n log n)                     ║
╚══════════════╩══════════════╩══════════════╩══════════════╩════════════════════════════════╝
  ★ Green = best in that column
```

---

## ADS Concepts Covered

| Concept              | Used By                          |
|----------------------|----------------------------------|
| In-place sorting     | Bubble, Selection, Insertion, Heap|
| Divide & Conquer     | Merge Sort, Quick Sort            |
| Recursion            | Merge Sort, Quick Sort, Heap Sort |
| Heap data structure  | Heap Sort                         |
| Algorithm Analysis   | Big-O, comparisons, time metrics  |
| Stability            | Bubble ✓, Insertion ✓, Merge ✓   |
