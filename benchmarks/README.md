# Benchmarks

These benchmarks serve as a performance reference for regression testing and
comparing rendering performance between releases. The measured values help
identify regressions and track performance changes across engine versions.

<table>
  <thead>
    <tr>
      <th></th>

      <th>Blink</th>
      <th>WebKit</th>
      <th>goanna</th>
      <th>Gecko</th>

      <th>Blink</th>
      <th>WebKit</th>
      <th>goanna</th>
      <th>Gecko</th>

      <th>Blink</th>
      <th>WebKit</th>
      <th>goanna</th>
      <th>Gecko</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <details>
          <summary>Deep Iteration Rendering</summary>
          <p></p>
          <p>
            Renders a four-level nested template with 10×10×10×10 iterations,
            producing 11,110 loop instances in total (10 + 100 + 1,000 + 10,000).
          </p>
          <p>
            Each iteration evaluates reactive template expressions, updates a
            shared counter, and creates the corresponding DOM structure. The
            benchmark measures the total time required until the renderer
            signals that the complete rendering process has finished.
          </p>
          <p>
            The benchmark evaluates the efficiency of template expansion,
            expression evaluation, and DOM creation under a large number of
            nested iterations.
          </p>
        </details> 
      </td>

      <td></td>
      <td></td>
      <td></td>
      <td></td>

      <td></td>
      <td></td>
      <td></td>
      <td></td>

      <td>max.  300 ms</td>
      <td>max.  375 ms</td>
      <td>max. 2250 ms</td>
      <td>max.  325 ms</td>
    </tr>
    <tr>
      <td>
      </td>

      <td></td>
      <td></td>
      <td></td>
      <td></td>

      <td></td>
      <td></td>
      <td></td>
      <td></td>

      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>
