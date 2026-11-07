/*
 * ============================================================
 *  Comparison-Based Sorting Algorithm Analyzer
 *  ADS Mini-Project
 * ============================================================
 *  Algorithms : Bubble Sort, Selection Sort, Insertion Sort,
 *               Merge Sort, Quick Sort, Heap Sort
 *  Metrics    : Comparisons, Swaps/Movements, Execution Time
 *  Language   : C  |  Interface: Menu-driven Console App
 * ============================================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/* ─── ANSI colour codes ─────────────────────────────────── */
#define RESET   "\033[0m"
#define BOLD    "\033[1m"
#define RED     "\033[1;31m"
#define GREEN   "\033[1;32m"
#define YELLOW  "\033[1;33m"
#define CYAN    "\033[1;36m"
#define MAGENTA "\033[1;35m"
#define BLUE    "\033[1;34m"
#define WHITE   "\033[1;37m"

/* ─── Metric struct for one algorithm run ───────────────── */
typedef struct {
    char   name[30];
    long long comparisons;
    long long swaps;
    double time_ms;
} Metrics;

/* ─── Global working copy helpers ───────────────────────── */
static long long g_cmp;   /* comparisons counter */
static long long g_swp;   /* swaps / movements counter */

/* ═══════════════════════════════════════════════════════════
 *  UTILITY FUNCTIONS
 * ═══════════════════════════════════════════════════════════ */

void copy_array(int *src, int *dst, int n) {
    if (n > 0) memcpy(dst, src, (size_t)n * sizeof(int));
}

void print_array(int *arr, int n, const char *label) {
    printf("%s%s:%s ", CYAN, label, RESET);
    for (int i = 0; i < n; i++) {
        printf("%d", arr[i]);
        if (i < n - 1) printf(", ");
    }
    printf("\n");
}

/* ═══════════════════════════════════════════════════════════
 *  1. BUBBLE SORT  –  O(n²)
 * ═══════════════════════════════════════════════════════════ */
void bubble_sort(int *arr, int n) {
    g_cmp = 0; g_swp = 0;
    for (int i = 0; i < n - 1; i++) {
        int swapped = 0;
        for (int j = 0; j < n - i - 1; j++) {
            g_cmp++;
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
                g_swp++;
                swapped = 1;
            }
        }
        if (!swapped) break;   /* early exit optimisation */
    }
}

/* ═══════════════════════════════════════════════════════════
 *  2. SELECTION SORT  –  O(n²)
 * ═══════════════════════════════════════════════════════════ */
void selection_sort(int *arr, int n) {
    g_cmp = 0; g_swp = 0;
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            g_cmp++;
            if (arr[j] < arr[min_idx]) min_idx = j;
        }
        if (min_idx != i) {
            int tmp = arr[i]; arr[i] = arr[min_idx]; arr[min_idx] = tmp;
            g_swp++;
        }
    }
}

/* ═══════════════════════════════════════════════════════════
 *  3. INSERTION SORT  –  O(n²)
 * ═══════════════════════════════════════════════════════════ */
void insertion_sort(int *arr, int n) {
    g_cmp = 0; g_swp = 0;
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0) {
            g_cmp++;
            if (arr[j] > key) {
                arr[j + 1] = arr[j];
                g_swp++;    /* each shift counts as a movement */
                j--;
            } else break;
        }
        arr[j + 1] = key;
    }
}

/* ═══════════════════════════════════════════════════════════
 *  4. MERGE SORT  –  O(n log n)
 * ═══════════════════════════════════════════════════════════ */
void merge(int *arr, int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int *L = (int *)malloc(n1 * sizeof(int));
    int *R = (int *)malloc(n2 * sizeof(int));

    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        g_cmp++;
        if (L[i] <= R[j]) { arr[k++] = L[i++]; }
        else               { arr[k++] = R[j++]; }
        g_swp++;   /* each placement is a movement */
    }
    while (i < n1) { arr[k++] = L[i++]; g_swp++; }
    while (j < n2) { arr[k++] = R[j++]; g_swp++; }

    free(L); free(R);
}

