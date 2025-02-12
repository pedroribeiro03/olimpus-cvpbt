import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading}
      style={{ 
        backgroundColor: '#bdc5c7', padding: 10, borderRadius: 5, width:'30%', alignSelf:'center', margin:20
      }}
    >
      <Text>
        {title}
      </Text>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
        />
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;