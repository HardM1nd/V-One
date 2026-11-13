FROM mirror.gcr.io/library/golang:1.24.8-alpine AS builder

RUN apk add --no-cache git
ENV GOMAXPROCS=1 GOGC=30 GOMEMLIMIT=1200MiB
WORKDIR /src
RUN git init && \
    git remote add origin https://github.com/minio/minio.git && \
    git fetch --depth 1 origin 9e49d5e7a648f00e26f2246f4dc28e6b07f8c84a && \
    git checkout --detach FETCH_HEAD
RUN CGO_ENABLED=0 go build -tags kqueue -trimpath -o /out/minio .

FROM alpine:3.22

RUN addgroup -S -g 10001 minio && \
    adduser -S -u 10001 -G minio -h /home/minio minio && \
    mkdir -p /data && \
    chown minio:minio /data
COPY --from=builder /out/minio /usr/bin/minio
USER minio
ENV HOME=/home/minio
EXPOSE 9000 9001
VOLUME ["/data"]
ENTRYPOINT ["minio"]
CMD ["server", "/data", "--console-address", ":9001"]
