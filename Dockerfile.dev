FROM node:22.15.0

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /workdir/src

ENTRYPOINT ["/entrypoint.sh"]
