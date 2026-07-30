# Benchmarks

These benchmarks serve as a performance reference for regression testing and
comparing rendering performance between releases. The measured values help
identify regressions and track performance changes across engine versions.

| __[Deep Iteration Rendering](#deep-iteration-rendering)__ |   __Blink__ |  __WebKit__ |   __goanna__ |   __Gecko__ |
|:----------------------------------------------------------|------------:|------------:|-------------:|------------:|
| 1.7.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 
| 1.8.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 
| 1.9.0                                                     | max. 300 ms | max. 375 ms | max. 2250 ms | max. 325 ms | 
| __[xxx](#xxx)__                                           |   __Blink__ |      WebKit |   __goanna__ |   __Gecko__ |
| 1.7.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 
| 1.8.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 
| 1.9.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 
| __[xxx](#xxx)__                                           |   __Blink__ |  __WebKit__ |   __goanna__ |   __Gecko__ |
| 1.7.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 
| 1.8.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 
| 1.9.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 
| __[xxx](#xxx)__                                           |   __Blink__ |  __WebKit__ |   __goanna__ |   __Gecko__ |
| 1.7.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 
| 1.8.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 
| 1.9.0                                                     |   max. - ms |   max. - ms |    max. - ms |   max. - ms | 

## Deep Iteration Rendering
Renders a four-level nested template with 10×10×10×10 iterations, producing
11,110 loop instances in total (10 + 100 + 1,000 + 10,000).

Each iteration evaluates reactive template expressions, updates a shared
counter, and creates the corresponding DOM structure. The benchmark measures the
total time required until the renderer signals that the complete rendering
process has finished.

The benchmark evaluates the efficiency of template expansion, expression
evaluation, and DOM creation under a large number of nested iterations.
