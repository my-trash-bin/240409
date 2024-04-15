#!/bin/sh

set -e

(cd client && npm run build)
(cd server && npm run build && npm run start)
