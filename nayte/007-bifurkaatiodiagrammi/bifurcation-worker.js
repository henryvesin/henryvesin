/*
  Näyte 007 — worker: computes the logistic-map bifurcation diagram
  column by column (one column = one r value) so the main thread can
  render progressively instead of blocking on the whole image.
*/
"use strict";

self.onmessage = function (evt) {
  var job = evt.data;
  var rMin = job.rMin, rMax = job.rMax, width = job.width;
  var transient = job.transient || 800;
  var samples = job.samples || 200;
  var jobId = job.jobId;

  for (var col = 0; col < width; col++) {
    var r = rMin + (col / (width - 1)) * (rMax - rMin);
    var x = 0.5;
    for (var i = 0; i < transient; i++) x = r * x * (1 - x);
    var values = new Float64Array(samples);
    for (var s = 0; s < samples; s++) {
      x = r * x * (1 - x);
      values[s] = x;
    }
    self.postMessage({ jobId: jobId, col: col, r: r, values: values });
  }
  self.postMessage({ jobId: jobId, done: true });
};
