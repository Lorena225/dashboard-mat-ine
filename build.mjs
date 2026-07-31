// Build: source-app.jsx -> app.js (React/Recharts como globais UMD, sem bundler no runtime)
import * as esbuild from "esbuild";

const GLOBALS = { react: "React", "react-dom": "ReactDOM", recharts: "Recharts" };

const externalGlobals = {
  name: "external-globals",
  setup(build) {
    const filter = /^(react|react-dom|recharts)$/;
    build.onResolve({ filter }, (a) => ({ path: a.path, namespace: "globals" }));
    build.onLoad({ filter: /.*/, namespace: "globals" }, (a) => ({
      contents: `module.exports = window.${GLOBALS[a.path]};`,
      loader: "js",
    }));
  },
};

await esbuild.build({
  stdin: {
    contents: `
      import ReactDOM from "react-dom";
      import DashboardEdilvo from "./source-app.jsx";
      ReactDOM.createRoot(document.getElementById("root")).render(
        React.createElement(DashboardEdilvo)
      );`,
    resolveDir: ".",
    loader: "jsx",
  },
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2019"],
  charset: "utf8",
  outfile: "app.js",
  jsx: "transform",
  plugins: [externalGlobals],
  logLevel: "info",
});
