import { FastifyReply, FastifyRequest } from 'fastify';
import { supabaseAdmin } from '../../../shared/supabase/supabaseAdmin';

export class DeviceController {

    async create(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.supabaseUser?.id;

        if (!userId) {
            return reply.status(401).send({ message: 'Sessão inválida ou não autorizada.' });
        }

        const { nome, serialNumber, wifiSsid, wifiSenha, intervaloAcordarMinutos, comportamentoSemWifi } = request.body as any;

        const { data, error } = await supabaseAdmin.from('devices').insert([{
            owner_id: userId,
            nome,
            serial_number: serialNumber,
            wifi_ssid: wifiSsid,
            wifi_senha: wifiSenha,
            intervalo_acordar_minutos: intervaloAcordarMinutos,
            comportamento_sem_wifi: comportamentoSemWifi,
            status: 'ONLINE'
        }]).select().single();

        if (error) {
            if (error.code === '23505') {
                return reply.status(409).send({ message: 'Este hardware já se encontra registado numa conta.' });
            }
            return reply.status(500).send({ message: 'Erro interno ao registar a coleira.', error });
        }

        return reply.status(201).send(data);
    }

    async list(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.supabaseUser?.id;

        if (!userId) {
            return reply.status(401).send({ message: 'Sessão inválida ou não autorizada.' });
        }

        const { data, error } = await supabaseAdmin
            .from('devices')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return reply.status(500).send({ message: 'Erro ao carregar a lista de dispositivos.', error });
        }

        return reply.status(200).send(data);
    }
}