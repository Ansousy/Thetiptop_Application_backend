FROM redis
RUN mkdir data 
VOLUME /data
WORKDIR /data

COPY redis/redis.conf /etc/redis/redis.conf
EXPOSE 6379
ENTRYPOINT [ "redis-server", "/etc/redis/redis.conf" ]

