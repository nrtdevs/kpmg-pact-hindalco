// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/office_work/kpmg-kmeet-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/office_work/kpmg-kmeet-frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import rollupNodePolyFill from "file:///D:/office_work/kpmg-kmeet-frontend/node_modules/rollup-plugin-node-polyfills/dist/index.js";
import { NodeGlobalsPolyfillPlugin } from "file:///D:/office_work/kpmg-kmeet-frontend/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import fs from "fs";
import svgr from "file:///D:/office_work/kpmg-kmeet-frontend/node_modules/vite-plugin-svgr/dist/index.mjs";
import viteCompression from "file:///D:/office_work/kpmg-kmeet-frontend/node_modules/vite-plugin-compression/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\office_work\\kpmg-kmeet-frontend";
var replace = (val) => {
  return val.replace(/^~/, "");
};
var vite_config_default = ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    base: process.env.VITE_BASE_URL || "/",
    plugins: [
      viteCompression({
        algorithm: "brotliCompress"
      }),
      react(),
      svgr({
        svgrOptions: {
          titleProp: false
        }
      })
    ],
    define: {
      global: "globalThis"
    },
    server: {
      port: 3e3,
      cors: {
        origin: ["https://pixinvent.com/", "http://localhost:3000"],
        methods: ["GET", "PATCH", "PUT", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          includePaths: ["node_modules", "./src/assets"]
        }
      }
      // postcss: {
      //   plugins: [require("postcss-rtl")()],
      // },
    },
    resolve: {
      alias: [
        {
          find: /^~.+/,
          // replacement: '',
          replacement: replace
        },
        {
          find: "stream",
          replacement: "stream-browserify"
        },
        { find: "stream", replacement: "stream-browserify" },
        { find: "crypto", replacement: "crypto-browserify" },
        { find: "@src", replacement: path.resolve(__vite_injected_original_dirname, "src") },
        { find: "@store", replacement: path.resolve(__vite_injected_original_dirname, "src/redux") },
        { find: "@configs", replacement: path.resolve(__vite_injected_original_dirname, "src/configs") },
        {
          find: "url",
          replacement: "rollup-plugin-node-polyfills/polyfills/url"
        },
        {
          find: "@styles",
          replacement: path.resolve(__vite_injected_original_dirname, "src/@core/scss")
        },
        {
          find: "util",
          replacement: "rollup-plugin-node-polyfills/polyfills/util"
        },
        {
          find: "zlib",
          replacement: "rollup-plugin-node-polyfills/polyfills/zlib"
        },
        {
          find: "@utils",
          replacement: path.resolve(__vite_injected_original_dirname, "src/utility/Utils")
        },
        {
          find: "@hooks",
          replacement: path.resolve(__vite_injected_original_dirname, "src/utility/hooks")
        },
        {
          find: "@assets",
          replacement: path.resolve(__vite_injected_original_dirname, "src/@core/assets")
        },
        {
          find: "@@assets",
          replacement: path.resolve(__vite_injected_original_dirname, "src/assets")
        },
        {
          find: "@layouts",
          replacement: path.resolve(__vite_injected_original_dirname, "src/@core/layouts")
        },
        {
          find: "assert",
          replacement: "rollup-plugin-node-polyfills/polyfills/assert"
        },
        {
          find: "buffer",
          replacement: "rollup-plugin-node-polyfills/polyfills/buffer-es6"
        },
        {
          find: "process",
          replacement: "rollup-plugin-node-polyfills/polyfills/process-es6"
        },
        {
          find: "@components",
          replacement: path.resolve(__vite_injected_original_dirname, "src/@core/components")
        },
        {
          find: "@@components",
          replacement: path.resolve(__vite_injected_original_dirname, "src/views/components")
        },
        {
          find: "@modules",
          replacement: path.resolve(__vite_injected_original_dirname, "src/modules")
        }
      ]
    },
    //   esbuild: {
    //     // loader: 'jsx',
    //     // include: /.\/src\/.*\.js?$/,
    //     // exclude: [],
    //     jsx: 'automatic'
    //   },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx"
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true,
            process: true
          }),
          {
            name: "load-js-files-as-jsx",
            setup(build) {
              build.onLoad({ filter: /src\\.*\.js$/ }, async (args) => ({
                loader: "jsx",
                contents: await fs.readFileSync(args.path, "utf8")
              }));
            }
          }
        ]
      }
    },
    build: {
      rollupOptions: {
        plugins: [rollupNodePolyFill()]
      }
    }
  });
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxvZmZpY2Vfd29ya1xcXFxrcG1nLWttZWV0LWZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxvZmZpY2Vfd29ya1xcXFxrcG1nLWttZWV0LWZyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9vZmZpY2Vfd29yay9rcG1nLWttZWV0LWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgcm9sbHVwTm9kZVBvbHlGaWxsIGZyb20gJ3JvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnXHJcbmltcG9ydCB7IE5vZGVHbG9iYWxzUG9seWZpbGxQbHVnaW4gfSBmcm9tICdAZXNidWlsZC1wbHVnaW5zL25vZGUtZ2xvYmFscy1wb2x5ZmlsbCdcclxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xyXG5pbXBvcnQgc3ZnciBmcm9tICd2aXRlLXBsdWdpbi1zdmdyJ1xyXG5pbXBvcnQgdml0ZUNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJ1xyXG5cclxuY29uc3QgcmVwbGFjZTogYW55ID0gKHZhbCkgPT4ge1xyXG4gIHJldHVybiB2YWwucmVwbGFjZSgvXn4vLCAnJylcclxufVxyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgKHsgbW9kZSB9KSA9PiB7XHJcbiAgcHJvY2Vzcy5lbnYgPSB7IC4uLnByb2Nlc3MuZW52LCAuLi5sb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpIH1cclxuXHJcbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XHJcbiAgICBiYXNlOiBwcm9jZXNzLmVudi5WSVRFX0JBU0VfVVJMIHx8ICcvJyxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgICBhbGdvcml0aG06ICdicm90bGlDb21wcmVzcydcclxuICAgICAgfSksXHJcbiAgICAgIHJlYWN0KCksXHJcbiAgICAgIHN2Z3Ioe1xyXG4gICAgICAgIHN2Z3JPcHRpb25zOiB7XHJcbiAgICAgICAgICB0aXRsZVByb3A6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgXSxcclxuICAgIGRlZmluZToge1xyXG4gICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJ1xyXG4gICAgfSxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBwb3J0OiAzMDAwLFxyXG4gICAgICBjb3JzOiB7XHJcbiAgICAgICAgb3JpZ2luOiBbJ2h0dHBzOi8vcGl4aW52ZW50LmNvbS8nLCAnaHR0cDovL2xvY2FsaG9zdDozMDAwJ10sXHJcbiAgICAgICAgbWV0aG9kczogWydHRVQnLCAnUEFUQ0gnLCAnUFVUJywgJ1BPU1QnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcclxuICAgICAgICBhbGxvd2VkSGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQXV0aG9yaXphdGlvbicsICdYLVJlcXVlc3RlZC1XaXRoJ11cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNzczoge1xyXG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgICAgc2Nzczoge1xyXG4gICAgICAgICAgaW5jbHVkZVBhdGhzOiBbJ25vZGVfbW9kdWxlcycsICcuL3NyYy9hc3NldHMnXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBwb3N0Y3NzOiB7XHJcbiAgICAgIC8vICAgcGx1Z2luczogW3JlcXVpcmUoXCJwb3N0Y3NzLXJ0bFwiKSgpXSxcclxuICAgICAgLy8gfSxcclxuICAgIH0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZmluZDogL15+LisvLFxyXG4gICAgICAgICAgLy8gcmVwbGFjZW1lbnQ6ICcnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHJlcGxhY2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICdzdHJlYW0nLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6ICdzdHJlYW0tYnJvd3NlcmlmeSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgZmluZDogJ3N0cmVhbScsIHJlcGxhY2VtZW50OiAnc3RyZWFtLWJyb3dzZXJpZnknIH0sXHJcbiAgICAgICAgeyBmaW5kOiAnY3J5cHRvJywgcmVwbGFjZW1lbnQ6ICdjcnlwdG8tYnJvd3NlcmlmeScgfSxcclxuICAgICAgICB7IGZpbmQ6ICdAc3JjJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSB9LFxyXG4gICAgICAgIHsgZmluZDogJ0BzdG9yZScsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3JlZHV4JykgfSxcclxuICAgICAgICB7IGZpbmQ6ICdAY29uZmlncycsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbmZpZ3MnKSB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICd1cmwnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6ICdyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy91cmwnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaW5kOiAnQHN0eWxlcycsXHJcbiAgICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9AY29yZS9zY3NzJylcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICd1dGlsJyxcclxuICAgICAgICAgIHJlcGxhY2VtZW50OiAncm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvdXRpbCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICd6bGliJyxcclxuICAgICAgICAgIHJlcGxhY2VtZW50OiAncm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvemxpYidcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICdAdXRpbHMnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdXRpbGl0eS9VdGlscycpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaW5kOiAnQGhvb2tzJyxcclxuICAgICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3V0aWxpdHkvaG9va3MnKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZmluZDogJ0Bhc3NldHMnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvQGNvcmUvYXNzZXRzJylcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICdAQGFzc2V0cycsXHJcbiAgICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9hc3NldHMnKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZmluZDogJ0BsYXlvdXRzJyxcclxuICAgICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL0Bjb3JlL2xheW91dHMnKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZmluZDogJ2Fzc2VydCcsXHJcbiAgICAgICAgICByZXBsYWNlbWVudDogJ3JvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL2Fzc2VydCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICdidWZmZXInLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6ICdyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9idWZmZXItZXM2J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZmluZDogJ3Byb2Nlc3MnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6ICdyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9wcm9jZXNzLWVzNidcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICdAY29tcG9uZW50cycsXHJcbiAgICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9AY29yZS9jb21wb25lbnRzJylcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICdAQGNvbXBvbmVudHMnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdmlld3MvY29tcG9uZW50cycpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaW5kOiAnQG1vZHVsZXMnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvbW9kdWxlcycpXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgLy8gICBlc2J1aWxkOiB7XHJcbiAgICAvLyAgICAgLy8gbG9hZGVyOiAnanN4JyxcclxuICAgIC8vICAgICAvLyBpbmNsdWRlOiAvLlxcL3NyY1xcLy4qXFwuanM/JC8sXHJcbiAgICAvLyAgICAgLy8gZXhjbHVkZTogW10sXHJcbiAgICAvLyAgICAganN4OiAnYXV0b21hdGljJ1xyXG4gICAgLy8gICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XHJcbiAgICAgICAgbG9hZGVyOiB7XHJcbiAgICAgICAgICAnLmpzJzogJ2pzeCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgIE5vZGVHbG9iYWxzUG9seWZpbGxQbHVnaW4oe1xyXG4gICAgICAgICAgICBidWZmZXI6IHRydWUsXHJcbiAgICAgICAgICAgIHByb2Nlc3M6IHRydWVcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnbG9hZC1qcy1maWxlcy1hcy1qc3gnLFxyXG4gICAgICAgICAgICBzZXR1cChidWlsZCkge1xyXG4gICAgICAgICAgICAgIGJ1aWxkLm9uTG9hZCh7IGZpbHRlcjogL3NyY1xcXFwuKlxcLmpzJC8gfSwgYXN5bmMgKGFyZ3MpID0+ICh7XHJcbiAgICAgICAgICAgICAgICBsb2FkZXI6ICdqc3gnLFxyXG4gICAgICAgICAgICAgICAgY29udGVudHM6IGF3YWl0IGZzLnJlYWRGaWxlU3luYyhhcmdzLnBhdGgsICd1dGY4JylcclxuICAgICAgICAgICAgICB9KSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBwbHVnaW5zOiBbcm9sbHVwTm9kZVBvbHlGaWxsKCldXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7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
