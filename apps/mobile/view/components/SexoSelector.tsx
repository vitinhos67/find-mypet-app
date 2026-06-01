import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../styles/color';

interface Props {
    value: 'MACHO' | 'FEMEA';
    onChange: (v: 'MACHO' | 'FEMEA') => void;
    surfaceColor: string;
    borderColor: string;
    textSecondaryColor: string;
}

export function SexoSelector({ value, onChange, surfaceColor, borderColor, textSecondaryColor }: Props) {
    return (
        <View style={styles.container}>
            {(['MACHO', 'FEMEA'] as const).map((opt) => {
                const selected = value === opt;
                const label = opt === 'MACHO' ? '♂  Macho' : '♀  Fêmea';
                const activeColor = opt === 'MACHO' ? Colors.brand.primaryBlue : '#E879A8';
                const activeBg = opt === 'MACHO' ? '#EEF3FF' : '#FFF0F7';
                return (
                    <Pressable
                        key={opt}
                        style={[
                            styles.chip,
                            { backgroundColor: selected ? activeBg : surfaceColor, borderColor: selected ? activeColor : borderColor }
                        ]}
                        onPress={() => onChange(opt)}
                    >
                        <Text style={[styles.chipText, { color: selected ? activeColor : textSecondaryColor }]}>
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 10,
    },
    chip: {
        flex: 1,
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    chipText: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
    },
});
