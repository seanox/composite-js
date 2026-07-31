# Benchmarks
These benchmarks serve as a performance reference for regression testing and
comparing rendering performance between releases. The measured values help
identify regressions and track performance changes across engine versions.

|                                                                     |   __i5-1240P__ |       __A14__ |   __i5-1240P__ |   __i5-1240P__ |
|:--------------------------------------------------------------------|---------------:|--------------:|---------------:|---------------:|
| __[Deep Iteration Rendering](#deep-iteration-rendering)__           |      __Blink__ |    __WebKit__ |     __goanna__ |      __Gecko__ |
| 1.7.0                                                               | `max.  525 ms` | `max. 325 ms` | `max. 2325 ms` | `max.  625 ms` | 
| 1.8.0                                                               | `max.  375 ms` | `max. 350 ms` | `max. 2175 ms` | `max.  350 ms` | 
| 1.9.0                                                               | `max.  350 ms` | `max. 325 ms` | `max. 2125 ms` | `max.  325 ms` | 
| __[Expression Evaluation](#expression-evaluation)__                 |      __Blink__ |    __WebKit__ |     __goanna__ |      __Gecko__ |
| 1.7.0                                                               | `max.   50 ms` | `max. 100 ms` | `max.  200 ms` | `max.   75 ms` | 
|                                                                     | `max.   25 ms` | `max.  25 ms` | `max.  100 ms` | `max.   15 ms` | 
|                                                                     | `max.   10 ms` | `max.  30 ms` | `max.  300 ms` | `max.   50 ms` | 
| 1.8.0                                                               | `max.   50 ms` | `max.  75 ms` | `max.  125 ms` | `max.   75 ms` | 
|                                                                     | `max.   25 ms` | `max.  50 ms` | `max.  100 ms` | `max.   25 ms` | 
|                                                                     | `max.   30 ms` | `max.  50 ms` | `max.  300 ms` | `max.   50 ms` |
| 1.9.0                                                               | `max.   50 ms` | `max. 100 ms` | `max.  150 ms` | `max.   75 ms` | 
|                                                                     | `max.   25 ms` | `max.  25 ms` | `max.  100 ms` | `max.   25 ms` | 
|                                                                     | `max.   30 ms` | `max.  50 ms` | `max.  300 ms` | `max.   50 ms` | 
| __[Reactive: Batching](#reactive-batching)__                        |      __Blink__ |    __WebKit__ |     __goanna__ |      __Gecko__ |
| 1.7.0                                                               | `max.   15 ms` | `max.  15 ms` | `max.  125 ms` | `max.   10 ms` | 
| 1.8.0                                                               | `max.   25 ms` | `max.  15 ms` | `max.  125 ms` | `max.   25 ms` | 
| 1.9.0                                                               | `max.   10 ms` | `max.  10 ms` | `max.   50 ms` | `max.   10 ms` | 
| __[Reactive: Granular Update](#reactive-granular-update)__          |      __Blink__ |    __WebKit__ |     __goanna__ |      __Gecko__ |
| 1.7.0                                                               | `max.  350 ms` | `max. 125 ms` |  `max. 775 ms` | `max.  325 ms` | 
| 1.8.0                                                               | `max.  125 ms` | `max. 115 ms` | `max.  825 ms` | `max.   75 ms` |  
| 1.9.0                                                               |  `max.  50 ms` | `max.  50 ms` | `max.  325 ms` | `max.   50 ms` | 
| __[Reactive: Leaf Update](#reactive-leaf-update)__                  |      __Blink__ |    __WebKit__ |     __goanna__ |      __Gecko__ |
| 1.7.0                                                               | `max.  125 ms` | `max.  75 ms` | `max.  550 ms` | `max.  125 ms` | 
| 1.8.0                                                               | `max.   75 ms` | `max. 100 ms` | `max.  325 ms` | `max.   75 ms` | 
| 1.9.0                                                               | `max.   75 ms` | `max. 100 ms` | `max.  300 ms` | `max.   75 ms` | 
| __[Reactive: Root-Update](#reactive-root-update)__                  |      __Blink__ |    __WebKit__ |     __goanna__ |      __Gecko__ |
| 1.7.0                                                               | `max.  925 ms` | `max. 675 ms` | `max. 4525 ms` | `max. 1275 ms` | 
| 1.8.0                                                               | `max.  625 ms` | `max. 625 ms` | `max. 4750 ms` | `max.  700 ms` | 
| 1.9.0                                                               | `max.  675 ms` | `max. 650 ms` | `max. 4525 ms` | `max.  775 ms` | 
| __[Reactive: Worst Case](#reactive-worst-case)__                    |      __Blink__ |    __WebKit__ |     __goanna__ |      __Gecko__ |
| 1.7.0                                                               | `max.  225 ms` | `max. 725 ms` | `max. 3175 ms` | `max.  275 ms` | 
| 1.8.0                                                               | `max. 1550 ms` | `max. 650 ms` | `max. 1500 ms` | `max. 1350 ms` | 
| 1.9.0                                                               | `max. 1675 ms` | `max. 625 ms` | `max. 2275 ms` | `max. 1275 ms` | 
| __[Script Parsing and Evaluation](#script-parsing-and-evaluation)__ |      __Blink__ |    __WebKit__ |     __goanna__ |      __Gecko__ |
| 1.7.0                                                               | `max.  200 ms` | `max. 225 ms` | `max. 2075 ms` | `max.  625 ms` | 
| 1.8.0                                                               | `max.  225 ms` | `max. 250 ms` | `max. 2500 ms` | `max.  425 ms` | 
| 1.9.0                                                               | `max.  200 ms` | `max. 250 ms` | `max. 2125 ms` | `max.  650 ms` | 

## Deep Iteration Rendering
Renders a four-level nested template with 10×10×10×10 iterations, producing
11,110 loop instances in total (10 + 100 + 1,000 + 10,000).

Each iteration evaluates reactive template expressions, updates a shared
counter, and creates the corresponding DOM structure. The benchmark measures the
total time required until the renderer signals that the complete rendering
process has finished.

The benchmark evaluates the efficiency of template expansion, expression
evaluation, and DOM creation under a large number of nested iterations.

## Expression Evaluation
Evaluates a complex expression repeatedly against a model containing nested
object and array access, property reads, string operations, arithmetic
operations and type conversion.

The benchmark measures the performance of the expression parser and evaluator
under repeated execution. It verifies that expressions can resolve deep property
paths efficiently without unnecessary overhead during high-frequency evaluation.

## Reactive: Batching
Performs 1000 synchronous updates to a single reactive value.

The benchmark primarily measures the efficiency of the framework's reactivity
system, scheduler and batching strategy. An optimized renderer should coalesce
the updates into a single (or very few) render pass(es) instead of rendering
after every assignment.

This benchmark is intentionally focused on update coalescing. It does not
measure DOM complexity, diffing performance, layout, paint, component trees or
overall application rendering performance.  

Modern frameworks optimize this case.

## Reactive: Granular Update
Renders 10,000 flat DOM nodes and then updates exactly one reactive value in the
middle of the list (index 5000).

The benchmark measures whether the reactive system invalidates only the affected
binding or unnecessarily re-evaluates unrelated nodes.

Ideal:  
State change &rarr; one dependency &rarr; one text node update.

Poor implementations:  
State change &rarr; list re-evaluation &rarr; many template executions &rarr; many DOM checks.

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
Renders a tree whose entire structure depends on state.x. Updating state.x at
the root invalidates almost the complete render tree.

The benchmark measures:
- Reactive invalidation from the root
- Template evaluation
- Renderer throughput
- DOM creation and insertion
- End-to-end render latency until rendering has finished

Increasing state.x from 10 to 11 expands every nesting level, growing the tree
from 10^4 (10,000) to 11^4 (14,641) rendered nodes. This represents a worst-case
full-tree update where nearly every node must be regenerated.

## Reactive: Worst Case
Creates 10,000 DOM bindings that depend on the same reactive value. When the
reactive counter changes, all dependent bindings are invalidated and must be
processed by the reactive update pipeline.

This benchmark measures the throughput and overhead of dependency tracking,
change propagation, expression evaluation, and binding updates under a
worst-case full invalidation scenario.

It intentionally represents a case where every binding is affected, so the
benchmark evaluates the framework's raw update capacity rather than its ability
to optimize away unchanged work.

## Script Parsing and Evaluation
Processes a JavaScript source file containing 1,765 expression elements 2,500
times through the custom scripting engine and measures the total processing and
evaluation time.

The benchmark measures the performance of the complete scripting pipeline,
including preprocessing, macro detection and expansion, script preparation,
parsing, compilation, and runtime execution. It supports custom scripting 
features such as `#import`, `#export`, `#module`, `#use`, and tolerant
expressions while correctly ignoring JavaScript literals and comments during
preprocessing.

By repeatedly processing identical source code, the benchmark evaluates the
stability and efficiency of the entire script loading and execution path, 
helping identify unnecessary overhead in preprocessing, parsing, compilation, 
and evaluation.
