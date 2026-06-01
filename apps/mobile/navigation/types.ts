import { NavigatorScreenParams } from '@react-navigation/native';
export type AuthStackParams = {
    Login: undefined;    
    Cadastro: undefined;
}
export type CollarStackParamList = {
    DeviceList: undefined;
    DeviceConfigure: { collarId: string; currentPetId?: string | null };
    DeviceAdd: undefined;
}
export type PetStackParamList = {
    PetList: undefined;
    PetAdd: undefined;
    PetProfile: { petId: string };
    PetDetails: { petId: string };
    Collar: NavigatorScreenParams<CollarStackParamList>;
}
export type TabParamList = {
    Home: undefined;
    Dispositivos: undefined;
    Pets: undefined;
    Perfil: undefined;
};
