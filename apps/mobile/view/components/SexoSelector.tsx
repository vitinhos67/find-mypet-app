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

function SexoChip({
    label,
    selected,
    onPress,
    surfaceColor,
    borderColor,
    textSecondaryColor
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
    surfaceColor: string;
    borderColor: string;
    textSecondaryColor: string;
}) {
    return (
        <Pressable
            style={[
                styles.chip,
                {
                    backgroundColor: selected ? Colors.brand.primaryBlue : surfaceColor,
                    borderColor: selected ? Colors.brand.primaryBlue : borderColor,
                    flex: 1
                }
            ]}
            onPress={onPress}
        >
            <Text style={[styles.chipText, { color: selected ? 'white' : textSecondaryColor }]}>
                {label}
            </Text>
        </Pressable>
    );
}

export function SexoSelector({ value, onChange, surfaceColor, borderColor, textSecondaryColor }: Props) {
    return (
        <View style={styles.container}>
            <SexoChip
                label="Macho"
                selected={value === 'MACHO'}
                onPress={() => onChange('MACHO')}
                surfaceColor={surfaceColor}
                borderColor={borderColor}
                textSecondaryColor={textSecondaryColor}
            />
            <SexoChip
                label="Fêmea"
                selected={value === 'FEMEA'}
                onPress={() => onChange('FEMEA')}
                surfaceColor={surfaceColor}
                borderColor={borderColor}
                textSecondaryColor={textSecondaryColor}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 10
    },
    chip: {
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center'
    },
    chipText: {
        fontFamily: 'Inter-Bold',
        fontSize: 14
    }
});
