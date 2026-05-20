import { View, Text, TextInput } from 'react-native';

interface StitchInputProps {
  label: string;
  value: string;
  onChange?: (text: string) => void;
  placeholder?: string;
  unit?: string;
  icon?: any;
  iconPosition?: 'left' | 'right';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  required?: boolean;
  editable?: boolean;
  prefix?: string;
  multiline?: boolean;
  onFocus?: () => void;
}

export default function StitchInput({
  label,
  value,
  onChange,
  placeholder,
  unit,
  icon: Icon,
  iconPosition = 'left',
  keyboardType = 'default',
  required = false,
  editable = true,
  prefix,
  multiline = false,
  onFocus
}: StitchInputProps) {
  return (
    <View className={`flex flex-col mb-4 ${multiline ? 'flex-1' : ''}`}>
      <Text className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${!editable ? 'text-[#6b7280]' : 'text-[#111827]'}`}>
        {label} {required && <Text className="text-[#e63946]">*</Text>}
      </Text>
      <View className={`relative flex justify-center ${multiline ? 'flex-1' : ''}`}>
        {prefix && <Text className="absolute left-3 top-[14px] text-sm text-[#111827] font-medium z-10">{prefix}</Text>}
        
        {Icon && iconPosition === 'left' && (
          <View className="absolute left-3 top-[14px] z-10 pointer-events-none">
            <Icon size={16} color="#9ca3af" />
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          keyboardType={keyboardType}
          placeholderTextColor="#9ca3af"
          editable={editable}
          multiline={multiline}
          onFocus={onFocus}
          style={multiline ? { textAlignVertical: 'top', minHeight: 120 } : {}}
          className={`w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#111827] font-medium 
            ${!editable ? 'opacity-70 bg-gray-100' : ''} 
            ${prefix ? 'pl-8' : (Icon && iconPosition === 'left' ? 'pl-9' : 'px-3')} 
            ${unit || (Icon && iconPosition === 'right') ? 'pr-10' : ''}
            ${multiline ? 'pt-3 pb-3 h-full' : 'py-3'} 
          `}
        />

        {unit && <Text className="absolute right-3 text-sm text-[#9ca3af] font-medium pointer-events-none">{unit}</Text>}
        
        {Icon && iconPosition === 'right' && (
          <View className="absolute right-3 pointer-events-none">
            <Icon size={18} color="#9ca3af" />
          </View>
        )}
      </View>
    </View>
  );
}
