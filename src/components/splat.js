  /* global Worker, Blob, fetch */
  import { registerComponent } from '../core/component.js';
  import THREE from '../lib/three.js';

  registerComponent('splat', {
    schema: {
      src: {type: 'asset'},
      cutoutEntity: {type: 'selector'},
      pixelRatio: {type: 'number', default: 1},
      xrPixelRatio: {type: 'number', default: 0.5}
    },

    init: function () {
      this.initWorker();
    },

    update: function () {
      var data = this.data;
      var sceneEl = this.el.sceneEl;
      if (data.src) { this.loadSplat(); }
      if (data.pixelRatio > 0) {
        sceneEl.renderer.setPixelRatio(this.data.pixelRatio);
      }
      if (data.xrPixelRatio > 0) {
        sceneEl.renderer.xr.setFramebufferScaleFactor(this.data.xrPixelRatio);
      }
    },

    loadSplat: function () {
      var sceneEl = this.el.sceneEl;
      var src = this.data.src;

      if (!src) { return; }

      // Postpone if scene not loaded.
      if (!sceneEl.hasLoaded) {
        sceneEl.addEventListener('loaded', this.loadSplat.bind(this));
        return;
      }

      if (this.data.cutoutEntity) {
        this.worldToCutoutMatrix = new THREE.Matrix4();
        this.cutout = this.data.cutoutEntity.object3D;
      }

      var isPly = src.endsWith('.ply');
      this.loadedVerticesNumber = 0;
      this.worker.postMessage({method: 'clear'});
      if (isPly) {
        this.loadPlyFile(src);
      } else {
        this.loadSplatFile(src);
      }
    },

    loadPlyFile: async function loadPlyFile (src) {
      var response = await fetch(src);
      var reader = response.body.getReader();

      var rowLength = 3 * 4 + 3 * 4 + 4 + 4;
      var bytesDownloaded = 0;
      var bytesFileTotal = response.headers.get('Content-Length');
      bytesFileTotal = bytesFileTotal ? parseInt(bytesFileTotal) : undefined;
      var chunks = [];
      var start = Date.now();
      var lastReportedProgress = 0;

      while (true) {
        try {
          var dataReceived = await reader.read();
          if (dataReceived.done) {
            console.log('Completed download.');
            break;
          }
          var newChunk = dataReceived.value;
          bytesDownloaded += newChunk.length;
          chunks.push(newChunk);

          // Downloar progress stats.
          if (bytesFileTotal) {
            var mbps = (bytesDownloaded / 1024 / 1024) / ((Date.now() - start) / 1000);
            var percent = bytesDownloaded / bytesFileTotal * 100;
            if (percent - lastReportedProgress > 1) {
              console.log('Download progress:', percent.toFixed(2) + '%', mbps.toFixed(2) + ' Mbps');
              lastReportedProgress = percent;
            }
          } else {
            console.log('Download progress:', bytesDownloaded, ', unknown total');
          }
        } catch (error) {
          console.error(error);
          break;
        }
      }

      if (bytesDownloaded === 0) { return; }
      var chunksBufferLength = chunks.reduce(function add (sum, chunk) { return sum + chunk.length; }, 0);
      var concatenatedChunks = new Uint8Array(chunksBufferLength);

      // Concatenate the chunks into a single Uint8Array
      var offset = 0;
      for (var chunk of chunks) {
        concatenatedChunks.set(chunk, offset);
        offset += chunk.length;
      }

      concatenatedChunks = new Uint8Array(this.processPlyBuffer(concatenatedChunks.buffer));
      var numVertices = Math.floor(concatenatedChunks.byteLength / rowLength);
      await this.initGL(numVertices);
      this.pushDataBuffer(concatenatedChunks.buffer, numVertices);
    },

    loadSplatFile: async function loadSplatFile (src) {
      var response = await fetch(src);
      var reader = response.body.getReader();

      var rowLength = 3 * 4 + 3 * 4 + 4 + 4;
      var bytesDownloaded = 0;
      var bytesProcessed = 0;
      var bytesFileTotal = response.headers.get('Content-Length');
      bytesFileTotal = bytesFileTotal ? parseInt(bytesFileTotal) : undefined;

      if (bytesFileTotal) {
        var numVertices = Math.floor(bytesFileTotal / rowLength);
        await this.initGL(numVertices);
      }

      var chunks = [];
      var start = Date.now();
      var lastReportedProgress = 0;

      while (true) {
        try {
          var dataReceived = await reader.read();
          if (dataReceived.done) {
            console.log('Completed download.');
            break;
          }
          var newChunk = dataReceived.value;
          bytesDownloaded += newChunk.length;
          chunks.push(newChunk);

          // Downloar progress stats.
          if (bytesFileTotal) {
            var mbps = (bytesDownloaded / 1024 / 1024) / ((Date.now() - start) / 1000);
            var percent = bytesDownloaded / bytesFileTotal * 100;
            if (percent - lastReportedProgress > 1) {
              console.log('Download progress:', percent.toFixed(2) + '%', mbps.toFixed(2) + ' Mbps');
              lastReportedProgress = percent;
            }
          } else {
            console.log('Download progress:', bytesDownloaded, ', unknown total');
          }

          var bytesToProcess = bytesDownloaded - bytesProcessed;
          if (bytesFileTotal && bytesToProcess > rowLength) {
            var concatenatedChunksbuffer = new Uint8Array(bytesToProcess);
            var offset = 0;
            for (var chunk of chunks) {
              concatenatedChunksbuffer.set(chunk, offset);
              offset += chunk.length;
            }

            var chunkBytesProcessed = this.processSplatChunk(concatenatedChunksbuffer, bytesToProcess);
            bytesProcessed += chunkBytesProcessed;

            // Reset chunks array. Copy leftover bytes if chunks not perfect multiple of a splat data structure.
            chunks.length = 0;
            if (bytesToProcess > chunkBytesProcessed) {
              var extraData = new Uint8Array(bytesToProcess - chunkBytesProcessed);
              extraData.set(concatenatedChunksbuffer.subarray(bytesToProcess - extraData.length, bytesToProcess), 0);
              chunks.push(extraData);
            }
          }
        } catch (error) {
          console.error(error);
          break;
        }
      }
    },

    processSplatChunk: function (chunksBuffer, chunkSize) {
      var rowLength = 3 * 4 + 3 * 4 + 4 + 4;
      var vertexCount = Math.floor(chunkSize / rowLength);
      var bytesProcessed = vertexCount * rowLength;
      var chunkBuffer = new Uint8Array(bytesProcessed);
      chunkBuffer.set(chunksBuffer.subarray(0, chunkBuffer.byteLength), 0);
      this.pushDataBuffer(chunkBuffer.buffer, vertexCount);
      return bytesProcessed;
    },

    initGL: async function initGL (numVertices) {
      console.log('initGL', numVertices);
      this.el.object3D.frustumCulled = false;
      var renderer = this.el.sceneEl.renderer;
      var gl = renderer.getContext();
      var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      this.maxVertices = maxTextureSize * maxTextureSize;

      // Clamp number of vertices to maximum texture size.
      if (numVertices > this.maxVertices) {
        console.log('Number of vertices limited to ', this.maxVertices, numVertices);
        numVertices = this.maxVertices;
      }

      this.bufferTextureWidth = maxTextureSize;
      this.bufferTextureHeight = Math.floor((numVertices - 1) / maxTextureSize) + 1;

      this.centerAndScaleData = new Float32Array(this.bufferTextureWidth * this.bufferTextureHeight * 4);
      this.covAndColorData = new Uint32Array(this.bufferTextureWidth * this.bufferTextureHeight * 4);
      this.centerAndScaleTexture = new THREE.DataTexture(this.centerAndScaleData, this.bufferTextureWidth, this.bufferTextureHeight, THREE.RGBA, THREE.FloatType);
      this.centerAndScaleTexture.needsUpdate = true;

      this.covAndColorTexture = new THREE.DataTexture(this.covAndColorData, this.bufferTextureWidth, this.bufferTextureHeight, THREE.RGBAIntegerFormat, THREE.UnsignedIntType);
      this.covAndColorTexture.internalFormat = 'RGBA32UI';
      this.covAndColorTexture.needsUpdate = true;

      var quadGeometry = new THREE.BufferGeometry();
      // Why 2.0?
      var vertices = new Float32Array([
        -2.0, -2.0, 0.0,
        2.0, 2.0, 0.0,
        -2.0, 2.0, 0.0,

        2.0, -2.0, 0.0,
        2.0, 2.0, 0.0,
        -2.0, -2.0, 0.0
      ]);
      quadGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

      var splatIndexArray = new Uint32Array(this.bufferTextureWidth * this.bufferTextureHeight);
      var splatIndices = new THREE.InstancedBufferAttribute(splatIndexArray, 1, false);
      splatIndices.setUsage(THREE.DynamicDrawUsage);
      var geometry = new THREE.InstancedBufferGeometry().copy(quadGeometry);
      geometry.setAttribute('splatIndex', splatIndices);
      geometry.instanceCount = 1;

      var material = new THREE.ShaderMaterial({
        uniforms: {
          viewport: {value: new Float32Array([1980, 1080])}, // Dummy. will be overwritten
          focal: {value: 1000.0}, // Dummy. will be overwritten
          centerAndScaleTexture: {value: this.centerAndScaleTexture},
          covAndColorTexture: {value: this.covAndColorTexture},
          gsProjectionMatrix: {value: this.getProjectionMatrix()},
          gsModelViewMatrix: {value: this.getModelViewMatrix()}
        },
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader,
        blending: THREE.CustomBlending,
        blendSrcAlpha: THREE.OneFactor,
        depthTest: true,
        depthWrite: false,
        transparent: true
      });

      material.onBeforeRender = (renderer, scene, camera, geometry, object, group) => {
        var projectionMatrix = this.getProjectionMatrix(camera);
        mesh.material.uniforms.gsProjectionMatrix.value = projectionMatrix;
        mesh.material.uniforms.gsModelViewMatrix.value = this.getModelViewMatrix(camera);

        var viewport = new THREE.Vector4();
        renderer.getCurrentViewport(viewport);
        var focal = (viewport.w / 2.0) * Math.abs(-1);
        material.uniforms.viewport.value[0] = viewport.z;
        material.uniforms.viewport.value[1] = viewport.w;
        material.uniforms.focal.value = focal;
      };

      var mesh = this.mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      this.el.setObject3D('mesh', mesh);

      // Wait until texture is ready
      while (true) {
        var centerAndScaleTextureProperties = renderer.properties.get(this.centerAndScaleTexture);
        var covAndColorTextureProperties = renderer.properties.get(this.covAndColorTexture);
        if (centerAndScaleTextureProperties && centerAndScaleTextureProperties.__webglTexture &&
          covAndColorTextureProperties && centerAndScaleTextureProperties.__webglTexture) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      this.startSplatsSort();
    },

    pushDataBuffer: function (buffer, vertexCount) {
      if (this.loadedVerticesNumber + vertexCount > this.maxVertices) {
        console.log('vertexCount limited to ', this.maxVertices, vertexCount);
        vertexCount = this.maxVertices - this.loadedVerticesNumber;
      }
      if (vertexCount <= 0) { return; }

      var uBuffer = new Uint8Array(buffer);
      var fBuffer = new Float32Array(buffer);
      var matrices = new Float32Array(vertexCount * 16);

      var covAndColorDataUint8 = new Uint8Array(this.covAndColorData.buffer);
      var covAndColorDataInt16 = new Int16Array(this.covAndColorData.buffer);
      for (var i = 0; i < vertexCount; i++) {
        var quat = new THREE.Quaternion(
          (uBuffer[32 * i + 28 + 1] - 128) / 128.0,
          (uBuffer[32 * i + 28 + 2] - 128) / 128.0,
          -(uBuffer[32 * i + 28 + 3] - 128) / 128.0,
          (uBuffer[32 * i + 28 + 0] - 128) / 128.0
        );
        var center = new THREE.Vector3(
          fBuffer[8 * i + 0],
          fBuffer[8 * i + 1],
          -fBuffer[8 * i + 2]
        );
        var scale = new THREE.Vector3(
          fBuffer[8 * i + 3 + 0],
          fBuffer[8 * i + 3 + 1],
          fBuffer[8 * i + 3 + 2]
        );

        var mtx = new THREE.Matrix4();
        mtx.makeRotationFromQuaternion(quat);
        mtx.transpose();
        mtx.scale(scale);
        var mtxt = mtx.clone();
        mtx.transpose();
        mtx.premultiply(mtxt);
        mtx.setPosition(center);

        var covIndexes = [0, 1, 2, 5, 6, 10];
        var maxValue = 0.0;
        for (var j = 0; j < covIndexes.length; j++) {
          if (Math.abs(mtx.elements[covIndexes[j]]) > maxValue) {
            maxValue = Math.abs(mtx.elements[covIndexes[j]]);
          }
        }

        var destOffset = this.loadedVerticesNumber * 4 + i * 4;
        this.centerAndScaleData[destOffset + 0] = center.x;
        this.centerAndScaleData[destOffset + 1] = center.y;
        this.centerAndScaleData[destOffset + 2] = center.z;
        this.centerAndScaleData[destOffset + 3] = maxValue / 32767.0;

        destOffset =  this.loadedVerticesNumber * 8 + i * 4 * 2;
        for (j = 0; j < covIndexes.length; j++) {
          covAndColorDataInt16[destOffset + j] = parseInt(mtx.elements[covIndexes[j]] * 32767.0 / maxValue);
        }

        // RGBA
        destOffset = this.loadedVerticesNumber * 16 + (i * 4 + 3) * 4;
        covAndColorDataUint8[destOffset + 0] = uBuffer[32 * i + 24 + 0];
        covAndColorDataUint8[destOffset + 1] = uBuffer[32 * i + 24 + 1];
        covAndColorDataUint8[destOffset + 2] = uBuffer[32 * i + 24 + 2];
        covAndColorDataUint8[destOffset + 3] = uBuffer[32 * i + 24 + 3];

        // Store scale and transparent to remove splat in sorting process
        mtx.elements[15] = Math.max(scale.x, scale.y, scale.z) * uBuffer[32 * i + 24 + 3] / 255.0;

        for (j = 0; j < 16; j++) {
          matrices[i * 16 + j] = mtx.elements[j];
        }
      }

      var renderer = this.el.sceneEl.renderer;
      var gl = renderer.getContext();
      while (vertexCount > 0) {
        var width = 0;
        var height = 0;
        var xoffset = (this.loadedVerticesNumber % this.bufferTextureWidth);
        var yoffset = Math.floor(this.loadedVerticesNumber / this.bufferTextureWidth);
        if (this.loadedVerticesNumber % this.bufferTextureWidth !== 0) {
          width = Math.min(this.bufferTextureWidth, xoffset + vertexCount) - xoffset;
          height = 1;
        } else if (Math.floor(vertexCount / this.bufferTextureWidth) > 0) {
          width = this.bufferTextureWidth;
          height = Math.floor(vertexCount / this.bufferTextureWidth);
        } else {
          width = vertexCount % this.bufferTextureWidth;
          height = 1;
        }

        var centerAndScaleTextureProperties = renderer.properties.get(this.centerAndScaleTexture);
        gl.bindTexture(gl.TEXTURE_2D, centerAndScaleTextureProperties.__webglTexture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl.RGBA, gl.FLOAT, this.centerAndScaleData, this.loadedVerticesNumber * 4);

        var covAndColorTextureProperties = renderer.properties.get(this.covAndColorTexture);
        gl.bindTexture(gl.TEXTURE_2D, covAndColorTextureProperties.__webglTexture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl.RGBA_INTEGER, gl.UNSIGNED_INT, this.covAndColorData, this.loadedVerticesNumber * 4);

        this.loadedVerticesNumber += width * height;
        vertexCount -= width * height;
      }

      this.worker.postMessage({
        method: 'push',
        matrices: matrices.buffer
      }, [matrices.buffer]);
    },

    getProjectionMatrix: (function () {
      var projectionMatrix = new THREE.Matrix4();
      return function (camera) {
        camera = camera || this.el.sceneEl.camera.el.components.camera.camera;
        projectionMatrix.copy(camera.projectionMatrix);
        projectionMatrix.elements[4] *= -1;
        projectionMatrix.elements[5] *= -1;
        projectionMatrix.elements[6] *= -1;
        projectionMatrix.elements[7] *= -1;
        return projectionMatrix;
      };
    })(),

    getModelViewMatrix: (function () {
        var modelMatrix = new THREE.Matrix4();
        var viewMatrix = new THREE.Matrix4();
        return function (camera) {
        // Matrix to go from model (object) local coordinates to world (M)
        modelMatrix.copy(this.el.object3D.matrixWorld);
        modelMatrix.elements[1] *= -1;
        modelMatrix.elements[4] *= -1;
        modelMatrix.elements[6] *= -1;
        modelMatrix.elements[9] *= -1;
        modelMatrix.elements[13] *= -1;

        camera = camera || this.el.sceneEl.camera.el.components.camera.camera;
        // Matrix to go from local camera coordinates to world (C)
        viewMatrix.copy(camera.matrixWorld);
        viewMatrix.elements[1] *= -1;
        viewMatrix.elements[4] *= -1;
        viewMatrix.elements[6] *= -1;
        viewMatrix.elements[9] *= -1;
        viewMatrix.elements[13] *= -1;

        // Invert to get a matrix to go from world to camera coordinates (C-1)
        viewMatrix.invert();

        // V = C-1 * M
        // Model view matrix. Goes first from model (object) coordinates to world and then
        // from world to camera.
        var modelViewMatrix = viewMatrix.multiply(modelMatrix);
        return modelViewMatrix;
      };
    })(),

    initWorker: function () {
      var self = this;
      var worker = this.worker = new Worker(
        URL.createObjectURL(
          new Blob(['(', this.initWorkerCode.toString(), ')(self)'], {
            type: 'application/javascript'
          })
        )
      );

      worker.onmessage = function updateSplatIndices (e) {
        var indices = new Uint32Array(e.data.sortedIndices);
        var mesh = self.mesh;
        mesh.geometry.attributes.splatIndex.set(indices);
        mesh.geometry.attributes.splatIndex.needsUpdate = true;
        mesh.geometry.instanceCount = indices.length;
        self.startSplatsSort();
      };
    },

    startSplatsSort: function () {
      var modelViewMatrix = this.getModelViewMatrix();
      var view = new Float32Array([modelViewMatrix.elements[2], modelViewMatrix.elements[6], modelViewMatrix.elements[10], modelViewMatrix.elements[14]]);
      var worldToCutoutMatrix = this.worldToCutoutMatrix;
      if (this.cutout) {
        worldToCutoutMatrix.copy(this.cutout.matrixWorld);
        worldToCutoutMatrix.invert();
        worldToCutoutMatrix.multiply(this.el.object3D.matrixWorld);
      }
      this.worker.postMessage({
        method: 'sort',
        view: view.buffer,
        cutout: this.cutout ? new Float32Array(worldToCutoutMatrix.elements) : undefined
      }, [view.buffer]);
    },

    initWorkerCode: function (self) {
      var matrices;

      // multiply: matrix4x4 * vector3
      var mul = function mul (e, x, y, z) {
        var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

        return [
          (e[0] * x + e[4] * y + e[8] * z + e[12]) * w,
          (e[1] * x + e[5] * y + e[9] * z + e[13]) * w,
          (e[2] * x + e[6] * y + e[10] * z + e[14]) * w
        ];
      };

      // dot: vector3 * vector3
      var dot = function dot (vec1, vec2) {
        return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
      };

      var sortSplats = function sortSplats (matrices, view, cutout) {
        var vertexCount = matrices.length / 16;
        var threshold = -0.0001;

        var maxDepth = -Infinity;
        var minDepth = Infinity;
        var depthList = new Float32Array(vertexCount);
        var sizeList = new Int32Array(depthList.buffer);
        var validIndexList = new Int32Array(vertexCount);
        var validCount = 0;

        // Discard splats behind the camera,
        // too small or outside of the cutout box (if any defined).
        for (var i = 0; i < vertexCount; i++) {
          // Sign of depth is reversed
          var depth =
            (view[0] * matrices[i * 16 + 12] +
             view[1] * matrices[i * 16 + 13] +
             view[2] * matrices[i * 16 + 14] +
             view[3]);

          // Skip splats behind of camera.
          if (depth >= 0) { continue; }

          // Skip if splat is too small.
          if (matrices[i * 16 + 15] <= threshold * depth) { continue; }

          if (cutout !== undefined) {
            // Position-based culling
            var posX = matrices[i * 16 + 12];
            var posY = matrices[i * 16 + 13];
            var posZ = matrices[i * 16 + 14];

            // convert to cutout space – not sure why Y axis is inverted
            var cutoutSpacePos = mul(cutout, posX, -posY, posZ);
            var len = dot(cutoutSpacePos, cutoutSpacePos);

            // Skip if splat is outside of the cutout area.
            if (cutoutSpacePos[0] < -0.5 || cutoutSpacePos[0] > 0.5 ||
              cutoutSpacePos[1] < -0.5 || cutoutSpacePos[1] > 0.5 ||
              cutoutSpacePos[2] < -0.5 || cutoutSpacePos[2] > 0.5) {
              continue;
            }
          }

          depthList[validCount] = depth;
          validIndexList[validCount] = i;
          validCount++;
          if (depth > maxDepth) { maxDepth = depth; }
          if (depth < minDepth) { minDepth = depth; }
        }

        // Sort the splats by depth that have not been discarded.
        // 16 bit single-pass counting sort.
        // Divide depth range in 2^16 slots.
        var depthInv = (256 * 256 - 1) / (maxDepth - minDepth);
        var counts0 = new Uint32Array(256 * 256);
        // Counts number of splats on each depth slot.
        for (i = 0; i < validCount; i++) {
          sizeList[i] = ((depthList[i] - minDepth) * depthInv) | 0;
          counts0[sizeList[i]]++;
        }

        // Indices range for each of the depth slots.
        var starts0 = new Uint32Array(256 * 256);
        for (i = 1; i < 256 * 256; i++) {
          starts0[i] = starts0[i - 1] + counts0[i - 1];
        }

        // Sorts the splats by depth.
        var depthIndex = new Uint32Array(validCount);
        for (i = 0; i < validCount; i++) {
          depthIndex[starts0[sizeList[i]]++] = validIndexList[i];
        }

        return depthIndex;
      };

      self.onmessage = function onMessage (e) {
        if (e.data.method === 'clear') {
          matrices = undefined;
        }
        if (e.data.method === 'push') {
          var newMatrices = new Float32Array(e.data.matrices);
          if (matrices === undefined) {
            matrices = newMatrices;
          } else {
            var resized = new Float32Array(matrices.length + newMatrices.length);
            resized.set(matrices);
            resized.set(newMatrices, matrices.length);
            matrices = resized;
          }
        }
        if (e.data.method === 'sort') {
          if (matrices === undefined) {
            var sortedIndices = new Uint32Array(1);
            self.postMessage({sortedIndices}, [sortedIndices.buffer]);
          } else {
            var view = new Float32Array(e.data.view);
            var cutout = e.data.cutout !== undefined ? new Float32Array(e.data.cutout) : undefined;
            sortedIndices = sortSplats(matrices, view, cutout);
            self.postMessage({sortedIndices}, [sortedIndices.buffer]);
          }
        }
      };
    },

    processPlyBuffer: function (inputBuffer) {
      var ubuf = new Uint8Array(inputBuffer);
      // 10KB ought to be enough for a header...
      var header = new TextDecoder().decode(ubuf.slice(0, 1024 * 10));
      var headerEnd = 'end_header\n';
      var headerEndIndex = header.indexOf(headerEnd);
      if (headerEndIndex < 0) {
        throw new Error('Unable to read .ply file header');
      }
      var vertexCount = parseInt(/element vertex (\d+)\n/.exec(header)[1]);
      console.log('Vertex Count', vertexCount);
      var rowOffset = 0;
      var offsets = {};
      var types = {};
      var TYPE_MAP = {
        double: 'getFloat64',
        int: 'getInt32',
        uint: 'getUint32',
        float: 'getFloat32',
        short: 'getInt16',
        ushort: 'getUint16',
        uchar: 'getUint8'
      };

      for (var prop of header
        .slice(0, headerEndIndex)
        .split('\n')
        .filter((k) => k.startsWith('property '))) {
        var [p, type, name] = prop.split(' ');
        var arrayType = TYPE_MAP[type] || 'getInt8';
        types[name] = arrayType;
        offsets[name] = rowOffset;
        rowOffset += parseInt(arrayType.replace(/[^\d]/g, '')) / 8;
      }
      console.log('Bytes per row', rowOffset, types, offsets);

      var dataView = new DataView(
        inputBuffer,
        headerEndIndex + headerEnd.length
      );
      var row = 0;
      var attrs = new Proxy(
        {},
        {
          get (target, prop) {
            if (!types[prop]) throw new Error(prop + ' not found');
            return dataView[types[prop]](
              row * rowOffset + offsets[prop],
              true
            );
          }
        }
      );

      console.time('calculate importance');
      var sizeList = new Float32Array(vertexCount);
      var sizeIndex = new Uint32Array(vertexCount);
      for (row = 0; row < vertexCount; row++) {
        sizeIndex[row] = row;
        if (!types['scale_0']) continue;
        var size =
          Math.exp(attrs.scale_0) *
          Math.exp(attrs.scale_1) *
          Math.exp(attrs.scale_2);
        var opacity = 1 / (1 + Math.exp(-attrs.opacity));
        sizeList[row] = size * opacity;
      }
      console.timeEnd('calculate importance');

      console.time('sort');
      sizeIndex.sort((b, a) => sizeList[a] - sizeList[b]);
      console.timeEnd('sort');

      // 6*4 + 4 + 4 = 8*4
      // XYZ - Position (Float32)
      // XYZ - Scale (Float32)
      // RGBA - colors (uint8)
      // IJKL - quaternion/rot (uint8)
      var rowLength = 3 * 4 + 3 * 4 + 4 + 4;
      var buffer = new ArrayBuffer(rowLength * vertexCount);

      console.time('build buffer');
      for (var j = 0; j < vertexCount; j++) {
        row = sizeIndex[j];

        var position = new Float32Array(buffer, j * rowLength, 3);
        var scales = new Float32Array(buffer, j * rowLength + 4 * 3, 3);
        var rgba = new Uint8ClampedArray(
          buffer,
          j * rowLength + 4 * 3 + 4 * 3,
          4
        );
        var rot = new Uint8ClampedArray(
          buffer,
          j * rowLength + 4 * 3 + 4 * 3 + 4,
          4
        );

        if (types['scale_0']) {
          var qlen = Math.sqrt(
            attrs.rot_0 ** 2 +
              attrs.rot_1 ** 2 +
              attrs.rot_2 ** 2 +
              attrs.rot_3 ** 2
          );

          rot[0] = (attrs.rot_0 / qlen) * 128 + 128;
          rot[1] = (attrs.rot_1 / qlen) * 128 + 128;
          rot[2] = (attrs.rot_2 / qlen) * 128 + 128;
          rot[3] = (attrs.rot_3 / qlen) * 128 + 128;

          scales[0] = Math.exp(attrs.scale_0);
          scales[1] = Math.exp(attrs.scale_1);
          scales[2] = Math.exp(attrs.scale_2);
        } else {
          scales[0] = 0.01;
          scales[1] = 0.01;
          scales[2] = 0.01;

          rot[0] = 255;
          rot[1] = 0;
          rot[2] = 0;
          rot[3] = 0;
        }

        position[0] = attrs.x;
        position[1] = attrs.y;
        position[2] = attrs.z;

        if (types['f_dc_0']) {
          var SH_C0 = 0.28209479177387814;
          rgba[0] = (0.5 + SH_C0 * attrs.f_dc_0) * 255;
          rgba[1] = (0.5 + SH_C0 * attrs.f_dc_1) * 255;
          rgba[2] = (0.5 + SH_C0 * attrs.f_dc_2) * 255;
        } else {
          rgba[0] = attrs.red;
          rgba[1] = attrs.green;
          rgba[2] = attrs.blue;
        }
        if (types['opacity']) {
          rgba[3] = (1 / (1 + Math.exp(-attrs.opacity))) * 255;
        } else {
          rgba[3] = 255;
        }
      }
      console.timeEnd('build buffer');
      return buffer;
    },

    vertexShader: `
      precision highp sampler2D;
      precision highp usampler2D;

      out vec4 vColor;
      out vec2 vPosition;
      uniform vec2 viewport;
      uniform float focal;
      uniform mat4 gsProjectionMatrix;
      uniform mat4 gsModelViewMatrix;

      attribute uint splatIndex;
      uniform sampler2D centerAndScaleTexture;
      uniform usampler2D covAndColorTexture;

      vec2 unpackInt16(in uint value) {
        int v = int(value);
        int v0 = v >> 16;
        int v1 = (v & 0xFFFF);
        if((v & 0x8000) != 0)
          v1 |= 0xFFFF0000;
        return vec2(float(v1), float(v0));
      }

      void main () {
        ivec2 texSize = textureSize(centerAndScaleTexture, 0);
        ivec2 texPos = ivec2(splatIndex % uint(texSize.x), splatIndex / uint(texSize.x));
        vec4 centerAndScaleData = texelFetch(centerAndScaleTexture, texPos, 0);

        vec4 center = vec4(centerAndScaleData.xyz, 1);

        // Model view and projection matrices calculated for every frame.
        // Not sure we cannot use built-in ones.
        vec4 camspace = gsModelViewMatrix * center;
        vec4 pos2d = gsProjectionMatrix * camspace;

        float bounds = 1.2 * pos2d.w;
        if (pos2d.z < -pos2d.w || pos2d.x < -bounds || pos2d.x > bounds
          || pos2d.y < -bounds || pos2d.y > bounds) {
          gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
          return;
        }

        uvec4 covAndColorData = texelFetch(covAndColorTexture, texPos, 0);
        // Applies splat scale.
        vec2 cov3D_M11_M12 = unpackInt16(covAndColorData.x) * centerAndScaleData.w;
        vec2 cov3D_M13_M22 = unpackInt16(covAndColorData.y) * centerAndScaleData.w;
        vec2 cov3D_M23_M33 = unpackInt16(covAndColorData.z) * centerAndScaleData.w;

        // 3D covariance matrix.
        // This is output of splat training with scale applied above.
        mat3 Vrk = mat3(
          cov3D_M11_M12.x, cov3D_M11_M12.y, cov3D_M13_M22.x,
          cov3D_M11_M12.y, cov3D_M13_M22.y, cov3D_M23_M33.x,
          cov3D_M13_M22.x, cov3D_M23_M33.x, cov3D_M23_M33.y
        );

        // Project 3D covariance matrix in 2D.
        // Section 6.2.2 EWA Splatting, 2001
        // local affine approximation of the projective transformation
        // Some values and signs different than paper. Not sure why.
        mat3 J = mat3(
          focal / camspace.z, 0., -(focal * camspace.x) / (camspace.z * camspace.z),
          0., -focal / camspace.z, (focal * camspace.y) / (camspace.z * camspace.z),
          0., 0., 0.
        );

        // Section 4 fig (5). 3D Gaussian Splatting for Real-Time Radiance Field Rendering
        // Bernhard Kerbl
        // In paper. cov = J * W * Vrk * transpose (W) * transpose(J)
        // Need to understand de the difference.
        mat3 W = transpose(mat3(gsModelViewMatrix));
        mat3 T = W * J;
        mat3 cov = transpose(T) * Vrk * T;

        // 2D projection of the center of the splat.
        vec2 vCenter = vec2(pos2d) / pos2d.w;

        // Covariance matrix determines the orientation and
        // shape of the ellipse that represents a splat.
        // 2D projection of the 3D covariance matrix that
        // represents the original splat ellipsoid.
        // 0.3 offset to prevent splats too small / degenerate.
        float diagonal1 = cov[0][0] + 0.3;
        float offDiagonal = cov[0][1];
        float diagonal2 = cov[1][1] + 0.3;

        // Calculating the eigen values of the covariance matrix.
        // Via characteristics equation. det(C - λI) = 0
        // It's going to be a quadratic function of the form aλ^2 + bλ + c = 0
        // a = 1
        // b = -(diagonal1 + diagonal2)
        // c = offdiagonal ^ 2
        // Simplified calculation (Radii and rotation section) https://cookierobotics.com/007/
        // Quadratic formula equivalent to standard by dividing by 2a. Yields simpler calculation.
        // Standard: aλ^2 + bλ + c
        // Divided by 2a: λ^2 / 2 + bλ / 2a + c / 2a = 0
        // Quadratic formula
        // λ = - b / 2 +- sqr ((b / 2a)^2 - (c / a))
        // First term of quadratic formula -b / 2
        float mid = (diagonal1 + diagonal2) / 2.0;
        // Second term of quadratic formula sqr ((b / 2)^2 - (c)) and c = offdiagonal ^ 2
        float radius = length(vec2((diagonal1 - diagonal2) / 2.0, offDiagonal));
        // The two eigen values that represent variance along ellipse principal axis.
        // +- solutions of the quadratic formula.
        float lambda1 = mid + radius;
        // Preven too small. Degenerate ellipse.
        float lambda2 = max(mid - radius, 0.1);

        // Direction vector of one the ellipse axis.
        // calculate one of the eigen vectors.
        // Solution of (C - λI)v = 0 where C=covariance matrix.
        vec2 diagonalVector = normalize(vec2(offDiagonal, lambda1 - diagonal1));
        float majorAxisLength = min(sqrt(2.0 * lambda1), 1024.0);
        vec2 v1 = majorAxisLength * diagonalVector;
        float minorAxisLength = min(sqrt(2.0 * lambda2), 1024.0);
        // For the other ellipse axis. we calculate perpendicular vector in projection coords.
        // swap x,y. flip de sign of one.
        vec2 v2 = minorAxisLength * vec2(diagonalVector.y, -diagonalVector.x);

        // Solid color of the ellipse / splat. No Spherical Harmonic Coefficients / View dependent colors.
        uint colorUint = covAndColorData.w;
        vColor = vec4(
          float(colorUint & uint(0xFF)) / 255.0,
          float((colorUint >> uint(8)) & uint(0xFF)) / 255.0,
          float((colorUint >> uint(16)) & uint(0xFF)) / 255.0,
          float(colorUint >> uint(24)) / 255.0
        );

        vPosition = position.xy;

        // Displaces each vertex of the quad representing the splat by:
        // translate the splat to its position.
        // displace the vertex by each the ellipse axis vectors and transform to NDC coordinates.
        gl_Position = vec4(
          vCenter
            + position.x * v2 / viewport * 2.0
            + position.y * v1 / viewport * 2.0, pos2d.z / pos2d.w, 1.0);

      }
    `,

    fragmentShader: `
      in vec4 vColor;
      in vec2 vPosition;

      void main () {
        // square of vector length.
        float A = dot(vPosition, vPosition);
        // discards fragments outside of the ellipse.
        // otherwise the full quad would be shaded.
        if (A > 4.0) discard;
        // Fade the edge of the ellipse.
        float B = exp(-A) * vColor.a;
        gl_FragColor = vec4(vColor.rgb, B);
      }
    `
  });
