#!/usr/bin/env bash
set -e

WORKSPACE="$(pwd)/ecl-workspace"
mkdir -p "${WORKSPACE}"
cd "${WORKSPACE}"

if [ ! -d "ecl" ]; then
  git clone https://gitlab.com/embeddable-common-lisp/ecl.git
fi
cd ecl
ECL_SRC=$(pwd)

./configure --prefix="${WORKSPACE}/host-install"
make -j"$(nproc 2>/dev/null || echo 2)"
make install

export ECL_TO_RUN="${WORKSPACE}/host-install/bin/ecl"

make distclean || true

cd "${WORKSPACE}"
if [ ! -d "emsdk" ]; then
  git clone https://github.com/emscripten-core/emsdk.git
fi
cd emsdk

./emsdk install 4.0.12
./emsdk activate 4.0.12

source ./emsdk_env.sh
export EMSDK_PATH=$(pwd)

cd "${ECL_SRC}"

BUILD_ARCH=$(cc -dumpmachine || echo "x86_64-pc-linux-gnu")

export CFLAGS="-O2"
export CXXFLAGS="-O2"
export LDFLAGS="-O2"

emconfigure ./configure \
  --host=wasm32-unknown-emscripten \
  --build="$BUILD_ARCH" \
  --with-cross-config="${ECL_SRC}/src/util/wasm32-unknown-emscripten.cross_config" \
  --prefix="${WORKSPACE}/wasm-install" \
  --disable-shared \
  --with-tcp=no \
  --with-cmp=no

emmake make -j"$(nproc 2>/dev/null || echo 2)" LDFLAGS="-lidbfs.js -O2 -s FORCE_FILESYSTEM=1 -s EXPORTED_RUNTIME_METHODS=['FS_createPath','FS_createDataFile','addRunDependency','removeRunDependency'] -s TOTAL_STACK=67108864 -s INITIAL_HEAP=1073741824 -s ALLOW_MEMORY_GROWTH=1 -s MAXIMUM_MEMORY=4294967296" EXEEXT=".html"