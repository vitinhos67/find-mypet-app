export type AuthStackParams = {
    Login: undefined;    
    Cadastro: undefined;
}
export type CollarStackParamList = {
    DeviceList: undefined;
    DeviceConfigure: { collarId: string; currentPetId?: string | null };
    DeviceAdd: undefined;
}
export type TabParamList = {
    Home: undefined;
    Dispositivos: undefined; 
    Perfil: undefined;
};