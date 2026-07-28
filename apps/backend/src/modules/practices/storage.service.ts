import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class StorageService {
  private supabase: SupabaseClient | null = null;
  private bucketName = "practice-evidences";

  private getClient(): SupabaseClient {
    if (!this.supabase) {
      let supabaseUrl = process.env.SUPABASE_URL || "";

      if (!supabaseUrl && process.env.DATABASE_URL) {
        const match = process.env.DATABASE_URL.match(/postgres\.([a-z0-9]+):/i);
        if (match && match[1]) {
          supabaseUrl = `https://${match[1]}.supabase.co`;
        }
      }

      const supabaseKey =
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        "";

      if (!supabaseUrl) {
        throw new InternalServerErrorException(
          "Falta SUPABASE_URL en el entorno.",
        );
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    return this.supabase;
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    try {
      const client = this.getClient();
      const fileExt = file.originalname?.split(".").pop() || "jpg";
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await client.storage
        .from(this.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype || "image/jpeg",
          upsert: false, // <-- CAMBIAR A false PARA NO REQUERIR PERMISOS DE UPDATE
        });

      if (error) {
        throw new InternalServerErrorException(
          `Error subiendo imagen a Supabase Storage: ${error.message}`,
        );
      }

      const { data: publicUrlData } = client.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      throw new InternalServerErrorException(
        err.message || "Error en el servicio de almacenamiento",
      );
    }
  }
}
