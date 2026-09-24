# Benchmarks
These benchmarks serve as a performance reference for regression testing and
comparing rendering and runtime performance between releases. The measured
values help identify regressions and track performance changes across engine
versions.

|                                                                     | __Apple M2 64GB__ | __Apple M2 64GB__ | __Apple M2 64GB__ | __Apple A14 4GB__ | __i5-1240P 16GB__ |
|---------------------------------------------------------------------|------------------:|------------------:|------------------:|------------------:|------------------:|
| __[Deep Iteration Rendering](#deep-iteration-rendering)__           |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |        __goanna__ |
| 1.7.0                                                               |            356 ms |            496 ms |            348 ms |            536 ms |           3220 ms | 
| 1.8.0                                                               |            233 ms |            350 ms |            237 ms |            377 ms |           2386 ms | 
| 1.9.0                                                               |            239 ms |            245 ms |            234 ms |            355 ms |           2186 ms | 
| 2.0.0                                                               |            252 ms |            249 ms |            228 ms |            334 ms |           2184 ms | 
| 2.1.0                                                               |            228 ms |            248 ms |            247 ms |            350 ms |           2496 ms | 
| __[Expression Evaluation](#expression-evaluation)__                 |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |        __goanna__ |
| 1.7.0                                                               |             78 ms |             86 ms |            108 ms |            106 ms |            258 ms | 
|                                                                     |             15 ms |             18 ms |             25 ms |             25 ms |             74 ms | 
|                                                                     |             10 ms |             23 ms |             10 ms |             12 ms |            258 ms | 
| 1.8.0                                                               |             78 ms |             75 ms |            109 ms |             98 ms |            410 ms | 
|                                                                     |             19 ms |             25 ms |             20 ms |             31 ms |             88 ms | 
|                                                                     |             28 ms |             50 ms |             18 ms |             31 ms |            306 ms |
| 1.9.0                                                               |             71 ms |             70 ms |            140 ms |            118 ms |            270 ms | 
|                                                                     |             17 ms |             17 ms |             24 ms |             37 ms |             94 ms | 
|                                                                     |             27 ms |             32 ms |             20 ms |             33 ms |            303 ms | 
| 2.0.0                                                               |             71 ms |             74 ms |             96 ms |            106 ms |            250 ms | 
|                                                                     |             17 ms |             20 ms |             23 ms |             33 ms |             90 ms | 
|                                                                     |             27 ms |             36 ms |             19 ms |             32 ms |            282 ms | 
| 2.1.0                                                               |             70 ms |             71 ms |             83 ms |            106 ms |            370 ms | 
|                                                                     |             17 ms |             22 ms |             26 ms |             35 ms |            114 ms | 
|                                                                     |             38 ms |             41 ms |             34 ms |             62 ms |            516 ms |
| __[Reactive: Batching](#reactive-batching)__                        |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |        __goanna__ |
| 1.7.0                                                               |             18 ms |             13 ms |             15 ms |             18 ms |            116 ms | 
| 1.8.0                                                               |             14 ms |             25 ms |             15 ms |             32 ms |            118 ms | 
| 1.9.0                                                               |              4 ms |              5 ms |              5 ms |             18 ms |             40 ms | 
| 2.0.0                                                               |              4 ms |              4 ms |              4 ms |              8 ms |             40 ms | 
| 2.1.0                                                               |              7 ms |              7 ms |              9 ms |              9 ms |             54 ms | 
| __[Reactive: Granular Update](#reactive-granular-update)__          |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |        __goanna__ |
| 1.7.0                                                               |            199 ms |            282 ms |           4848 ms |           8161 ms |           2048 ms | 
| 1.8.0                                                               |             78 ms |             75 ms |             68 ms |             91 ms |            650 ms |  
| 1.9.0                                                               |             30 ms |             35 ms |             22 ms |             49 ms |            186 ms | 
| 2.0.0                                                               |             30 ms |             23 ms |             22 ms |             47 ms |            182 ms | 
| 2.1.0                                                               |             38 ms |             48 ms |             31 ms |             86 ms |            262 ms |
| __[Reactive: Leaf Update](#reactive-leaf-update)__                  |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |        __goanna__ |
| 1.7.0                                                               |             81 ms |             62 ms |             57 ms |            133 ms |            508 ms | 
| 1.8.0                                                               |             46 ms |             75 ms |             32 ms |             73 ms |            288 ms | 
| 1.9.0                                                               |             46 ms |             42 ms |             31 ms |             93 ms |            244 ms | 
| 2.0.0                                                               |             45 ms |             40 ms |             31 ms |             71 ms |            242 ms | 
| 2.1.0                                                               |             63 ms |             79 ms |             53 ms |            112 ms |            546 ms |
| __[Reactive: Root-Update](#reactive-root-update)__                  |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |        __goanna__ |
| 1.7.0                                                               |            587 ms |            734 ms |            623 ms |           1070 ms |           7002 ms | 
| 1.8.0                                                               |            404 ms |            700 ms |            372 ms |            673 ms |           5276 ms | 
| 1.9.0                                                               |            359 ms |            472 ms |            371 ms |            625 ms |           4852 ms | 
| 2.0.0                                                               |            382 ms |            479 ms |            360 ms |            615 ms |           4720 ms | 
| 2.1.0                                                               |            369 ms |            534 ms |            423 ms |            790 ms |           5902 ms |
| __[Reactive: Worst Case](#reactive-worst-case)__                    |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |        __goanna__ |
| 1.7.0                                                               |            123 ms |            282 ms |           5014 ms |           8550 ms |           1554 ms | 
| 1.8.0                                                               |           1442 ms |           1350 ms |            515 ms |            658 ms |           4272 ms | 
| 1.9.0                                                               |           1387 ms |           1005 ms |            485 ms |            593 ms |           2106 ms | 
| 2.0.0                                                               |           1385 ms |           1000 ms |            489 ms |            588 ms |           2158 ms | 
| 2.1.0                                                               |           1403 ms |           1095 ms |            494 ms |            635 ms |           2240 ms |
| __[Script Parsing and Evaluation](#script-parsing-and-evaluation)__ |         __Blink__ |         __Gecko__ |        __WebKit__ |        __WebKit__ |        __goanna__ |
| 1.7.0                                                               |            190 ms |            364 ms |            170 ms |            231 ms |           2440 ms | 
| 1.8.0                                                               |            186 ms |            425 ms |            170 ms |            267 ms |           2100 ms | 
| 1.9.0                                                               |            190 ms |            349 ms |            185 ms |            233 ms |           2400 ms | 
| 2.0.0                                                               |            195 ms |            345 ms |            186 ms |            224 ms |           2312 ms | 
| 2.1.0                                                               |            176 ms |            301 ms |            180 ms |            232 ms |           2024 ms |

## Deep Iteration Rendering
Renders a four-level nested view with 10×10×10×10 iterations, producing 11,110
loop instances in total (10 + 100 + 1,000 + 10,000).

Each iteration evaluates reactive expressions, updates a shared application
module value, and creates its corresponding DOM structure. The benchmark
measures end-to-end rendering time until the runtime signals completion.

It evaluates the efficiency of view expansion, expression evaluation, and DOM
creation across a large number of nested iterations.

## Expression Evaluation
Repeatedly evaluates a complex expression against an application module
containing nested object and array access, property reads, string operations,
arithmetic, and type conversion.

The benchmark measures expression parsing and evaluation performance under
high-frequency execution, with a focus on efficient resolution of deep property
paths without unnecessary overhead.

## Reactive: Batching
Performs 1,000 synchronous updates to a single reactive value.

The benchmark measures the efficiency of the reactivity system, scheduler, and
batching strategy. An optimized renderer should coalesce individual updates into
a single or few rendering passes instead of rendering after every assignment.

The benchmark focuses on update coalescing and excludes DOM complexity, diffing,
layout, paint, composite structure, and overall application rendering
performance.

## Reactive: Granular Update
Renders 10,000 flat DOM nodes and updates exactly one reactive value in the
middle of the view (index 5000).

The benchmark measures whether the reactive system updates only the affected
binding or unnecessarily re-evaluates unrelated nodes.

__Ideal:__  
State change &rarr; one dependency &rarr; one text node update.

__Poor implementations:__  
State change &rarr; view re-evaluation &rarr; many expression evaluations &rarr; many DOM updates.

The benchmark primarily measures:
- Dependency tracking
- Update granularity
- Scheduler overhead
- Incremental DOM update performance

## Reactive: Leaf Update
Renders a static 10×10×10×10 DOM tree (10,000 nodes) and updates exactly one
reactive value bound to `#target`.

The benchmark measures whether the reactive renderer invalidates and updates
only the affected binding without traversing or re-rendering unrelated DOM
nodes. The surrounding tree size is used to expose unnecessary work during the
update phase.

## Reactive: Root-Update
Renders a view whose entire structure depends on `state.x`. Updating `state.x`
at the root invalidates and regenerates nearly the complete render tree.

The benchmark measures:
- Root-level reactive invalidation
- Expression evaluation
- Rendering throughput
- DOM creation and insertion
- End-to-end rendering latency

Increasing `state.x` from 10 to 11 expands each nesting level, growing the tree
from 10⁴ (10,000) to 11⁴ (14,641) nodes. This represents a worst-case
full-render update in which nearly every node is regenerated.

## Reactive: Worst Case
Creates 10,000 DOM bindings that depend on the same application module value.
When the value changes, all bindings are invalidated and processed by the
reactive update pipeline.

The benchmark measures the throughput and overhead of dependency tracking,
change propagation, expression evaluation, and binding updates under full
invalidation.

This intentionally represents a worst-case scenario where every binding is
affected, measuring the runtime's raw update capacity without optimization from
unchanged bindings.

## Script Parsing and Evaluation
Processes a JavaScript source file containing 1,765 expression elements 2,500
times and measures total processing and evaluation time.

The benchmark covers the complete composite script pipeline, including
preprocessing, macro detection and expansion, script preparation, parsing, and
runtime execution. It supports macros such as `#import`, `#export`, and `#use`,
as well as tolerant expressions, while correctly ignoring JavaScript literals
and comments during preprocessing.

Repeated processing of identical source code measures pipeline stability and
helps identify unnecessary overhead in preprocessing, parsing, and evaluation.
