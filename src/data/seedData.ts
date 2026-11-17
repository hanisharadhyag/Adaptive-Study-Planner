import { AppState, PlannerConfig, Subject, Topic } from '../types/study';
import { DEFAULT_BKT_PARAMS } from '../utils/bkt';
import { generateAdaptiveSchedule } from '../utils/scheduler';

export const STUDENT_AVATAR_URL =
  '/src/assets/images/avatar_alex_rivera_1794909965892.jpg';

const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-ds',
    name: 'Data Structures',
    code: 'CS 201',
    enabled: true,
  },
  {
    id: 'sub-algo',
    name: 'Algorithms',
    code: 'CS 301',
    enabled: false,
  },
];

const INITIAL_TOPICS: Topic[] = [
  {
    id: 'topic-arrays',
    subjectId: 'sub-ds',
    name: 'Arrays',
    description: 'Contiguous memory indexing, sliding windows, prefix sums, and dynamic resizing.',
    mastery: 0.78,
    enabled: true,
    lastPracticedAt: '2026-11-15T16:20:00Z',
    questions: [
      {
        id: 'arr-1',
        prompt: 'What is the worst-case time complexity of accessing an element by index in a static array?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 0,
        explanation:
          'Arrays store elements in contiguous memory, so the address base + index * size is computed in constant O(1) time.',
      },
      {
        id: 'arr-2',
        prompt: 'Why is appending to a dynamic array (like std::vector or Python list) O(1) amortized time?',
        options: [
          'It allocates memory in a linked chain of blocks',
          'Capacity doubles on overflow, spreading copy cost across insertions',
          'The OS reserves unlimited virtual pages automatically',
          'Elements are hashed directly to slots without shifting',
        ],
        correctIndex: 1,
        explanation:
          'Geometric resizing (typically doubling capacity) ensures O(n) copies happen infrequently enough that total work over n appends is O(n).',
      },
      {
        id: 'arr-3',
        prompt: 'Which technique optimizes range-sum queries on a static integer array to O(1) per query?',
        options: [
          'Bubble sort preprocessing',
          'Prefix sum array',
          'Depth-first traversal',
          'Recursive binary splitting on each query',
        ],
        correctIndex: 1,
        explanation:
          'A prefix sum array stores cumulative totals so sum(L..R) = prefix[R + 1] - prefix[L] in O(1) time.',
      },
      {
        id: 'arr-4',
        prompt: 'What is the time complexity of inserting a new element at index 0 of an array of size n?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctIndex: 2,
        explanation:
          'Every existing element must be shifted one position to the right, requiring O(n) operations.',
      },
    ],
  },
  {
    id: 'topic-linked-lists',
    subjectId: 'sub-ds',
    name: 'Linked Lists',
    description: 'Singly and doubly linked nodes, pointer manipulation, cycle detection, and reversal.',
    mastery: 0.28,
    enabled: true,
    lastPracticedAt: '2026-11-14T19:10:00Z',
    questions: [
      {
        id: 'll-1',
        prompt: 'In a singly linked list with only a head pointer, what is the time complexity to delete the last node?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 2,
        explanation:
          'Without a pointer to the second-to-last node, you must traverse from the head to update its next pointer to null, taking O(n).',
      },
      {
        id: 'll-2',
        prompt: 'Which algorithm detects a cycle in a linked list using O(1) extra space?',
        options: [
          'Storing visited node addresses in a HashSet',
          "Floyd's Tortoise and Hare (fast & slow pointers)",
          'Binary search on node values',
          'Breadth-first level traversal',
        ],
        correctIndex: 1,
        explanation:
          'Moving a slow pointer by 1 step and a fast pointer by 2 steps guarantees they meet inside any cycle using O(1) memory.',
      },
      {
        id: 'll-3',
        prompt: 'What advantage does a doubly linked list have over a singly linked list when given a direct reference to a node?',
        options: [
          'O(1) random access by numeric index',
          'Half the memory overhead per node',
          'O(1) deletion of that node without traversing from head',
          'Automatic sorting during insertion',
        ],
        correctIndex: 2,
        explanation:
          'Because each node stores both prev and next pointers, you can re-link neighbors directly in O(1) time.',
      },
      {
        id: 'll-4',
        prompt: 'When reversing a singly linked list iteratively, how many pointer variables are typically tracked in the loop?',
        options: [
          '1 (curr only)',
          '3 (prev, curr, nextTemp)',
          'n pointers in an auxiliary array',
          '2 (head and tail only)',
        ],
        correctIndex: 1,
        explanation:
          'You save nextTemp = curr.next before flipping curr.next = prev, then advance prev and curr.',
      },
    ],
  },
  {
    id: 'topic-stacks',
    subjectId: 'sub-ds',
    name: 'Stacks',
    description: 'LIFO invariants, call frames, expression parsing, and monotonic stack patterns.',
    mastery: 0.55,
    enabled: true,
    lastPracticedAt: '2026-11-15T11:00:00Z',
    questions: [
      {
        id: 'stk-1',
        prompt: 'Which ordering principle governs a Stack data structure?',
        options: [
          'First-In, First-Out (FIFO)',
          'Last-In, First-Out (LIFO)',
          'Smallest-Key-First (Priority)',
          'Random Uniform Eviction',
        ],
        correctIndex: 1,
        explanation:
          'The most recently pushed item is always the first one popped, known as Last-In, First-Out (LIFO).',
      },
      {
        id: 'stk-2',
        prompt: 'A monotonic decreasing stack is most commonly used to solve which problem in O(n) time?',
        options: [
          'Shortest path in a weighted graph',
          'Next Greater Element for every item in an array',
          'Balancing an AVL binary search tree',
          'Computing prefix sums in 2D matrices',
        ],
        correctIndex: 1,
        explanation:
          'Each element is pushed and popped at most once, resolving the Next Greater Element in linear O(n) time.',
      },
      {
        id: 'stk-3',
        prompt: 'What happens when a recursive function recurses too deeply without hitting a base case?',
        options: [
          'Memory automatically shifts to a FIFO queue',
          'A stack overflow occurs as call frames exhaust stack memory',
          'The compiler converts it into a heap array at runtime',
          'Time complexity drops to O(1)',
        ],
        correctIndex: 1,
        explanation:
          'Each nested function call pushes an activation frame onto the call stack until its fixed memory limit overflows.',
      },
      {
        id: 'stk-4',
        prompt: 'Which data structure is ideal for validating balanced parentheses like "{[()]}"?',
        options: ['Stack', 'Min-Heap', 'Adjacency Matrix', 'Circular Queue'],
        correctIndex: 0,
        explanation:
          'Opening brackets are pushed onto the stack and matched against the top element whenever a closing bracket appears.',
      },
    ],
  },
  {
    id: 'topic-queues',
    subjectId: 'sub-ds',
    name: 'Queues',
    description: 'FIFO buffers, circular ring buffers, deques, and breadth-first traversal queues.',
    mastery: 0.48,
    enabled: true,
    lastPracticedAt: '2026-11-13T14:40:00Z',
    questions: [
      {
        id: 'que-1',
        prompt: 'Why is a circular array (ring buffer) preferred over a naive linear array for a fixed-capacity queue?',
        options: [
          'It allows O(1) sorting on dequeue',
          'It reuses freed front slots via modulo wraparound without shifting',
          'It removes the need for a capacity bound',
          'It supports O(1) arbitrary middle deletion',
        ],
        correctIndex: 1,
        explanation:
          'Modulo arithmetic wraps front and rear indices around the array, preventing wasted space or O(n) shifts.',
      },
      {
        id: 'que-2',
        prompt: 'If you implement a FIFO Queue using two Stacks, what is the amortized time complexity of enqueue and dequeue?',
        options: [
          'O(n) enqueue and O(n) dequeue',
          'O(1) amortized for both operations',
          'O(log n) enqueue and O(1) dequeue',
          'O(n²) worst-case per item',
        ],
        correctIndex: 1,
        explanation:
          'Each element is moved from the input stack to the output stack at most once, giving O(1) amortized cost per operation.',
      },
      {
        id: 'que-3',
        prompt: 'Which graph or tree traversal relies fundamentally on a FIFO queue?',
        options: [
          'Depth-First Search (DFS)',
          'Post-order recursive traversal',
          'Breadth-First Search (BFS)',
          'Topological sort via recursion',
        ],
        correctIndex: 2,
        explanation:
          'BFS explores vertices level by level in discovery order, which directly matches a FIFO queue.',
      },
      {
        id: 'que-4',
        prompt: 'What distinguishes a Deque (Double-Ended Queue) from a standard Queue?',
        options: [
          'Elements are always sorted in ascending order',
          'Insertions and deletions are supported at both front and back in O(1)',
          'It stores two values per node for binary branching',
          'It only allows dequeue from the middle',
        ],
        correctIndex: 1,
        explanation:
          'A deque supports push/pop operations from both ends in O(1) time, making it useful for sliding window maximums.',
      },
    ],
  },
  {
    id: 'topic-trees',
    subjectId: 'sub-ds',
    name: 'Trees',
    description: 'Binary search trees, tree traversals, height balance, heaps, and tries.',
    mastery: 0.32,
    enabled: true,
    lastPracticedAt: '2026-11-12T20:15:00Z',
    questions: [
      {
        id: 'tree-1',
        prompt: 'Which depth-first traversal of a Binary Search Tree (BST) yields node keys in sorted ascending order?',
        options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
        correctIndex: 1,
        explanation:
          'In-order traversal visits Left -> Node -> Right, which produces keys in sorted non-decreasing order for any valid BST.',
      },
      {
        id: 'tree-2',
        prompt: 'What is the worst-case search time complexity in an unbalanced Binary Search Tree with n nodes?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 2,
        explanation:
          'Inserting sorted data into an unbalanced BST degenerates it into a linked chain of height n, making search O(n).',
      },
      {
        id: 'tree-3',
        prompt: 'In a complete binary min-heap stored in an array (0-indexed), where is the left child of index i located?',
        options: ['i + 1', '2i + 1', '2i + 2', 'i / 2'],
        correctIndex: 1,
        explanation:
          'In a 0-indexed binary heap array, the left child of node i is at 2i + 1 and the right child is at 2i + 2.',
      },
      {
        id: 'tree-4',
        prompt: 'What invariant does an AVL tree maintain at every node after insertions or deletions?',
        options: [
          'Every leaf must sit at the exact same depth',
          'Height difference between left and right subtrees is at most 1',
          'Every parent key is strictly smaller than its left child',
          'All internal nodes must have exactly 2 children',
        ],
        correctIndex: 1,
        explanation:
          'An AVL tree enforces a balance factor of -1, 0, or +1 using single and double tree rotations to guarantee O(log n) height.',
      },
    ],
  },
  {
    id: 'topic-graphs',
    subjectId: 'sub-ds',
    name: 'Graphs',
    description: 'Adjacency representations, BFS/DFS, topological ordering, and shortest paths.',
    mastery: 0.22,
    enabled: true,
    lastPracticedAt: '2026-11-11T17:45:00Z',
    questions: [
      {
        id: 'grp-1',
        prompt: 'For a sparse graph (where E << V²), which representation uses significantly less memory?',
        options: [
          'Adjacency Matrix (V × V)',
          'Adjacency List',
          'Complete Incidence Tensor',
          'Full Pairwise Distance Table',
        ],
        correctIndex: 1,
        explanation:
          'An adjacency list stores only existing edges using O(V + E) memory, whereas a matrix always allocates O(V²) cells.',
      },
      {
        id: 'grp-2',
        prompt: 'Which algorithm finds the shortest path in an unweighted graph?',
        options: [
          'Breadth-First Search (BFS)',
          'Depth-First Search (DFS)',
          'Prim’s Minimum Spanning Tree',
          'Topological Sort',
        ],
        correctIndex: 0,
        explanation:
          'Because BFS visits nodes in order of edge distance from the source, the first time it reaches a target is guaranteed shortest.',
      },
      {
        id: 'grp-3',
        prompt: 'Which property must a directed graph satisfy in order to have a valid topological ordering?',
        options: [
          'It must be a complete graph',
          'It must be a Directed Acyclic Graph (DAG)',
          'All edge weights must be positive',
          'Every vertex must have an even degree',
        ],
        correctIndex: 1,
        explanation:
          'If a directed graph contains a cycle, no linear ordering can place every prerequisite before its dependent node.',
      },
      {
        id: 'grp-4',
        prompt: "Why does Dijkstra's shortest-path algorithm fail when a graph contains negative edge weights?",
        options: [
          'It cannot process adjacency lists',
          'A finalized vertex might later be reached with a shorter path via a negative edge',
          'Priority queues reject negative numbers',
          'It only works on undirected trees',
        ],
        correctIndex: 1,
        explanation:
          'Dijkstra greedily assumes once a vertex is popped with minimum distance, no future path can improve it—which breaks with negative edges.',
      },
    ],
  },
  // Secondary subject topics (Algorithms - toggleable in Subjects & Topics Manager)
  {
    id: 'topic-sorting',
    subjectId: 'sub-algo',
    name: 'Sorting & Divide-and-Conquer',
    description: 'Merge sort, quicksort partitioning, stability, and lower bounds.',
    mastery: 0.62,
    enabled: true,
    questions: [
      {
        id: 'sort-1',
        prompt: 'Which sorting algorithm guarantees O(n log n) worst-case time complexity AND is stable?',
        options: ['Quicksort', 'Heapsort', 'Merge Sort', 'Selection Sort'],
        correctIndex: 2,
        explanation:
          'Merge Sort divides and merges deterministically in O(n log n) worst-case time while preserving equal element order.',
      },
      {
        id: 'sort-2',
        prompt: 'What is the theoretical lower bound for comparison-based sorting of n distinct elements?',
        options: ['Ω(n)', 'Ω(n log n)', 'Ω(n²)', 'Ω(log n)'],
        correctIndex: 1,
        explanation:
          'A decision tree must have at least n! leaves, requiring height at least log₂(n!) = Ω(n log n).',
      },
      {
        id: 'sort-3',
        prompt: 'When does deterministic Quicksort (picking the last element as pivot) hit its O(n²) worst case?',
        options: [
          'When all elements are distinct and random',
          'When the input array is already sorted or reverse-sorted',
          'When the array length is a power of two',
          'When using an auxiliary stack',
        ],
        correctIndex: 1,
        explanation:
          'Picking an extreme element on sorted input creates 0 and n-1 partitions at every step, yielding O(n²) work.',
      },
    ],
  },
  {
    id: 'topic-dp',
    subjectId: 'sub-algo',
    name: 'Dynamic Programming',
    description: 'Optimal substructure, overlapping subproblems, memoization, and tabulation.',
    mastery: 0.34,
    enabled: true,
    questions: [
      {
        id: 'dp-1',
        prompt: 'Which two properties indicate that a problem is well-suited for Dynamic Programming?',
        options: [
          'Greedy choice and random sampling',
          'Overlapping subproblems and optimal substructure',
          'Linear independence and cyclic graphs',
          'Constant space and O(1) branching',
        ],
        correctIndex: 1,
        explanation:
          'DP caches answers to overlapping subproblems and combines optimal sub-solutions via optimal substructure.',
      },
      {
        id: 'dp-2',
        prompt: 'What is the difference between top-down memoization and bottom-up tabulation?',
        options: [
          'Memoization uses recursion + cache; tabulation fills a table iteratively from base cases',
          'Tabulation cannot solve 2D problems',
          'Memoization always uses O(1) space',
          'Tabulation has exponential time complexity',
        ],
        correctIndex: 0,
        explanation:
          'Top-down computes subproblems on demand recursively and caches them; bottom-up iteratively solves smaller states first.',
      },
      {
        id: 'dp-3',
        prompt: 'In the 0/1 Knapsack problem with n items and capacity W, what is the standard DP time complexity?',
        options: ['O(n + W)', 'O(n · W)', 'O(2^n)', 'O(n log W)'],
        correctIndex: 1,
        explanation:
          'Filling the DP table of dimensions (n + 1) × (W + 1) takes O(n · W) pseudo-polynomial time.',
      },
    ],
  },
];

