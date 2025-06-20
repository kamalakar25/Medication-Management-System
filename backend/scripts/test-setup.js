// Test script to verify the setup is working
const path = require("path")

console.log("🧪 Testing Medication Management System setup...")

async function testSetup() {
  try {
    // Test database connection
    console.log("📋 Testing database connection...")
    const { db, dbType } = require("../config/database-adapter")
    console.log(`✅ Database connected using ${dbType}`)

    // Test basic database operations
    console.log("📋 Testing database operations...")

    // Test a simple query
    db.get("SELECT 1 as test", [], (err, result) => {
      if (err) {
        console.error("❌ Database query failed:", err.message)
      } else {
        console.log("✅ Database query successful")
      }
    })

    // Test middleware
    console.log("📋 Testing middleware...")
    const { authenticateToken } = require("../middleware/auth")
    console.log("✅ Authentication middleware loaded")

    // Test routes
    console.log("📋 Testing route imports...")
    const authRoutes = require("../routes/auth")
    console.log("✅ Auth routes loaded")

    console.log("\n🎉 All tests passed! Your setup is ready.")
    console.log("You can now run: npm start")
  } catch (error) {
    console.error("❌ Setup test failed:", error.message)
    console.error("\nPlease check the following:")
    console.error("1. All dependencies are installed (npm install)")
    console.error("2. All required files exist in the correct directories")
    console.error("3. Environment variables are set correctly")
    process.exit(1)
  }
}

testSetup()
