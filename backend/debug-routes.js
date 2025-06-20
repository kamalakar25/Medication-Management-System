const express = require("express");

// Enhanced route debugging function
function debugRouteRegistration(app) {
  const originalMethods = {};
  const registeredRoutes = [];
  const issues = [];

  // Wrap all HTTP methods
  ["get", "post", "put", "delete", "patch", "use", "all"].forEach((method) => {
    originalMethods[method] = app[method];

    app[method] = function (path, ...handlers) {
      try {
        console.log(`🔍 Registering ${method.toUpperCase()} route: "${path}"`);

        // Detailed route validation
        if (typeof path === "string") {
          // Check for common problematic patterns
        //   const issues = [];

          // Check for missing parameter names
          if (path.includes("/:") && !path.match(/:[\w]+/g)) {
            issues.push("Missing parameter name after colon");
          }

          // Check for double colons
          if (path.includes("::")) {
            issues.push("Double colons found");
          }

          // Check for invalid parameter syntax
          if (path.match(/:[^/\w]/g)) {
            issues.push("Invalid parameter syntax");
          }

          // Check for duplicate parameter names
          const params = path.match(/:[\w]+/g);
          if (params) {
            const paramNames = params.map((p) => p.substring(1));
            const duplicates = paramNames.filter(
              (name, index) => paramNames.indexOf(name) !== index
            );
            if (duplicates.length > 0) {
              issues.push(
                `Duplicate parameter names: ${duplicates.join(", ")}`
              );
            }
          }

          // Check for empty parameter names
          if (path.match(/:\s/g) || path.match(/:$/g) || path.match(/:\//g)) {
            issues.push("Empty parameter name");
          }

          if (issues.length > 0) {
            console.error(`❌ ROUTE ISSUES for "${path}":`);
            issues.forEach((issue) => console.error(`   - ${issue}`));
          }

          // Log character-by-character analysis for suspicious routes
          if (path.includes(":")) {
            console.log(`📝 Character analysis for "${path}":`);
            for (let i = 0; i < path.length; i++) {
              const char = path[i];
              const code = char.charCodeAt(0);
              if (char === ":") {
                console.log(
                  `   Position ${i}: ':' (${code}) - Next chars: "${path.substring(
                    i,
                    i + 5
                  )}"`
                );
              }
            }
          }
        }

        registeredRoutes.push({
          method: method.toUpperCase(),
          path,
          issues: issues,
        });
        return originalMethods[method].call(this, path, ...handlers);
      } catch (error) {
        console.error(
          `❌ ERROR registering ${method.toUpperCase()} route "${path}":`
        );
        console.error(`   Error: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        throw error;
      }
    };
  });

  // Add a function to print all registered routes
  app.printRoutes = () => {
    console.log("\n📋 All Registered Routes:");
    console.log("=".repeat(50));
    registeredRoutes.forEach((route) => {
      const status = route.issues.length > 0 ? "❌" : "✅";
      console.log(`${status} ${route.method} ${route.path}`);
      if (route.issues.length > 0) {
        route.issues.forEach((issue) => console.log(`     - ${issue}`));
      }
    });
    console.log("=".repeat(50));
  };
}

module.exports = { debugRouteRegistration };
