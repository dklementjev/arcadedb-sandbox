FROM denoland/deno:ubuntu-2.6.3

RUN addgroup --gid 1000 deno-app && \
    adduser --uid 1000 --gid 1000 --home /home/deno --shell /bin/bash deno-app && \
    usermod -a -G deno deno-app && \
    chmod g+w /deno-dir
