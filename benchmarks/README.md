# Benchmarks
These benchmarks serve as a performance reference for regression testing and
comparing rendering and runtime performance between releases. The measured
values help identify regressions and track performance changes across engine
versions.

|                                                                     | __Apple M2 64GB__ | __Apple M2 64GB__ | __Apple M2 64GB__ | __Apple A14 4GB__ |  __i5-1240P 16GB__ |
|---------------------------------------------------------------------|------------------:|------------------:|------------------:|------------------:|-------------------:|
| __[Deep Iteration Rendering](#deep-iteration-rendering)__           |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |         __goanna__ |
| 1.7.0                                                               |            356 ms |            496 ms |            348 ms |            536 ms |            3220 ms | 
| 1.8.0                                                               |            233 ms |            350 ms |            237 ms |            377 ms |            2386 ms | 
| 1.9.0                                                               |            239 ms |            245 ms |            234 ms |            355 ms |            2186 ms | 
| 2.0.0                                                               |            252 ms |            249 ms |            228 ms |            334 ms |            2184 ms | 
| 2.1.0 (in development)                                              |            220 ms |            427 ms |            414 ms |            551 ms |            3116 ms | 
| __[Expression Evaluation](#expression-evaluation)__                 |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |         __goanna__ |
| 1.7.0                                                               |             78 ms |             86 ms |            108 ms |            106 ms |             258 ms | 
|                                                                     |             15 ms |             18 ms |             25 ms |             25 ms |              74 ms | 
|                                                                     |             10 ms |             23 ms |             10 ms |             12 ms |             258 ms | 
| 1.8.0                                                               |             78 ms |             75 ms |            109 ms |             98 ms |             410 ms | 
|                                                                     |             19 ms |             25 ms |             20 ms |             31 ms |              88 ms | 
|                                                                     |             28 ms |             50 ms |             18 ms |             31 ms |             306 ms |
| 1.9.0                                                               |             71 ms |             70 ms |            140 ms |            118 ms |             270 ms | 
|                                                                     |             17 ms |             17 ms |             24 ms |             37 ms |              94 ms | 
|                                                                     |             27 ms |             32 ms |             20 ms |             33 ms |             303 ms | 
| 2.0.0                                                               |             71 ms |             74 ms |             96 ms |            106 ms |             250 ms | 
|                                                                     |             17 ms |             20 ms |             23 ms |             33 ms |              90 ms | 
|                                                                     |             27 ms |             36 ms |             19 ms |             32 ms |             282 ms | 
| 2.1.0 (in development)                                              |             74 ms |             78 ms |             95 ms |            125 ms |             250 ms | 
|                                                                     |             10 ms |             46 ms |             53 ms |             59 ms |             154 ms | 
|                                                                     |             13 ms |            239 ms |            179 ms |            256 ms |             858 ms |
| __[Reactive: Batching](#reactive-batching)__                        |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |         __goanna__ |
| 1.7.0                                                               |             18 ms |             13 ms |             15 ms |             18 ms |             116 ms | 
| 1.8.0                                                               |             14 ms |             25 ms |             15 ms |             32 ms |             118 ms | 
| 1.9.0                                                               |              4 ms |              5 ms |              5 ms |             18 ms |              40 ms | 
| 2.0.0                                                               |              4 ms |              4 ms |              4 ms |              8 ms |              40 ms | 
| 2.1.0 (in development)                                              |              3 ms |             10 ms |             13 ms |             34 ms |              64 ms | 
| __[Reactive: Granular Update](#reactive-granular-update)__          |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |         __goanna__ |
| 1.7.0                                                               |            199 ms |            282 ms |           4848 ms |           8161 ms |            2048 ms | 
| 1.8.0                                                               |             78 ms |             75 ms |             68 ms |             91 ms |             650 ms |  
| 1.9.0                                                               |             30 ms |             35 ms |             22 ms |             49 ms |             186 ms | 
| 2.0.0                                                               |             30 ms |             23 ms |             22 ms |             47 ms |             182 ms | 
| 2.1.0 (in development)                                              |             33 ms |             32 ms |             23 ms |             59 ms |             208 ms |
| __[Reactive: Leaf Update](#reactive-leaf-update)__                  |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |         __goanna__ |
| 1.7.0                                                               |             81 ms |             62 ms |             57 ms |            133 ms |             508 ms | 
| 1.8.0                                                               |             46 ms |             75 ms |             32 ms |             73 ms |             288 ms | 
| 1.9.0                                                               |             46 ms |             42 ms |             31 ms |             93 ms |             244 ms | 
| 2.0.0                                                               |             45 ms |             40 ms |             31 ms |             71 ms |             242 ms | 
| 2.1.0 (in development)                                              |             46 ms |             39 ms |             34 ms |             76 ms |             274 ms |
| __[Reactive: Root-Update](#reactive-root-update)__                  |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |         __goanna__ |
| 1.7.0                                                               |            587 ms |            734 ms |            623 ms |           1070 ms |            7002 ms | 
| 1.8.0                                                               |            404 ms |            700 ms |            372 ms |            673 ms |            5276 ms | 
| 1.9.0                                                               |            359 ms |            472 ms |            371 ms |            625 ms |            4852 ms | 
| 2.0.0                                                               |            382 ms |            479 ms |            360 ms |            615 ms |            4720 ms | 
| 2.1.0 (in development)                                              |            400 ms |            924 ms |            658 ms |           1140 ms |            7232 ms |
| __[Reactive: Worst Case](#reactive-worst-case)__                    |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |         __goanna__ |
| 1.7.0                                                               |            123 ms |            282 ms |           5014 ms |           8550 ms |            1554 ms | 
| 1.8.0                                                               |           1442 ms |           1350 ms |            515 ms |            658 ms |            4272 ms | 
| 1.9.0                                                               |           1387 ms |           1005 ms |            485 ms |            593 ms |            2106 ms | 
| 2.0.0                                                               |           1385 ms |           1000 ms |            489 ms |            588 ms |            2158 ms | 
| 2.1.0 (in development)                                              |           1380 ms |           1011 ms |            520 ms |            932 ms |            2282 ms |
| __[Script Parsing and Evaluation](#script-parsing-and-evaluation)__ |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |         __goanna__ |
| 1.7.0                                                               |            190 ms |            364 ms |            170 ms |            231 ms |            2440 ms | 
| 1.8.0                                                               |            186 ms |            425 ms |            170 ms |            267 ms |            2100 ms | 
| 1.9.0                                                               |            190 ms |            349 ms |            185 ms |            233 ms |            2400 ms | 
| 2.0.0                                                               |            195 ms |            345 ms |            186 ms |            224 ms |            2312 ms | 
| 2.1.0 (in development)                                              |            188 ms |            352 ms |            266 ms |            335 ms |            2438 ms |

## Deep Iteration Rendering
Renders a four-level nested view with 10×10×10×10 iterations, producing 11,110
loop instances in total (10 + 100 + 1,000 + 10,000).

Each iteration evaluates reactive expressions, updates a shared application
module value, and creates the corresponding DOM structure. The benchmark
measures the total time required until the runtime signals that the complete
rendering process has finished.

The benchmark evaluates the efficiency of view expansion, expression evaluation,
and DOM creation under a large number of nested iterations.

## Expression Evaluation
Evaluates a complex expression repeatedly against an application module
containing nested object and array access, property reads, string operations,
arithmetic operations, and type conversion.

The benchmark measures the performance of expression parsing and evaluation
under repeated execution. It verifies that expressions can resolve deep property
paths efficiently without unnecessary overhead during high-frequency evaluation.

## Reactive: Batching
Performs 1000 synchronous updates to a single reactive value.

The benchmark primarily measures the efficiency of the reactivity system, the
scheduler and the batching strategy. In an optimized rendering process,
individual updates should be combined into a single (or very few) rendering
passes, rather than performing a render after every assignment.

This benchmark is intentionally focused on update coalescing. It does not
measure DOM complexity, diffing performance, layout, paint, composite structure,
or overall application rendering performance.

Modern frameworks/runtimes optimize this case.

## Reactive: Granular Update
Renders 10,000 flat DOM nodes and then updates exactly one reactive value in the
middle of the view (index 5000).

The benchmark measures whether the reactive system invalidates only the affected
binding or unnecessarily re-evaluates unrelated nodes in the view.

Ideal:  
State change &rarr; one dependency &rarr; one text node update.

Poor implementations:  
State change &rarr; view re-evaluation &rarr; many expression evaluations &rarr;
many DOM updates.

This benchmark primarily evaluates:
- dependency tracking
- update granularity
- scheduler overhead
- incremental DOM update performance

## Reactive: Leaf Update
Renders a static 10×10×10×10 DOM tree (10,000 nodes) and then updates exactly
one reactive value bound to #target.

The benchmark verifies that a reactive renderer invalidates only the affected
binding instead of traversing or re-rendering unrelated parts of the DOM. The
size of the surrounding tree serves solely to detect unnecessary work during the
update phase.

## Reactive: Root-Update
Renders a view whose entire structure depends on state.x. Updating state.x at
the root invalidates almost the complete render structure.

The benchmark measures:
- Reactive invalidation from the root
- Expression evaluation
- Rendering throughput
- DOM creation and insertion
- End-to-end rendering latency until rendering has finished

Increasing state.x from 10 to 11 expands every nesting level, growing the tree
from 10^4 (10,000) to 11^4 (14,641) rendered nodes. This represents a worst-case
full rendering update where nearly every node must be regenerated.

## Reactive: Worst Case
Creates 10,000 DOM bindings that depend on the same application module value.
When the value changes, all dependent bindings are invalidated and must be
processed by the reactive update pipeline.

This benchmark measures the throughput and overhead of dependency tracking,
change propagation, expression evaluation, and binding updates under a
worst-case full invalidation scenario.

It intentionally represents a case where every binding is affected, so the
benchmark evaluates the runtime's raw update capacity rather than its ability
to optimize away unchanged work.

## Script Parsing and Evaluation
Processes a JavaScript source file containing 1,765 expression elements 2,500
times through the composite script processing and measures the total processing
and evaluation time.

The benchmark measures the performance of the complete composite script
pipeline, including preprocessing, macro detection and expansion, script
preparation, parsing and runtime execution. It supports additional composite
script macros such as `#import`, `#export`, `#use`, and tolerant expressions
while correctly ignoring JavaScript literals and comments during preprocessing.

By repeatedly processing identical source code, the benchmark evaluates the
stability and efficiency of the entire composite script loading and execution
path, helping identify unnecessary overhead in preprocessing, parsing, and
evaluation.
