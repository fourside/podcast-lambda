FROM hayd/deno-lambda:1.32.5

WORKDIR /work

COPY . .

RUN wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz \
  && tar xvf ffmpeg-release-amd64-static.tar.xz \
  && mv ffmpeg-*-amd64-static/ff* /usr/local/bin/ \
  && deno task cache

CMD [ "mod.handler" ]
