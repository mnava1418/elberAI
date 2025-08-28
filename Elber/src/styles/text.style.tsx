import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const textStyles = StyleSheet.create({
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: appColors.text,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: '400',
      color: appColors.subtitle,
      letterSpacing: 0.2,
      marginBottom: 24,
    },
    text: {
      fontSize: 18,
      fontWeight: '400',
      color: appColors.text,
      letterSpacing: 0.1,
      lineHeight: 22,
    },
    error: {
      fontSize: 18,
      fontWeight: '400',
      color: appColors.text,
      letterSpacing: 0.1,
      lineHeight: 22,
    },
  });

  export default textStyles;