const INITIAL_PLANNER_CONFIG: PlannerConfig = {
  weeklyHours: 10,
  preferredDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export function createInitialAppState(): AppState {
  const subjects = INITIAL_SUBJECTS.map((s) => ({ ...s }));
  const topics = INITIAL_TOPICS.map((t) => ({ ...t }));
  const plannerConfig: PlannerConfig = {
    weeklyHours: INITIAL_PLANNER_CONFIG.weeklyHours,
    preferredDays: [...INITIAL_PLANNER_CONFIG.preferredDays],
  };

  return {
    student: {
      name: 'Alex Rivera',
      major: 'Computer Science',
      year: 'Junior Year',
      email: 'alex.rivera@university.edu',
      avatarUrl: STUDENT_AVATAR_URL,
      isSignedIn: true,
    },
    bktParams: { ...DEFAULT_BKT_PARAMS },
    subjects,
    topics,
    plannerConfig,
    schedule: generateAdaptiveSchedule(subjects, topics, plannerConfig),
    attempts: [
      {
        id: 'att-seed-1',
        timestamp: '2026-11-15T16:20:00Z',
        topicId: 'topic-arrays',
        topicName: 'Arrays',
        subjectName: 'Data Structures',
        correctCount: 4,
        totalQuestions: 4,
        masteryBefore: 0.49,
        masteryAfter: 0.78,
        tierBefore: 'developing',
        tierAfter: 'strong',
      },
      {
        id: 'att-seed-2',
        timestamp: '2026-11-15T11:00:00Z',
        topicId: 'topic-stacks',
        topicName: 'Stacks',
        subjectName: 'Data Structures',
        correctCount: 3,
        totalQuestions: 4,
        masteryBefore: 0.36,
        masteryAfter: 0.55,
        tierBefore: 'weak',
        tierAfter: 'developing',
      },
      {
        id: 'att-seed-3',
        timestamp: '2026-11-14T19:10:00Z',
        topicId: 'topic-linked-lists',
        topicName: 'Linked Lists',
        subjectName: 'Data Structures',
        correctCount: 1,
        totalQuestions: 4,
        masteryBefore: 0.31,
        masteryAfter: 0.28,
        tierBefore: 'weak',
        tierAfter: 'weak',
      },
    ],
  };
}
