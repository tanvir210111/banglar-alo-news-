module.exports = {
  apps: [
    {
      name: "banglar-alo-news-frontend",
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3010',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 3010,
        NODE_ENV: 'production',
      },
    },
  ],
};
