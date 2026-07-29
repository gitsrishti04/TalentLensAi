const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, ".env") })
const app = require("./src/app")
const connectToDB = require("./src/config/database")

const PORT = process.env.PORT || 3000

connectToDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.error("Server failed to start:", err.message)
        process.exit(1)
    })
