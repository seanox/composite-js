FROM node:24-bookworm

ENV ENGINE=blink
ENV PORT=8000
ENV TEST_DIR=/test
ENV PLAYWRIGHT_DIR=/test/playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

ARG PLAYWRIGHT_VERSION=1.55.0

RUN npm install --global playwright@${PLAYWRIGHT_VERSION} \
    && playwright install-deps chromium firefox webkit \
    && playwright install chromium firefox webkit \
    && npm cache clean --force
ENV NODE_PATH=/usr/local/lib/node_modules

EXPOSE 8000

ENTRYPOINT ["/bin/bash", "/test/playwright/runner.sh"]

# Usage:
# docker build -t seanox-composite-js-test .
#
# docker run --rm -p 8000:8000 -e ENGINE=blink  -v "../:/test" seanox-composite-js-test
# docker run --rm -p 8000:8000 -e ENGINE=gecko  -v "../:/test" seanox-composite-js-test
# docker run --rm -p 8000:8000 -e ENGINE=webkit -v "../:/test" seanox-composite-js-test
