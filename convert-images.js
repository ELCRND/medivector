import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация
const CONFIG = {
  inputDir: path.join(__dirname, "/public/images"),
  // Исключить определенные папки или файлы
  exclude: ["converted", "processed", "node_modules"],
  // Поддерживаемые форматы
  supportedFormats: [".jpg", ".jpeg", ".png", ".tiff", ".tif"],
};

// Расширенная конфигурация качества
const QUALITY_PROFILES = {
  // Для фотографий
  photos: {
    webp: {
      quality: 75,
      lossless: false,
      nearLossless: false,
      alphaQuality: 100,
      effort: 6,
      smartSubsample: true,
      reductionEffort: 4,
    },
    avif: {
      quality: 65,
      lossless: false,
      effort: 8,
      chromaSubsampling: "4:2:0",
    },
  },
  // Для графики, иконок, UI элементов
  graphics: {
    webp: {
      quality: 90,
      lossless: false,
      nearLossless: true, // Сохраняет четкость краев
      alphaQuality: 100,
      effort: 6,
      smartSubsample: false,
      reductionEffort: 6,
    },
    avif: {
      quality: 80,
      lossless: false,
      effort: 8,
      chromaSubsampling: "4:4:4", // Лучшая цветопередача
    },
  },
  // Для скриншотов, текстовых изображений
  screenshots: {
    webp: {
      quality: 75,
      lossless: false,
      nearLossless: true,
      alphaQuality: 100,
      effort: 6,
      smartSubsample: false,
      reductionEffort: 6,
    },
    avif: {
      quality: 65,
      lossless: false,
      effort: 9, // Максимальное сжатие
      chromaSubsampling: "4:4:4",
    },
  },
};

class AdvancedImageConverter {
  constructor() {
    this.stats = {
      processed: 0,
      skipped: 0,
      errors: 0,
      totalOriginalSize: 0,
      totalWebPSize: 0,
      totalAVIFSize: 0,
    };
  }

  // Проверка, нужно ли обрабатывать файл
  shouldProcessFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const dir = path.dirname(filePath);
    const dirName = path.basename(dir);

