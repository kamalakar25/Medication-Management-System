const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🔧 Setting up Windows development environment...")

// Check if we're on Windows
if (process.platform !== "win32") {
  console.log("✅ Not on Windows, skipping Windows-specific setup")
  process.exit(0)
}

try {
  // Check if Visual Studio Build Tools are installed
  console.log("📋 Checking for Visual Studio Build Tools...")

  try {
    execSync("where msbuild", { stdio: "ignore" })
    console.log("✅ MSBuild found")
  } catch (error) {
    console.log("❌ MSBuild not found")
    console.log("Please install Visual Studio Build Tools:")
    console.log("https://visualstudio.microsoft.com/visual-cpp-build-tools/")
    process.exit(1)
  }

  // Check Python
  console.log("📋 Checking for Python...")
  try {
    const pythonVersion = execSync("python --version", { encoding: "utf8" })
    console.log(`✅ Python found: ${pythonVersion.trim()}`)
  } catch (error) {
    console.log("❌ Python not found")
    console.log("Please install Python 3.x from https://python.org")
    process.exit(1)
  }

  // Clean and reinstall
  console.log("🧹 Cleaning node_modules...")
  if (fs.existsSync("node_modules")) {
    execSync("rmdir /s /q node_modules", { stdio: "inherit" })
  }

  if (fs.existsSync("package-lock.json")) {
    fs.unlinkSync("package-lock.json")
  }

  console.log("📦 Installing dependencies...")
  execSync("npm install", { stdio: "inherit" })

  console.log("✅ Setup complete!")
} catch (error) {
  console.error("❌ Setup failed:", error.message)
  process.exit(1)
}
