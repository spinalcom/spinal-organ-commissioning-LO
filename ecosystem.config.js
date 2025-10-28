module.exports = {
  apps : [{
    script: 'index.js',
    cwd: "./dist",
    name: 'spinal-organ-commissioning-LO-Integration',
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time: true,
    node_args: "--max-old-space-size=5120",
  }],

  
};

