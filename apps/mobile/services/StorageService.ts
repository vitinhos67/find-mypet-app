import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../src/shared/lib/supabase';

export class StorageService {
    static async uploadPetImage(fileUri: string): Promise<string | null> {
        try {
            if (!fileUri || fileUri.startsWith('http')) {
                return fileUri;
            }

            const fileName = `${Date.now()}_pet.jpg`;
            const filePath = `pets/${fileName}`;

            const base64String = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const { error } = await supabase.storage
                .from('pets')
                .upload(filePath, decode(base64String), {
                    contentType: 'image/jpeg',
                });
            if (error) {
                console.error("Erro no Supabase Storage:", error);
                return null;
            }
            const { data: publicUrlData } = supabase.storage
                .from('pets')
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;

        } catch (error) {
            console.error("Falha ao ler e subir a imagem para o Supabase:", error);
            return null;
        }
    }
}