void merge_sort_rec(int *arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        merge_sort_rec(arr, l, m);
        merge_sort_rec(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

void merge_sort(int *arr, int n) {
    g_cmp = 0; g_swp = 0;
    merge_sort_rec(arr, 0, n - 1);
}

/* ═══════════════════════════════════════════════════════════
 *  5. QUICK SORT  –  Average O(n log n)
 * ═══════════════════════════════════════════════════════════ */
int partition(int *arr, int low, int high) {
    /* Median-of-three pivot for better average performance */
    int mid = low + (high - low) / 2;
    if (arr[low] > arr[mid])  { int t=arr[low]; arr[low]=arr[mid]; arr[mid]=t; g_swp++; }
    if (arr[low] > arr[high]) { int t=arr[low]; arr[low]=arr[high]; arr[high]=t; g_swp++; }
    if (arr[mid] > arr[high]) { int t=arr[mid]; arr[mid]=arr[high]; arr[high]=t; g_swp++; }

    int pivot = arr[mid];
    int tmp = arr[mid]; arr[mid] = arr[high - 1]; arr[high - 1] = tmp; g_swp++;

    int i = low, j = high - 1;
    while (1) {
        while (arr[++i] < pivot) { g_cmp++; }  g_cmp++;
        while (arr[--j] > pivot) { g_cmp++; }  g_cmp++;
        if (i >= j) break;
        tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; g_swp++;
    }
    tmp = arr[i]; arr[i] = arr[high - 1]; arr[high - 1] = tmp; g_swp++;
    return i;
}

void quick_sort_rec(int *arr, int low, int high) {
    if (high - low < 3) {
        /* insertion sort for tiny sub-arrays */
        for (int i = low + 1; i <= high; i++) {
            int key = arr[i], j = i - 1;
            while (j >= low) {
                g_cmp++;
                if (arr[j] > key) { arr[j+1]=arr[j]; g_swp++; j--; }
                else break;
            }
            arr[j+1] = key;
        }
        return;
    }
    int p = partition(arr, low, high);
    quick_sort_rec(arr, low, p - 1);
    quick_sort_rec(arr, p + 1, high);
}

void quick_sort(int *arr, int n) {
    g_cmp = 0; g_swp = 0;
    if (n > 1) quick_sort_rec(arr, 0, n - 1);
}

/* ═══════════════════════════════════════════════════════════
 *  6. HEAP SORT  –  O(n log n)
 * ═══════════════════════════════════════════════════════════ */
void heapify(int *arr, int n, int i) {
    int largest = i, l = 2*i+1, r = 2*i+2;
    if (l < n) { g_cmp++; if (arr[l] > arr[largest]) largest = l; }
    if (r < n) { g_cmp++; if (arr[r] > arr[largest]) largest = r; }
    if (largest != i) {
        int tmp = arr[i]; arr[i] = arr[largest]; arr[largest] = tmp;
        g_swp++;
        heapify(arr, n, largest);
    }
}

void heap_sort(int *arr, int n) {
    g_cmp = 0; g_swp = 0;
    for (int i = n/2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int tmp = arr[0]; arr[0] = arr[i]; arr[i] = tmp;
        g_swp++;
        heapify(arr, n, i);  /* reduce heap size by 1 */
        /* NOTE: heapify call above uses reduced size i, not n */
    }
}

/* ═══════════════════════════════════════════════════════════
 *  TIMED RUNNER  – runs one algorithm and records metrics
 * ═══════════════════════════════════════════════════════════ */
Metrics run_algorithm(const char *name,
                      void (*sort_fn)(int *, int),
                      int *original, int n) {
    int *arr = (int *)malloc(n * sizeof(int));
    copy_array(original, arr, n);

    clock_t start = clock();
    sort_fn(arr, n);
    clock_t end   = clock();

    Metrics m;
    strncpy(m.name, name, sizeof(m.name) - 1);
    m.comparisons = g_cmp;
    m.swaps       = g_swp;
    m.time_ms     = 1000.0 * (double)(end - start) / CLOCKS_PER_SEC;

    free(arr);
    return m;
}

/* ═══════════════════════════════════════════════════════════
 *  DISPLAY HELPERS
 * ═══════════════════════════════════════════════════════════ */
void print_banner(void) {
    printf(BOLD CYAN);
    printf("\n╔══════════════════════════════════════════════════════╗\n");
    printf("║   COMPARISON-BASED SORTING ALGORITHM ANALYZER       ║\n");
    printf("║          ADS Mini-Project  |  Language: C            ║\n");
    printf("╚══════════════════════════════════════════════════════╝\n");
    printf(RESET);
}

void print_separator(void) {
    printf(YELLOW "──────────────────────────────────────────────────────\n" RESET);
}

void print_menu(void) {
    printf(BOLD WHITE "\n  ┌─────────────────────────────────────┐\n");
    printf("  │           MAIN MENU                 │\n");
    printf("  ├─────────────────────────────────────┤\n");
    printf("  │  1. Enter / change input array      │\n");
    printf("  │  2. Run a single sorting algorithm  │\n");
    printf("  │  3. Compare ALL algorithms          │\n");
    printf("  │  4. Display current array           │\n");
    printf("  │  5. Generate random array           │\n");
    printf("  │  6. Exit                            │\n");
    printf("  └─────────────────────────────────────┘\n" RESET);
    printf("  Choice: ");
}

void print_algo_menu(void) {
    printf(BOLD MAGENTA "\n  Pick a sorting algorithm:\n" RESET);
    printf("  1. Bubble Sort    (O(n²))\n");
    printf("  2. Selection Sort (O(n²))\n");
    printf("  3. Insertion Sort (O(n²))\n");
    printf("  4. Merge Sort     (O(n log n))\n");
    printf("  5. Quick Sort     (Avg O(n log n))\n");
    printf("  6. Heap Sort      (O(n log n))\n");
    printf("  Choice: ");
}

/* Complexity badge */
const char *complexity_of(int choice) {
    switch (choice) {
        case 1: return "O(n²)";
        case 2: return "O(n²)";
        case 3: return "O(n²)";
        case 4: return "O(n log n)";
        case 5: return "Avg O(n log n) | Worst O(n²)";
        case 6: return "O(n log n)";
        default: return "?";
    }
}

/* ═══════════════════════════════════════════════════════════
 *  PERFORMANCE TABLE
 * ═══════════════════════════════════════════════════════════ */
void print_comparison_table(Metrics *m, int count) {
    printf(BOLD CYAN
           "\n╔══════════════╦══════════════╦══════════════╦══════════════╦════════════════════════════════╗\n"
           "║  Algorithm   ║ Comparisons  ║  Swaps/Mvts  ║  Time (ms)   ║  Time Complexity               ║\n"
           "╠══════════════╬══════════════╬══════════════╬══════════════╬════════════════════════════════╣\n"
           RESET);

    const char *complexities[] = {
        "O(n²)",
        "O(n²)",
        "O(n²)",
        "O(n log n)",
        "Avg O(n log n) | Worst O(n²)",
        "O(n log n)"
    };

    /* find best (minimum) for highlighting */
    long long min_cmp = m[0].comparisons, min_swp = m[0].swaps;
    double    min_time = m[0].time_ms;
    for (int i = 1; i < count; i++) {
        if (m[i].comparisons < min_cmp) min_cmp = m[i].comparisons;
        if (m[i].swaps       < min_swp) min_swp = m[i].swaps;
        if (m[i].time_ms     < min_time) min_time = m[i].time_ms;
    }

    for (int i = 0; i < count; i++) {
        const char *row_col = (i % 2 == 0) ? WHITE : RESET;
        const char *cmp_col = (m[i].comparisons == min_cmp) ? GREEN : row_col;
        const char *swp_col = (m[i].swaps       == min_swp) ? GREEN : row_col;
        const char *tim_col = (m[i].time_ms      <= min_time + 0.001) ? GREEN : row_col;

        printf("%s║ %-12s ║%s %12lld %s║%s %12lld %s║%s %10.4f ms %s║ %-30s ║\n" RESET,
               row_col,
               m[i].name,
               cmp_col, m[i].comparisons, row_col,
               swp_col, m[i].swaps,       row_col,
               tim_col, m[i].time_ms,     row_col,
               complexities[i]);
    }

    printf(BOLD CYAN
           "╚══════════════╩══════════════╩══════════════╩══════════════╩════════════════════════════════╝\n"
           RESET);
    printf(GREEN "  ★ Green  = best in that column\n" RESET);
}

/* ═══════════════════════════════════════════════════════════
 *  SINGLE ALGORITHM RUNNER (interactive)
 * ═══════════════════════════════════════════════════════════ */
void run_single(int *original, int n) {
    if (n == 0) {
        printf(RED "  ✗ No array loaded. Please enter an array first.\n" RESET);
        return;
    }

    print_algo_menu();
    int choice;
    if (scanf("%d", &choice) != 1 || choice < 1 || choice > 6) {
        printf(RED "  ✗ Invalid choice.\n" RESET);
        while (getchar() != '\n');
        return;
    }

    const char *names[] = { "Bubble Sort","Selection Sort","Insertion Sort",
                             "Merge Sort","Quick Sort","Heap Sort" };
    void (*fns[])(int *, int) = { bubble_sort, selection_sort, insertion_sort,
                                   merge_sort,  quick_sort,    heap_sort };

    int *arr = (int *)malloc(n * sizeof(int));
    copy_array(original, arr, n);

    printf(YELLOW "\n  Original: " RESET);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\n");

    Metrics m = run_algorithm(names[choice-1], fns[choice-1], original, n);

    /* show sorted result */
    copy_array(original, arr, n);
    fns[choice-1](arr, n);

    printf(GREEN "  Sorted  : " RESET);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\n");

    print_separator();
    printf(BOLD "  Algorithm   : %s\n" RESET, m.name);
    printf("  Complexity   : %s%s%s\n", MAGENTA, complexity_of(choice), RESET);
    printf("  Comparisons  : %s%lld%s\n", CYAN,   m.comparisons, RESET);
    printf("  Swaps/Mvmts  : %s%lld%s\n", CYAN,   m.swaps,       RESET);
    printf("  Execution    : %s%.4f ms%s\n", CYAN, m.time_ms,     RESET);
    print_separator();

    free(arr);
}

/* ═══════════════════════════════════════════════════════════
 *  COMPARE ALL
 * ═══════════════════════════════════════════════════════════ */
void compare_all(int *original, int n) {
    if (n == 0) {
        printf(RED "  ✗ No array loaded. Please enter an array first.\n" RESET);
        return;
    }

    const char *names[] = { "Bubble Sort","Selection Sort","Insertion Sort",
                             "Merge Sort","Quick Sort","Heap Sort" };
    void (*fns[])(int *, int) = { bubble_sort, selection_sort, insertion_sort,
                                   merge_sort,  quick_sort,    heap_sort };

    printf(YELLOW "\n  Running all 6 algorithms on %d elements …\n\n" RESET, n);

    Metrics results[6];
    for (int i = 0; i < 6; i++) {
        results[i] = run_algorithm(names[i], fns[i], original, n);
        printf("  %s%-15s%s … done\n", GREEN, names[i], RESET);
    }

    print_comparison_table(results, 6);
}

/* ═══════════════════════════════════════════════════════════
 *  INPUT HELPERS
 * ═══════════════════════════════════════════════════════════ */
int read_array(int **arr) {
    printf(BOLD "\n  Enter number of elements (1 – 10000): " RESET);
    int n;
    if (scanf("%d", &n) != 1 || n < 1 || n > 10000) {
        printf(RED "  ✗ Invalid size.\n" RESET);
        while (getchar() != '\n');
        return 0;
    }

    *arr = (int *)realloc(*arr, n * sizeof(int));
    if (!*arr) { printf(RED "  ✗ Memory allocation failed.\n" RESET); return 0; }

    printf("  Enter %d integers (space-separated):\n  > ", n);
    for (int i = 0; i < n; i++) {
        if (scanf("%d", &(*arr)[i]) != 1) {
            printf(RED "  ✗ Invalid input at position %d.\n" RESET, i + 1);
            while (getchar() != '\n');
            return 0;
        }
    }
    printf(GREEN "  ✓ Array loaded (%d elements).\n" RESET, n);
    return n;
}

int generate_random(int **arr) {
    printf(BOLD "\n  Enter number of random elements (1 – 10000): " RESET);
    int n;
    if (scanf("%d", &n) != 1 || n < 1 || n > 10000) {
        printf(RED "  ✗ Invalid size.\n" RESET);
        while (getchar() != '\n');
        return 0;
    }

    printf("  Range max (e.g. 1000): ");
    int rmax;
    if (scanf("%d", &rmax) != 1 || rmax < 1) rmax = 1000;

    *arr = (int *)realloc(*arr, n * sizeof(int));
    srand((unsigned)time(NULL));
    for (int i = 0; i < n; i++) (*arr)[i] = rand() % rmax + 1;

    printf(GREEN "  ✓ Random array of %d elements generated (range 1–%d).\n" RESET, n, rmax);
    return n;
}

/* ═══════════════════════════════════════════════════════════
 *  MAIN
 * ═══════════════════════════════════════════════════════════ */
int main(void) {
    /* Enable ANSI colours on Windows (requires Win10 1511+) */
#ifdef _WIN32
    system("chcp 65001 > nul");
#endif

    print_banner();

    int  *arr = NULL;
    int   n   = 0;
    int   choice;

    while (1) {
        print_menu();
        if (scanf("%d", &choice) != 1) {
            while (getchar() != '\n');
            continue;
        }

        switch (choice) {

        /* ── 1. Enter array ───────────────────────────── */
        case 1:
            n = read_array(&arr);
            break;

        /* ── 2. Single algorithm ──────────────────────── */
        case 2:
            run_single(arr, n);
            break;

        /* ── 3. Compare all ───────────────────────────── */
        case 3:
            compare_all(arr, n);
            break;

        /* ── 4. Display current array ─────────────────── */
        case 4:
            if (n == 0) {
                printf(RED "  ✗ No array loaded yet.\n" RESET);
            } else {
                printf(CYAN "\n  Current array (%d elements):\n  " RESET, n);
                for (int i = 0; i < n; i++) {
                    printf("%d", arr[i]);
                    if (i < n - 1) printf(", ");
                }
                printf("\n");
            }
            break;

        /* ── 5. Random array ──────────────────────────── */
        case 5:
            n = generate_random(&arr);
            break;

        /* ── 6. Exit ──────────────────────────────────── */
        case 6:
            printf(GREEN "\n  Thank you for using the Sorting Analyzer. Goodbye!\n\n" RESET);
            free(arr);
            return 0;

        default:
            printf(RED "  ✗ Invalid option. Try again.\n" RESET);
        }
    }
}
