const fs = require('fs').promises
const path = require('path')

class DirectoryCopier {
  constructor(sourcePath, destinationPath, excludedDirs = []) {
    this.sourcePath = path.resolve(sourcePath)
    this.destinationPath = path.resolve(destinationPath)
    this.excludedDirs = new Set(excludedDirs)
    this.copiedFiles = 0
    this.skippedDirs = 0
  }

  async copyDirectory() {
    console.log(`🚀 Bắt đầu copy từ: ${this.sourcePath}`)
    console.log(`📁 Đến thư mục: ${this.destinationPath}`)
    console.log(`🚫 Loại trừ: ${Array.from(this.excludedDirs).join(', ')}\n`)

    try {
      await this.ensureDestinationExists()
      await this.copyRecursively(this.sourcePath, this.destinationPath)

      console.log(`\n✅ Hoàn thành!`)
      console.log(`📊 Thống kê:`)
      console.log(`   - Files đã copy: ${this.copiedFiles}`)
      console.log(`   - Folders đã bỏ qua: ${this.skippedDirs}`)
    } catch (error) {
      console.error('❌ Lỗi khi copy:', error.message)
      throw error
    }
  }

  async ensureDestinationExists() {
    try {
      await fs.access(this.destinationPath)
    } catch {
      await fs.mkdir(this.destinationPath, { recursive: true })
      console.log(`📁 Tạo thư mục đích: ${this.destinationPath}`)
    }
  }

  async copyRecursively(currentSource, currentDestination) {
    const items = await fs.readdir(currentSource, { withFileTypes: true })

    for (const item of items) {
      const sourcePath = path.join(currentSource, item.name)
      const destPath = path.join(currentDestination, item.name)

      if (item.isDirectory()) {
        if (this.shouldSkipDirectory(item.name)) {
          console.log(`⏭️  Bỏ qua folder: ${item.name}`)
          this.skippedDirs++
          continue
        }

        await this.ensureDirectoryExists(destPath)
        await this.copyRecursively(sourcePath, destPath)
      } else {
        await this.copyFile(sourcePath, destPath)
      }
    }
  }

  shouldSkipDirectory(dirName) {
    return this.excludedDirs.has(dirName)
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath)
    } catch {
      await fs.mkdir(dirPath, { recursive: true })
    }
  }

  async copyFile(sourcePath, destPath) {
    try {
      await fs.copyFile(sourcePath, destPath)
      this.copiedFiles++

      // Log tiến trình mỗi 50 files
      if (this.copiedFiles % 50 === 0) {
        console.log(`📋 Đã copy ${this.copiedFiles} files...`)
      }
    } catch (error) {
      console.warn(`⚠️  Không thể copy file ${sourcePath}: ${error.message}`)
    }
  }
}

// Main execution
async function main() {
  const SOURCE_DIR = '/Users/s19793/Desktop/WORKSPACE/navi-ui-ssr'
  const DEST_DIR = '/Users/s19793/Desktop/PERSONAL/fe-nv-ssr'
  const EXCLUDED_DIRS = ['.git', '.next', 'node_modules']

  const copier = new DirectoryCopier(SOURCE_DIR, DEST_DIR, EXCLUDED_DIRS)

  try {
    const startTime = Date.now()
    await copier.copyDirectory()
    const endTime = Date.now()

    console.log(`⏱️  Thời gian thực hiện: ${(endTime - startTime) / 1000}s`)
  } catch (error) {
    console.error('💥 Script thất bại:', error.message)
    process.exit(1)
  }
}

// Chạy script
if (require.main === module) {
  main()
}

module.exports = { DirectoryCopier }
