import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const VIDEO_MAX_BYTES = 30 * 1024 * 1024; // 30 MB
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 2; // 2 horas

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const ALLOWED_VIDEO_MIME = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient | null = null;
  private readonly bucketName = "practice-evidences";

  onModuleInit() {
    // Valida configuración al arrancar (no rompe si falta en tests locales sin storage)
    try {
      this.getClient();
    } catch (err: any) {
      this.logger.warn(
        `Storage no listo: ${err.message}. Subidas de evidencia fallarán hasta configurar SUPABASE_SECRET_KEY.`,
      );
    }
  }

  private getClient(): SupabaseClient {
    if (this.supabase) return this.supabase;

    let supabaseUrl = process.env.SUPABASE_URL || "";
    if (!supabaseUrl && process.env.DATABASE_URL) {
      const match = process.env.DATABASE_URL.match(/postgres\.([a-z0-9]+):/i);
      if (match?.[1]) {
        supabaseUrl = `https://${match[1]}.supabase.co`;
      }
    }

    // Secret key (nueva) o service_role (legacy). Nest no usa Supabase Auth;
    // hace falta privilegio de servidor para bucket privado + signed URLs.
    const serviceKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "";
    if (!supabaseUrl) {
      throw new InternalServerErrorException(
        "Falta SUPABASE_URL en el entorno.",
      );
    }
    if (!serviceKey) {
      throw new InternalServerErrorException(
        "Falta SUPABASE_SECRET_KEY (Dashboard → API Keys → Secret keys). Alternativa legacy: SUPABASE_SERVICE_ROLE_KEY.",
      );
    }

    this.supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return this.supabase;
  }

  /**
   * Extrae el path del objeto dentro del bucket desde:
   * - path relativo (`user-x/model-1/file.jpg`)
   * - URL pública antigua
   * - URL firmada
   */
  extractObjectPath(urlOrPath: string | null | undefined): string | null {
    if (!urlOrPath) return null;
    const value = urlOrPath.trim();
    if (!value) return null;

    if (!value.includes("://")) {
      return value
        .replace(new RegExp(`^${this.bucketName}/`), "")
        .replace(/^\//, "");
    }

    try {
      const u = new URL(value);
      const patterns = [
        `/storage/v1/object/public/${this.bucketName}/`,
        `/storage/v1/object/sign/${this.bucketName}/`,
        `/storage/v1/object/authenticated/${this.bucketName}/`,
      ];
      for (const p of patterns) {
        const idx = u.pathname.indexOf(p);
        if (idx >= 0) {
          return decodeURIComponent(u.pathname.slice(idx + p.length));
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  async createSignedUrl(
    urlOrPath: string | null | undefined,
    expiresIn = SIGNED_URL_TTL_SECONDS,
  ): Promise<string | null> {
    const path = this.extractObjectPath(urlOrPath);
    if (!path) return urlOrPath || null;

    const client = this.getClient();
    const { data, error } = await client.storage
      .from(this.bucketName)
      .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
      this.logger.warn(
        `No se pudo firmar URL (${path}): ${error?.message || "sin data"}`,
      );
      return null;
    }
    return data.signedUrl;
  }

  async signEvidenceUrls<
    T extends {
      photoBeforeUrl?: string | null;
      photoAfterUrl?: string | null;
      videoOptionalUrl?: string | null;
    },
  >(evidence: T | null | undefined): Promise<T | null | undefined> {
    if (!evidence) return evidence;
    const [photoBeforeUrl, photoAfterUrl, videoOptionalUrl] = await Promise.all(
      [
        this.createSignedUrl(evidence.photoBeforeUrl),
        this.createSignedUrl(evidence.photoAfterUrl),
        this.createSignedUrl(evidence.videoOptionalUrl),
      ],
    );
    return {
      ...evidence,
      photoBeforeUrl: photoBeforeUrl || evidence.photoBeforeUrl || "",
      photoAfterUrl: photoAfterUrl || evidence.photoAfterUrl || "",
      videoOptionalUrl: videoOptionalUrl,
    };
  }

  async deleteObject(urlOrPath: string | null | undefined): Promise<void> {
    const path = this.extractObjectPath(urlOrPath);
    if (!path) return;
    const client = this.getClient();
    const { error } = await client.storage.from(this.bucketName).remove([path]);
    if (error) {
      this.logger.warn(`No se pudo borrar ${path}: ${error.message}`);
    }
  }

  async deleteMany(urlsOrPaths: Array<string | null | undefined>) {
    await Promise.all(urlsOrPaths.map((u) => this.deleteObject(u)));
  }

  /**
   * Lista objects del bucket y borra los que no estén referenciados en evidences.
   */
  async cleanupOrphanObjects(
    referencedPaths: string[],
  ): Promise<{ scanned: number; removed: number }> {
    const client = this.getClient();
    const referenced = new Set(
      referencedPaths
        .map((p) => this.extractObjectPath(p))
        .filter((p): p is string => Boolean(p)),
    );

    const allPaths: string[] = [];
    const walk = async (prefix: string) => {
      const { data, error } = await client.storage
        .from(this.bucketName)
        .list(prefix, { limit: 1000 });
      if (error) {
        this.logger.warn(`List storage (${prefix}): ${error.message}`);
        return;
      }
      for (const item of data || []) {
        const full = prefix ? `${prefix}/${item.name}` : item.name;
        // Carpetas en Storage suelen no tener id/metadata.size
        if ((item as any).id) {
          allPaths.push(full);
        } else {
          await walk(full);
        }
      }
    };

    await walk("");
    const orphans = allPaths.filter((p) => !referenced.has(p));
    if (orphans.length > 0) {
      const { error } = await client.storage
        .from(this.bucketName)
        .remove(orphans);
      if (error) {
        this.logger.warn(`Cleanup orphans: ${error.message}`);
        return { scanned: allPaths.length, removed: 0 };
      }
    }
    this.logger.log(
      `Storage cleanup: ${allPaths.length} archivos, ${orphans.length} huérfanos eliminados`,
    );
    return { scanned: allPaths.length, removed: orphans.length };
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    this.assertFileLimits(file, "image");
    return this.uploadFile(file, folder, "image/jpeg");
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    this.assertFileLimits(file, "video");
    return this.uploadFile(file, `${folder}/videos`, "video/mp4");
  }

  private assertFileLimits(
    file: Express.Multer.File,
    kind: "image" | "video",
  ) {
    const size = file.buffer?.length || 0;
    const mime = (file.mimetype || "").toLowerCase();

    if (kind === "image") {
      if (size > IMAGE_MAX_BYTES) {
        throw new BadRequestException(
          `La imagen supera el máximo de ${IMAGE_MAX_BYTES / (1024 * 1024)} MB.`,
        );
      }
      if (mime && !ALLOWED_IMAGE_MIME.has(mime)) {
        throw new BadRequestException(
          `Tipo de imagen no permitido (${mime}). Usá JPG, PNG o WebP.`,
        );
      }
    } else {
      if (size > VIDEO_MAX_BYTES) {
        throw new BadRequestException(
          `El video supera el máximo de ${VIDEO_MAX_BYTES / (1024 * 1024)} MB.`,
        );
      }
      if (mime && !ALLOWED_VIDEO_MIME.has(mime)) {
        throw new BadRequestException(
          `Tipo de video no permitido (${mime}). Usá MP4, MOV o WebM.`,
        );
      }
    }
  }

  /**
   * Sube el archivo y retorna el PATH relativo al bucket (no URL pública).
   * Las URLs firmadas se generan al leer evidencias.
   */
  private async uploadFile(
    file: Express.Multer.File,
    folder: string,
    defaultMime: string,
  ): Promise<string> {
    try {
      const client = this.getClient();
      const fileExt = file.originalname?.split(".").pop() || "bin";
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await client.storage
        .from(this.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype || defaultMime,
          upsert: false,
        });

      if (error) {
        throw new InternalServerErrorException(
          `Error subiendo archivo a Supabase Storage: ${error.message}`,
        );
      }

      return data.path;
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        err.message || "Error en el servicio de almacenamiento",
      );
    }
  }
}