    return (
      CONFIG.supportedFormats.includes(ext) && !CONFIG.exclude.includes(dirName)
    );
  }

  // Определяем тип изображения для выбора профиля
  getImageProfile(metadata, filePath) {
    const { width, height } = metadata;

    // По имени папки или файла можно определить тип
    const dirName = path.dirname(filePath).toLowerCase();
    const fileName = path.basename(filePath).toLowerCase();

    // Эвристики для определения типа контента
    if (
      dirName.includes("icon") ||
      dirName.includes("logo") ||
      fileName.includes("icon") ||
      fileName.includes("logo") ||
      width < 200 ||
      height < 200
    ) {
      return "graphics";
    }

    if (
      dirName.includes("screenshot") ||
      fileName.includes("screenshot") ||
      (metadata.hasAlpha && this.hasTextContent(metadata))
    ) {
      return "screenshots";
    }

    // По умолчанию считаем фотографией
    return "photos";
  }

  // Простая проверка на текстовый контент (по размерам и прозрачности)
  hasTextContent(metadata) {
    return metadata.hasAlpha && metadata.width < 1200 && metadata.height < 800;
  }

  // Проверка, стоит ли конвертировать в AVIF
  shouldConvertToAvif(metadata) {
    return metadata.width > 50 && metadata.height > 50;
  }

  async convertImage(filePath) {
    try {
      const dir = path.dirname(filePath);
      const fileName = path.basename(filePath, path.extname(filePath));
      const outputDir = dir;

      await fs.mkdir(outputDir, { recursive: true });

      const image = sharp(filePath);
      const metadata = await image.metadata();

      // Получаем оригинальный размер файла
      const originalStats = await fs.stat(filePath);
      this.stats.totalOriginalSize += originalStats.size;

      // Определяем профиль качества
      const profileType = this.getImageProfile(metadata, filePath);
      const profile = QUALITY_PROFILES[profileType];

      console.log(
        `🔄 Обрабатываю: ${path.relative(
          process.cwd(),
          filePath
        )} [${profileType}]`
      );

      // WebP конвертация
      const webpPath = path.join(outputDir, `${fileName}.webp`);
      await image.webp(profile.webp).toFile(webpPath);

      const webpStats = await fs.stat(webpPath);
      this.stats.totalWebPSize += webpStats.size;

      // AVIF конвертация
      let avifSize = 0;
      if (this.shouldConvertToAvif(metadata)) {
        const avifPath = path.join(outputDir, `${fileName}.avif`);
        await image.avif(profile.avif).toFile(avifPath);

        const avifStats = await fs.stat(avifPath);
        avifSize = avifStats.size;
        this.stats.totalAVIFSize += avifSize;

        console.log(
          `✅ ${fileName}: WebP ${this.formatSize(
            webpStats.size
          )}, AVIF ${this.formatSize(avifSize)}`
        );
      } else {
        console.log(
          `✅ ${fileName}: WebP ${this.formatSize(
            webpStats.size
          )} (AVIF пропущен)`
        );
      }

      this.stats.processed++;
    } catch (error) {
      console.error(
        `❌ Ошибка: ${path.relative(process.cwd(), filePath)}`,
        error.message
      );
      this.stats.errors++;
    }
  }

  formatSize(bytes) {
    const sizes = ["Б", "КБ", "МБ", "ГБ"];
    if (bytes === 0) return "0 Б";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  // Рекурсивный поиск изображений
  async findImages(dir) {
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      const images = [];

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          // Пропускаем исключенные папки
          if (!CONFIG.exclude.includes(item.name)) {
            const subImages = await this.findImages(fullPath);
            images.push(...subImages);
          }
        } else if (this.shouldProcessFile(fullPath)) {
          images.push(fullPath);
        }
      }

      return images;
    } catch (error) {
      console.error(`Ошибка чтения директории ${dir}:`, error.message);
      return [];
    }
  }

  async run() {
    console.log("🚀 Запуск расширенной конвертации...");
    console.log(`📁 Исходная директория: ${CONFIG.inputDir}`);
    console.log("📊 Профили качества:");
    console.log("   📷 Photos - оптимальное сжатие для фотографий");
    console.log("   🎨 Graphics - высокое качество для иконок");
    console.log("   📱 Screenshots - максимальная четкость текста");

    try {
      // Проверяем существование директории
      await fs.access(CONFIG.inputDir);

      const images = await this.findImages(CONFIG.inputDir);

      if (images.length === 0) {
        console.log("ℹ️ Изображения для обработки не найдены");
        return;
      }

      console.log(`\n📷 Найдено изображений: ${images.length}`);

      // Обрабатываем изображения последовательно
      for (const image of images) {
        await this.convertImage(image);
      }

      // Детальная статистика
      console.log("\n📊 Детальная статистика:");
      console.log(`✅ Обработано: ${this.stats.processed}`);
      console.log(`❌ Ошибок: ${this.stats.errors}`);

      if (this.stats.processed > 0) {
        const avgOriginal = this.stats.totalOriginalSize / this.stats.processed;
        const avgWebP = this.stats.totalWebPSize / this.stats.processed;
        const webpSavings = (
          ((this.stats.totalOriginalSize - this.stats.totalWebPSize) /
            this.stats.totalOriginalSize) *
          100
        ).toFixed(1);

        console.log(
          `📦 Общий размер оригиналов: ${this.formatSize(
            this.stats.totalOriginalSize
          )}`
        );
        console.log(
          `🔄 Общий размер WebP: ${this.formatSize(this.stats.totalWebPSize)}`
        );
        console.log(`💰 Экономия WebP: ${webpSavings}%`);

        if (this.stats.totalAVIFSize > 0) {
          const avgAVIF = this.stats.totalAVIFSize / this.stats.processed;
          const avifSavings = (
            ((this.stats.totalOriginalSize - this.stats.totalAVIFSize) /
              this.stats.totalOriginalSize) *
            100
          ).toFixed(1);
          console.log(
            `🎯 Общий размер AVIF: ${this.formatSize(this.stats.totalAVIFSize)}`
          );
          console.log(`💰 Экономия AVIF: ${avifSavings}%`);
        }
      }
    } catch (error) {
      console.error("❌ Критическая ошибка:", error.message);
      console.log("Убедитесь, что директория public/images существует");
    }
  }
}

// Запуск
const converter = new AdvancedImageConverter();
converter.run();
