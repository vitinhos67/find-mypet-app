import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        const timestamp = new Date().toISOString();
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(`[CRASH AUDIT] ${timestamp}`);
        console.error(`[CRASH AUDIT] Tipo: React ErrorBoundary`);
        console.error(`[CRASH AUDIT] Mensagem: ${error.message}`);
        console.error(`[CRASH AUDIT] Stack:\n${error.stack}`);
        console.error(`[CRASH AUDIT] Componente:\n${info.componentStack}`);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Algo deu errado</Text>
                    <Text style={styles.message}>{this.state.error?.message}</Text>
                    <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                        <Text style={styles.buttonText}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#d00',
    },
    message: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
    },
    button: {
        marginTop: 8,
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: '#333',
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
    },
});
