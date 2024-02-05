FROM hayd/deno-lambda:1.32.5

WORKDIR /work

COPY . .

RUN yum install -y ffmpeg \
    && deno task cache

CMD [ "mod.handler" ]
